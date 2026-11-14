import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../config/server';
import { Spinner } from '../UI/Feedback';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const [instructorStatus, setInstructorStatus] = useState(null);
    const [loading, setLoading] = useState(user?.role === 'instructor');

    useEffect(() => {
        let cancelled = false;
        const checkStatus = async () => {
            if (user?.role === 'instructor') {
                try {
                    const { data } = await api.get('/users/profile');
                    if (!cancelled) setInstructorStatus(data.data.instructorStatus);
                } catch (err) {
                    console.error("Failed to check status", err);
                }
            }
            if (!cancelled) setLoading(false);
        };

        if (isAuthenticated) checkStatus();
        else setLoading(false);
        return () => { cancelled = true; };
    }, [isAuthenticated, user?.role]);

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    if (user.role === 'instructor' && loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Spinner label="Checking your account" />
            </div>
        );
    }

    // Unapproved instructors may only use the settings page and the student-side pages.
    if (user.role === 'instructor' && location.pathname.startsWith('/instructor')
        && location.pathname !== '/instructor/settings' && instructorStatus !== 'approved') {
        return <Navigate to="/instructor/settings" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
