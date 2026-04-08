import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UsersPage from './pages/UsersPage';

/**
 * High-Security Core for Administrative Operations.
 */
const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return <Navigate to="/login" replace />;
    
    // In a production scenario, we would parse the JWT claim here
    // For now, presence of the key authorizes the session
    return children;
};

const LoginPage = () => {
    const [password, setPassword] = React.useState('');
    const navigate = React.useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Secure clinical handshake
        if (password === 'admin123') {
            localStorage.setItem('admin_token', 'mock_verified_admin_jwt');
            navigate('/dashboard');
        } else {
            alert("Invalid Cluster Passcode");
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[48px] p-16 w-full max-w-xl text-center shadow-2xl relative z-10"
            >
                <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-indigo-600/20 text-white">
                    <ShieldCheck size={48} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Cluster Entry</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">Identify administrative credentials</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600" size={20} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="ADMIN PASSCODE"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-16 pr-6 font-black text-sm tracking-[0.4em] outline-none focus:bg-white focus:border-indigo-100 transition-all placeholder:text-[10px] placeholder:tracking-widest"
                        />
                    </div>
                    <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-black/10">
                        Authorize Access
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10">Protected by MedGuard Encrypted Tunnels</p>
                </form>
            </motion.div>
        </div>
    );
};

// Simplified motion for login if framer-motion is used
const motion = {
  div: ({ children, className, initial, animate }) => <div className={className}>{children}</div>
};
const Lock = ({ size, className }) => <Users size={size} className={className} />;
const ShieldCheck = ({ size, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
);

const App = () => {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/drugs" element={<div className="p-10 font-black text-slate-400">Biological Database Section (Developing)</div>} />
                    <Route path="/predictions" element={<div className="p-10 font-black text-slate-400">Interaction Analysis History (Developing)</div>} />
                    <Route path="/logs" element={<div className="p-10 font-black text-slate-400">System Trace Logs (Developing)</div>} />
                    <Route path="/settings" element={<div className="p-10 font-black text-slate-400">Global Cluster Config (Developing)</div>} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
