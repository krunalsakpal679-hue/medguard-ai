import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Stethoscope, ShieldCheck, Brain, Upload, 
    MessageSquare, Search, ArrowRight, Star,
    Github, Mail, Phone, MapPin, ChevronDown
} from 'lucide-react'

const LandingPage = () => {
    const navigate = useNavigate()
    const canvasRef = useRef(null)

    // Animated particle network (pure canvas, no deps)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let frame
        const W = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
        W()
        window.addEventListener('resize', W)

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 1,
        }))

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(99,102,241,0.5)'
                ctx.fill()
            })
            particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
                const d = Math.hypot(a.x - b.x, a.y - b.y)
                if (d < 120) {
                    ctx.beginPath()
                    ctx.moveTo(a.x, a.y)
                    ctx.lineTo(b.x, b.y)
                    ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - d / 120)})`
                    ctx.lineWidth = 0.8
                    ctx.stroke()
                }
            }))
            frame = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', W) }
    }, [])

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white font-sans overflow-x-hidden">

            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight">MedGuard <span className="text-indigo-400">AI</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how" className="hover:text-white transition-colors">How It Works</a>
                    <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign In</button>
                    <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
                {/* Animated canvas background */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
                
                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] animate-pulse" style={{animationDelay:'1s'}} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px]" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        AI-Powered Clinical Intelligence Platform
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
                        <span className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Med</span>
                        <span className="bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">Guard</span>
                        <span className="block text-4xl md:text-5xl mt-2 bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent font-bold">
                            Intelligent Drug Safety Network
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        AI-powered prescription analysis, drug interaction detection, and multilingual medical assistance — protecting patients in real time with 98.4% accuracy.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => navigate('/register')}
                            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 text-base"
                        >
                            Start Free — Create Account
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all text-base"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-white/5">
                        {[
                            { v: '98.4%', l: 'AI Accuracy' },
                            { v: '3,421+', l: 'Drug Database' },
                            { v: '3', l: 'Languages' },
                            { v: '<100ms', l: 'Response Time' },
                        ].map(s => (
                            <div key={s.l} className="text-center">
                                <p className="text-2xl font-black text-indigo-400">{s.v}</p>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 hover:text-slate-400 transition-colors animate-bounce">
                    <span className="text-xs font-semibold uppercase tracking-widest">Scroll</span>
                    <ChevronDown size={20} />
                </a>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-32 px-6 bg-gradient-to-b from-[#0a0a1a] to-[#0d0d24]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Core Features</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Everything a Clinical Team Needs
                        </h2>
                        <p className="text-slate-500 mt-4 max-w-xl mx-auto">From OCR prescription scanning to AI drug interaction analysis, MedGuard covers the full clinical safety pipeline.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Upload, color: 'indigo', title: 'OCR Prescription Scan', desc: 'Upload any prescription image or PDF. Our deep learning pipeline extracts drug names with 97%+ confidence.' },
                            { icon: ShieldCheck, color: 'violet', title: 'Drug Interaction Check', desc: 'Instantly detect dangerous drug combinations using a 3,421-entry pharmacological database updated weekly.' },
                            { icon: Brain, color: 'emerald', title: 'AI Clinical Assistant', desc: 'Ask complex medical questions in English, Hindi, or Gujarati. Powered by Gemini and Groq LLMs.' },
                            { icon: Search, color: 'sky', title: 'Drug Safety Manual', desc: 'Browse detailed drug profiles, side effects, contraindications, and dosage information instantly.' },
                            { icon: MessageSquare, color: 'orange', title: 'Multilingual Chat', desc: 'Full natural language processing in 3 languages for patient-facing and practitioner-facing queries.' },
                            { icon: Star, color: 'rose', title: 'HIPAA Compliant', desc: 'End-to-end encryption, no PHI stored on public servers, full audit trail for regulatory compliance.' },
                        ].map((f, i) => (
                            <div key={i} className="group p-8 bg-white/3 hover:bg-white/6 border border-white/5 hover:border-indigo-500/20 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                                <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <f.icon size={22} className={`text-${f.color}-400`} />
                                </div>
                                <h3 className="text-lg font-black text-white mb-3">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" className="py-32 px-6 bg-[#0d0d24]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Process</p>
                        <h2 className="text-4xl font-black text-white">Three Steps to Clinical Safety</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { n: '01', title: 'Create Your Account', desc: 'Register as a medical professional. Your data stays encrypted and private.', action: 'Register Now', path: '/register' },
                            { n: '02', title: 'Upload or Type Prescription', desc: 'Drop a prescription image or manually enter drug names. AI does the rest.', action: 'Try Upload', path: '/register' },
                            { n: '03', title: 'Receive AI Safety Analysis', desc: 'Get instant interaction warnings, risk scores, and multilingual explanations.', action: 'See Dashboard', path: '/register' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-8 p-8 bg-white/3 border border-white/5 rounded-3xl hover:border-indigo-500/20 transition-all group">
                                <span className="text-5xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors flex-shrink-0">{step.n}</span>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-white mb-2">{step.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                                <button onClick={() => navigate(step.path)} className="flex-shrink-0 px-5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold rounded-xl transition-all">
                                    {step.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-32 px-6 bg-gradient-to-b from-[#0d0d24] to-[#0a0a1a]">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="p-12 bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 rounded-[3rem] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-white mb-4">Ready to Protect Your Patients?</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">Join thousands of medical professionals using MedGuard AI to prevent dangerous drug interactions every day.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={() => navigate('/register')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/30 hover:scale-105">
                                    Create Free Account
                                </button>
                                <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTACT / FOOTER ── */}
            <footer id="contact" className="bg-[#08080f] border-t border-white/5 py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                                    <Stethoscope size={18} />
                                </div>
                                <span className="text-lg font-black">MedGuard <span className="text-indigo-400">AI</span></span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Intelligent multilingual drug safety platform built for modern clinical environments.</p>
                            <div className="flex gap-4 mt-6">
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                    <Github size={18} />
                                </a>
                                <a href="mailto:support@medguard.ai" className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                    <Mail size={18} />
                                </a>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Platform</p>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Dashboard</button></li>
                                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Drug Check</button></li>
                                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">OCR Upload</button></li>
                                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Clinical Chat</button></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Contact</p>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li className="flex items-center gap-2"><Mail size={14} /><span>support@medguard.ai</span></li>
                                <li className="flex items-center gap-2"><Phone size={14} /><span>+91 98765 43210</span></li>
                                <li className="flex items-center gap-2"><MapPin size={14} /><span>Ahmedabad, Gujarat, India</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                        <p>© 2025 MedGuard AI. All rights reserved. Built for clinical excellence.</p>
                        <p>HIPAA Compliant · SSL Encrypted · GDPR Ready</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
