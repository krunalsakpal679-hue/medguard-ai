import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Activity, Users, ShieldCheck, Stethoscope,
    Bell, FileText, MessageSquare, Search,
    CheckCircle2, Clock, Upload
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import StatCard from '../components/dashboard/StatCard'
import QuickActionCard from '../components/dashboard/QuickActionCard'
import RiskBadge from '../components/dashboard/RiskBadge'

const DashboardPage = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const displayName = user?.name || user?.full_name || user?.email?.split('@')[0] || 'Doctor'
    const firstName = displayName.split(' ')[0]

    const recentPrescriptions = [
        { id: 1, drugs: ['Sertraline', 'Warfarin'], risk: 'MAJOR', date: '2 mins ago' },
        { id: 2, drugs: ['Metformin', 'Ibuprofen'], risk: 'NONE', date: '1 hour ago' },
        { id: 3, drugs: ['Lisinopril', 'Aspirin'], risk: 'MINOR', date: 'Today' },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Welcome Back, Dr. {firstName}
                    </h2>
                    <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">
                        Medical Dashboard | Monitoring Active
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all">
                        <Bell size={20} />
                    </button>
                    <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-900 uppercase leading-none">{displayName}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                {user?.role || 'Clinical User'}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-2xl overflow-hidden border-2 border-white shadow-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard label="Today's Safety Audits" value={142} trend="up" icon={Activity} color="indigo" />
                <StatCard label="Live Molecules" value={3421} trend="neutral" icon={Users} color="emerald" />
                <StatCard label="Critical Risks Blocked" value={12} trend="up" icon={ShieldCheck} color="rose" />
                <StatCard label="AI Accuracy" value="98.4%" trend="up" icon={Stethoscope} color="orange" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Quick Actions (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Quick Diagnostics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <QuickActionCard
                                title="Check Interactions"
                                description="Run the pairwise AI model to identify clinical incompatibilities."
                                icon={ShieldCheck}
                                color="bg-indigo-600"
                                onClick={() => navigate('/predict')}
                            />
                            <QuickActionCard
                                title="Patient Upload"
                                description="Use high-precision OCR to digitize physical prescriptions instantly."
                                icon={Upload}
                                color="bg-emerald-600"
                                onClick={() => navigate('/upload')}
                            />
                            <QuickActionCard
                                title="Clinical Chat"
                                description="Ask MedGuard AI deep pharmacological questions in 3 languages."
                                icon={MessageSquare}
                                color="bg-orange-600"
                                onClick={() => navigate('/chat')}
                            />
                            <QuickActionCard
                                title="Drug Manual"
                                description="Explore the global drug database with side effects and labels."
                                icon={Search}
                                color="bg-rose-600"
                                onClick={() => navigate('/drugs')}
                            />
                        </div>
                    </section>

                    {/* Recent Logs */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Patient Logs</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Chronological clinical analysis trace</p>
                            </div>
                            <button
                                onClick={() => navigate('/history')}
                                className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentPrescriptions.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/history')}>
                                    <div className="flex items-center space-x-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                                            log.risk === 'MAJOR' ? 'bg-rose-100 text-rose-600' :
                                            log.risk === 'MINOR' ? 'bg-yellow-100 text-yellow-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {log.drugs.length}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.drugs.join(' + ')}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={10} /> {log.date}
                                            </p>
                                        </div>
                                    </div>
                                    <RiskBadge severity={log.risk} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    <section className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-3 uppercase tracking-tight leading-tight">
                                Secure AI Cloud<br />Monitoring Active
                            </h3>
                            <p className="text-indigo-200/80 text-sm leading-relaxed mb-6">
                                HIPAA-compliant encryption. No PHI stored on public servers.
                            </p>
                            <button
                                onClick={() => navigate('/predict')}
                                className="w-full py-3 bg-white text-indigo-950 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Run Security Audit
                            </button>
                        </div>
                    </section>

                    <section className="p-8 border-2 border-indigo-100 border-dashed rounded-[2.5rem] text-center bg-white">
                        <div className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={28} className="text-emerald-500" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Systems Nominal</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                            All AI inference nodes reporting 100% health. Latency 42ms.
                        </p>
                        <button onClick={() => navigate('/drugs')} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-100 transition-all">
                            Browse Drug DB
                        </button>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
