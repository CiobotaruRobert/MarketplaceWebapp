import React, { useEffect, useRef, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import './NotificationDropdown.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationDropdown = ({ token }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const clientRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (!token) return;

    const socket = new SockJS(`http://localhost:8080/ws-chat?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (msg) => {
          const notification = JSON.parse(msg.body);
          setNotifications((prev) => [notification, ...prev]);

          toast.info(` ${notification.sender}: ${notification.messagePreview}`, {
            position: 'top-right',
            autoClose: 5000,
            theme: 'colored',
          });
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen(!open);
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:8080/api/notifications/read-all', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="notification-button"
        aria-label="Notifications"
        type="button"
      >
        <FaBell />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <ul className="notification-list">
            {notifications.length === 0 ? (
              <li className="notification-empty">Nu aveți notificări</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className="notification-item"
                  tabIndex={0}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <p className="notification-message">
                    <strong>{n.sender}</strong>: {n.messagePreview}
                  </p>
                  <p className="notification-timestamp">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>

          {notifications.length > 0 && (
            <button className="notification-mark-all-btn" onClick={markAllAsRead}>
              Marcați ca citit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
