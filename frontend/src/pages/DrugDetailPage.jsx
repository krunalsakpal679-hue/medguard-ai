import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Activity, 
    ShieldAlert, 
    Droplet, 
    Clock, 
    FlaskConical,
    ChevronLeft,
    CheckCircle2,
    Info,
    AlertCircle,
    ArrowRight,
    Search
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import RiskBadge from '../components/dashboard/RiskBadge'

const DrugDetailPage = () => {
    const { id } = useParams()
    const { token } = useAuthStore()
    const [drug, setDrug] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDrugData = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/drugs/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setDrug(res.data)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDrugData()
    }, [id, token])

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F7]"><Activity className="animate-spin text-indigo-600" size={48} /></div>
    if (!drug) return <div className="p-20 text-center font-inter h-screen flex flex-col items-center justify-center">
        <AlertCircle size={64} className="text-rose-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Molecular Trace Not Found</h2>
        <p className="text-slate-400 font-bold text-sm uppercase mt-2">The requested drug identifier is invalid or has been purged.</p>
    </div>

    const tabs = [
        { id: 'overview', label: 'Clinical Overview', icon: Info },
        { id: 'pharmacology', label: 'Pharmacology', icon: FlaskConical },
        { id: 'interactions', label: 'Known Interactions', icon: ShieldAlert },
        { id: 'sideeffects', label: 'Side Effects', icon: Activity }
    ]

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-inter">
            {/* Header: Identity Hub */}
            <header className="bg-slate-900 text-white pt-20 pb-40 px-8 relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <button className="flex items-center text-slate-400 hover:text-white mb-10 transition-colors uppercase text-[10px] font-black tracking-widest">
                        <ChevronLeft size={16} className="mr-2" /> Laboratory Repository
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div>
                            <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-[0.2em] mb-6 uppercase">
                                {drug.drug_class}
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter mb-2 leading-none uppercase">
                                {drug.name}
                            </h1>
                            <p className="text-xl text-slate-400 font-bold uppercase tracking-tight italic">
                                {drug.generic_name}
                            </p>
                        </div>
                        
                        <div className="flex gap-4">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Structural ID</p>
                                <p className="text-sm font-black text-white">{drug.id.substring(0, 12).toUpperCase()}</p>
                             </div>
                             <button className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-white/5">
                                Run Interaction Check
                             </button>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            </header>

            {/* Navigation & Content Palette */}
            <main className="max-w-6xl mx-auto -mt-20 px-8 pb-40">
                <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-900/10 overflow-hidden">
                    
                    {/* Tabs Control */}
                    <nav className="flex items-center overflow-x-auto border-b border-slate-50 px-8 bg-slate-50/50">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-8 px-6 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                                    activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon size={16} className="mr-3" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-10 md:p-16">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.section 
                                    key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 lg:grid-cols-3 gap-20"
                                >
                                    <div className="lg:col-span-2 space-y-10">
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Mechanism of Action</h3>
                                            <p className="text-lg font-medium text-slate-700 leading-relaxed">
                                                {drug.mechanism_of_action}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Contraindications</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {drug.contraindications.map((item, idx) => (
                                                    <div key={idx} className="flex items-start p-5 bg-rose-50 text-rose-800 rounded-2xl border border-rose-100">
                                                        <AlertCircle size={20} className="mr-4 flex-shrink-0" />
                                                        <p className="text-sm font-bold uppercase leading-tight tracking-tighter">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-10">
                                        <div className="p-8 bg-slate-900 rounded-[30px] text-white">
                                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Manufacturer Brands</h4>
                                            <div className="space-y-3">
                                                {drug.brand_names.map(b => (
                                                    <div key={b} className="flex items-center justify-between group">
                                                        <span className="text-sm font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">{b}</span>
                                                        <ArrowRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === 'pharmacology' && (
                                <motion.section 
                                    key="pharm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="space-y-16"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                                        {[
                                            { label: 'Half-Life', value: `${drug.half_life_hours}h`, icon: Clock, color: 'indigo' },
                                            { label: 'Bioavailability', value: `${drug.bioavailability}%`, icon: Droplet, color: 'emerald' },
                                            { label: 'Protein Binding', value: `${drug.protein_binding_percent}%`, icon: Activity, color: 'blue' },
                                            { label: 'CYP Clearance', value: drug.metabolized_by.join(', '), icon: FlaskConical, color: 'orange' }
                                        ].map((stat, i) => (
                                            <div key={i}>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                                                    <stat.icon size={12} className="mr-2" /> {stat.label}
                                                </p>
                                                <p className="text-3xl font-black text-slate-950 uppercase tracking-tight">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Visual Kinetics: Distribution */}
                                    <div className="p-12 bg-slate-50 rounded-[40px] border border-slate-100">
                                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Systemic Distribution Model</h3>
                                         <div className="flex items-end justify-center h-48 space-x-20">
                                             <div className="flex flex-col items-center">
                                                 <motion.div initial={{ height: 0 }} animate={{ height: `${drug.bioavailability}%` }} className="w-16 bg-emerald-500 rounded-t-2xl shadow-xl shadow-emerald-500/20" />
                                                 <p className="text-[10px] font-black text-slate-900 mt-4 uppercase">AVAILABILITY</p>
                                             </div>
                                             <div className="flex flex-col items-center">
                                                 <motion.div initial={{ height: 0 }} animate={{ height: `${drug.protein_binding_percent}%` }} className="w-16 bg-indigo-600 rounded-t-2xl shadow-xl shadow-indigo-600/20" />
                                                 <p className="text-[10px] font-black text-slate-900 mt-4 uppercase">BINDING</p>
                                             </div>
                                         </div>
                                    </div>
                                </motion.section>
                            )}

                             {activeTab === 'sideeffects' && (
                                <motion.section 
                                    key="effects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-10"
                                >
                                    {drug.side_effects.map((se, i) => (
                                        <div key={i} className="flex items-center p-6 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 mr-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors animate-pulse">
                                                <Activity size={20} />
                                            </div>
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{se}</span>
                                        </div>
                                    ))}
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

        </div>
    )
}

export default DrugDetailPage
