import React, { useState } from 'react'
import { Plus, MessageSquare, Trash2, Clock, Calendar, CheckCircle2 } from 'lucide-react'

const ConversationSidebar = ({ 
    conversations, 
    activeId, 
    onSelect, 
    onDelete, 
    onNewChat 
}) => {
    const [confirmDelete, setConfirmDelete] = useState(null)

    /**
     * Helper for clinical timestamp formatting.
     */
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now - date
        
        if (diff < 24 * 3600 * 1000) return "Today"
        if (diff < 48 * 3600 * 1000) return "Yesterday"
        return date.toLocaleDateString()
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-80 min-w-[320px] transition-all duration-300">
            {/* Header Action */}
            <div className="p-6">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 group"
                >
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-bold text-sm tracking-wide uppercase">New Conversation</span>
                </button>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3 custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-400 opacity-60 px-6 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1">No Past Dialogue</p>
                        <p className="text-xs font-medium max-w-[180px]">Your clinical sessions will appear here as you interact.</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div key={conv.id} className="relative group">
                            <button
                                onClick={() => onSelect(conv.id)}
                                className={`w-full flex flex-col p-4 text-left rounded-2xl transition-all duration-300 border ${
                                    activeId === conv.id 
                                    ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/10' 
                                    : 'bg-transparent border-transparent hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-1.5 rounded-lg mr-3 ${activeId === conv.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400 opacity-60'}`}>
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter self-center mt-1">
                                        {formatDate(conv.created_at)}
                                    </p>
                                </div>
                                <h4 className={`text-sm font-black line-clamp-1 mb-1 tracking-tight pr-8 ${activeId === conv.id ? 'text-indigo-950' : 'text-slate-600'}`}>
                                    {conv.title}
                                </h4>
                                <div className="flex items-center mt-2">
                                    <div className="w-8 h-1.5 bg-indigo-500/30 rounded-full overflow-hidden mr-3">
                                        <div 
                                            className="h-full bg-indigo-500" 
                                            style={{ width: `${Math.min(conv.message_count * 10, 100)}%` }} 
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400">
                                        {conv.message_count} Clinical Turns
                                    </p>
                                </div>
                            </button>

                            {/* Delete Action Overlay */}
                            {confirmDelete === conv.id ? (
                                <div className="absolute inset-0 bg-red-600/95 backdrop-blur-sm rounded-2xl flex items-center justify-evenly p-2 animate-in fade-in zoom-in duration-200 z-10">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Purge?</p>
                                    <div className="flex gap-1">
                                        <button 
                                            onMouseDown={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                                            className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onMouseDown={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                            className="p-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(conv.id); }}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {/* Context Footer */}
            <div className="p-6 border-t border-slate-200 bg-white/40 backdrop-blur-xl">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20">M</div>
                    <div>
                        <p className="text-xs font-black text-indigo-950 uppercase tracking-widest leading-none">MedGuard AI</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Clinical Guidance Kernel</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConversationSidebar
