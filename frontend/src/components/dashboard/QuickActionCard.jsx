import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color = 'bg-indigo-600', 
    onClick,
    actionLabel = "Get Started"
}) => {
    return (
        <motion.button
            whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group relative flex flex-col p-8 bg-white text-left rounded-[40px] border border-slate-100 transition-all duration-300 overflow-hidden"
        >
            <div className={`p-4 rounded-3xl ${color} text-white mb-6 w-14 h-14 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={24} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2 leading-none uppercase tracking-tight">{title}</h3>
            <p className="text-sm font-bold text-slate-400 leading-relaxed mb-6 flex-1">{description}</p>
            
            <div className="flex items-center text-xs font-black uppercase tracking-widest text-indigo-600 group-hover:translate-x-2 transition-transform duration-300">
                <span>{actionLabel}</span>
                <ArrowRight size={14} className="ml-2" />
            </div>

            {/* Subtle Gradient Detail */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.button>
    )
}

export default QuickActionCard
