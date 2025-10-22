import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token lipsă sau invalid.");
      return;
    }

    const verifyAccount = async () => {
      setStatus("loading");
      try {
        const res = await axios.post("http://localhost:8080/api/auth/verify-account", { token });
        setStatus("success");
        setMessage(res.data);
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        if (err.response?.data) {
          setMessage(err.response.data);
        } else {
          setMessage("Nu am putut verifica contul. Token invalid sau expirat.");
        }
      }
    };

    verifyAccount();
  }, [token, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Verificare cont</h2>
        {status === "loading" && <p>Se verifică contul...</p>}
        {status === "success" && <p style={{ color: "green" }}>{message} Redirecționare către autentificare...</p>}
        {status === "error" && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
}
