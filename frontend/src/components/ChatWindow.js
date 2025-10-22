import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import axios from 'axios';
import './ChatWindow.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChatWindow({ email, recipient }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [notifications, setNotifications] = useState([]);

  const onNotificationReceived = (message) => {
    const notification = JSON.parse(message.body);
    setNotifications((prev) => [notification, ...prev]);
  };


useEffect(() => {
  setMessages([]);
  axios
    .get('http://localhost:8080/api/chat/history', {
      params: { sender: email, recipient },
    })
    .then((res) => {
      setMessages(res.data);
    })
    .catch((err) => console.error('Eroare la incarcarea istoricului:', err));
}, [email, recipient]);


  useEffect(() => {
    const token = localStorage.getItem('token');

    const socket = new SockJS(`http://localhost:8080/ws-chat?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/user/queue/notifications', onNotificationReceived);
        client.subscribe('/user/queue/messages', (msg) => {
          const message = JSON.parse(msg.body);
          if (
            (message.sender === email && message.recipient === recipient) ||
            (message.sender === recipient && message.recipient === email)
          ) {
            setMessages((prev) => [...prev, message]);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [email, recipient]);

  const sendMessage = (content) => {
    if (!connected) {
      console.warn('STOMP neconectat');
      return;
    }

    const message = {
      sender: email,
      recipient,
      content,
    };

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });

    setMessages((prev) => [
      ...prev,
      { ...message, timestamp: new Date().toISOString() },
    ]);
  };



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Conversație cu {recipient}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} self={msg.sender === email} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
