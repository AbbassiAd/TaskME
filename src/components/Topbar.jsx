import { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Topbar.module.css';
import Notifications from './Notifications';

const Topbar = ({ title }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showNotifs, setShowNotifs] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/notifications');
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Optionnel: polling toutes les minutes
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className={styles.topbar}>
            <h1 className={styles.title}>{title || 'Dashboard'}</h1>

            <div className={styles.actions}>
               

                <div className={styles.notificationWrapper}>
                    {/* Theme Toggle Button */}
                    <button onClick={toggleTheme} className={styles.iconBtn} style={{ marginRight: '0.5rem' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <button className={styles.iconBtn} onClick={() => setShowNotifs(!showNotifs)}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </button>
                    {showNotifs && <Notifications onClose={() => setShowNotifs(false)} onUpdate={fetchUnreadCount} />}
                </div>

                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        {user?.profilePicture ? (
                            <img
                                src={`http://localhost:5000${user.profilePicture}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : (
                            (user?.username || user?.name || 'U').charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.username || user?.name || 'Guest'}</span>
                        <span className={styles.userRole}>
                            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Visitor'}
                        </span>
                        <a href="/profile" className={styles.profileLink}>Mon Profil</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
