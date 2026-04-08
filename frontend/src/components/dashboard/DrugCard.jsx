import React from 'react'
import { motion } from 'framer-motion'
import { 
    Activity, 
    Heart, 
    Clock, 
    Droplet, 
    ChevronRight, 
    PlusCircle,
    FlaskConical
} from 'lucide-react'

const DrugCard = ({ drug, onAdd, onDetail, isSelected = false }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`relative group p-6 bg-white rounded-[40px] border-2 transition-all duration-500 overflow-hidden ${
                isSelected ? 'border-indigo-500 shadow-2xl' : 'border-slate-50 shadow-sm hover:shadow-xl'
            }`}
        >
            {/* Header: Class & Favorite */}
            <div className="flex justify-between items-start mb-6">
                <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100/50">
                    {drug.drug_class || 'General Pharma'}
                </div>
                <button className="text-slate-200 hover:text-rose-500 transition-colors">
                    <Heart size={20} fill="currentColor" className={drug.isFavorite ? 'text-rose-500' : ''} />
                </button>
            </div>

            {/* Molecule Identity */}
            <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-none mb-1">
                    {drug.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic truncate">
                    {drug.generic_name}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {drug.brand_names?.slice(0, 3).map(brand => (
                        <span key={brand} className="text-[8px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase">
                            {brand}
                        </span>
                    ))}
                    {drug.brand_names?.length > 3 && <span className="text-[9px] text-slate-300 font-bold">+ {drug.brand_names.length - 3}</span>}
                </div>
            </div>

            {/* Kinetic Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-3 bg-slate-50 rounded-2xl border border-white">
                    <div className="flex items-center text-slate-400 mb-1">
                        <Clock size={12} className="mr-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Half-Life</span>
                    </div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{drug.half_life_hours}h</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-white">
                    <div className="flex items-center text-slate-400 mb-1">
                        <Droplet size={12} className="mr-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Bioavail.</span>
                    </div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{drug.bioavailability}%</p>
                </div>
            </div>

            {/* Metabolic Profile */}
            <div className="flex items-center space-x-2 mb-8 px-1">
                <FlaskConical size={14} className="text-indigo-400" />
                <div className="flex gap-1.5 overflow-hidden">
                    {drug.metabolized_by?.slice(0, 2).map(cyp => (
                        <span key={cyp} className="text-[9px] font-black text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            {cyp}
                        </span>
                    ))}
                </div>
            </div>

            {/* Action Matrix */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => onAdd(drug)}
                    className="flex-1 flex items-center justify-center py-4 bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 transition-all duration-300 transform group-hover:scale-[1.02] shadow-xl shadow-slate-900/10"
                >
                    <PlusCircle size={18} className="mr-2" />
                    <span className="text-xs font-black uppercase tracking-widest">Add to Check</span>
                </button>
                <button 
                    onClick={() => onDetail(drug.id)}
                    className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Isometric Gradient Decor */}
            <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors" />
        </motion.div>
    )
}

export default DrugCard
