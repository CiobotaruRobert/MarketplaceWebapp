import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Token lipsă sau invalid.");
    }
  }, [token]);

  const validatePassword = (password) => {
    const length = password.length >= 10;
    const lowercase = /[a-z]/.test(password);
    const uppercase = /[A-Z]/.test(password);
    const digit = /[0-9]/.test(password);
    const symbol = /[^A-Za-z0-9]/.test(password);
    return length && lowercase && uppercase && digit && symbol;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validatePassword(newPassword)) {
      setError(
        "Parola trebuie să aibă minim 10 caractere, o literă mică, o literă mare, o cifră și un simbol."
      );
      return;
    }

    if (newPassword !== confirm) {
      setError("Parolele nu se potrivesc.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        token,
        newPassword,
      });
      setMessage("Parolă resetată cu succes. Redirecționare către autentificare...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Nu am reușit să resetăm parola. Tokenul poate fi invalid sau expirat.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Resetare parolă</h2>

        {message && <p style={{ color: "green", marginBottom: "20px", textAlign: "center" }}>{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="newPassword" className="form-label">
            Parola nouă
          </label>
          <input
            id="newPassword"
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Introduceți noua parolă"
          />

          <label htmlFor="confirmPassword" className="form-label">
            Repetare parolă nouă
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="form-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Repetați parola"
          />

          <button type="submit" className="login-button">
            Resetare parolă
          </button>
        </form>
      </div>
    </div>
  );
}
