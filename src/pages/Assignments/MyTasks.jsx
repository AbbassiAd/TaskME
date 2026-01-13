import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  FileText,
  Car,
  User,
  Award,
  Briefcase,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import styles from './MyTasks.module.css';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const MyTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState(null);
    const [refuseJustification, setRefuseJustification] = useState({});

    useEffect(() => {
        if (!user) return;
        const fetchMyTasks = async () => {
            try {
                const res = await axios.get('/tasks/me');
                setTasks(res.data.map(t => ({
                    ...t,
                    id: t._id || t.id,
                    status: t.status === 'pending' ? 'pending_response' : t.status,
                    pdfFile: t.pdfFile
                })));
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des missions', error);
                setLoading(false);
            }
        };
        fetchMyTasks();
    }, [user]);

    const handleTaskAction = async (taskId, action) => {
        let status = '';
        let justification = '';

        if (action === 'accept') {
            status = 'accepted';
        } else if (action === 'refuse') {
            status = 'refused';
            justification = refuseJustification[taskId];
            if (!justification || justification.trim() === '') {
                return alert('La justification est obligatoire pour refuser la mission.');
            }
        } else return;

        try {
            await axios.put(`/tasks/${taskId}/respond`, { status, justification });
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
            setRefuseJustification(prev => ({ ...prev, [taskId]: '' }));
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la mission', error);
            alert(error.response?.data?.message || 'Impossible de mettre à jour la mission.');
        }
    };

    const toggleTaskDetails = (taskId) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'accepted': return <CheckCircle size={16} className={styles.statusIconAccepted} />;
            case 'refused': return <XCircle size={16} className={styles.statusIconRefused} />;
            case 'pending_response': return <Clock size={16} className={styles.statusIconPending} />;
            default: return null;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'pending_response': return 'En attente de réponse';
            case 'accepted': return 'Acceptée';
            case 'refused': return 'Refusée';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Chargement des missions...</p>
            </div>
        );
    }

    if (!tasks.length) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                    <Briefcase size={48} />
                </div>
                <h3>Aucune mission assignée</h3>
                <p>Vous n'avez pas de missions pour le moment.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Mes Missions</h1>
                <div className={styles.stats}>
                    <span className={styles.statItem}>
                        <span className={styles.statNumber}>{tasks.length}</span>
                        <span className={styles.statLabel}>Mission{tasks.length > 1 ? 's' : ''}</span>
                    </span>
                    <span className={styles.statItem}>
                        <span className={styles.statNumber}>
                            {tasks.filter(t => t.status === 'pending_response').length}
                        </span>
                        <span className={styles.statLabel}>En attente</span>
                    </span>
                </div>
            </header>

            <div className={styles.grid}>
                {tasks.map(task => (
                    <div key={task.id} className={`${styles.card} ${expandedTask === task.id ? styles.expanded : ''}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerLeft}>
                                <div className={styles.typeBadge}>
                                    {task.type}
                                </div>
                                <div className={`${styles.statusBadge} ${styles[task.status]}`}>
                                    {getStatusIcon(task.status)}
                                    <span>{getStatusLabel(task.status)}</span>
                                </div>
                            </div>
                            <button 
                                className={styles.expandBtn}
                                onClick={() => toggleTaskDetails(task.id)}
                            >
                                {expandedTask === task.id ? 'Réduire' : 'Détails'}
                            </button>
                        </div>

                        <div className={styles.cardBody}>
                            <h3 className={styles.title}>{task.name}</h3>
                            <p className={styles.description}>{task.description}</p>

                            <div className={styles.metaGrid}>
                                <div className={styles.metaItem}>
                                    <Calendar className={styles.metaIcon} />
                                    <div>
                                        <span className={styles.metaLabel}>Début</span>
                                        <span className={styles.metaValue}>{formatDate(task.startDate)}</span>
                                    </div>
                                </div>
                                <div className={styles.metaItem}>
                                    <Calendar className={styles.metaIcon} />
                                    <div>
                                        <span className={styles.metaLabel}>Fin</span>
                                        <span className={styles.metaValue}>{formatDate(task.endDate)}</span>
                                    </div>
                                </div>
                                {task.direction && (
                                    <div className={styles.metaItem}>
                                        <MapPin className={styles.metaIcon} />
                                        <div>
                                            <span className={styles.metaLabel}>Direction</span>
                                            <span className={styles.metaValue}>{task.direction}</span>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.metaItem}>
                                    <Users className={styles.metaIcon} />
                                    <div>
                                        <span className={styles.metaLabel}>Capacité</span>
                                        <span className={styles.metaValue}>{task.capacity} personne{task.capacity > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {expandedTask === task.id && (
                                <div className={styles.detailsPanel}>
                                    <div className={styles.detailsGrid}>
                                        {task.specialties && task.specialties.length > 0 && (
                                            <div className={styles.detailSection}>
                                                <h4 className={styles.detailTitle}>
                                                    <Award size={16} />
                                                    Spécialités requises
                                                </h4>
                                                <div className={styles.tags}>
                                                    {task.specialties.map((spec, index) => (
                                                        <span key={index} className={styles.tag}>
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {task.grades && task.grades.length > 0 && (
                                            <div className={styles.detailSection}>
                                                <h4 className={styles.detailTitle}>
                                                    <Award size={16} />
                                                    Grades requis
                                                </h4>
                                                <div className={styles.tags}>
                                                    {task.grades.map((grade, index) => (
                                                        <span key={index} className={styles.tag}>
                                                            {grade}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {task.vehicle && (
                                            <div className={styles.detailSection}>
                                                <h4 className={styles.detailTitle}>
                                                    <Car size={16} />
                                                    Véhicule assigné
                                                </h4>
                                                <div className={styles.vehicleInfo}>
                                                    <p><strong>Marque/Modèle:</strong> {task.vehicle.brand} {task.vehicle.model}</p>
                                                    <p><strong>Immatriculation:</strong> {task.vehicle.matricule}</p>
                                                    <p><strong>Capacité:</strong> {task.vehicle.capacite} places</p>
                                                    <p><strong>Disponibilité:</strong> {task.vehicle.nbPlaceReste} places restantes</p>
                                                </div>
                                            </div>
                                        )}

                                        {task.createdBy && (
                                            <div className={styles.detailSection}>
                                                <h4 className={styles.detailTitle}>
                                                    <User size={16} />
                                                    Créé par
                                                </h4>
                                                <div className={styles.creatorInfo}>
                                                    <p><strong>Nom:</strong> {task.createdBy.username}</p>
                                                    <p><strong>Email:</strong> {task.createdBy.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        {task.refusalJustification && (
                                            <div className={styles.detailSection}>
                                                <h4 className={styles.detailTitle}>
                                                    <AlertCircle size={16} />
                                                    Justification du refus
                                                </h4>
                                                <div className={styles.justificationBox}>
                                                    {task.refusalJustification}
                                                </div>
                                            </div>
                                        )}

                                        {task.pdfFile && (
                                            <div className={styles.detailSection}>
                                                <h4 className={styles.detailTitle}>
                                                    <FileText size={16} />
                                                    Document
                                                </h4>
                                                <a
                                                    href={task.pdfFile.startsWith('http') ? task.pdfFile : `http://localhost:5000/${task.pdfFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.pdfLink}
                                                >
                                                    <ExternalLink size={14} />
                                                    <span>Télécharger le PDF</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Boutons d'action */}
                            {task.status === 'pending_response' && (
                                <div className={styles.actions}>
                                    <div className={styles.actionHeader}>
                                        <Clock size={16} />
                                        <span className={styles.deadlineText}>Réponse requise sous 24h</span>
                                    </div>
                                    
                                    <div className={styles.buttonsContainer}>
                                        <button
                                            className={styles.acceptBtn}
                                            onClick={() => handleTaskAction(task.id, 'accept')}
                                        >
                                            <CheckCircle size={18} /> 
                                            <span>Accepter la mission</span>
                                        </button>

                                        <div className={styles.refuseSection}>
                                            <textarea
                                                placeholder="Veuillez justifier votre refus..."
                                                value={refuseJustification[task.id] || ''}
                                                onChange={e => setRefuseJustification(prev => ({ 
                                                    ...prev, 
                                                    [task.id]: e.target.value 
                                                }))}
                                                className={styles.refuseTextarea}
                                                rows="3"
                                            />
                                            <button
                                                className={styles.refuseBtn}
                                                disabled={!refuseJustification[task.id]?.trim()}
                                                onClick={() => handleTaskAction(task.id, 'refuse')}
                                            >
                                                <XCircle size={18} /> 
                                                <span>Refuser la mission</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {task.status === 'accepted' && (
                                <div className={styles.confirmationBanner}>
                                    <CheckCircle size={24} />
                                    <div>
                                        <h4>Mission confirmée !</h4>
                                        <p>Votre participation a été enregistrée. Bon courage pour votre mission !</p>
                                        {task.vehicle && (
                                            <p className={styles.vehicleNote}>
                                                <Car size={14} />
                                                Un véhicule vous a été assigné pour cette mission.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {task.status === 'refused' && (
                                <div className={styles.refusedBanner}>
                                    <XCircle size={24} />
                                    <div>
                                        <h4>Mission refusée</h4>
                                        <p>Vous avez décliné cette mission.</p>
                                        {task.refusalJustification && (
                                            <p className={styles.refusalNote}>
                                                <strong>Votre justification:</strong> {task.refusalJustification}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.cardFooter}>
                            <span className={styles.taskId}>
                                <FileText size={12} />
                                ID: {task.id?.substring(0, 8)}...
                            </span>
                            <span className={styles.taskMethod}>
                                Méthode: {task.method === 'manuel' ? 'Manuelle' : 'Automatique'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTasks;