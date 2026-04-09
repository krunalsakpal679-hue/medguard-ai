import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { googleClientId } from '../utils/environment';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle, isAuthenticated, isLoading, error: authError, clearError } = useAuthStore();

    const [form, setForm] = useState({ email: '', password: '' });

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
        
        // Initialize Google script
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCallback
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleBtn"),
                    { theme: "outline", size: "large", width: "380" }
                );
            }
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
              document.body.removeChild(script);
            }
            clearError();
        };
    }, [isAuthenticated]);

    const handleGoogleCallback = async (response) => {
        const success = await loginWithGoogle(response.credential);
        if (success) {
            toast.success("Clinical Access Granted");
            navigate('/dashboard');
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (authError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.email || !form.password) {
            toast.error("Credentials required");
            return;
        }

        const success = await login(form.email, form.password);
        if (success) {
            toast.success("Identity Verified");
            navigate('/dashboard');
        } else {
            toast.error(authError || "Authentication Failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-2xl p-10 border border-white/10 relative overflow-hidden">
                {/* Header */}
                <header className="flex flex-col items-center text-center mb-10">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20">
                        <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">MedGuard Login</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 px-10">Secure Entry for Medical Professionals</p>
                </header>

                {/* Google Login Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div id="googleBtn" className="w-full min-h-[40px] flex justify-center" />
                    <div className="flex items-center gap-3 w-full mt-8">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Or Secure Login</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                            <Mail size={18} />
                        </span>
                        <input
                            type="email" name="email" value={form.email} onChange={handleChange}
                            placeholder="Registered Medical Email"
                            className="w-full pl-14 pr-6 py-4.5 bg-white/5 border border-white/5 rounded-2xl text-[13px] font-semibold text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                            <Lock size={18} />
                        </span>
                        <input
                            type="password" name="password" value={form.password} onChange={handleChange}
                            placeholder="Access Password"
                            className="w-full pl-14 pr-6 py-4.5 bg-white/5 border border-white/5 rounded-2xl text-[13px] font-semibold text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 rounded-[22px] bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                    >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...</> :
                         <><LogIn className="w-5 h-5" /> Authenticate Account</>}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                        New Researcher? <button onClick={() => navigate('/register')} className="text-indigo-400 hover:text-indigo-300 font-extrabold transition-colors">Begin Enrollment</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
