import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    MessageSquare, 
    ShieldQuestion, 
    Globe,
    AlertCircle,
    Zap
} from 'lucide-react';
import { useChat } from '../hooks/useChat';

/**
 * Tactical Multilingual AI Chat Interface.
 * Real-time engagement with the MedGuard GPT engine for pharmacological queries.
 */
const ChatPage = () => {
    const { messages, sendMessage, isLoading, error } = useChat();
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendMessage(input, language);
        setInput('');
    };

    const suggested = [
        "Explain Sertraline mechanism",
        "Common side effects of Aspirin",
        "Dosage for Metformin",
        "Pediatric safety of Ibuprofen"
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto space-y-4">
            {/* Header / Assistant Info */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Bot size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">MedGuard Assistant</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Medical Engine v1.5</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    {['en', 'hi', 'gu'].map(lang => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                language === lang ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Canvas */}
            <div className="flex-1 glass-effect rounded-[32px] p-6 overflow-y-auto space-y-6 relative">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500"
                        >
                            <Sparkles size={40} />
                        </motion.div>
                        <div className="max-w-md">
                            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">How can I assist you today?</h2>
                            <p className="text-sm font-medium text-slate-500">
                                Access immediate clinical insights in English, Hindi, and Gujarati. 
                                Type a drug name or pharmacological query above.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-lg mt-8">
                            {suggested.map(txt => (
                                <button 
                                    key={txt}
                                    onClick={() => setInput(txt)}
                                    className="p-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all text-left flex items-center gap-2"
                                >
                                    <MessageSquare size={14} className="shrink-0" />
                                    {txt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: msg.isBot ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-3xl ${
                                msg.isBot 
                                    ? 'bg-slate-50 text-slate-800 border-l-4 border-indigo-600 rounded-tl-none font-medium' 
                                    : 'bg-indigo-600 text-white rounded-tr-none font-bold'
                            }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {msg.isBot ? <Bot size={12} className="text-indigo-500" /> : <User size={12} />}
                                    <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                                        {msg.isBot ? 'Assistant' : 'You'}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-50 p-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-75" />
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-150" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesizing response...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Architecture */}
            <div className="relative">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about interactions, side effects, or pharmacology..."
                    className="w-full h-16 pl-6 pr-32 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
                />
                <div className="absolute right-3 top-2 flex items-center gap-2">
                    <button className="p-3 text-slate-400 hover:text-indigo-600">
                        <Globe size={20} />
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            {/* Warning Footer */}
            <div className="flex items-center justify-center gap-2 px-6 py-2 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle size={14} className="text-amber-600" />
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
                    Information provided is for clinical guidance only. Always verify with patient records.
                </p>
            </div>
        </div>
    );
};

export default ChatPage;
