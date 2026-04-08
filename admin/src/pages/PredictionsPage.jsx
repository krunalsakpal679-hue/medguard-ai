import React, { useMemo, useState } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender,
    getSortedRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import { 
    Search, 
    Eye, 
    Download, 
    ShieldAlert, 
    Clock, 
    Filter,
    ChevronUp,
    ChevronDown,
    Activity,
    UserCircle2,
    BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

const PredictionsPage = () => {
    // Mock Prediction Data
    const data = useMemo(() => [
        { id: '1', user: 'Dr. Sarah Wilson', drugs: ['Aspirin', 'Warfarin'], risk: 'MAJOR', timestamp: new Date(), accuracy: 0.94 },
        { id: '2', user: 'John Doe', drugs: ['Metformin', 'Insulin'], risk: 'MODERATE', timestamp: new Date(), accuracy: 0.88 },
        { id: '3', user: 'Krunal Lathiya', drugs: ['Amoxicillin', 'Azithromycin'], risk: 'NONE', timestamp: new Date(), accuracy: 0.99 },
        { id: '4', user: 'Dr. Sarah Wilson', drugs: ['Sildenafil', 'Nitroglycerin'], risk: 'CONTRAINDICATED', timestamp: new Date(), accuracy: 0.98 },
    ], []);

    const chartData = [
        { name: 'Contra.', count: 12, color: '#7f1d1d' },
        { name: 'Major', count: 45, color: '#f43f5e' },
        { name: 'Moderate', count: 88, color: '#fb923c' },
        { name: 'Minor', count: 124, color: '#fde047' },
        { name: 'None', count: 312, color: '#10b981' },
    ];

    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => [
        {
            header: 'Clinical Analyst',
            accessorKey: 'user',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-3">
                    <UserCircle2 size={24} className="text-slate-300" />
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{getValue()}</span>
                </div>
            )
        },
        {
            header: 'Subject Molecules',
            accessorKey: 'drugs',
            cell: ({ getValue }) => (
                <div className="flex flex-wrap gap-1.5">
                    {getValue().map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded ring-1 ring-slate-200">
                            {d}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'AI Severity Trace',
            accessorKey: 'risk',
            cell: ({ getValue }) => (
                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${
                    getValue() === 'CONTRAINDICATED' ? 'bg-rose-950 text-rose-400' :
                    getValue() === 'MAJOR' ? 'bg-rose-50 text-rose-600' :
                    getValue() === 'MODERATE' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                    {getValue()}
                </div>
            )
        },
        {
            header: 'AI Confidence',
            accessorKey: 'accuracy',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${getValue() * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 tabular-nums">{(getValue() * 100).toFixed(0)}%</span>
                </div>
            )
        },
        {
            header: 'Temporal Log',
            accessorKey: 'timestamp',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                    <Clock size={12} />
                    {format(getValue(), 'MMM d, HH:mm')}
                </div>
            )
        },
        {
            id: 'view',
            cell: () => (
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <Eye size={16} />
                </button>
            )
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">Analytical Monitoring</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time surveillance of clinical molecule interactions</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                            type="text" 
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Filter analytical history..."
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                    </div>
                    <button className="h-14 px-8 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 flex items-center shadow-sm">
                        <Download size={16} className="mr-3" /> Export Audit Log
                    </button>
                </div>
            </header>

            {/* Quick Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Volume Intensity Index</h3>
                        <BarChart3 size={20} className="text-slate-300" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[40px] text-white flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Platform Accuracy</p>
                        <h4 className="text-6xl font-black tracking-tight tabular-nums">98.2%</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[98%]" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">
                            Mean confidence score across last 14,000 analytical inferences.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-8 py-6">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-8 py-6">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    export default PredictionsPage;
    
