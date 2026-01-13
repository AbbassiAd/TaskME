import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Camera, Save, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, login } = useAuth(); // login used to refresh token if needed, or we might need a refreshUser function
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        confirmPassword: ''
    });
    const [preview, setPreview] = useState(user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        setPreview(URL.createObjectURL(file));

        // Upload immediately
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await axios.post('/users/profile/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Force reload or update context?
            // Ideally update context, but for now a reload is simple
            setMessage({ type: 'success', text: 'Photo mise à jour !' });
            // Update local storage user manually to see changes immediately without reload
            const updatedUser = { ...user, profilePicture: res.data.profilePicture };
            localStorage.setItem('taskme_user', JSON.stringify(updatedUser));
            window.location.reload();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'upload' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }

        try {
            const payload = {
                email: formData.email,
                phone: formData.phone
            };
            if (formData.password) payload.password = formData.password;

            const res = await axios.put('/users/profile/me', payload);

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });

            // Update local storage
            localStorage.setItem('taskme_user', JSON.stringify({ ...user, ...res.data }));

            // Clear password fields
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour' });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer} onClick={() => fileInputRef.current.click()}>
                        {preview ? (
                            <img src={preview} alt="Profile" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {(user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={styles.overlay}>
                            <Camera size={24} color="white" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <div className={styles.userInfo}>
                        <h2>{user?.username}</h2>
                        <span className={styles.roleBadge}>{user?.role}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {message.text && (
                        <div className={`${styles.alert} ${message.type === 'error' ? styles.error : styles.success}`}>
                            {message.text}
                        </div>
                    )}

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Informations Personnelles</h3>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>Nom d'utilisateur (Lecture seule)</label>
                                <div className={styles.readOnlyField}>
                                    <UserIcon size={16} />
                                    <span>{user?.username}</span>
                                </div>
                            </div>

                            {user?.role === 'auditor' && (
                                <>
                                    <div className={styles.group}>
                                        <label>Spécialité</label>
                                        <div className={styles.readOnlyField}>
                                            <span>{user?.specialty}</span>
                                        </div>
                                    </div>
                                    <div className={styles.group}>
                                        <label>Grade</label>
                                        <div className={styles.readOnlyField}>
                                            <span>{user?.grade}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                           
                                <label>  <Mail size={16} />Email</label>
                              
                                <div className={styles.inputWrapper}>
                                  
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>   <Phone size={16} /> Téléphone</label>
                                <div className={styles.inputWrapper}>
                                 
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Sécurité</h3>
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label><Lock size={16} /> Nouveau Mot de passe</label>
                                <div className={styles.inputWrapper}>
                                    
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Laisser vide pour ne pas changer"
                                    />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>  <Lock size={16} /> Confirmer Mot de passe</label>
                                <div className={styles.inputWrapper}>
                                  
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirmer nouveau mot de passe"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.saveBtn}>
                            <Save size={18} />
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
