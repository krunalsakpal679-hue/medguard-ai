import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, FileText, CheckCircle2, ShieldAlert, X } from 'lucide-react'

const DropZone = ({ 
    onFileSelect, 
    accept = "image/*,application/pdf", 
    maxSize = 10 * 1024 * 1024 
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)

    /**
     * Handle input via primary file explorer.
     */
    const handleClick = () => fileInputRef.current.click()

    /**
     * Validation against clinical size protocols.
     */
    const validateFile = (file) => {
        if (!file) return false
        if (file.size > maxSize) {
            alert("Clinical safety limit: File size exceeds 10MB.")
            return false
        }
        return true
    }

    const processFile = useCallback((file) => {
        if (!validateFile(file)) return
        
        // Generate High-Res Preview for UI context
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setPreview(e.target.result)
            reader.readAsDataURL(file)
        } else {
            setPreview('pdf') # Placeholder for PDF identification
        }
        onFileSelect(file)
    }, [onFileSelect])

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        processFile(file)
    }

    const handleInputChange = (e) => {
        const file = e.target.files[0]
        processFile(file)
    }

    return (
        <div className="w-full">
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={handleClick}
                animate={isDragging ? { scale: 1.02, borderColor: '#4F46E5', backgroundColor: '#F8FAFC' } : { scale: 1 }}
                className={`relative h-80 rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                    isDragging ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
            >
                <input 
                    type="file" ref={fileInputRef} onChange={handleInputChange} 
                    accept={accept} className="hidden" 
                />

                <AnimatePresence mode="wait">
                    {!preview ? (
                        <motion.div 
                            key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="p-6 bg-slate-50 text-slate-300 rounded-full mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
                                <CloudUpload size={48} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Identify Asset</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drag or browse clinical prescriptions (MAX 10MB)</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="preview" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="w-full h-full p-4 flex items-center justify-center"
                        >
                             {preview === 'pdf' ? (
                                 <div className="flex flex-col items-center p-12 bg-rose-50 rounded-3xl border border-rose-100 text-rose-600">
                                     <FileText size={64} className="mb-4" />
                                     <span className="text-xs font-black uppercase tracking-widest">Medical PDF Captured</span>
                                 </div>
                             ) : (
                                 <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl">
                                     <img src={preview} className="w-full h-full object-cover" alt="Clinical Evidence Preview" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-8">
                                         <div className="flex items-center text-white">
                                             <CheckCircle2 size={16} className="mr-2 text-emerald-400" />
                                             <span className="text-[10px] font-black uppercase tracking-widest">Ready for AI Analysis</span>
                                         </div>
                                     </div>
                                 </div>
                             )}
                             <button 
                                onClick={(e) => { e.stopPropagation(); setPreview(null); onFileSelect(null); }}
                                className="absolute top-6 right-6 p-3 bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl backdrop-blur-md transition-all z-20"
                             >
                                <X size={20} />
                             </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isDragging && (
                    <div className="absolute inset-4 rounded-[32px] border-4 border-indigo-600/20 animate-pulse pointer-events-none" />
                )}
            </motion.div>
        </div>
    )
}

export default DropZone
