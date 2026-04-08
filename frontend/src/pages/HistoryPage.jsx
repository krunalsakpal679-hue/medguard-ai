import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
    History, 
    Search, 
    Filter, 
    Download, 
    Trash2, 
    Calendar,
    ArrowUpRight,
    ShieldAlert,
    X,
    LayoutGrid,
    LayoutList
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import HistoryCard from '../components/dashboard/HistoryCard'
import RiskBadge from '../components/dashboard/RiskBadge'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const HistoryPage = ({ navigate }) => {
    const { token } = useAuthStore()
    const [history, setHistory] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterSeverity, setFilterSeverity] = useState('ALL')

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE}/predictions/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setHistory(res.data)
            } catch (err) {
                console.error("Clinical History Purge Error", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [token])

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE}/predictions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setHistory(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            alert("Record locked by clinical audit.")
        }
    }

    const filteredHistory = history.filter(item => {
        const matchesQuery = item.drug_names.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesSeverity = filterSeverity === 'ALL' || item.overall_risk_level.toUpperCase() === filterSeverity
        return matchesQuery && matchesSeverity
    })

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-8 md:p-12 lg:p-20 font-inter">
            <div className="max-w-6xl mx-auto">
                
                {/* 1. Header Analysis */}
                <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-xl shadow-slate-200/50">
                                <History size={28} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Audit Logs</h1>
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] leading-none mb-1">Persistent Clinical History | Research Archive</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:shadow-lg transition-all flex items-center">
                            <Download size={16} className="mr-3" /> Export Archive
                        </button>
                    </div>
                </header>

                {/* 2. Research Filtering Cluster */}
                <div className="bg-white rounded-[40px] p-8 mb-12 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-8 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter chronologically by drug name..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-100 transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        {['ALL', 'NONE', 'MINOR', 'MODERATE', 'MAJOR', 'CONTRAINDICATED'].map(sev => (
                            <button
                                key={sev}
                                onClick={() => setFilterSeverity(sev)}
                                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filterSeverity === sev 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. History Feed */}
                {isLoading ? (
                    <div className="space-y-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-slate-200 animate-pulse rounded-[40px]" />)}
                    </div>
                ) : filteredHistory.length > 0 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {filteredHistory.map((item) => (
                            <HistoryCard 
                                key={item.id} 
                                prediction={item} 
                                onDelete={handleDelete}
                                onReRun={(pred) => console.log("Load drugs back into lab", pred.drug_names)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center opacity-60">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                            <ShieldAlert size={48} className="text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Archive Entries</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Adjust your clinical filters or start a new interaction check.</p>
                    </div>
                )}

            </div>
        </div>
    )
}

export default HistoryPage
