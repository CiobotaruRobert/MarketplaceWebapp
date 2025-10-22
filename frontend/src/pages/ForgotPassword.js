import { useState } from "react";
import axios from "axios";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", {
        email,
      });
      setMessage("Linkul de resetare a parolei v-a fost trimis pe email.");
    } catch (err) {
      setError("Eroare la trimiterea linkului de resetare. Vă rugăm să reîncercați.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Ați uitat parola</h2>

        {message && <p style={{ color: "green", marginBottom: "20px", textAlign: "center" }}>{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="form-label">
            Introdu adresa ta de e-mail
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

          <button type="submit" className="login-button">
            Trimite link de resetare
          </button>
        </form>
      </div>
    </div>
  );
}
