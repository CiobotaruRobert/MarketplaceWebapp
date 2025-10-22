import React from 'react';
import './MessageBubble.css';

export default function MessageBubble({ message, self }) {
  return (
    <div className={`message-bubble ${self ? 'sent' : 'received'}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-meta">
        <small>{self ? 'Tu' : message.sender}</small>
      </div>
    </div>
  );
}
