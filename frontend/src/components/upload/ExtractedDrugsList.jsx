import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    CheckCircle2, 
    AlertCircle, 
    Plus, 
    Trash2, 
    ShieldCheck, 
    Search,
    Brain
} from 'lucide-react'

const ExtractedDrugsList = ({ 
    drugs = [], 
    onSelectionChange, 
    onAddManual, 
    onRemoveDrug 
}) => {
    const [selectedDrugs, setSelectedDrugs] = useState([])
    const [manualInput, setManualInput] = useState('')

    /**
     * Toggles a drug's selection state and notifies the parent logic.
     */
    const toggleDrug = (drugName) => {
        let newSelection
        if (selectedDrugs.includes(drugName)) {
            newSelection = selectedDrugs.filter(d => d !== drugName)
        } else {
            newSelection = [...selectedDrugs, drugName]
        }
        setSelectedDrugs(newSelection)
        onSelectionChange?.(newSelection)
    }

    const handleManualAdd = () => {
        if (!manualInput.trim()) return
        onAddManual?.(manualInput)
        setManualInput('')
    }

    // Clinical Confidence Logic
    const getConfidenceColor = (confidence) => {
        if (confidence > 0.85) return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-400/20"
        if (confidence > 0.60) return "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-400/20"
        return "bg-rose-50 text-rose-700 border-rose-100 ring-rose-400/20"
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            
            <header className="flex justify-between items-end border-b border-slate-100 pb-4 pr-4">
                <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest mb-1 flex items-center">
                        <Brain size={16} className="mr-3 text-indigo-600" />
                        AI Extraction Result
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Review and confirm medication trace</p>
                </div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg">
                    {selectedDrugs.length} Selected
                </p>
            </header>

            <div className="flex flex-wrap gap-4 min-h-20">
                {drugs.map((drug, index) => {
                    const isSelected = selectedDrugs.includes(drug.name)
                    const confidence = drug.confidence || 0.9

                    return (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={index}
                            onClick={() => toggleDrug(drug.name)}
                            className={`flex items-center px-6 py-4 rounded-[24px] border-2 transition-all duration-300 relative overflow-hidden ring-4 group ${
                                isSelected ? 'bg-indigo-600 border-indigo-500 text-white ring-indigo-500/10 shadow-xl scale-105' : 
                                `bg-white ${getConfidenceColor(confidence)} hover:shadow-lg transform active:scale-95`
                            }`}
                        >
                            <div className={`p-1 rounded-full mr-3 ${isSelected ? 'bg-white text-indigo-600' : 'bg-current opacity-20'}`}>
                                {isSelected ? <CheckCircle2 size={12} strokeWidth={3} /> : <div className="w-3 h-3" />}
                            </div>
                            
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">{drug.name}</p>
                                <p className={`text-[8px] font-bold uppercase tracking-widest ${isSelected ? 'opacity-60 text-white' : 'opacity-80'}`}>
                                    {Math.round(confidence * 100)}% Match
                                </p>
                            </div>
                            
                            {!isSelected && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemoveDrug(drug.name); }}
                                    className="ml-4 opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-rose-500 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </motion.button>
                    )
                })}

                {drugs.length === 0 && (
                    <div className="py-10 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] italic px-4">
                        Waiting for extraction sequence...
                    </div>
                )}
            </div>

            {/* Manual Correction Component */}
            <div className="relative group max-w-sm mt-10">
                <input 
                    type="text" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                    placeholder="Add missing clinical identifier..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 pl-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-100 transition-all placeholder:text-[10px] placeholder:uppercase placeholder:font-black placeholder:tracking-widest"
                />
                <button 
                    onClick={handleManualAdd}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    )
}

export default ExtractedDrugsList
