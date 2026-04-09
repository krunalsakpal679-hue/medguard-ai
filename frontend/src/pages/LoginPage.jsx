import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
    Stethoscope, 
    ScanFace, 
    ShieldCheck, 
    MessageSquare, 
    UserCheck,
    CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'

const LoginPage = () => {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { isAuthenticated, setAuth } = useAuthStore()
    const [toast, setToast] = useState(false)

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard')
    }, [isAuthenticated, navigate])

    const switchLang = (code) => { i18n.changeLanguage(code) }

    const handleGuestLogin = () => {
        setAuth({ id: 'guest', name: 'Medical Guest', email: 'guest@medguard.ai' }, 'guest_token')
        setToast(true)
        setTimeout(() => navigate('/dashboard'), 1200)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Success Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30 text-sm font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Welcome, Medical Guest! Redirecting...
                </div>
            )}
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
            
            {/* Glassmorphic Login Card */}
            <div className="w-full max-w-lg bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-slate-200/50 p-12 border border-white relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                {/* Clinical Header */}
                <header className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-brand rounded-3xl shadow-xl shadow-brand/20 flex items-center justify-center mb-8 border border-brand/10 relative group overflow-hidden">
                        <Stethoscope className="w-12 h-12 text-white relative z-10" />
                    </div>
                    
                    <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-2 uppercase">
                        MedGuard <span className="text-brand">AI</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">
                        Your Intelligent Multilingual Medical Companion
                    </p>
                </header>

                {/* Feature Highlights */}
                <div className="space-y-4 mb-12">
                    <FeatureRow 
                      icon={<ScanFace className="w-6 h-6 text-brand" />} 
                      text={t('upload_prescription')} 
                      onClick={handleGuestLogin}
                    />
                    <FeatureRow 
                      icon={<ShieldCheck className="w-6 h-6 text-brand" />} 
                      text={t('drug_interaction')} 
                      onClick={handleGuestLogin}
                    />
                    <FeatureRow 
                      icon={<MessageSquare className="w-6 h-6 text-brand" />} 
                      text={t('chat_placeholder').replace('...', '')} 
                      onClick={handleGuestLogin}
                    />
                </div>
                
                {/* Authentication Core */}
                <div className="space-y-6">
                    <GoogleLoginButton />
                    
                    <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 h-[1px] bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or login with Email</span>
                        <div className="flex-1 h-[1px] bg-slate-100" />
                    </div>

                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value })
                            })
                            if (res.ok) {
                                const data = await res.json()
                                setAuth(data.user, data.access_token)
                                navigate('/dashboard')
                            } else {
                                alert("Login failed. Check your credentials.")
                            }
                        } catch (err) {
                            console.error(err)
                            alert("Login failed due to an error.")
                        }
                    }} className="space-y-4">
                        <div className="relative group">
                            <input type="email" name="email" placeholder="Medical Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand focus:outline-none" required />
                        </div>
                        <div className="relative group">
                            <input type="password" name="password" placeholder="Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand focus:outline-none" required />
                        </div>
                        <button type="submit" className="w-full py-4 text-white text-xs font-bold uppercase tracking-widest bg-brand rounded-2xl hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
                            Access Dashboard
                        </button>
                    </form>

                    <button 
                        onClick={handleGuestLogin}
                        className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 hover:border-slate-200 transition-all flex items-center justify-center gap-3"
                    >
                        <UserCheck className="w-4 h-4" />
                        Continue as Medical Guest
                    </button>
                </div>

                {/* Secondary Actions */}
                <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
                    <button 
                        onClick={() => navigate('/register')}
                        className="text-xs font-bold text-slate-400 hover:text-brand transition-colors uppercase tracking-widest"
                    >
                        Don't have an account? <span className="text-brand ml-1">Register Path</span>
                    </button>
                    
                    <div className="flex items-center justify-center gap-6">
                        <LanguageButton code="en" label="English" current={i18n.language} onClick={() => switchLang('en')} />
                        <LanguageButton code="hi" label="हिन्दी" current={i18n.language} onClick={() => switchLang('hi')} />
                        <LanguageButton code="gu" label="ગુજરાતી" current={i18n.language} onClick={() => switchLang('gu')} />
                    </div>
                </div>

                <footer className="mt-12 text-center">
                    <p className="text-[9px] text-slate-300 font-bold leading-relaxed uppercase tracking-tighter max-w-[280px] mx-auto">
                        Authorized medical personnel only. Session activity is monitored for safety and clinical integrity.
                    </p>
                </footer>
            </div>
        </div>
    )
}

const FeatureRow = ({ icon, text, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center gap-6 p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all group"
    >
        <div className="p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="text-xs font-black text-slate-600 uppercase tracking-widest text-left">{text}</span>
    </button>
)

const LanguageButton = ({ code, label, current, onClick }) => (
    <button 
        onClick={onClick}
        className={`text-[10px] font-black uppercase tracking-widest transition-all ${
            current === code ? 'text-brand scale-110' : 'text-slate-300 hover:text-slate-500'
        }`}
    >
        {label}
    </button>
)

export default LoginPage
