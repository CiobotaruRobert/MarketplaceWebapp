import React from 'react';
import './AccountDropdown.css';

const AccountDropdown = () => {
  return (
    <div className="account-dropdown">
      <button className="dropdown-button">Contul tău</button>
      <div className="dropdown-content">
        <a href="/profile">Profil</a>
        <a href="/chat">Conversații</a>
        <a href="/my-ads">Anunțurile tale</a>
      </div>
    </div>
  );
};

export default AccountDropdown;
