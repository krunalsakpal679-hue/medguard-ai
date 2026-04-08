import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Search, 
    SlidersHorizontal, 
    X, 
    Filter, 
    ArrowRight, 
    Activity, 
    FlaskConical,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    LayoutList,
    Layers
} from 'lucide-react'
import { useDrugSearch } from '../hooks/useDrugSearch'
import DrugCard from '../components/dashboard/DrugCard'

const DrugSearchPage = () => {
    const {
        query,
        setQuery,
        results,
        isLoading,
        error,
        page,
        totalResults,
        filters,
        toggleFilter,
        loadMore,
        clearSearch
    } = useDrugSearch()

    const [showFilters, setShowFilters] = useState(false)
    const [selectedForCompare, setSelectedForCompare] = useState([])

    // Suggested Clinical Classes for Filtering
    const drugClasses = [
         "SSRI", "Beta-Blocker", "ACE Inhibitor", "NSAID", "Anticoagulant", 
         "Statin", "Antibiotic", "Anti-Diabetic"
    ]

    const handleCompareToggle = (drug) => {
        if (selectedForCompare.find(d => d.id === drug.id)) {
            setSelectedForCompare(prev => prev.filter(d => d.id !== drug.id))
        } else {
            if (selectedForCompare.length < 4) {
                setSelectedForCompare(prev => [...prev, drug])
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-inter">
            
            {/* 1. Global Research Sidebar */}
            <AnimatePresence>
                {showFilters && (
                    <motion.aside 
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        className="w-80 h-screen bg-white border-r border-slate-100 p-8 flex flex-col sticky top-0"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Molecular Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-900"><X size={20}/></button>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <h4 className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                    <Activity size={12} className="mr-2" /> Therapeutic Class
                                </h4>
                                <div className="space-y-2">
                                    {drugClasses.map(cls => (
                                        <button 
                                            key={cls}
                                            onClick={() => toggleFilter('classes', cls)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                                filters.classes.includes(cls) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {cls}
                                            {filters.classes.includes(cls) && <Check size={12}/>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                    <FlaskConical size={12} className="mr-2" /> Metabolic Pathway (CYP)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {["CYP3A4", "CYP2D6", "CYP2C19", "CYP2C9"].map(cyp => (
                                        <button 
                                            key={cyp}
                                            className="px-3 py-1.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase"
                                        >
                                            {cyp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <button className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                            Apply Research Logic
                        </button>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* 2. Search Hub & Grid */}
            <main className="flex-1 p-12">
                
                {/* Dynamic Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="relative flex-1 max-w-2xl group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                            <Search size={28} />
                        </div>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Identify molecules by name, generic, or brand..."
                            className="w-full h-20 bg-white border border-slate-100 rounded-[30px] pl-16 pr-10 text-xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-100 shadow-sm transition-all"
                        />
                        {query && (
                            <button onClick={clearSearch} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500"><X size={24}/></button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-20 px-8 rounded-[30px] border flex items-center justify-center transition-all ${
                                showFilters ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:shadow-lg'
                            }`}
                        >
                            <SlidersHorizontal size={24} className="mr-3" />
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Filters</span>
                        </button>
                        <button className="h-20 w-20 bg-white border border-slate-100 rounded-[30px] flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:shadow-lg transition-all">
                            <Layers size={24} />
                        </button>
                    </div>
                </header>

                {/* Molecule Results Feed */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 w-full bg-slate-200 animate-pulse rounded-[40px]" />
                        ))}
                    </div>
                )}

                {results.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
                            {results.map((drug) => (
                                <DrugCard 
                                    key={drug.id} 
                                    drug={drug} 
                                    onAdd={() => console.log('added')}
                                    onDetail={(id) => console.log('navigate to detail', id)}
                                />
                            ))}
                        </div>

                        {/* Pagination Unit */}
                        <div className="mt-20 flex justify-center items-center space-x-6">
                            <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-indigo-600 hover:shadow-lg transition-all">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{page} / 4</span>
                            </div>
                            <button 
                                onClick={loadMore}
                                className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-indigo-600 hover:shadow-lg transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </>
                )}

                {!isLoading && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                            <Search size={48} className="text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">No Molecular Matches</h2>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Adjust your clinical filters or verify the spelling.</p>
                    </div>
                )}

            </main>

            {/* Compare Drawer (Floating) */}
            <AnimatePresence>
                {selectedForCompare.length > 0 && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-6 rounded-[30px] flex items-center gap-10 shadow-2xl z-50 ring-1 ring-white/10"
                    >
                        <div className="flex -space-x-4">
                            {selectedForCompare.map(d => (
                                <div key={d.id} className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center font-black text-[10px]">{d.name[0]}</div>
                            ))}
                        </div>
                        <div>
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Comparison Active</p>
                             <p className="text-sm font-bold">{selectedForCompare.length} Drugs Selected</p>
                        </div>
                        <button className="px-8 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Bench Analysis
                        </button>
                        <button onClick={() => setSelectedForCompare([])} className="p-2 text-slate-400 hover:text-white"><X size={20}/></button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default DrugSearchPage
