import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

const StatCard = ({ label, value, trend, icon: Icon, color = 'indigo' }) => {
    const [displayValue, setDisplayValue] = useState(0)

    // Animated Count-Up logic for clinical metrics
    useEffect(() => {
        let start = 0
        const end = parseInt(value)
        if (start === end) return
        
        let totalTime = 1500
        let timer = setInterval(() => {
            start += Math.ceil(end / 30)
            if (start >= end) {
                setDisplayValue(end)
                clearInterval(timer)
            } else {
                setDisplayValue(start)
            }
        }, 30)
        return () => clearInterval(timer)
    }, [value])

    const colorVariants = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        rose: 'bg-rose-50 text-rose-600'
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorVariants[color]} transition-colors duration-500`}>
                    <Icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                {trend && (
                    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                        trend === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : 
                         trend === 'down' ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                        <span>{trend === 'up' ? '+12%' : trend === 'down' ? '-4%' : 'STABLE'}</span>
                    </div>
                )}
            </div>
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h3>
            <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {typeof value === 'number' ? displayValue : value}
                </span>
                {typeof value === 'number' && <span className="text-xs font-bold text-slate-400">Total</span>}
            </div>
        </motion.div>
    )
}

export default StatCard
