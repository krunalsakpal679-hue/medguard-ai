import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Skull, Info, AlertCircle } from 'lucide-react'

const RiskBadge = ({ severity = 'NONE', label }) => {
    
    // Clinical Risk Normalization
    const config = {
        NONE: {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            icon: CheckCircle2,
            text: 'SAFE',
            pulse: false
        },
        MINOR: {
            color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            icon: Info,
            text: 'MINOR',
            pulse: false
        },
        MODERATE: {
            color: 'bg-orange-50 text-orange-700 border-orange-200',
            icon: AlertCircle,
            text: 'MODERATE',
            pulse: false
        },
        MAJOR: {
            color: 'bg-rose-100 text-rose-800 border-rose-300',
            icon: AlertTriangle,
            text: 'MAJOR',
            pulse: true
        },
        CONTRAINDICATED: {
            color: 'bg-slate-900 text-slate-50 border-slate-700',
            icon: Skull,
            text: 'FATAL RISK',
            pulse: true
        }
    }

    const { color, icon: Icon, text, pulse } = config[severity.toUpperCase()] || config.NONE
    const displayLabel = label || text

    return (
        <div className="relative group inline-block">
            <motion.div
                animate={pulse ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`flex items-center px-4 py-1.5 rounded-full border-2 ${color} transition-all duration-300 shadow-sm hover:shadow-lg`}
            >
                <Icon size={14} className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {displayLabel}
                </span>
            </motion.div>
            
            {/* Tooltip on Clinical Risk */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 scale-90 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-300 z-50 min-w-[180px] text-center shadow-2xl">
                <p className="uppercase tracking-widest mb-1 text-slate-400">Clinical Protocol:</p>
                {severity === 'NONE' && "No significant interaction detected by MedGuard AI model."}
                {severity === 'MAJOR' && "High risk of life-altering interaction. Requires physician triage."}
                {severity === 'CONTRAINDICATED' && "Combination carries fatal risk. Do NOT combine these medications."}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
            </div>
        </div>
    )
}

export default RiskBadge
