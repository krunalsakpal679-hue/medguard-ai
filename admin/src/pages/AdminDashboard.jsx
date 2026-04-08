import React from 'react';
import { 
    Users, 
    ShieldCheck, 
    Zap, 
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Activity,
    Database
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell 
} from 'recharts';

const AdminDashboard = () => {
    // Mock Data for Visualization
    const predictionTrend = [
        { date: '04/01', count: 120 }, { date: '04/02', count: 180 }, 
        { date: '04/03', count: 150 }, { date: '04/04', count: 210 }, 
        { date: '04/05', count: 320 }, { date: '04/06', count: 280 }, 
        { date: '04/07', count: 410 }
    ];

    const riskDistribution = [
        { name: 'None', value: 45, color: '#10b981' },
        { name: 'Minor', value: 25, color: '#f59e0b' },
        { name: 'Moderate', value: 15, color: '#f97316' },
        { name: 'Major', value: 10, color: '#ef4444' },
        { name: 'Contra.', value: 5, color: '#7f1d1d' }
    ];

    const StatCard = ({ label, value, trend, icon: Icon, color }) => (
        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trend)}%
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* KPI Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Total Platform Users" value="2,542" trend={12} icon={Users} color="indigo" />
                <StatCard label="Live Interactions" value="14,204" trend={8} icon={ShieldCheck} color="emerald" />
                <StatCard label="System Throughput" value="1.2ms" trend={-4} icon={Zap} color="orange" />
                <StatCard label="Critical Blocks" value="84" trend={15} icon={AlertTriangle} color="rose" />
            </div>

            {/* Visual Analytics Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Prediction Volume */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Activity Momentum</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">7-Day Prediction Volume</p>
                        </div>
                        <Activity className="text-indigo-600" size={24} />
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={predictionTrend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="900" />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="900" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Distribution */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Risk Segmentation</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cumulative interaction severity</p>
                        </div>
                        <Database className="text-rose-600" size={24} />
                    </div>
                    <div className="h-80 w-full flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskDistribution}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-1/3 space-y-3">
                            {riskDistribution.map(item => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-black uppercase text-slate-500">{item.name}</span>
                                    <span className="text-[10px] font-black text-slate-900 ml-auto">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                    { label: 'Core API Cluster', status: 'Optimal', latency: '42ms' },
                    { label: 'ML Prediction Engine', status: 'Healthy', latency: '184ms' },
                    { label: 'Blockchain Audit Sync', status: 'Syncing', latency: '92ms' }
                ].map((node, i) => (
                    <div key={i} className="p-6 bg-slate-900 rounded-3xl text-white">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{node.label}</p>
                        <div className="flex justify-between items-center mt-3">
                            <p className="text-sm font-black uppercase tracking-tight text-emerald-400">{node.status}</p>
                            <p className="text-xs font-bold text-slate-400 tabular-nums">{node.latency}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
