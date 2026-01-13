import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.baseURL = '/api'; // Uses Vite proxy

    useEffect(() => {
        // Check for stored token/user on mount
        const checkUser = async () => {
            const storedUser = localStorage.getItem('taskme_user');
            const token = localStorage.getItem('taskme_token');

            if (storedUser && token) {
                // Set token for requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                try {
                    // Validate token by fetching 'me'
                    const res = await axios.get('/auth/me');
                    setUser(res.data);
                    // Update stored user in case it changed
                    localStorage.setItem('taskme_user', JSON.stringify(res.data));
                } catch (error) {
                    console.error('Token invalid', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post('/auth/login', { username, password });

            if (res.data) {
                const { token, ...userData } = res.data;

                setUser(userData);
                localStorage.setItem('taskme_user', JSON.stringify(userData));
                localStorage.setItem('taskme_token', token);

                // Set default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur de connexion'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('/auth/register', userData);
            if (res.data) {
                const { token, ...userData } = res.data;

                setUser(userData);
                localStorage.setItem('taskme_user', JSON.stringify(userData));
                localStorage.setItem('taskme_token', token);

                // Set default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de l\'inscription'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('taskme_user');
        localStorage.removeItem('taskme_token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
