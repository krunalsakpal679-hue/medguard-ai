import React, { useState, useRef, useEffect } from 'react'
import { 
    Send, 
    MessageSquare, 
    Bot, 
    User, 
    FileText, 
    X,
    ShieldCheck,
    ArrowDown,
    Activity
} from 'lucide-react'
import { useChat } from '../../hooks/useChat'
import ConversationSidebar from './ConversationSidebar'
import SuggestedQuestions from './SuggestedQuestions'
import { useTranslation } from 'react-i18next'

const ChatInterface = () => {
    const { t } = useTranslation()
    const { 
        messages, 
        conversations, 
        activeId, 
        isLoading, 
        error, 
        selectedLanguage, 
        sendMessage, 
        loadConversation, 
        startNewConversation, 
        deleteConversation,
        setSelectedLanguage
    } = useChat()

    const [inputText, setInputText] = useState('')
    const messagesEndRef = useRef(null)
    const [showScrollDown, setShowScrollDown] = useState(false)

    // Layout Logic
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return
        const text = inputText
        setInputText('')
        await sendMessage(text)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Clinical Context Handlers
    const renderDrugChip = (drugName) => (
        <button 
            key={drugName}
            onClick={() => console.log("Navigate to drug details for:", drugName)}
            className="inline-flex items-center px-3 py-1 mr-2 mb-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105"
        >
            <ShieldCheck className="w-3 h-3 mr-1" />
            {drugName}
        </button>
    )

    // Language Mapping Logic
    const languages = [
        { id: 'en', label: 'EN', flag: '🇬🇧' },
        { id: 'hi', label: 'हिंदी', flag: '🇮🇳' },
        { id: 'gu', label: 'GUJ', flag: '🇮🇳' }
    ]

    return (
        <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-white shadow-2xl rounded-3xl border border-slate-100 m-4">
            
            {/* 1. History Navigation */}
            <ConversationSidebar 
                conversations={conversations}
                activeId={activeId}
                onSelect={loadConversation}
                onDelete={deleteConversation}
                onNewChat={startNewConversation}
            />

            {/* 2. Chat Hub */}
            <main className="flex-1 flex flex-col relative bg-[#F5F5F7] overflow-hidden">
                
                {/* Hub Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Activity className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-indigo-950 uppercase tracking-widest leading-none">AI Health Guard</h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Verified Medical Context Engine</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                        {languages.map(lang => (
                            <button
                                key={lang.id}
                                onClick={() => setSelectedLanguage(lang.id)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 flex items-center ${
                                    selectedLanguage === lang.id 
                                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-500/10' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <span className="mr-1.5">{lang.flag}</span>
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Main Dialogue Scroll Area */}
                <div className="flex-1 overflow-y-auto px-8 relative custom-scrollbar">
                    
                    {/* Empty State / Quick Starts */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full px-10 text-center animate-in fade-in duration-700">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center mb-8 rotate-12 glow-effect">
                                <Bot className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4">
                                {selectedLanguage === 'hi' ? 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?' : 
                                 selectedLanguage === 'gu' ? 'નમસ્તે! હું તમારી શી રીતે મદદ કરી શકું?' :
                                 'Hello! How can I assist you with medication safety today?'}
                            </h1>
                            <p className="text-slate-400 text-sm max-w-lg leading-relaxed font-medium mb-12">
                                I specialize in high-detail pharmacological analysis, interaction warnings, and dosage safety. Ask me about any clinical medication.
                            </p>
                            <SuggestedQuestions 
                                onSelect={sendMessage} 
                                language={selectedLanguage} 
                            />
                        </div>
                    )}

                    <div className="py-10 space-y-8 max-w-4xl mx-auto">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`flex items-start max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar Trace */}
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 ml-4 ring-4 ring-indigo-600/10' 
                                        : 'bg-white mr-4 ring-4 ring-white/20'
                                    }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                                    </div>

                                    {/* Clinical Bubble */}
                                    <div className={`group relative p-6 rounded-[30px] shadow-sm transform transition-all duration-300 hover:shadow-xl ${
                                        msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none hover:translate-x-[-4px]'
                                        : 'bg-white text-slate-800 rounded-tl-none hover:translate-x-[4px]'
                                    }`}>
                                        <div className="absolute top-0 right-0 p-2 opacity-20 text-[10px] font-black group-hover:opacity-100 transition-opacity">
                                            {msg.language?.toUpperCase() || 'EN'}
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed tracking-wide mb-1 whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                        
                                        {/* Clinical Drug Entities Detection */}
                                        {msg.detected_drugs?.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-indigo-100/20">
                                                <p className="text-[9px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Prescription Context Identified:</p>
                                                <div className="flex flex-wrap">
                                                    {msg.detected_drugs.map(drug => renderDrugChip(drug))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 mt-2 mx-12 uppercase tracking-tighter">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}

                        {/* Loading Clinical State */}
                        {isLoading && (
                            <div className="flex items-start animate-in fade-in transition-all">
                                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-xl bg-white mr-4 flex items-center justify-center shadow-lg ring-4 ring-white/20">
                                    <Bot className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="bg-white p-6 rounded-[30px] rounded-tl-none shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    <span className="text-[10px] font-black text-indigo-900 ml-4 uppercase tracking-widest opacity-60">LLM Processing</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Clinical Intelligence Input */}
                <div className="p-8 bg-white border-t border-slate-100 z-10 w-full flex items-center justify-center">
                    <div className="relative w-full max-w-4xl shadow-2xl shadow-indigo-600/10 rounded-[30px] border border-indigo-100/50 p-2 bg-gradient-to-r from-white via-white to-indigo-50/10">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Consult MedGuard AI about drugs, interactions, or safety..."
                            className="w-full bg-transparent px-6 py-4 pr-16 text-sm font-medium text-slate-700 outline-none resize-none max-h-40 min-h-[60px]"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputText.trim() || isLoading}
                            className={`absolute right-4 bottom-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                                inputText.trim() && !isLoading 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 active:scale-95' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Safety Disclaimer Hub */}
                <div className="absolute bottom-[115px] left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-orange-100 shadow-sm z-30 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-500 mr-2" />
                    <p className="text-[9px] font-black text-orange-600 tracking-tight uppercase">Always consult a physical physician for dosage changes.</p>
                </div>
            </main>

            {/* Global Style Inject for Glassmorphism & Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .glow-effect { box-shadow: 0 0 50px 0 rgba(79, 70, 229, 0.15); }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            `}} />
        </div>
    )
}

export default ChatInterface
