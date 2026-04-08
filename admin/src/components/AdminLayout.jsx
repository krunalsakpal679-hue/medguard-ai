import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FlaskConical, 
    ShieldAlert, 
    ClipboardList, 
    Settings, 
    LogOut,
    Menu,
    X,
    Activity
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'User Management', icon: Users, path: '/users' },
        { name: 'Molecular Database', icon: FlaskConical, path: '/drugs' },
        { name: 'Prediction Logs', icon: ShieldAlert, path: '/predictions' },
        { name: 'System Audit', icon: ClipboardList, path: '/logs' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-inter">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
                <div className="p-6 flex items-center gap-4 border-b border-slate-800">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Activity size={24} />
                    </div>
                    {isSidebarOpen && (
                        <div className="animate-in fade-in duration-500">
                            <h1 className="text-lg font-black tracking-tight leading-none">ADMIN HUB</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">MedGuard Security</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group
                                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {isSidebarOpen && <span className="text-sm font-bold tracking-tight">{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all group"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm font-bold tracking-tight">System Logout</span>}
                    </button>
                    {isSidebarOpen && (
                        <div className="mt-6 px-4 py-3 bg-slate-800/50 rounded-xl">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Node Status</p>
                            <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                CLUSTER ACTIVE
                            </p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-slate-900 uppercase leading-none">Global Admin</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Verified Cluster Node</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-white">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="avatar" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
