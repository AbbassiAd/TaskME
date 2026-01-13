import { Bell, Check, Info, AlertTriangle } from 'lucide-react';
import styles from './Notifications.module.css';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Mock Data removed

const Notifications = ({ onClose, onUpdate }) => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            // Assuming backend supports this or we loop
            // For now, loop client side or better add a route.
            // But to keep it simple and safe with existing routes:
            const unread = notifications.filter(n => !n.read);
            await Promise.all(unread.map(n => axios.put(`/notifications/${n._id}`)));
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className={styles.dropdown}>
            <div className={styles.header}>
                <h3>Notifications</h3>
                <button className={styles.markRead} onClick={handleMarkAllRead}>Tout marquer comme lu</button>
            </div>
            <div className={styles.list}>
                {notifications.length === 0 && <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Aucune notification</p>}
                {notifications.map(notif => (
                    <div key={notif._id} className={`${styles.item} ${styles[notif.type]}`}>
                        <div className={styles.icon}>
                            {notif.type === 'assignment' && <Info size={16} />}
                            {notif.type === 'success' && <Check size={16} />}
                            {notif.type === 'info' && <Info size={16} />}
                            {notif.type === 'warning' && <AlertTriangle size={16} />}
                            {notif.type === 'alert' && <AlertTriangle size={16} />}
                            {notif.type === 'message' && <Bell size={16} />}
                        </div>
                        <div className={styles.content} onClick={() => !notif.read && handleMarkRead(notif._id)} style={{ cursor: !notif.read ? 'pointer' : 'default', opacity: notif.read ? 0.6 : 1 }}>
                            <p className={styles.text}>{notif.message}</p>
                            <span className={styles.time}>{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
