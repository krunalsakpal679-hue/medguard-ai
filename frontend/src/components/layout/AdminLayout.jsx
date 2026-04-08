import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { ShieldCheck, Users, Database, Activity, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/**
 * Restricted Admin Layout Wrapper.
 * Provides a dedicated navigation context for administrative operations.
 */
const AdminLayout = () => {
    const { user } = useAuthStore();

    // Security clearance check
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    const adminLinks = [
        { name: 'Users Control', path: '/admin/users', icon: <Users size={18} /> },
        { name: 'Pharma Inventory', path: '/admin/drugs', icon: <Database size={18} /> },
        { name: 'Prediction Assets', path: '/admin/predictions', icon: <Activity size={18} /> },
    ];

    return (
        <div className="space-y-8">
            {/* Admin Header */}
            <div className="bg-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-rose-100 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full w-fit mb-4 backdrop-blur-sm">
                        <Lock size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Administrative Clearance Active</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">System Security Hub</h1>
                    <p className="opacity-80 font-medium">Manage clinical assets, user tiers, and pharmacist clearance.</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 hidden md:block">
                    <ShieldCheck size={48} />
                </div>
            </div>

            {/* Tactical Sub-Nav */}
            <div className="flex bg-white rounded-2xl p-2 border border-slate-100 shadow-sm gap-2">
                {adminLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `
                            flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-bold text-sm
                            ${isActive 
                                ? 'bg-rose-50 text-rose-600 shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }
                        `}
                    >
                        {link.icon}
                        {link.name}
                    </NavLink>
                ))}
            </div>

            {/* Admin Content Port */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
