import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Activity, FlaskConical, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const drugSchema = z.object({
    name: z.string().min(2, "Name required"),
    generic_name: z.string().min(2, "Generic name required"),
    drug_class: z.string().min(2, "Therapeutic class required"),
    mechanism_of_action: z.string().max(500).optional(),
    half_life_hours: z.preprocess((val) => Number(val), z.number().min(0).max(500)),
    bioavailability: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
    protein_binding_percent: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
});

const DrugFormModal = ({ isOpen, onClose, initialData }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(drugSchema),
        defaultValues: initialData || { half_life_hours: 0, bioavailability: 0, protein_binding_percent: 0 }
    });

    const [enzymes, setEnzymes] = useState(['CYP3A4', 'CYP2D6']);

    useEffect(() => {
        if (isOpen) reset(initialData || { half_life_hours: 0, bioavailability: 0, protein_binding_percent: 0 });
    }, [isOpen, initialData, reset]);

    const onSubmit = async (data) => {
        try {
            toast.loading(initialData ? "Refining Molecule..." : "Synthesizing Molecule...", { id: 'drug' });
            // Mock API delay
            await new Promise(r => setTimeout(r, 1000));
            toast.success(initialData ? "Refinement Complete" : "Synthesis Complete", { id: 'drug' });
            onClose();
        } catch (err) {
            toast.error("Process Disturbance", { id: 'drug' });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                >
                    <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <FlaskConical size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    {initialData ? 'Refine Molecule' : 'New Synthetic Entry'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Molecular Profile Editor</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all"><X size={20} /></button>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-10 space-y-10">
                        {/* Primary Identity Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Market Name</label>
                                <input {...register('name')} placeholder="e.g. Lipitor" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" />
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 flex items-center ml-2"><AlertCircle size={10} className="mr-1" /> {errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Generic Name</label>
                                <input {...register('generic_name')} placeholder="e.g. Atorvastatin" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" />
                                {errors.generic_name && <p className="text-[10px] font-bold text-rose-500 flex items-center ml-2"><AlertCircle size={10} className="mr-1" /> {errors.generic_name.message}</p>}
                            </div>
                        </div>

                        {/* Pharmacology Cluster */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Half-Life (hrs)</label>
                                <input {...register('half_life_hours')} type="number" step="0.1" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Bioavailability (%)</label>
                                <input {...register('bioavailability')} type="number" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Protein Binding (%)</label>
                                <input {...register('protein_binding_percent')} type="number" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                            </div>
                        </div>

                        {/* Enzymatic Profile */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Metabolic CYP Pathways</label>
                            <div className="flex flex-wrap gap-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                {['CYP1A2', 'CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4'].map(cyp => (
                                    <button 
                                        key={cyp} type="button"
                                        onClick={() => setEnzymes(prev => prev.includes(cyp) ? prev.filter(e => e !== cyp) : [...prev, cyp])}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                            enzymes.includes(cyp) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-slate-400 hover:text-indigo-600 border border-slate-200'
                                        }`}
                                    >
                                        {cyp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Narrative Segment */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mechanism of Action</label>
                            <textarea {...register('mechanism_of_action')} placeholder="Describe the biological interaction pathway..." className="w-full min-h-[120px] bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all resize-none" />
                        </div>
                    </form>

                    <footer className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel Entry</button>
                        <button 
                            disabled={isSubmitting}
                            onClick={handleSubmit(onSubmit)}
                            className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Activity size={16} className="animate-spin" /> : <Check size={16} />}
                            {initialData ? 'Commit Refinement' : 'Authorize Synthesis'}
                        </button>
                    </footer>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DrugFormModal;
