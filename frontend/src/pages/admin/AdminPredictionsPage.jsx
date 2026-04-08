import React from 'react';
import { 
    Activity, 
    Download, 
    Filter, 
    Eye,
    TrendingUp,
    Zap,
    History
} from 'lucide-react';

const AdminPredictionsPage = () => {
    // Mock prediction logs
    const logs = [
        { id: 'PRD-8821', user: 'Dr. Connor', drugs: 'Sertraline + Tramadol', risk: 'Critical', date: '5 mins ago' },
        { id: 'PRD-8822', user: 'Dr. John', drugs: 'Aspirin + Ibuprofen', risk: 'Moderate', date: '12 mins ago' },
        { id: 'PRD-8823', user: 'Nurse Kyle', drugs: 'Metformin + Glucophage', risk: 'Minimal', date: '1 hour ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Activity size={24} className="text-rose-500" />
                    Prediction Asset Audit
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                    <Download size={18} />
                    Export Global Logs
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Predictions', val: '14,202', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Major Interactions', val: '892', color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'System Accuracy', val: '94.2%', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map(stat => (
                    <div key={stat.label} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-amber-400" />
                        Live GNN Stream
                    </h3>
                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <History size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold tracking-tight">{log.drugs}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">By {log.user} • {log.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        log.risk === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {log.risk}
                                    </span>
                                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPredictionsPage;
