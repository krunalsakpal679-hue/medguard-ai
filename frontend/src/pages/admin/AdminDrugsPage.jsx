import React from 'react';
import { 
    Database, 
    Plus, 
    Search, 
    Filter,
    Edit3,
    Trash2,
    FlaskConical
} from 'lucide-react';

const AdminDrugsPage = () => {
    // Mock drug data
    const drugs = [
        { id: 1, name: 'Sertraline', generic: 'Zoloft', class: 'SSRI', stock: 1200 },
        { id: 2, name: 'Tramadol', generic: 'Ultram', class: 'Opioid', stock: 540 },
        { id: 3, name: 'Metformin', generic: 'Glucophage', class: 'Antidiabetic', stock: 2100 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Database size={24} className="text-rose-500" />
                    Molecular Inventory
                </h2>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder="Filter molecules..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                        <Plus size={18} />
                        Register Drug
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drugs.map(drug => (
                    <div key={drug.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600"><Edit3 size={14} /></button>
                            <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                        </div>
                        
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
                            <FlaskConical size={24} />
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{drug.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{drug.generic}</p>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] font-black text-slate-500">{drug.class}</span>
                            <span className="text-xs font-black text-slate-800">{drug.stock} units</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDrugsPage;
