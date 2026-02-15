import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../config/server';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const [instructorStatus, setInstructorStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (user?.role === 'instructor') {
                try {
                    const { data } = await api.get('/users/profile');
                    setInstructorStatus(data.data.instructorStatus);
                } catch (err) {
                    console.error("Failed to check status", err);
                }
            }
            setLoading(false);
        };

        if (isAuthenticated) {
            checkStatus();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Special check for instructors
    if (user.role === 'instructor' && !loading) {
        // Allow access to settings page always
        if (location.pathname === '/instructor/settings') {
            return <Outlet />;
        }

        // Block other instructor pages if not approved
        if (instructorStatus !== 'approved') {
            return <Navigate to="/instructor/settings" replace />;
        }
    }

    if (loading && user.role === 'instructor') {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <Outlet />;
};

export default ProtectedRoute;
