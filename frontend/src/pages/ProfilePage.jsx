import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    User, 
    Mail, 
    ShieldCheck, 
    LogOut, 
    Trash2, 
    CheckCircle2, 
    Calendar,
    Globe,
    Bell,
    ChevronRight,
    Camera
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const ProfilePage = () => {
    const { user, logout } = useAuthStore()
    const [isDeleting, setIsDeleting] = useState(false)
    const [language, setLanguage] = useState('en')

    const stats = [
        { label: 'Clinical Audits', value: user?.prediction_count || 124, color: 'indigo' },
        { label: 'Safety Score', value: '98%', color: 'emerald' },
        { label: 'Active Molecules', value: 8, color: 'orange' }
    ]

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-8 md:p-12 lg:p-20 font-inter">
            <div className="max-w-4xl mx-auto">
                
                {/* 1. Identity Segment */}
                <header className="flex flex-col md:flex-row items-center gap-12 mb-20">
                    <div className="relative group">
                        <div className="w-40 h-40 bg-white rounded-[48px] overflow-hidden border-4 border-white shadow-2xl relative z-10">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="avatar" className="w-full h-full" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl z-20 cursor-pointer border-4 border-[#F5F5F7] group-hover:scale-110 transition-transform">
                            <Camera size={20} />
                        </div>
                        <div className="absolute inset-0 bg-indigo-600/20 blur-[60px] rounded-full scale-110 opacity-50" />
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">
                            {user?.name}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none">
                                <Mail size={14} className="mr-2" /> {user?.email}
                            </div>
                            <div className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none">
                                <CheckCircle2 size={14} className="mr-2" /> Google Verified
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {stats.map((s, idx) => (
                        <div key={idx} className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                            <p className="text-4xl font-black text-slate-900 tabular-nums">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* 2. Preferences Matrix */}
                <section className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                        <ChevronRight size={14} className="mr-2 text-indigo-600" /> Administrative Preferences
                    </h3>
                    
                    <div className="bg-white rounded-[40px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                        
                        {/* Language Pivot */}
                        <div className="p-8 flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Globe size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Language</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Turn Clinical Inference</p>
                                </div>
                            </div>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-slate-50 border-none outline-none p-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
                            >
                                <option value="en">English (Clinical)</option>
                                <option value="hi">Hindi (हिन्दी)</option>
                                <option value="gu">Gujarati (ગુજરાતી)</option>
                            </select>
                        </div>

                        {/* Notifications */}
                        <div className="p-8 flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Bell size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Security Alerts</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Interaction Risk Notifications</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative flex items-center px-1 shadow-inner shadow-black/10">
                                <div className="w-4 h-4 bg-white rounded-full shadow-lg translate-x-6" />
                            </div>
                        </div>

                        {/* Logout & Delete Core */}
                        <div className="p-8 flex flex-col md:flex-row gap-4 bg-slate-50/50">
                             <button 
                                onClick={logout}
                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                             >
                                <LogOut size={16} className="inline mr-2" /> End Session
                             </button>
                             <button 
                                onClick={() => setIsDeleting(true)}
                                className="flex-1 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                             >
                                <Trash2 size={16} className="inline mr-2" /> Purge Account
                             </button>
                        </div>

                    </div>
                </section>

                {/* Secure Purge Modal */}
                <AnimatePresence>
                    {isDeleting && (
                        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-8">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[30px] flex items-center justify-center mx-auto mb-8 animate-pulse">
                                    <Trash2 size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight mb-4">Request Data Purge?</h2>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">
                                    This action is final. All clinical history, prescription uploads, and audit logs will be permanently deleted across all nodes.
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                                    <button className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/30">Confirm Purge</button>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-3xl" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

export default ProfilePage
