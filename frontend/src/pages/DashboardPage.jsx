import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Home, 
    Search, 
    ShieldCheck, 
    FileText, 
    MessageSquare, 
    History, 
    Settings, 
    LogOut, 
    Activity,
    Users,
    Stethoscope,
    LayoutDashboard,
    Bell,
    CheckCircle2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import StatCard from '../components/dashboard/StatCard'
import QuickActionCard from '../components/dashboard/QuickActionCard'
import RiskBadge from '../components/dashboard/RiskBadge'

const DashboardPage = ({ navigate }) => {
    const { user, logout } = useAuthStore()
    const [recentPrescriptions, setRecentPrescriptions] = useState([
        { id: 1, drugs: ["Sertraline", "Warfarin"], risk: "MAJOR", date: "2 mins ago" },
        { id: 2, drugs: ["Metformin", "Ibuprofen"], risk: "NONE", date: "1 hour ago" },
        { id: 3, drugs: ["Lisinopril", "Aspirin"], risk: "MINOR", date: "Today" }
    ])

    const menuItems = [
        { label: 'Dashboard', icon: Home, active: true },
        { label: 'Cloud Scan', icon: FileText },
        { label: 'Security Lab', icon: ShieldCheck },
        { label: 'Drug Manual', icon: Search },
        { label: 'Chat Help', icon: MessageSquare }
    ]

    return (
        <div className="flex h-screen w-full bg-[#F5F5F7] overflow-hidden font-inter">
            
            {/* 1. Sidebar (Desktop) */}
            <aside className="w-80 h-full bg-white border-r border-slate-100 flex flex-col p-8 z-30 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-14 px-2">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 glow-effect">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">MedGuard AI</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Global Safety Net</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {menuItems.map((item, idx) => (
                        <button 
                            key={idx}
                            className={`w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-300 group ${
                                item.active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <item.icon size={20} className={`mr-4 transition-transform group-hover:scale-110 ${item.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                            {item.active && <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-slate-100 mt-auto">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center px-6 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all duration-300 group"
                    >
                        <LogOut size={20} className="mr-4 group-hover:-translate-x-1" />
                        <span className="text-xs font-black uppercase tracking-widest">clinical logout</span>
                    </button>
                </div>
            </aside>

            {/* 2. Main Lab Content */}
            <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-12">
                
                {/* Header Action Unit */}
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <motion.h2 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-3xl font-black text-slate-900 tracking-tight"
                        >
                            Welcome Back, Dr. {user?.name.split(' ')[0]}
                        </motion.h2>
                        <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">Medical Dashboard | Monitoring Active </p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none">{user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Clinical Admin</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
                     <StatCard label="Today's Safety Audits" value={142} trend="up" icon={Activity} color="indigo" />
                     <StatCard label="Live Molecules" value={3421} trend="neutral" icon={Users} color="emerald" />
                     <StatCard label="Critical Risks Blocked" value={12} trend="up" icon={ShieldCheck} color="rose" />
                     <StatCard label="AI Accuracy" value="98.4%" trend="up" icon={Stethoscope} color="orange" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Primary Operations (2/3 width) */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Quick Diagnostics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <QuickActionCard 
                                    title="Check Interactions" 
                                    description="Run the pairwise AI model to identify clinical incompatibilities." 
                                    icon={ShieldCheck}
                                    color="bg-indigo-600"
                                    onClick={() => console.log('interaction check')}
                                />
                                <QuickActionCard 
                                    title="Patient Upload" 
                                    description="Use high-precision OCR to digitize physical prescriptions instantly." 
                                    icon={FileText}
                                    color="bg-emerald-600"
                                    onClick={() => console.log('ocr upload')}
                                />
                                <QuickActionCard 
                                    title="Clinical Chat" 
                                    description="Ask MedGuard AI deep pharmacological questions in 3 languages." 
                                    icon={MessageSquare}
                                    color="bg-orange-600"
                                    onClick={() => console.log('chat assist')}
                                />
                                <QuickActionCard 
                                    title="Safety Manual" 
                                    description="Explore the global drug database with side effects and labels." 
                                    icon={Search}
                                    color="bg-rose-600"
                                    onClick={() => console.log('search manual')}
                                />
                            </div>
                        </section>

                        <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                             <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Recent Patient Logs</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Chronological clinical analysis trace</p>
                                </div>
                                <button className="px-6 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-indigo-600/10 shadow-lg">
                                    View Repository
                                </button>
                             </div>

                             <div className="space-y-4">
                                {recentPrescriptions.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl hover:bg-slate-100 transition-colors duration-300">
                                        <div className="flex items-center space-x-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${
                                                log.risk === 'MAJOR' ? 'bg-rose-100 text-rose-600' : 
                                                log.risk === 'MINOR' ? 'bg-yellow-100 text-yellow-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {log.drugs.length}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{log.drugs.join(' + ')}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center">
                                                    <Clock size={10} className="mr-1" /> {log.date}
                                                </p>
                                            </div>
                                        </div>
                                        <RiskBadge severity={log.risk} />
                                    </div>
                                ))}
                             </div>
                        </section>
                    </div>

                    {/* Secondary Context (1/3 width) */}
                    <div className="space-y-12">
                        <section className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/40 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md">
                                    <Activity size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight leading-tight">Secure AI Cloud <br/>Monitoring Active</h3>
                                <p className="text-indigo-200/80 text-sm font-medium leading-relaxed mb-8">
                                    Your clinical activity is protected by HIPAA-compliant encryption. No PHI is stored on public servers.
                                </p>
                                <button className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-white/20 hover:bg-slate-50 transition-all duration-300">
                                    Security Vault
                                </button>
                            </div>
                        </section>

                        <section className="p-10 border-2 border-indigo-100 border-dashed rounded-[40px] text-center">
                            <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Systems Nominal</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tighter">
                                All AI Inference nodes reporting 100% health. Latency 42ms.
                            </p>
                        </section>
                    </div>

                </div>

            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .glow-effect { box-shadow: 0 0 50px -10px rgba(79, 70, 229, 0.4); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}} />
        </div>
    )
}

export default DashboardPage
