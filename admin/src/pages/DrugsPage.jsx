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
    Plus, 
    FileUp, 
    Download, 
    FlaskConical, 
    Edit3, 
    Trash2, 
    Filter,
    ChevronUp,
    ChevronDown,
    Activity
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import DrugFormModal from '../components/DrugFormModal';
import Papa from 'papaparse';
import { toast } from 'react-hot-toast';

const DrugsPage = () => {
    const [drugs, setDrugs] = useState([
        { id: '1', name: 'Metformin', generic_name: 'Metformin Hydrochloride', drug_class: 'Biguanide', half_life: '6.2h', active: true },
        { id: '2', name: 'Aspirin', generic_name: 'Acetylsalicylic Acid', drug_class: 'NSAID', half_life: '0.25h', active: true },
        { id: '3', name: 'Warfarin', generic_name: 'Warfarin Sodium', drug_class: 'Anticoagulant', half_life: '40h', active: true },
    ]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => [
        {
            header: 'Product Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <FlaskConical size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{row.original.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{row.original.generic_name}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Therapeutic Class',
            accessorKey: 'drug_class',
            cell: ({ getValue }) => (
                <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[9px] font-black uppercase rounded-lg border border-slate-100">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Pharmacology',
            accessorKey: 'half_life',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-slate-300" />
                    <span className="text-xs font-black text-slate-700 tabular-nums lowercase">t½: {getValue()}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'active',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getValue() ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getValue() ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {getValue() ? 'Synced' : 'Draft'}
                    </span>
                </div>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { setSelectedDrug(row.original); setIsModalOpen(true); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data: drugs,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handleBulkImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: async (results) => {
                    toast.success(`Processing ${results.data.length} molecules...`);
                    // In real app, call adminApi.bulkImportDrugs(results.data)
                }
            });
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">Molecular Registry</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Curation of pharmacological data & interaction profiles</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                            type="text" 
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search clinical registry..."
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <label className="cursor-pointer px-6 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center shadow-sm">
                            <FileUp size={16} className="mr-3" />
                            <span>Bulk Import</span>
                            <input type="file" className="hidden" accept=".csv" onChange={handleBulkImport} />
                        </label>
                        <button 
                            onClick={() => { setSelectedDrug(null); setIsModalOpen(true); }}
                            className="px-8 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-indigo-600/10 flex items-center"
                        >
                            <Plus size={18} className="mr-3" /> Add Molecule
                        </button>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-left">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 select-none cursor-pointer hover:bg-slate-100" onClick={header.column.getToggleSortingHandler()}>
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
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-all group">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-8 py-6">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DrugFormModal 
                isOpen={isModalOpen}
                initialData={selectedDrug}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default DrugsPage;
