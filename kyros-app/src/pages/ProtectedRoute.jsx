import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = () => {
            try {
                const user = localStorage.getItem('user');
                setIsAuthenticated(!!user);
            } catch (err) {
                console.error("Error validando sesión:", err);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        const onStorage = (e) => {
            if (e.key === 'user') setIsAuthenticated(!!e.newValue);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-surface flex items-center justify-center text-white">Validando acceso...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;