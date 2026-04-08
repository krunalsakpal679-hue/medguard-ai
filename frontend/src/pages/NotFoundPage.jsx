import React from 'react'
import { motion } from 'framer-motion'
import { 
    Activity, 
    ArrowLeft, 
    LayoutDashboard, 
    ShieldAlert, 
    Stethoscope, 
    HeartPulse 
} from 'lucide-react'

const NotFoundPage = ({ navigate }) => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-8 text-center font-inter overflow-hidden relative">
            
            {/* Background Medical Visual: Floating Crosses */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000 }}
                        animate={{ 
                            y: [0, Math.random() * 100 - 50, 0], 
                            x: [0, Math.random() * 100 - 50, 0],
                            rotate: [0, 360] 
                        }}
                        transition={{ duration: 10 + Math.random() * 20, repeat: Infinity }}
                        className="absolute"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    >
                        <Activity size={100 + Math.random() * 200} />
                    </motion.div>
                ))}
            </div>

            <main className="relative z-10">
                {/* 404 Helix Component */}
                <div className="relative mb-12 flex justify-center">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-48 h-48 bg-white rounded-[60px] shadow-2xl flex items-center justify-center relative rotate-12"
                    >
                        <div className="text-8xl font-black text-indigo-950 tracking-tighter">4</div>
                        <div className="w-12 h-20 bg-indigo-600 rounded-full mx-1 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Stethoscope size={32} className="text-white animate-pulse" />
                        </div>
                        <div className="text-8xl font-black text-indigo-950 tracking-tighter">4</div>
                    </motion.div>
                    
                    {/* Error Indicator */}
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="absolute -top-4 -right-4 w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-2xl border-4 border-[#F5F5F7] rotate-[-15deg]"
                    >
                        <ShieldAlert size={32} />
                    </motion.div>
                </div>

                <div className="space-y-4 max-w-lg mb-14">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Prescription Trace Lost</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed">
                        The clinical path you were following does not exist in our molecular database. <br/>It may have been purged or relocated.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center group"
                    >
                        <LayoutDashboard size={18} className="mr-3 group-hover:scale-110" /> Back to Dashboard
                    </button>
                    <button 
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-10 py-5 bg-white text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:text-slate-950 hover:bg-slate-50 transition-all border border-slate-100 flex items-center justify-center group"
                    >
                        <ArrowLeft size={18} className="mr-3 group-hover:-translate-x-1" /> Previous Sequence
                    </button>
                </div>
            </main>

            {/* Visual Continuity Footer */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20">
                <HeartPulse size={16} className="text-rose-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">MedGuard AI • Safety First</p>
            </div>

        </div>
    )
}

export default NotFoundPage
