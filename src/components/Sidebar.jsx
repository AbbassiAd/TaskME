import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Truck, CheckSquare, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';
import Logo from '../assets/Logo1.png';


const Sidebar = () => {
    const { user, logout } = useAuth();

    const links = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'coordinator'] },
        { to: '/tasks', label: 'Gestion Tâches', icon: ClipboardList, roles: ['superadmin', 'coordinator'] },
        { to: '/my-tasks', label: 'Mes Tâches', icon: CheckSquare, roles: ['auditor'] },
        { to: '/vehicles', label: 'Véhicules', icon: Truck, roles: ['superadmin','coordinator'] },
        { to: '/chat', label: 'Messagerie', icon: MessageSquare, roles: ['superadmin', 'coordinator', 'auditor'] },
        { to: '/users', label: 'Utilisateurs', icon: Users, roles: ['superadmin', 'coordinator'] },
    ];

    // Filter links based on role
    const filteredLinks = links.filter(link =>
        !link.roles || (user && link.roles.includes(user.role))
    );

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContnair}>
               <img src={Logo} alt="logo" className={styles.image} />
            </div>

            <nav className={styles.nav}>
                {filteredLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ''}`
                        }
                    >
                        <link.icon size={20} />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                <button onClick={logout} className={styles.logoutBtn}>
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
