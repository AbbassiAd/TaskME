import { useState, useEffect, useRef } from 'react';
import { Send, User, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './Chat.module.css';

const Chat = () => {
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch all users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/users');
                // Filter out current user
                const otherUsers = res.data.filter(u => u._id !== currentUser._id);
                setUsers(otherUsers);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };
        fetchUsers();
    }, [currentUser._id]);

    // Fetch messages when a user is selected
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/chat?userId=${selectedUser._id}`);
                setMessages(res.data.map(msg => ({
                    id: msg._id,
                    sender: msg.sender.username || msg.sender.name, // Handle populated field
                    senderId: msg.sender._id,
                    senderPic: msg.sender.profilePicture, // Add senderPic
                    text: msg.content,
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: msg.sender._id === currentUser._id
                })));
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        };

        fetchMessages();

        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);

    }, [selectedUser, currentUser._id]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedUser) return;

        try {
            const res = await axios.post('/chat', {
                receiverId: selectedUser._id,
                content: input
            });

            // Optimistically add message or wait for polling? 
            // Better to add optimistically for UI responsiveness
            const newMsg = {
                id: res.data._id,
                sender: currentUser.username || currentUser.name,
                senderId: currentUser._id,
                senderPic: currentUser.profilePicture, // Use current user's pic
                text: input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };
            setMessages([...messages, newMsg]);
            setInput('');
        } catch (error) {
            console.error('Error sending message', error);
            alert('Failed to send message');
        }
    };

    const filteredUsers = users.filter(u =>
        (u.username || u.name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to get initials
    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : 'U';
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Messagerie</h1>
            <div className={styles.chatWindow}>
                <div className={styles.sidebar}>
                    <div className={styles.searchBox}>
                        <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
                        <input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.userList}>
                        {filteredUsers.map(u => (
                            <div
                                key={u._id}
                                className={`${styles.userItem} ${selectedUser?._id === u._id ? styles.active : ''}`}
                                onClick={() => setSelectedUser(u)}
                            >
                                <div className={styles.avatar}>
                                    {u.profilePicture ? (
                                        <img src={`http://localhost:5000${u.profilePicture}`} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        getInitials(u.username || u.name)
                                    )}
                                </div>
                                <div className={styles.userInfo}>
                                    <span className={styles.name}>{u.username || u.name}</span>
                                    <span className={styles.role}>{u.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.main}>
                    {selectedUser ? (
                        <>
                            <div className={styles.header}>
                                <div className={styles.avatar}>
                                    {selectedUser.profilePicture ? (
                                        <img src={`http://localhost:5000${selectedUser.profilePicture}`} alt={selectedUser.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        getInitials(selectedUser.username || selectedUser.name)
                                    )}
                                </div>
                                <span className={styles.headerName}>{selectedUser.username || selectedUser.name}</span>
                            </div>

                            <div className={styles.messageList}>
                                {messages.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Aucun message. Commencez la discussion !</p>}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`${styles.message} ${msg.isMe ? styles.me : styles.other}`}>
                                        <div className={styles.messageHeader}>
                                            {!msg.isMe && (
                                                msg.senderPic ?
                                                    <img src={`http://localhost:5000${msg.senderPic}`} className={styles.msgAvatar} alt="" />
                                                    : <div className={styles.msgAvatar} style={{ background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{getInitials(msg.sender)}</div>
                                            )}
                                        </div>
                                        <div className={styles.bubble}>
                                            {msg.text}
                                        </div>
                                        <span className={styles.time}>{msg.time}</span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className={styles.inputArea}>
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                />
                                <button type="submit" disabled={!input.trim()}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                            <User size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Sélectionnez un utilisateur pour commencer à discuter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
