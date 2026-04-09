import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        if (!user && isAuthenticated) {
            checkAuth();
        }
    }, [user, isAuthenticated]);

    if (isLoading && !user) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Clinical Authorization...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
                <div className="max-w-md">
                    <h1 className="text-red-500 text-4xl font-black mb-4">403</h1>
                    <p className="text-white text-lg font-bold mb-2">Access Denied</p>
                    <p className="text-slate-400">Administrative clearance required for this node.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
