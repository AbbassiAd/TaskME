import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Tag, 
  DollarSign, 
  Car, 
  User, 
  Award,
  Trash2,
  Edit,
  AlertCircle
} from 'lucide-react';
import styles from './TaskDetails.module.css';
import axios from 'axios';

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [refusedJustification, setRefusedJustification] = useState('');

    const getTaskStatusFromAssignments = (assignments = []) => {
        if (assignments.some(a => a.status === 'finished')) return 'finished';
        if (assignments.some(a => ['accepted', 'delegated'].includes(a.status))) return 'assigned';
        if (assignments.length > 0 && assignments.every(a => a.status === 'refused')) return 'refused';
        return 'pending';
    };

    const extractRefusedJustification = (assignments = []) => {
        // Récupère la première justification de refus trouvée
        const refusedAssignment = assignments.find(a => a.status === 'refused' && a.justification);
        return refusedAssignment ? refusedAssignment.justification : '';
    };

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await axios.get(`/tasks/${id}`);
                const data = res.data;

                // Format des dates
                const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const taskAssignments = data.assignments || [];
                const taskStatus = getTaskStatusFromAssignments(taskAssignments);
                const justification = extractRefusedJustification(taskAssignments);

                const mappedTask = {
                    id: data._id,
                    title: data.name,
                    description: data.description,
                    type: data.type,
                    scope: data.scope,
                    startDate: formatDate(data.startDate),
                    endDate: formatDate(data.endDate),
                    startDateISO: data.startDate,
                    endDateISO: data.endDate,
                    status: taskStatus,
                    remunerated: data.isPaid,
                    places: data.capacity,
                    assignedCount: data.assignments.length,
                    remainingPlaces: data.capacity - data.assignments.length,
                    direction: data.direction,
                    specialties: data.specialties || [],
                    grades: data.grades || [],
                    vehicleNeeded: data.needsVehicle,
                    vehicle: data.vehicle,
                    pdfFile: data.pdfFile,
                    createdAt: formatDate(data.createdAt),
                    createdBy: data.createdBy?.username || 'Non spécifié',
                    assignments: taskAssignments
                };

                setTask(mappedTask);
                setAssignments(taskAssignments);
                setRefusedJustification(justification);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching task', error);
                setLoading(false);
            }
        };

        fetchTask();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
            try {
                await axios.delete(`/tasks/${id}`);
                navigate('/tasks');
            } catch (error) {
                console.error('Error deleting task', error);
                alert('Erreur lors de la suppression de la tâche');
            }
        }
    };

    if (loading) return (
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Chargement des détails...</p>
        </div>
    );

    if (!task) return (
        <div className={styles.error}>
            <h2>Tâche non trouvée</h2>
            <p>La tâche que vous recherchez n'existe pas ou a été supprimée.</p>
            <button onClick={() => navigate('/tasks')} className={styles.backBtn}>
                Retour à la liste
            </button>
        </div>
    );

    const getStatusLabel = (status) => {
        switch(status) {
            case 'pending': return 'En attente';
            case 'assigned': return 'Affectée';
            case 'finished': return 'Terminée';
            case 'refused': return 'Refusée';
            case 'delegated': return 'Déléguée';
            default: return status;
        }
    };

    return (
        <div className={styles.container}>
            {/* Bouton de retour */}
            <button onClick={() => navigate('/tasks')} className={styles.backBtn}>
                <ArrowLeft size={20} />
                <span>Retour à la liste</span>
            </button>

            {/* En-tête avec titre et actions */}
            <div className={styles.header}>
                <div className={styles.titleWrapper}>
                    <h1 className={styles.title}>{task.title}</h1>
                    <div className={styles.statusWrapper}>
                        <span className={`${styles.badge} ${styles[task.status]}`}>
                            {getStatusLabel(task.status)}
                        </span>
                        <span className={`${styles.scopeBadge} ${styles[task.scope]}`}>
                            {task.scope === 'particuliere' ? 'Particulière' : 'Générale'}
                        </span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        className={styles.editBtn}
                        onClick={() => navigate(`/tasks/edit/${id}`)}
                    >
                        <Edit size={18} />
                        Modifier
                    </button>
                    <button 
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                    >
                        <Trash2 size={18} />
                        Supprimer
                    </button>
                    <button 
                        className={styles.assignBtn}
                        onClick={() => navigate(`/tasks/${task.id}/assign`)}
                    >
                        Gérer les Affectations ({task.assignedCount}/{task.places})
                    </button>
                </div>
            </div>

            {/* Grille principale */}
            <div className={styles.grid}>
                <div className={styles.mainCard}>
                    <h2 className={styles.sectionTitle}>
                        <Tag size={20} />
                        Détails de la Mission
                    </h2>

                    {/* Section justification du refus */}
                    {task.status === 'refused' && refusedJustification && (
                        <div className={styles.refusedWarning}>
                            <div className={styles.warningHeader}>
                                <AlertCircle size={20} />
                                <h3>Mission Refusée - Justification</h3>
                            </div>
                            <div className={styles.justificationContent}>
                                <p>{refusedJustification}</p>
                                {assignments.filter(a => a.status === 'refused' && a.justification).length > 1 && (
                                    <div className={styles.multipleRefusals}>
                                        <small>
                                            {assignments.filter(a => a.status === 'refused').length} affectation(s) refusée(s)
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Type de mission:</span>
                            <span className={styles.detailValue}>{task.type}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Portée:</span>
                            <span className={styles.detailValue}>
                                {task.scope === 'particuliere' ? 'Mission Particulière' : 'Mission Générale'}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}><Calendar size={16}/> Période:</span>
                            <span className={styles.detailValue}>
                                Du {task.startDate} au {task.endDate}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}><MapPin size={16}/> Direction:</span>
                            <span className={styles.detailValue}>{task.direction}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}><Users size={16}/> Capacité:</span>
                            <div className={styles.capacityInfo}>
                                <span className={styles.detailValue}>{task.places} places</span>
                                <span className={`${styles.placesBadge} ${task.remainingPlaces === 0 ? styles.full : ''}`}>
                                    {task.assignedCount} affectés • {task.remainingPlaces} restantes
                                </span>
                            </div>
                        </div>

                        {/* Section détaillée des affectations si la mission est refusée */}
                        {task.status === 'refused' && assignments.length > 0 && (
                            <div className={styles.assignmentsDetails}>
                                <h4 className={styles.assignmentsTitle}>Détail des refus</h4>
                                <div className={styles.assignmentsList}>
                                    {assignments
                                        .filter(a => a.status === 'refused')
                                        .map((assignment, index) => (
                                            <div key={index} className={styles.assignmentItem}>
                                                <div className={styles.assignmentHeader}>
                                                    <span className={styles.assignmentUser}>
                                                        {assignment.user?.username || 'Utilisateur inconnu'}
                                                    </span>
                                                  
                                                </div>
                                                {assignment.Refusjustification && (
                                                    <div className={styles.assignmentJustification}>
                                                        <strong>Justification :</strong>
                                                        <p>{assignment.Refusjustification}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}><DollarSign size={16}/> Rémunération:</span>
                            <span className={`${styles.detailValue} ${task.remunerated ? styles.paid : styles.unpaid}`}>
                                {task.remunerated ? 'Rémunérée' : 'Non rémunérée'}
                            </span>
                        </div>

                        {task.vehicleNeeded && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}><Car size={16}/> Véhicule:</span>
                                <span className={styles.detailValue}>
                                    {task.vehicle ? `${task.vehicle.brand} ${task.vehicle.model} (${task.vehicle.matricule})` : 'Véhicule requis mais non affecté'}
                                </span>
                            </div>
                        )}

                        {task.specialties.length > 0 && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Spécialités:</span>
                                <div className={styles.tags}>
                                    {task.specialties.map((s, i) => (
                                        <span key={i} className={styles.tag}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {task.grades.length > 0 && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}><Award size={16}/> Grades requis:</span>
                                <div className={styles.tags}>
                                    {task.grades.map((g, i) => (
                                        <span key={i} className={styles.gradeTag}>{g}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}><User size={16}/> Créé par:</span>
                            <span className={styles.detailValue}>{task.createdBy}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Date de création:</span>
                            <span className={styles.detailValue}>{task.createdAt}</span>
                        </div>

                        {task.pdfFile && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}><FileText size={16}/> Document:</span>
                                <a
                                    href={task.pdfFile.startsWith('http') ? task.pdfFile : `http://localhost:5000/${task.pdfFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.pdfLink}
                                >
                                    Télécharger le PDF
                                </a>
                            </div>
                        )}

                        {task.description && (
                            <div className={styles.descriptionSection}>
                                <h3 className={styles.subtitle}>Description</h3>
                                <div className={styles.descriptionContent}>
                                    {task.description.split('\n').map((p, i) => <p key={i}>{p || <br/>}</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;