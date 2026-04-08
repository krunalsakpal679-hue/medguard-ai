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
    MoreVertical, 
    ChevronUp, 
    ChevronDown, 
    ShieldCheck, 
    ShieldAlert,
    Clock,
    UserCircle2
} from 'lucide-react';
import { format } from 'date-fns';

const UsersPage = () => {
    // Mock User Data
    const data = useMemo(() => [
        { id: 1, name: 'Krunal Lathiya', email: 'krunal@example.com', role: 'ADMIN', lastActive: new Date(), checks: 142, status: 'Active' },
        { id: 2, name: 'John Doe', email: 'john@clinical.io', role: 'USER', lastActive: new Date(), checks: 45, status: 'Active' },
        { id: 3, name: 'Dr. Sarah Wilson', email: 'sarah.w@hospital.org', role: 'USER', lastActive: new Date(), checks: 88, status: 'Inactive' },
        { id: 4, name: 'System Auditor', email: 'audit@medguard.ai', role: 'ADMIN', lastActive: new Date(), checks: 0, status: 'Active' },
    ], []);

    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => [
        {
            header: 'Identity',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center text-slate-400">
                        <UserCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{row.original.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{row.original.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Cluster Role',
            accessorKey: 'role',
            cell: ({ getValue }) => (
                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${
                    getValue() === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}>
                    {getValue()}
                </div>
            )
        },
        {
            header: 'Clinical Activity',
            accessorKey: 'checks',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span className="text-sm font-black tabular-nums">{getValue()}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">checks</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getValue() === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getValue() === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{getValue()}</span>
                </div>
            )
        },
        {
            header: 'Last Pulse',
            accessorKey: 'lastActive',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                    <Clock size={12} />
                    {format(getValue(), 'MMM d, HH:mm')}
                </div>
            )
        },
        {
            id: 'actions',
            cell: () => (
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <MoreVertical size={16} />
                </button>
            )
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <header className="flex justify-between items-end gap-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">Identity Registry</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage global user credentials and cluster roles</p>
                </div>
                
                <div className="relative w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search identities..."
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    />
                </div>
            </header>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: <ChevronUp size={12} />, desc: <ChevronDown size={12} /> }[header.column.getIsSorted()] ?? null}
                                        </div>
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
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {data.length === 0 && (
                    <div className="py-20 text-center opacity-40">
                        <UserCircle2 size={64} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-xs font-black uppercase tracking-widest italic">Registry Empty</p>
                    </div>
                )}
            </div>

            <footer className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-8">
                <p>Displaying {data.length} Clinical Identities</p>
                <div className="flex gap-4">
                    <button className="pb-1 border-b-2 border-transparent hover:border-slate-300">Previous</button>
                    <button className="pb-1 border-b-2 border-indigo-600 text-indigo-600">1</button>
                    <button className="pb-1 border-b-2 border-transparent hover:border-slate-300">Next</button>
                </div>
            </footer>
        </div>
    );
};

export default UsersPage;
