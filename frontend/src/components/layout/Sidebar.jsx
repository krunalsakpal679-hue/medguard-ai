import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Search, 
    Upload, 
    History, 
    User, 
    Settings, 
    ShieldAlert, 
    ChevronLeft,
    ChevronRight,
    Activity,
    MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/**
 * Tactical Left Sidebar for Desktop.
 * Provides rapid navigation with collapsible logic and role-based clearance indicators.
 */
const Sidebar = () => {
    const { user } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const items = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Drug Check', path: '/drugs', icon: <Search size={20} /> },
        { name: 'Direct Check', path: '/predict', icon: <Activity size={20} /> },
        { name: 'OCR Upload', path: '/upload', icon: <Upload size={20} /> },
        { name: 'Clinical Chat', path: '/chat', icon: <MessageSquare size={20} /> },
        { name: 'History', path: '/history', icon: <History size={20} /> },
    ];

    const adminItems = [
        { name: 'Security Hub', path: '/admin', icon: <ShieldAlert size={20} /> }
    ];

    return (
        <aside 
            className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-slate-100 transition-all duration-300 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-4 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-indigo-600 shadow-sm"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation Items */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
                    {isCollapsed ? '•••' : 'Main Pipeline'}
                </p>
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                            ${isActive 
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }
                        `}
                    >
                        <div className={`transition-transform duration-200 ${!isCollapsed && 'group-hover:scale-110'}`}>
                            {item.icon}
                        </div>
                        {!isCollapsed && <span className="font-semibold text-sm">{item.name}</span>}
                    </NavLink>
                ))}

                {user?.role === 'ADMIN' && (
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
                            {isCollapsed ? '•••' : 'Clearance Tier'}
                        </p>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                    ${isActive 
                                        ? 'bg-rose-50 text-rose-600' 
                                        : 'text-slate-500 hover:bg-rose-50/50 hover:text-rose-600'
                                    }
                                `}
                            >
                                {item.icon}
                                {!isCollapsed && <span className="font-semibold text-sm">{item.name}</span>}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats Placeholder */}
            {!isCollapsed && (
                <div className="p-4 mx-3 mb-6 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Live Metrics</span>
                    </div>
                    <p className="text-xs text-slate-500">Today's Diagnostics: <span className="font-bold text-slate-800">14</span></p>
                </div>
            )}

            {/* User Info */}
            <div className="p-4 border-t border-slate-50">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name || 'Clinical User'}</p>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">{user?.role || 'USER'}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
