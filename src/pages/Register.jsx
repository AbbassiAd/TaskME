import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Logo1.png';
import styles from './Register.module.css'; // Créer un fichier CSS séparé

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        specialty: 'pedagogique',
        grade: 'A',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const { username, email, password, confirmPassword, specialty, grade, phone } = formData;

    const onChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        const userData = {
            username,
            email,
            password,
            specialty,
            grade,
            phone
        };

        try {
            const res = await register(userData);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message || 'Erreur lors de l\'inscription');
            }
        } catch (err) {
            setError('Une erreur est survenue lors de l\'inscription');
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoWrapper}>
                        <img src={Logo} alt="TaskMe Logo" className={styles.logo} />
                    </div>
                    <h1 className={styles.title}>Créer un compte</h1>
                    <p className={styles.subtitle}>Rejoignez la communauté TaskMe</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Première ligne : Nom d'utilisateur et Email */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username" className={styles.label}>
                                Nom d'utilisateur <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={onChange}
                                    className={styles.input}
                                    placeholder="john_doe"
                                    required
                                    minLength="3"
                                    maxLength="30"
                                />
                                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={onChange}
                                    className={styles.input}
                                    placeholder="john@example.com"
                                    required
                                />
                                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Deuxième ligne : Téléphone et Spécialité */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="phone" className={styles.label}>
                                Téléphone <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={onChange}
                                    className={styles.input}
                                    placeholder="06 12 34 56 78"
                                    pattern="[0-9]{10}"
                                    required
                                />
                                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="specialty" className={styles.label}>
                                Spécialité <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    id="specialty"
                                    name="specialty"
                                    value={specialty}
                                    onChange={onChange}
                                    className={styles.select}
                                    required
                                >
                                    <option value="pedagogique">Pédagogique</option>
                                    <option value="orientation">Orientation</option>
                                    <option value="planification">Planification</option>
                                    <option value="financier">Financier</option>
                                </select>
                                <svg className={styles.selectIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Troisième ligne : Grade seul */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="grade" className={styles.label}>
                                Grade <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    id="grade"
                                    name="grade"
                                    value={grade}
                                    onChange={onChange}
                                    className={styles.select}
                                    required
                                >
                                    <option value="A">Grade A</option>
                                    <option value="B">Grade B</option>
                                    <option value="C">Grade C</option>
                                </select>
                                <svg className={styles.selectIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div className={styles.inputGroup}></div> {/* Espace vide pour alignement */}
                    </div>

                    {/* Quatrième ligne : Mot de passe */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Mot de passe <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={onChange}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePasswordVisibility('password')}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M1 1l22 22"></path>
                                        </svg>
                                    ) : (
                                        <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            <div className={styles.passwordStrength}>
                                <div className={`${styles.strengthBar} ${password.length >= 6 ? styles.strengthGood : styles.strengthWeak}`}>
                                    <div className={styles.strengthFill} style={{ width: `${Math.min((password.length / 12) * 100, 100)}%` }}></div>
                                </div>
                                <div className={styles.strengthText}>
                                    {password.length < 6 ? 'Faible' : password.length < 10 ? 'Moyen' : 'Fort'}
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Confirmer le mot de passe <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={onChange}
                                    className={`${styles.input} ${confirmPassword && password !== confirmPassword ? styles.inputError : ''}`}
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                                >
                                    {showConfirmPassword ? (
                                        <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M1 1l22 22"></path>
                                        </svg>
                                    ) : (
                                        <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <div className={styles.confirmError}>
                                    Les mots de passe ne correspondent pas
                                </div>
                            )}
                        </div>
                    </div>

                 

                    <button type="submit" className={styles.button}>
                        <span>Créer mon compte</span>
                        <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                    </button>

                    <div className={styles.loginLink}>
                        <span>Déjà un compte?</span>
                        <Link to="/login" className={styles.loginLinkButton}>
                            Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
