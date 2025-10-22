import { useState, useEffect } from "react";
import axios from "axios";
import './UserProfile.css';

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setForm(res.data);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, phone: digitsOnly }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await axios.put("http://localhost:8080/api/users/profile", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
    setEditMode(false);
  };

  if (!user) return <p>Loading...</p>;

  const avatarBgColor = stringToColor(user.name || "User");
  const firstLetter = (user.name && user.name[0].toUpperCase()) || "U";

  return (
    <div className="userprofile-page">
      <div className="userprofile-header">
        <div
          className="userprofile-avatar"
          style={{ backgroundColor: avatarBgColor }}
          title={user.name}
        >
          {firstLetter}
        </div>
        <h2 className="userprofile-header-text">
          {editMode ? "Editează profilul" : "Profilul tău"}
        </h2>
      </div>

      <div className="userprofile-container">
        {editMode ? (
          <form onSubmit={handleSave} className="userprofile-form">
            <div className="userprofile-group">
              <label>Nume:</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="userprofile-group">
              <label>Număr de telefon:</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Număr de telefon"
              />
            </div>

            <div className="userprofile-group">
              <label>Localitate:</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="userprofile-buttons">
              <button type="submit" className="userprofile-button">
                Salvează
              </button>
              <button
                type="button"
                className="userprofile-button"
                style={{ backgroundColor: "#e74c3c" }}
                onClick={() => setEditMode(false)}
              >
                Anulează
              </button>
            </div>
          </form>
        ) : (
          <div className="userprofile-info">
            <div className="userprofile-field">
              <label>Nume:</label>
              <p>{user.name}</p>
            </div>
            <div className="userprofile-field">
            <label>Număr de telefon:</label>
            <p>{user.phone?.trim() ? user.phone : "Nu este specificat"}</p>
            </div>
            <div className="userprofile-field">
            <label>Localitate:</label>
            <p>{user.location?.trim() ? user.location : "Nu este specificat"}</p>
            </div>
            <div className="userprofile-buttons">
              <button className="userprofile-button" onClick={() => setEditMode(true)}>
                Editează
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
