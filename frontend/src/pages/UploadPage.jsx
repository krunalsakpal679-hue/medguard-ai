import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    UploadCloud, 
    ShieldCheck, 
    FileText, 
    Search, 
    ArrowRight, 
    Activity, 
    Brain,
    Layers,
    Type,
    CheckCircle2,
    RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { uploadService } from '../services/uploadService'
import DropZone from '../components/upload/DropZone'
import ExtractedDrugsList from '../components/upload/ExtractedDrugsList'

const UploadPage = ({ navigate }) => {
    const { token } = useAuthStore()
    
    // State - Pipeline
    const [file, setFile] = useState(null)
    const [manualText, setManualText] = useState('')
    const [step, setStep] = useState('idle') // idle, uploading, analyzing, results
    const [progress, setProgress] = useState(0)
    
    // State - Data
    const [extractedDrugs, setExtractedDrugs] = useState([])
    const [selectedDrugs, setSelectedDrugs] = useState([])

    /**
     * Pipeline Step 1 & 2: Upload and AI Extraction.
     */
    const handleFileUpload = async (selectedFile) => {
        if (!selectedFile) return
        setFile(selectedFile)
        setStep('uploading')
        
        try {
            // Upload simulation progress
            const interval = setInterval(() => setProgress(prev => prev < 90 ? prev + 10 : prev), 200)
            const uploadResult = await uploadService.uploadFile(selectedFile, token)
            clearInterval(interval)
            setProgress(100)
            
            setStep('analyzing')
            
            // Poll for AI completion
            uploadService.pollStatus(uploadResult.upload_id, token, (status) => {
                if (status.ocr_status === 'completed') {
                    const formatted = status.extracted_drugs.map(name => ({
                        name,
                        confidence: status.confidence_scores[name] || 0.9
                    }))
                    setExtractedDrugs(formatted)
                    setStep('results')
                } else if (status.ocr_status === 'failed') {
                    alert("Pharmacological extraction failed.")
                    resetPipeline()
                }
            })
            
        } catch (err) {
            alert("Connection to clinical cloud failed.")
            resetPipeline()
        }
    }

    const handleTextParse = async () => {
        if (!manualText.trim()) return
        setStep('analyzing')
        try {
            const res = await uploadService.parseText(manualText, token)
            const formatted = res.extracted_drugs.map(name => ({
                name,
                confidence: res.confidence
            }))
            setExtractedDrugs(formatted)
            setStep('results')
        } catch (err) {
            alert("Natural Language Processing failed.")
            setStep('idle')
        }
    }

    const resetPipeline = () => {
        setStep('idle')
        setFile(null)
        setManualText('')
        setProgress(0)
        setExtractedDrugs([])
    }

    const startCheck = () => {
        // Navigate to prediction hub with selected drugs
        console.log("Navigating to check for:", selectedDrugs)
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-8 md:p-12 lg:p-20 font-inter">
            <div className="max-w-5xl mx-auto">
                
                {/* 1. Clinical Header */}
                <header className="mb-16">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <UploadCloud size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Drug Capture</h1>
                    </div>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] leading-none mb-1">Prescription Digitization Lab | OCR Analysis</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    
                    {/* 2. Left Action: Digital Capture */}
                    <div className="lg:col-span-2 space-y-12">
                        <AnimatePresence mode="wait">
                            {step === 'idle' && (
                                <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
                                    <section>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Digital Molecule Scan</h3>
                                        <DropZone onFileSelect={handleFileUpload} />
                                    </section>

                                    <div className="flex items-center gap-6">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <span className="text-[10px] font-black p-2 rounded-lg bg-white border border-slate-100 text-slate-300 uppercase italic tracking-[0.1em]">Manual Override</span>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>

                                    <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center space-x-4 mb-6 relative z-10">
                                            <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl border border-slate-100"><Type size={20} /></div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Transcription Input</h4>
                                        </div>
                                        <textarea 
                                            value={manualText}
                                            onChange={(e) => setManualText(e.target.value)}
                                            placeholder="Paste the raw text from your clinical prescription here..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-100 min-h-[200px] mb-6 transition-all"
                                        />
                                        <button 
                                            onClick={handleTextParse}
                                            disabled={!manualText.trim()}
                                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-30 transition-all flex items-center justify-center group"
                                        >
                                            Process Text <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px]" />
                                    </section>
                                </motion.div>
                            )}

                            {(step === 'uploading' || step === 'analyzing') && (
                                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 bg-white rounded-[40px] border border-slate-100 shadow-2xl">
                                    <div className="relative mb-12">
                                        <motion.div 
                                            animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            className="w-32 h-32 rounded-[40px] border-4 border-dashed border-indigo-600 flex items-center justify-center p-8 bg-indigo-50/50"
                                        >
                                            <Brain size={48} className="text-indigo-600 animate-pulse" />
                                        </motion.div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white shadow-xl rounded-2xl border border-slate-100 flex items-center justify-center">
                                            <Activity size={24} className="text-emerald-500 animate-bounce" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
                                        {step === 'uploading' ? 'Asset Synchronization...' : 'Molecular Intelligence Analysis...'}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-20 leading-relaxed mb-10">
                                        Extracting clinical entities using deep-learning pipelines and verifying against the drug master list.
                                    </p>
                                    
                                    <div className="w-80 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} animate={{ width: step === 'uploading' ? `${progress}%` : '95%' }}
                                            className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 'results' && (
                                <motion.div key="results" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                     <ExtractedDrugsList 
                                        drugs={extractedDrugs}
                                        onSelectionChange={setSelectedDrugs}
                                        onRemoveDrug={(name) => setExtractedDrugs(prev => prev.filter(d => d.name !== name))}
                                        onAddManual={(name) => setExtractedDrugs(prev => [...prev, { name, confidence: 1.0 }])}
                                     />
                                     <div className="flex gap-4">
                                         <button onClick={resetPipeline} className="px-10 py-5 bg-white border border-slate-100 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:text-rose-500 hover:border-rose-100 transition-all">Clear & Restart</button>
                                         <button 
                                            onClick={startCheck}
                                            disabled={selectedDrugs.length < 2}
                                            className={`flex-1 py-5 rounded-[28px] flex items-center justify-center space-x-4 shadow-xl transition-all ${
                                                selectedDrugs.length < 2 ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                            }`}
                                         >
                                            <ShieldCheck size={28} />
                                            <span className="text-lg font-black uppercase tracking-widest">Execute AI Audit ({selectedDrugs.length})</span>
                                         </button>
                                     </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. Right Context: Clinical Status */}
                    <div className="space-y-12">
                        <section className="bg-indigo-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />
                            <div className="relative z-10">
                                <Activity size={32} className="text-indigo-400 mb-8" />
                                <h4 className="text-2xl font-black mb-4 uppercase tracking-tight leading-tight">Secure Lab Monitoring Active</h4>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        { l: 'Asset Security', v: 'HIPAA ENCRYPTED' },
                                        { l: 'OCR Model', v: 'DEEP VISION 2.1' },
                                        { l: 'Verification', v: 'GLOBAL DB SYNC' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{item.l}</span>
                                            <span className="text-[10px] font-black">{item.v}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-[10px] font-bold text-indigo-300/60 leading-relaxed uppercase tracking-widest">Your uploads are processed in memory and never stored as permanent PII unless authorized.</p>
                            </div>
                        </section>

                        <div className="p-10 border-2 border-indigo-100 border-dashed rounded-[40px] text-center bg-white/40 shadow-sm backdrop-blur-xl">
                            <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Systems Nominal</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tighter">
                                All extraction nodes fully sync'd. Latency 142ms.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default UploadPage
