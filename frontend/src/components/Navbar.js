import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import NotificationDropdown from './NotificationDropdown';
import AccountDropdown from './AccountDropdown';
import { RiShoppingCartLine } from "react-icons/ri";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <RiShoppingCartLine
        className="navbar-logo-icon"
        onClick={() => navigate("/")}
      />
      <div className="navbar-buttons">
        {isLoggedIn && <NotificationDropdown token={localStorage.getItem("token")} />}
        {isLoggedIn && (
          <>
            <button className="chat-button-nav" onClick={() => navigate("/chat")}>Conversații</button>
            <button className="favorite-ads-button-nav" onClick={() => navigate("/favorites")}>Favorite</button>
            <button className="post-ad-button-nav" onClick={() => navigate("/post-ad")}>Adaugă anunț</button>
            <AccountDropdown />
            <button className="logout-button-nav" onClick={handleLogout}>Deconectare</button>
          </>
        )}
        {!isLoggedIn && (
          <button className="login-button-nav" onClick={() => navigate("/login")}>Autentificare</button>
        )}
      </div>
    </nav>
  );
}
