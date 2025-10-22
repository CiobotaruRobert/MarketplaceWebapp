import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      console.log(email, password);
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    } catch (err) {
      setError("Email sau parolă invalide");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Autentificare</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="form-label">
            Adresă de e-mail
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@exemplu.com"
          />

          <label htmlFor="password" className="form-label">
            Parolă
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Introduceți parola"
          />

          <button type="submit" className="login-button">
            Autentificare
          </button>
        </form>

        <div className="links-container">
          <Link to="/forgot-password" className="link">
            Ai uitat parola?
          </Link>
          <Link to="/register" className="link">
            Înregistrare
          </Link>
        </div>
      </div>
    </div>
  );
}
