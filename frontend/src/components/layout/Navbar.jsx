import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User, Globe, Search, Upload, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../common/NotificationBell';

/**
 * Intelligent Top Navigation Bar with dynamic scroll visibility and mobile drawer.
 */
const Navbar = () => {
    const { user, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Check Drugs', path: '/drugs', icon: <Search size={18} /> },
        { name: 'Upload', path: '/upload', icon: <Upload size={18} /> },
        { name: 'AI Chat', path: '/chat', icon: <MessageSquare size={18} /> },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: visible ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white text-xl font-bold">🏥</span>
                    </div>
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">
                        MedGuard <span className="text-indigo-600">AI</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'
                                }`
                            }
                        >
                            {link.icon}
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hidden sm:block">
                        <Globe size={20} />
                    </button>
                    
                    <NotificationBell />

                    <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                    {/* User Profile */}
                    <div className="relative group">
                        <Link to="/profile" className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User size={18} />
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button 
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[60] bg-white p-6 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-xl font-bold">Navigation</span>
                            <button onClick={() => setIsMenuOpen(false)}><X size={28} /></button>
                        </div>
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold text-slate-700 flex items-center gap-4"
                                >
                                    <div className="p-2 bg-slate-50 rounded-xl">{link.icon}</div>
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
