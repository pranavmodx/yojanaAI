import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set auth header whenever token changes
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchMe();
        } else {
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchMe = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch {
            // Token invalid
            logout();
        } finally {
            setLoading(false);
        }
    };

    const signup = async (phone, email, password) => {
        const res = await api.post('/auth/signup', { phone: phone || null, email: email || null, password });
        const { access_token, user_id, profile_completed } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('userId', user_id);
        setToken(access_token);
        return { user_id, profile_completed };
    };

    const login = async (identifier, password) => {
        const res = await api.post('/auth/login', { identifier, password });
        const { access_token, user_id, profile_completed } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('userId', user_id);
        setToken(access_token);
        return { user_id, profile_completed };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (token) await fetchMe();
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            loading,
            isAuthenticated: !!token && !!user,
            signup,
            login,
            logout,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
