import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Clock, 
    ChevronDown, 
    Share2, 
    Trash2, 
    RefreshCcw, 
    ExternalLink, 
    ShieldCheck,
    FlaskConical
} from 'lucide-react'
import RiskBadge from './RiskBadge'

const HistoryCard = ({ prediction, onDelete, onReRun }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    /**
     * Helper to format clinical entry timestamps.
     */
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
            
            {/* Primary Analysis Trace */}
            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {prediction.drug_names.map((name, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-[10px] font-black uppercase text-slate-600 rounded-md ring-1 ring-slate-200">
                                    {name}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {formatDate(prediction.created_at)}</span>
                            <span className="h-1 w-1 bg-slate-200 rounded-full" />
                            <span>{prediction.drug_names.length} Molecules Analyzed</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <RiskBadge severity={prediction.overall_risk_level} />
                    <div className="h-8 w-px bg-slate-100 mx-2" />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-3 rounded-2xl transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                        >
                            <ChevronDown size={20} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* In-depth Clinical Narrative */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="bg-slate-50/50 border-t border-slate-50"
                    >
                        <div className="p-10 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pairwise AI Trace Results</h4>
                                <div className="space-y-4">
                                    {prediction.pair_results.map((pair, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-3xl border border-slate-100/50 shadow-sm">
                                             <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FlaskConical size={14} /></div>
                                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                     {pair.drug_a_name} <span className="text-slate-300 mx-2">+</span> {pair.drug_b_name}
                                                 </p>
                                             </div>
                                             <div className="flex items-center gap-8">
                                                 <div className="text-right">
                                                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Confidence Score</p>
                                                     <p className="text-sm font-black text-slate-900">{(pair.synergy_score * 100).toFixed(0)}%</p>
                                                 </div>
                                                 <RiskBadge severity={pair.severity} />
                                             </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-slate-100">
                                <button 
                                    onClick={() => onReRun(prediction)}
                                    className="flex-1 flex items-center justify-center p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all group"
                                >
                                    <RefreshCcw size={16} className="mr-3 group-hover:rotate-180 transition-transform duration-500" />
                                    Restore Sequence
                                </button>
                                <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                    <Share2 size={18} />
                                </button>
                                <button 
                                    onClick={() => onDelete(prediction.id)}
                                    className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default HistoryCard
