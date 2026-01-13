import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Users } from 'lucide-react';
import styles from './TaskAssignment.module.css';
import axios from 'axios';

const TaskAssignment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('manual'); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [justification, setJustification] = useState('');

    // Charger les détails de la tâche
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await axios.get(`/tasks/${id}`);
                setTask(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchTask();
    }, [id]);

    // Charger les candidats selon le mode
    const fetchCandidates = async () => {
        setLoading(true);
        try {
            let res;
            if (mode === 'manual') {
                // Mode manuel → tous les auditeurs
                res = await axios.get(`/users/auditor`);
                setCandidates(res.data.map(user => ({ user }))); // garder même format que suggestions
            } else {
                // Mode semi-auto / IA → suggestions
                res = await axios.get(`/tasks/${id}/suggestions`);
                setCandidates(res.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des candidats', error);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
        setSelectedUser(null);
        setJustification('');
    }, [mode, id]);

    const handleAssign = async () => {
        if (!selectedUser) return alert('Veuillez sélectionner un auditeur');
        if (mode !== 'manual' && !justification) return alert('Une justification est requise pour ce mode');

        try {
            await axios.post(`/tasks/${id}/assign`, {
                userId: selectedUser._id,
                method: mode,
                justification
            });
            alert('Affectation réussie !');
            navigate(`/tasks/${id}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de l’affectation');
            console.error(error);
        }
    };

    if (!task) return <div className="p-8">Chargement...</div>;

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(`/tasks/${id}`)} className={styles.backBtn}>
                <ArrowLeft size={18} /> Retour aux détails
            </button>

            <header className={styles.header}>
                <h1 className={styles.title}>Affectation : {task.name}</h1>
                <p className={styles.subtitle}>{task.type} • {new Date(task.startDate).toLocaleDateString()}</p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${mode === 'manual' ? styles.activeTab : ''}`}
                    onClick={() => setMode('manual')}
                >
                    <Users size={18} style={{ marginRight: 8 }} />
                    Manuel
                </button>
                <button
                    className={`${styles.tab} ${mode === 'semi-auto' ? styles.activeTab : ''}`}
                    onClick={() => setMode('semi-auto')}
                >
                    <Zap size={18} style={{ marginRight: 8 }} />
                    Semi-Automatisé
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">Chargement des candidats...</div>
            ) : (
                <div className={styles.grid}>
                    {candidates.length === 0 && <p>Aucun candidat trouvé pour ce mode.</p>}
                    {candidates.map((item) => {
                        const user = item.user;
                        const isSelected = selectedUser?._id === user._id;

                        return (
                            <div
                                key={user._id}
                                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div className="font-bold">{user.username}</div>
                                            <div className="text-xs text-muted">{user.specialty} • Grade {user.grade}</div>
                                        </div>
                                    </div>
                                    {mode !== 'manual' && <div className={styles.score}>{Math.round(item.score)}%</div>}
                                </div>

                                {item.reasons && item.reasons.length > 0 && (
                                    <div className={styles.reasons}>
                                        <h4 className={styles.reasonTitle}>Analyse :</h4>
                                        <ul className={styles.reasonList}>
                                            {item.reasons.map((r, idx) => (
                                                <li key={idx} className={styles.reasonItem}>
                                                    <Check size={14} className={styles.check} />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedUser && (
                <div className={styles.actions}>
                    <h3>Validation de l'affectation</h3>
                    <p className="mb-4">
                        Vous allez affecter <strong>{selectedUser.username}</strong> via le mode{' '}
                        <strong>{mode === 'manual' ? 'Manuel' : 'Semi-Automatisé'}</strong>.
                    </p>

                    {mode !== 'manual' && (
                        <>
                            <label className="block text-sm font-medium mb-2">Justification (obligatoire)</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Expliquez pourquoi ce choix a été validé..."
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                            />
                        </>
                    )}

                    <button className={styles.confirmBtn} onClick={handleAssign}>
                        Confirmer l'affectation
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskAssignment;
