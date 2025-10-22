import React, { useState } from 'react';
import './MessageInput.css';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() !== '') {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        placeholder="Scrie un mesaj..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Trimite</button>
    </div>
  );
}
