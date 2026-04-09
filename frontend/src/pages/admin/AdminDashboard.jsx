import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Pill, Activity, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-500' },
        { label: 'Drugs Catalog', value: '45,000+', icon: Pill, color: 'text-emerald-500' },
        { label: 'Active Predictions', value: '842', icon: Activity, color: 'text-indigo-500' },
        { label: 'Clinical Alerts', value: '12', icon: ShieldAlert, color: 'text-rose-500' },
    ];

    const actions = [
        { title: 'User Management', desc: 'Manage clinical practitioners and patients.', link: '/admin/users', icon: Users },
        { title: 'Drug Repository', desc: 'Audit and expand the pharmacological database.', link: '/admin/drugs', icon: Pill },
        { title: 'Interaction Rules', desc: 'Configure molecular binding and interaction weights.', link: '/admin/predictions', icon: Activity },
    ];

    return (
        <div className="p-8 bg-slate-950 min-h-screen">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white mb-2">Admin Control Plane</h1>
                <p className="text-slate-400">MedGuard AI System Oversight</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {actions.map((action, i) => (
                    <Link to={action.link} key={i}>
                        <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[32px] hover:border-indigo-500/50 transition-all cursor-pointer">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 transition-colors">
                                <action.icon size={28} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{action.title}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{action.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
