import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const location = useLocation();

    // Helper to get title from path (simplistic mapped)
    const getTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard Overview';
            case '/tasks': return 'Gestion des Tâches';
            case '/users': return 'Gestion des Utilisateurs';
            case '/vehicles': return 'Parc Automobile';
            case '/my-tasks': return 'Mes Tâches';
            default: return 'Dashboard';
        }
    };

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.mainWrapper}>
                <Topbar title={getTitle()} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
