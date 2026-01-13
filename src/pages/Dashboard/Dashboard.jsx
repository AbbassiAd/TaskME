import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart as BarIcon, 
  Activity, 
  Users, 
  CheckCircle,
  Car,
  FileText,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'framer-motion';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon: Icon, trend, trendClass, color, delay, onClick }) => (
    <motion.div
        className={`${styles.statCard} ${styles[color]}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        onClick={onClick}
    >
        <div className={styles.cardHeader}>
            <span className={styles.title}>{title}</span>
            <div className={styles.iconWrapper}>
                <Icon size={24} />
            </div>
        </div>
        <div className={styles.value}>{value}</div>
        {trend && <div className={`${styles.trend} ${styles[trendClass]}`}>{trend}</div>}
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        activeAuditors: 0,
        assignmentRate: 0,
        activeVehicles: 0,
        upcomingTasks: 0,
        completionRate: 0,
        avgTaskDuration: 0
    });
    
    const [chartData, setChartData] = useState([]);
    const [taskStatusData, setTaskStatusData] = useState([]);
    const [vehicleData, setVehicleData] = useState([]);
    const [auditorPerformance, setAuditorPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
    const [activeView, setActiveView] = useState('overview');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const calculateTaskStatus = (tasks) => {
        const statusCounts = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0
        };

        const now = new Date();
        
        tasks.forEach(task => {
            const hasAssignments = task.assignments && task.assignments.length > 0;
            const hasAccepted = hasAssignments && task.assignments.some(a => a.status === 'accepted');
            const hasRefused = hasAssignments && task.assignments.some(a => a.status === 'refused');
            
            const startDate = new Date(task.startDate);
            const endDate = new Date(task.endDate);
            
            if (now < startDate) {
                statusCounts.pending++;
            } else if (now >= startDate && now <= endDate) {
                if (hasAccepted) {
                    statusCounts.inProgress++;
                } else {
                    statusCounts.pending++;
                }
            } else if (now > endDate) {
                if (hasAccepted) {
                    statusCounts.completed++;
                } else {
                    statusCounts.cancelled++;
                }
            }
        });

        return [
            { name: 'En attente', value: statusCounts.pending, color: '#FFBB28' },
            { name: 'En cours', value: statusCounts.inProgress, color: '#0088FE' },
            { name: 'Terminées', value: statusCounts.completed, color: '#00C49F' },
            { name: 'Annulées', value: statusCounts.cancelled, color: '#FF8042' }
        ];
    };

    const calculateVehicleUtilization = (vehicles) => {
        return vehicles.map(vehicle => ({
            name: `${vehicle.brand} ${vehicle.model}`,
            matricule: vehicle.matricule,
            capacity: vehicle.capacite,
            available: vehicle.nbPlaceReste,
            used: vehicle.capacite - vehicle.nbPlaceReste,
            utilization: Math.round(((vehicle.capacite - vehicle.nbPlaceReste) / vehicle.capacite) * 100),
            status: vehicle.status
        }));
    };

    const calculateAuditorPerformance = (users, tasks) => {
        const auditors = users.filter(u => u.role === 'auditor');
        return auditors.map(auditor => {
            const auditorTasks = tasks.filter(task => 
                task.assignments?.some(assignment => 
                    assignment.user?._id === auditor._id && 
                    assignment.status === 'accepted'
                )
            );
            
            const completedTasks = auditorTasks.filter(task => {
                const endDate = new Date(task.endDate);
                return endDate < new Date();
            }).length;
            
            return {
                name: auditor.username,
                tasks: auditorTasks.length,
                completed: completedTasks,
                completionRate: auditorTasks.length > 0 ? 
                    Math.round((completedTasks / auditorTasks.length) * 100) : 0,
                specialty: auditor.specialty
            };
        });
    };

    const fetchStats = async (timeframe = selectedTimeframe) => {
        try {
            const [tasksRes, usersRes, vehiclesRes] = await Promise.all([
                axios.get('/tasks'),
                axios.get('/users'),
                axios.get('/vehicles')
            ]);

            const tasks = tasksRes.data;
            const users = usersRes.data;
            const vehicles = vehiclesRes.data;

            const now = new Date();
            const totalTasks = tasks.length;
            
            // Calculate upcoming tasks (starting in next 7 days)
            const upcomingTasks = tasks.filter(task => {
                const startDate = new Date(task.startDate);
                const diffTime = startDate - now;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return diffDays > 0 && diffDays <= 7;
            }).length;

            // Calculate pending tasks (not started yet)
            const pendingTasks = tasks.filter(task => {
                const startDate = new Date(task.startDate);
                return startDate > now;
            }).length;

            const activeAuditors = users.filter(u => u.role === 'auditor' && u.isActive).length;
            
            const activeVehicles = vehicles.filter(v => v.status === 'available').length;

            // Calculate assignment rate
            const assignedTasks = tasks.filter(t => 
                t.assignments?.some(a => a.status === 'accepted')
            ).length;
            
            const assignmentRate = totalTasks > 0 ? 
                Math.round((assignedTasks / totalTasks) * 100) : 0;

            // Calculate completion rate
            const completedTasks = tasks.filter(t => {
                const endDate = new Date(t.endDate);
                return endDate < now && t.assignments?.some(a => a.status === 'accepted');
            }).length;
            
            const completionRate = assignedTasks > 0 ? 
                Math.round((completedTasks / assignedTasks) * 100) : 0;

            // Calculate average task duration
            let totalDuration = 0;
            let count = 0;
            
            tasks.forEach(task => {
                if (task.assignments?.some(a => a.status === 'accepted')) {
                    const start = new Date(task.startDate);
                    const end = new Date(task.endDate);
                    const duration = (end - start) / (1000 * 60 * 60 * 24); // Convert to days
                    totalDuration += duration;
                    count++;
                }
            });
            
            const avgTaskDuration = count > 0 ? Math.round(totalDuration / count) : 0;

            setStats({
                totalTasks,
                pendingTasks,
                activeAuditors,
                assignmentRate,
                activeVehicles,
                upcomingTasks,
                completionRate,
                avgTaskDuration
            });

            // Task Status Chart Data
            setTaskStatusData(calculateTaskStatus(tasks));

            // Vehicle Utilization Chart Data
            setVehicleData(calculateVehicleUtilization(vehicles));

            // Auditor Performance Data
            setAuditorPerformance(calculateAuditorPerformance(users, tasks));

            // Time-based Chart Data
            const monthsData = calculateTimeData(tasks, timeframe);
            setChartData(monthsData);

            setLoading(false);

        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setLoading(false);
        }
    };

    const calculateTimeData = (tasks, timeframe) => {
        const now = new Date();
        let data = [];
        
        if (timeframe === '6m') {
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
                const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                
                const monthTasks = tasks.filter(task => {
                    const taskDate = new Date(task.createdAt);
                    return taskDate >= monthStart && taskDate <= monthEnd;
                });
                
                const completedTasks = monthTasks.filter(task => {
                    const endDate = new Date(task.endDate);
                    return endDate < now && task.assignments?.some(a => a.status === 'accepted');
                }).length;
                
                data.push({
                    name: d.toLocaleString('fr-FR', { month: 'short' }),
                    month: d.getMonth(),
                    year: d.getFullYear(),
                    tasks: monthTasks.length,
                    completed: completedTasks,
                    active: monthTasks.filter(t => 
                        t.assignments?.some(a => a.status === 'accepted')
                    ).length
                });
            }
        } else if (timeframe === '1y') {
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
                const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                
                const monthTasks = tasks.filter(task => {
                    const taskDate = new Date(task.createdAt);
                    return taskDate >= monthStart && taskDate <= monthEnd;
                });
                
                data.push({
                    name: d.toLocaleString('fr-FR', { month: 'short' }),
                    month: d.getMonth(),
                    year: d.getFullYear(),
                    tasks: monthTasks.length,
                    active: monthTasks.filter(t => 
                        t.assignments?.some(a => a.status === 'accepted')
                    ).length
                });
            }
        }
        
        return data;
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleTimeframeChange = (timeframe) => {
        setSelectedTimeframe(timeframe);
        fetchStats(timeframe);
    };

    if (loading) return <div className={styles.loadingContainer}>Chargement du tableau de bord...</div>;

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Tableau de Bord</h1>
                <div className={styles.viewControls}>
                    <button 
                        className={`${styles.viewButton} ${activeView === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveView('overview')}
                    >
                        Vue d'ensemble
                    </button>
                    <button 
                        className={`${styles.viewButton} ${activeView === 'analytics' ? styles.active : ''}`}
                        onClick={() => setActiveView('analytics')}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                <StatCard
                    title="Total Tâches"
                    value={stats.totalTasks}
                    icon={FileText}
                    trend={stats.totalTasks > 0 ? "Actif" : "-"}
                    trendClass={stats.totalTasks > 0 ? "positive" : "neutral"}
                    color="blue"
                    delay={0.1}
                />
                <StatCard
                    title="Tâches à Venir"
                    value={stats.upcomingTasks}
                    icon={Calendar}
                    trend={stats.upcomingTasks > 0 ? "Cette semaine" : "-"}
                    trendClass={stats.upcomingTasks > 0 ? "warning" : "neutral"}
                    color="orange"
                    delay={0.2}
                />
                <StatCard
                    title="Auditeurs Actifs"
                    value={stats.activeAuditors}
                    icon={Users}
                    trend={stats.activeAuditors > 0 ? "Disponible" : "-"}
                    trendClass="positive"
                    color="green"
                    delay={0.3}
                />
                <StatCard
                    title="Taux d'Affectation"
                    value={`${stats.assignmentRate}%`}
                    icon={CheckCircle}
                    trend={stats.assignmentRate > 70 ? "Excellent" : "À améliorer"}
                    trendClass={stats.assignmentRate > 70 ? "positive" : "warning"}
                    color="purple"
                    delay={0.4}
                />
                <StatCard
                    title="Véhicules Disponibles"
                    value={stats.activeVehicles}
                    icon={Car}
                    trend={stats.activeVehicles > 0 ? "Disponible" : "Indisponible"}
                    trendClass={stats.activeVehicles > 0 ? "positive" : "negative"}
                    color="cyan"
                    delay={0.5}
                />
                <StatCard
                    title="Taux de Complétion"
                    value={`${stats.completionRate}%`}
                    icon={TrendingUp}
                    trend={stats.completionRate > 80 ? "Excellent" : "Moyen"}
                    trendClass={stats.completionRate > 80 ? "positive" : "neutral"}
                    color="pink"
                    delay={0.6}
                />
            </div>

            {activeView === 'overview' ? (
                <>
                    <div className={styles.chartsGrid}>
                        <div className={styles.chartSection}>
                            <div className={styles.chartHeader}>
                                <h2 className={styles.chartTitle}>Activité des Tâches (6 mois)</h2>
                                <div className={styles.timeframeSelector}>
                                    <button 
                                        className={`${styles.timeframeButton} ${selectedTimeframe === '6m' ? styles.active : ''}`}
                                        onClick={() => handleTimeframeChange('6m')}
                                    >
                                        6M
                                    </button>
                                    <button 
                                        className={`${styles.timeframeButton} ${selectedTimeframe === '1y' ? styles.active : ''}`}
                                        onClick={() => handleTimeframeChange('1y')}
                                    >
                                        1A
                                    </button>
                                </div>
                            </div>
                            <motion.div
                                className={styles.chartContainer}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="tasks" 
                                            name="Tâches créées" 
                                            stroke="#4f46e5" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorTasks)" 
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="completed" 
                                            name="Tâches terminées" 
                                            stroke="#10b981" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorCompleted)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        <div className={styles.chartSection}>
                            <h2 className={styles.chartTitle}>Statut des Tâches</h2>
                            <motion.div
                                className={styles.chartContainer}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {taskStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => [`${value} tâches`, 'Quantité']}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    </div>

                    <div className={styles.chartsGrid}>
                        <div className={styles.chartSection}>
                            <h2 className={styles.chartTitle}>Utilisation des Véhicules</h2>
                            <motion.div
                                className={styles.chartContainer}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={vehicleData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="matricule" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="used" name="Places utilisées" fill="#4f46e5" />
                                        <Bar dataKey="available" name="Places disponibles" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        <div className={styles.chartSection}>
                            <h2 className={styles.chartTitle}>Performance des Auditeurs</h2>
                            <motion.div
                                className={styles.chartContainer}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={auditorPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value, name) => {
                                                if (name === 'completionRate') return [`${value}%`, 'Taux de complétion'];
                                                return [value, name === 'tasks' ? 'Tâches assignées' : 'Tâches terminées'];
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="tasks" name="Tâches assignées" fill="#8884d8" />
                                        <Bar dataKey="completed" name="Tâches terminées" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.analyticsView}>
                    <div className={styles.chartSectionFull}>
                        <h2 className={styles.chartTitle}>Analyses Détaillées</h2>
                        <div className={styles.analyticsGrid}>
                            <motion.div
                                className={styles.analyticsCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3>Tendance Mensuelle</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="tasks" 
                                            name="Nouvelles tâches" 
                                            stroke="#8884d8" 
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="completed" 
                                            name="Tâches terminées" 
                                            stroke="#00C49F" 
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div
                                className={styles.analyticsCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3>Distribution par Spécialité</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[]}>
                                        {/* Add specialty distribution data here */}
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="specialty" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Nombre de tâches" fill="#4f46e5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div
                                className={styles.analyticsCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3>Métriques Clés</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <span className={styles.metricLabel}>Durée moyenne des tâches</span>
                                        <span className={styles.metricValue}>{stats.avgTaskDuration} jours</span>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <span className={styles.metricLabel}>Tâches sans affectation</span>
                                        <span className={styles.metricValue}>{stats.totalTasks - stats.pendingTasks}</span>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <span className={styles.metricLabel}>Taux de refus</span>
                                        <span className={styles.metricValue}>
                                            {stats.totalTasks > 0 ? 
                                                Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;