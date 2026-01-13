import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';
import Logo from '../assets/logo1.png';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        if (user.role === 'auditor') {
            navigate('/my-tasks', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await login(identifier, password);

        if (!res.success) {
            setError(res.message);
        }
        // ✅ PAS DE navigate ici
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoWrapper}>
                        <img src={Logo} alt="logo" className={styles.logo} />
                    </div>
                    <h1 className={styles.title}>Connexion</h1>
                    <p className={styles.subtitle}>Accédez à votre espace TaskMe</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="identifier" className={styles.label}>
                            Identifiant
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className={styles.input}
                            placeholder="Email, téléphone ou nom d'utilisateur"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Mot de passe
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={togglePasswordVisibility}
                            >
                                👁
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={styles.button}>
                        Se connecter
                    </button>

                    <p className={styles.registerText}>
                        Pas encore de compte ?{' '}
                        <Link to="/register" className={styles.registerLink}>
                            S'inscrire
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;

