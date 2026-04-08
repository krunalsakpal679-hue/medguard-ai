import React from 'react'
import { useTranslation } from 'react-i18next'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import { ShieldCheck, ScanFace, MessageSquareMore, Languages, Stethoscope } from 'lucide-react'

const LoginPage = () => {
    const { t, i18n } = useTranslation()
    
    /**
     * Toggles between English, Hindi, and Gujarati locales.
     */
    const switchLang = (lang) => {
        i18n.changeLanguage(lang)
    }
    
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-6">
            
            {/* Animated Medical Particles (Visual Flourish) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute animate-float" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.7}s`,
                        fontSize: `${Math.random() * 50 + 30}px`,
                        filter: 'blur(1px)'
                    }}>
                        {i % 3 === 0 ? '💊' : i % 3 === 1 ? '🩹' : '🩺'}
                    </div>
                ))}
            </div>
            
            {/* Glassmorphic Login Card */}
            <div className="max-w-md w-full bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(46,125,50,0.15)] border border-white border-b-slate-100 p-10 z-10 animate-slide-up">
                
                {/* Brand Header */}
                <div className="text-center mb-10 group">
                    <div className="bg-brand inline-flex p-5 rounded-3xl shadow-[0_12px_24px_-8px_rgba(46,125,50,0.4)] mb-8 animate-pulse-glow group-hover:scale-110 transition-transform">
                        <Stethoscope className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 mb-3 tracking-tight font-display">{t('app_name')}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[0.6rem]">{t('tagline')}</p>
                </div>
                
                {/* Feature Highlights */}
                <div className="space-y-4 mb-12">
                    <FeatureRow 
                      icon={<ScanFace className="w-6 h-6 text-brand" />} 
                      text={t('upload_prescription')} 
                    />
                    <FeatureRow 
                      icon={<ShieldCheck className="w-6 h-6 text-brand" />} 
                      text={t('drug_interaction')} 
                    />
                    <FeatureRow 
                      icon={<MessageSquareMore className="w-6 h-6 text-brand" />} 
                      text={t('chat_placeholder').replace('...', '')} 
                    />
                </div>
                
                {/* Google Login Component */}
                <div className="mb-12">
                    <GoogleLoginButton />
                </div>
                
                {/* Multilingual Switcher & Footer */}
                <div className="border-t border-slate-100 pt-10 text-center">
                    <p className="text-[0.65rem] font-bold text-slate-400 mb-6 uppercase tracking-widest">Global Medical Language Support</p>
                    
                    <div className="flex justify-center gap-6 mb-8">
                        <LangItem active={i18n.language === 'en'} onClick={() => switchLang('en')} label="ENGLISH" />
                        <LangItem active={i18n.language === 'hi'} onClick={() => switchLang('hi')} label="हिन्दी" />
                        <LangItem active={i18n.language === 'gu'} onClick={() => switchLang('gu')} label="ગુજરાતી" />
                    </div>
                    
                    <p className="text-[0.55rem] text-slate-400 font-medium px-4 leading-relaxed">
                        Authorized medical personnel only. Session activity is monitored for safety and clinical integrity.
                    </p>
                </div>
            </div>
        </div>
    )
}

/**
 * Styled subcomponent for feature listing.
 */
const FeatureRow = ({ icon, text }) => (
    <div className="flex items-center gap-5 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand/10 transition-all group overflow-hidden relative active:scale-95">
        <div className="p-3 bg-brand/5 rounded-2xl group-hover:bg-brand group-hover:text-white transition-colors">
            {React.cloneElement(icon, { className: 'w-6 h-6 transition-colors' })}
        </div>
        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide group-hover:translate-x-1 transition-transform">{text}</span>
    </div>
)

/**
 * Styled language toggle button.
 */
const LangItem = ({ active, onClick, label }) => (
    <button 
      onClick={onClick} 
      className={`text-[0.6rem] font-black tracking-widest px-3 py-1.5 rounded-full transition-all border ${
        active 
        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
        : 'text-slate-400 border-transparent hover:text-brand hover:border-brand/20'
      }`}
    >
        {label}
    </button>
)

export default LoginPage
