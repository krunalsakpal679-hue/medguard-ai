import React from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

const LoadingSpinner = ({ variant = 'dna', size = 'md', message }) => {
    const sizeMap = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    }

    const renderSpinner = () => {
        switch (variant) {
            case 'dna':
                return (
                    <div className={`${sizeMap[size]} relative flex items-center justify-center`}>
                        <motion.div 
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-full h-full border-4 border-indigo-600 rounded-full border-dashed opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                        />
                        <Activity className="absolute text-indigo-600 animate-pulse" size={size === 'lg' ? 48 : 24} />
                    </div>
                )
            case 'pulse':
                return (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`${sizeMap[size]} bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20`}
                    >
                        <Activity size={size === 'lg' ? 48 : 24} />
                    </motion.div>
                )
            case 'dots':
                return (
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                className="w-3 h-3 bg-indigo-600 rounded-full"
                            />
                        ))}
                    </div>
                )
            default:
                return <div className="animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            {renderSpinner()}
            {message && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}

export default LoadingSpinner
