import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Calendar,
    MapPin,
    Users as UsersIcon,
    FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './TaskList.module.css';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // ===============================
    // STATUS CALCULATION
    // ===============================
    const getTaskStatusFromAssignments = (assignments = []) => {
        if (assignments.some(a => a.status === 'finished')) {
            return 'finished';
        }

        if (assignments.some(a =>
            a.status === 'accepted' || a.status === 'delegated'
        )) {
            return 'assigned';
        }

        if (
            assignments.length > 0 &&
            assignments.every(a => a.status === 'refused')
        ) {
            return 'refused';
        }

        return 'pending';
    };

  
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get('/tasks');

                const mappedTasks = res.data.map(task => ({
                    id: task._id,
                    title: task.name,
                    type: task.type,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    status: getTaskStatusFromAssignments(task.assignments),
                    remunerated: task.isPaid,
                    places: task.capacity,
                    direction: task.direction
                }));

                setTasks(mappedTasks);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tasks', error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // ===============================
    // BADGE LABELS
    // ===============================
    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'En attente', class: 'pending' };
            case 'assigned':
                return { label: 'Affectée', class: 'assigned' };
            case 'finished':
                return { label: 'Terminée', class: 'completed' };
            case 'refused':
                return { label: 'Refusée', class: 'refused' };
            default:
                return { label: status, class: 'default' };
        }
    };

    // ===============================
    // FILTER + SEARCH
    // ===============================
    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'all' || task.status === filter;
        const matchesSearch = task.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // ===============================
    // RENDER
    // ===============================
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.filters}>
                    <div className={styles.search}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Rechercher une tâche..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className={styles.filterSelect}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="assigned">Affectée</option>
                        <option value="finished">Terminée</option>
                        <option value="refused">Refusée</option>
                    </select>
                </div>

                <Link to="/tasks/new" className={styles.createBtn}>
                    <Plus size={20} />
                    <span>Créer une Tâche</span>
                </Link>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    Chargement des tâches...
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredTasks.map(task => {
                        const status = getStatusLabel(task.status);

                        return (
                            <div key={task.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span
                                        className={`${styles.badge} ${styles[status.class]}`}
                                    >
                                        {status.label}
                                    </span>

                                    {task.remunerated && (
                                        <span className={styles.remuneratedBadge}>
                                            $
                                        </span>
                                    )}
                                </div>

                                <h3 className={styles.cardTitle}>
                                    {task.title}
                                </h3>

                                <div className={styles.cardMeta}>
                                    <div className={styles.metaItem}>
                                        <FileText size={16} />
                                        <span>{task.type}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <Calendar size={16} />
                                        <span>
                                            {new Date(task.startDate)
                                                .toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <MapPin size={16} />
                                        <span>{task.direction}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <UsersIcon size={16} />
                                        <span>{task.places} places</span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <Link
                                        to={`/tasks/${task.id}`}
                                        className={styles.viewBtn}
                                    >
                                        Voir Détails
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TaskList;
