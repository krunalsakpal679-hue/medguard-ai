import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, UserPlus, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { googleClientId } from '../utils/environment';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, loginWithGoogle, isAuthenticated, isLoading, error: authError, clearError } = useAuthStore();

    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
        
        // Initialize Google script if not already there
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
        
        if (!form.name.trim()) { toast.error('Full name is required.'); return; }
        if (!form.email.trim() || !form.email.includes('@')) { toast.error('A valid clinical email is required.'); return; }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }

        const result = await register({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role
        });

        if (result) {
            setSuccess(true);
            toast.success("Account created successfully!");
            setTimeout(() => navigate('/dashboard'), 1500);
        } else {
            toast.error(authError || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Card */}
            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-2xl p-10 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                {/* Back button */}
                <button onClick={() => navigate('/')} className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Header */}
                <header className="flex flex-col items-center text-center mb-10 mt-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">MedGuard Register</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Join the Pharmacological Network</p>
                </header>

                {/* Google Sign-Up */}
                <div className="mb-8 flex flex-col items-center">
                    <div id="googleBtn" className="w-full min-h-[40px] flex justify-center" />
                    <div className="flex items-center gap-3 w-full mt-8">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Or Clinical Enrollment</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl">
                    {['user', 'admin'].map(role => (
                        <button
                            key={role}
                            onClick={() => setForm(prev => ({ ...prev, role }))}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                form.role === role ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {role === 'user' ? 'Patient' : 'Administrator'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField icon={<User size={18} />} placeholder="Clinical Full Name" type="text" name="name" value={form.name} onChange={handleChange} />
                    <InputField icon={<Mail size={18} />} placeholder="Medical Email" type="email" name="email" value={form.email} onChange={handleChange} />
                    <InputField icon={<Lock size={18} />} placeholder="Access Password" type="password" name="password" value={form.password} onChange={handleChange} />

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full py-5 rounded-[22px] bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                    >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authorization in progress...</> :
                         success ? <><CheckCircle className="w-5 h-5" /> Enrollment Confirmed</> :
                         'Finalize Enrollment'}
                    </button>
                </form>

                {/* Sign in link */}
                <p className="mt-8 text-center text-[11px] font-bold text-slate-500">
                    Already a member?{' '}
                    <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 font-black transition-colors">Log In here</button>
                </p>
            </div>
        </div>
    );
};

const InputField = ({ icon, placeholder, type, name, value, onChange }) => (
    <div className="relative group">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
            {icon}
        </span>
        <input
            type={type} name={name} value={value} onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-14 pr-6 py-4.5 bg-white/5 border border-white/5 rounded-2xl text-[13px] font-semibold text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
        />
    </div>
);

export default RegisterPage;
