import React from 'react';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Mail, 
    Calendar,
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const AdminUsersPage = () => {
    // Mock user data
    const users = [
        { id: 1, name: 'Dr. Sarah Connor', email: 's.connor@hospital.com', role: 'ADMIN', joined: '2024-03-12', status: 'Active' },
        { id: 2, name: 'John Doe', email: 'j.doe@clinic.org', role: 'USER', joined: '2024-04-01', status: 'Active' },
        { id: 3, name: 'Kyle Reese', email: 'k.reese@med.edu', role: 'USER', joined: '2024-04-05', status: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Users size={24} className="text-rose-500" />
                    Identity Management
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                    <UserPlus size={18} />
                    Provision User
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified User</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Tier</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commissioned</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{u.name}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Mail size={12} />
                                                {u.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                                        u.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {u.joined}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {u.status === 'Active' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-300" />}
                                        <span className="text-xs font-bold text-slate-600">{u.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;
