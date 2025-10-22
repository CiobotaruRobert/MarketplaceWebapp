import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./ViewAd.css";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BuyerForm from "./BuyerForm";

export default function ViewAd() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");
  const [messageWindowOpen, setMessageWindowOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  const clientRef = useRef(null);
  let currentUserId = null;
  let currentUserEmail = null;
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserEmail = decoded?.sub || null;
      currentUserId = decoded?.userId || null;
      console.log(currentUserEmail);
      console.log(currentUserId);
    } catch (err) {
      console.error("Invalid token", err);
      currentUserEmail = null;
      currentUserId = null;
    }
  }


  const [notifications, setNotifications] = useState([]);

  const onNotificationReceived = (message) => {
    const notification = JSON.parse(message.body);
    setNotifications((prev) => [notification, ...prev]);
  };

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/ads/${id}`)
      .then((res) => {
        setAd(res.data);
        console.log("Fetched ad data:", res.data);
      })
      .catch(() => setError("Nu am găsit anunțul."));
  }, [id]);

  useEffect(() => {
    if (!ad?.user?.email || !currentUserEmail) return;

    const token = localStorage.getItem('token');
    const socket = new SockJS(`http://localhost:8080/ws-chat?token=${token}`);

    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', onNotificationReceived);
        client.subscribe("/user/queue/messages", (msg) => {
          const message = JSON.parse(msg.body);
          if (
            (message.sender === currentUserEmail && message.recipient === ad.user.email) ||
            (message.sender === ad.user.email && message.recipient === currentUserEmail)
          ) {
            setMessages((prev) => [...prev, message]);
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [ad?.user?.email, currentUserEmail]);


  useEffect(() => {
    if (!messageWindowOpen || !ad?.user?.email) return;

    axios
      .get("http://localhost:8080/api/chat/history", {
        params: { sender: currentUserEmail, recipient: ad.user.email },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => {
        console.error("Failed to load chat history", err);
        setMessages([]);
      });
  }, [messageWindowOpen, ad, currentUserEmail]);

  const handleSendMessage = () => {
    if (messageContent.trim() === "") return;
    if (!clientRef.current || !clientRef.current.connected) {
      console.error("WebSocket not connected");
      return;
    }

    const newMessage = {
      sender: currentUserEmail,
      recipient: ad.user.email,
      content: messageContent.trim(),
    };

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(newMessage),
    });

    setMessages((prev) => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
    setMessageContent("");
  };

  const handlePrev = () => {
    if (ad?.photos?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? ad.photos.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNext = () => {
    if (ad?.photos?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === ad.photos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  if (error) return <div className="viewad-error">{error}</div>;
  if (!ad) return <div className="viewad-loading">Loading...</div>;

  const currentImageUrl = ad.photos?.[currentImageIndex]?.imageUrl;

  return (
    <div className="viewad-wrapper">
      <div className="viewad-left">
        <div className="carousel-container">
          {ad.photos && ad.photos.length > 0 && (
            <>
              <button className="carousel-btn left" onClick={handlePrev}>
                &lt;
              </button>
              <img src={currentImageUrl} alt={ad.title} className="carousel-image" />
              <button className="carousel-btn right" onClick={handleNext}>
                &gt;
              </button>
            </>
          )}
        </div>

        <div className="ad-details">
          <h1 className="viewad-title">{ad.title}</h1>
          <h2 className="viewad-price">{ad.price} RON</h2>
          <p className="viewad-description">{ad.description}</p>
          <p className="viewad-category">Categorie: {ad.category?.name}</p>
        </div>
      </div>

      <div className="viewad-right">
        <div className="right-box seller-box">
          <h3>Contact vânzător</h3>
          <p>
            <strong>Nume:</strong> {ad.user?.name}
          </p>
          <p>
            <strong>Email:</strong> {ad.user?.email}
          </p>
          <p>
            <strong>Tel.:</strong> {ad.user?.phone || "Nespecificat"}
          </p>
          <p>
            <strong>Locație:</strong> {ad.user?.location || "Nespecificat"}
          </p>
          <button className="message-btn" onClick={() => setMessageWindowOpen(true)}>
            Trimite mesaj
          </button>
        </div>
        <div className="right-box buy-box">
            <button
              className="buy-btn"
              onClick={() => setShowBuyerForm(true)}
              >
              Cumpără acum
            </button>
        </div>
      </div>
      {showBuyerForm && (
        <BuyerForm
          ad={ad}
          buyerId={currentUserId}
          onClose={() => setShowBuyerForm(false)}
        />
      )}
      <div className={`message-window ${messageWindowOpen ? "open" : ""}`}>
        <div className="message-window-header">
          <span>Trimite un mesaj vânzătorului</span>
          <button
            className="close-btn"
            onClick={() => setMessageWindowOpen(false)}
            aria-label="Close message window"
          >
            ×
          </button>
        </div>

        <div className="message-window-body">
          {messages.length === 0 && <p className="no-messages">Niciun mesaj.</p>}
          {messages.map((msg, i) => {
            const isSelf = msg.sender === currentUserEmail;
            return (
              <div
                key={i}
                className={`message-row ${isSelf ? "self" : "other"}`}
              >
                <div className={`message-bubble ${isSelf ? "self" : "other"}`}>
                  {msg.content}
                  <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              </div>
            );
          })}

        </div>

        <div className="message-window-footer">
          <textarea
            placeholder="Întreabă ceva..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows={3}
          />
          <button onClick={handleSendMessage} className="send-btn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
