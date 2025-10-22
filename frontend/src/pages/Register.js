import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";



export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
  const length = password.length >= 10;
  const lowercase = /[a-z]/.test(password);
  const uppercase = /[A-Z]/.test(password);
  const digit = /[0-9]/.test(password);
  const symbol = /[^A-Za-z0-9]/.test(password);

  return length && lowercase && uppercase && digit && symbol;
};

const [emailError, setEmailError] = useState("");

const checkEmail = async () => {
  if (!email) return;

  try {
    const res = await axios.get("http://localhost:8080/api/auth/check-email", {
      params: { email },
    });
    if (res.data.exists) {
      setEmailError("Emailul este deja folosit.");
    } else {
      setEmailError("");
    }
  } catch (err) {
    console.error("Failed to check email", err);
  }
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!name || !email || !password) {
    setError("Toate câmpurile sunt obligatorii.");
    return;
  }

  if (!validatePassword(password)) {
    setError("Parola trebuie să aibă minim 10 caractere, o literă mică, o literă mare, o cifră și un simbol.");
    return;
  }

  if (emailError) {
    setError(emailError);
    return;
  }

  try {
    await axios.post("http://localhost:8080/api/auth/register", {
      name,
      email,
      password,
    });
    setSuccessMessage("Înregistrarea a fost realizată cu succes! Urmează să primești un email de verificare.");
    navigate("/login");
  } catch (err) {
    setError("Înregistrare eșuată. Reîncercați.");
  }
};


  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Înregistrare</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="name" className="form-label">Nume</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nume"
          />

          <label htmlFor="email" className="form-label">Adresă de e-mail</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@exemplu.com"
          />

          <label htmlFor="password" className="form-label">Parolă</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Introduceți parola"
          />

          <button type="submit" className="register-button">
            Înregistrare
          </button>
        </form>
      </div>
    </div>
  );
}
