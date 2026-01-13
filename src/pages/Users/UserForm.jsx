import { useState } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import styles from './UserForm.module.css';
import { useAuth } from '../../context/AuthContext';

const UserForm = ({ onClose, onSuccess, user }) => {
    const { user: userConnected } = useAuth();

    const [formData, setFormData] = useState({
        username: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'auditor',
        specialty: user?.specialty || '',
        grade: user?.grade || 'A'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = { ...formData };

            // 🔐 Forcer le rôle si ce n’est pas un superadmin
            if (userConnected?.role !== 'superadmin') {
                payload.role = user?.role || 'auditor';
            }

            // Nettoyage des champs selon le rôle
            if (payload.role !== 'auditor') {
                delete payload.specialty;
                delete payload.grade;
            }

            if (user) {
                if (!payload.password) delete payload.password;
                await axios.put(`/users/${user.id}`, payload);
            } else {
                await axios.post('/auth/register', payload);
            }

            onClose?.();
            onSuccess?.();
        } catch (error) {
            console.error('Error saving user', error);
            alert(error.response?.data?.message || 'Erreur inconnue');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                    </h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Nom d'utilisateur</label>
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!user}
                            />
                        </div>

                        {/* 🔐 ROLE — SUPERADMIN ONLY */}
                        {userConnected?.role === 'superadmin' && (
                            <div className={styles.field}>
                                <label>Rôle</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="auditor">Auditeur</option>
                                    <option value="coordinator">Coordinateur</option>
                                    <option value="superadmin">Administrateur</option>
                                </select>
                            </div>
                        )}

{(formData.role === 'auditor' || formData.role === 'coordinator') && (
    <>
        <div className={styles.field}>
            <label>Spécialité</label>
            <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
            >
                <option value="">Sélectionner...</option>
                <option value="pedagogique">Pédagogique</option>
                <option value="orientation">Orientation</option>
                <option value="planification">Planification</option>
                <option value="financier">Services Financiers</option>
            </select>
        </div>

        <div className={styles.field}>
            <label>Grade</label>
            <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
            >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
            </select>
        </div>
    </>
)}

                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                        >
                            Annuler
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            <Save size={18} />
                            <span>Enregistrer</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
