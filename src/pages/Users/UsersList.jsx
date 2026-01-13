import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import axios from 'axios';

import UserForm from './UserForm';
import styles from './UsersList.module.css';
import { useAuth } from '../../context/AuthContext';

const UsersList = () => {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

 
    const fetchUsers = async () => {
        try {
            let url = '/users';

            if (user?.role === 'coordinator') {
                url = '/users/auditor';
            }

            const res = await axios.get(url);

            setUsers(
                res.data.map(u => ({
                    id: u._id,
                    name: u.username,
                    email: u.email,
                    role: u.role,
                    specialty: u.specialty || '',
                    grade: u.grade || '',
                    profilePicture: u.profilePicture || null
                }))
            );

            setLoading(false);
        } catch (error) {
            console.error('Error fetching users', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

  
    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await axios.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            console.error('Error deleting user', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedUser(null);
    };


    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <p style={{ padding: '20px' }}>Chargement...</p>;
    }


    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Gestion des Utilisateurs</h1>

            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* SUPERADMIN ONLY */}
                {user?.role === 'superadmin' && (
                    <button
                        className={styles.addButton}
                        onClick={() => {
                            setSelectedUser(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={20} />
                        <span>Nouvel Utilisateur</span>
                    </button>
                )}
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nom Complet</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Spécialité</th>
                            <th>Grade</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((userItem) => (
                            <tr key={userItem.id}>
                                <td className={styles.nameCell}>
                                    <div className={styles.avatar}>
                                        {userItem.profilePicture ? (
                                            <img
                                                src={`http://localhost:5000${userItem.profilePicture}`}
                                                alt={userItem.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            userItem.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span>{userItem.name}</span>
                                </td>

                                <td>{userItem.email}</td>

                                <td>
                                    <span className={`${styles.badge} ${styles[userItem.role]}`}>
                                        {userItem.role}
                                    </span>
                                </td>

                                <td>{userItem.specialty}</td>

                                <td>
                                    <span className={styles.gradeBadge}>
                                        {userItem.grade}
                                    </span>
                                </td>

                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEdit(userItem)}
                                        >
                                            <Edit2 size={16} />
                                        </button>

                                        {/* DELETE ONLY FOR SUPERADMIN */}
                                        {user?.role === 'superadmin' && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.delete}`}
                                                onClick={() => handleDelete(userItem.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <UserForm
                    onClose={handleClose}
                    onSuccess={fetchUsers}
                    user={selectedUser}
                />
            )}
        </div>
    );
};

export default UsersList;
