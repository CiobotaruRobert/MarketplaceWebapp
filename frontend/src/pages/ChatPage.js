import React, { useEffect, useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import axios from 'axios';
import './ChatPage.css';
import { jwtDecode } from "jwt-decode";

export default function ChatPage() {
  const email = jwtDecode(localStorage.getItem("token"))?.sub;
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/chat/contacts', {
        params: { email },
      })
      .then((res) => {
        setUsers(res.data);
        if (res.data.length > 0) {
          setSelectedRecipient(res.data[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch contacts:', err);
      });
  }, [email]);

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Persoane</h3>
        {users.length === 0 ? (
          <p>Nu sunt persoane.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li
                key={user}
                onClick={() => setSelectedRecipient(user)}
                className={`user-list-item ${
                  selectedRecipient === user ? 'selected' : ''
                }`}
              >
                {user}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-main">
        {selectedRecipient ? (
          <ChatWindow email={email} recipient={selectedRecipient} />
        ) : (
          <p>Selectează un utilizator pentru a conversa</p>
        )}
      </div>
    </div>
  );
}
