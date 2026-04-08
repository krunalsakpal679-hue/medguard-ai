import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useWebSocket } from '../../hooks/useWebSocket';

/**
 * Global Application Frame.
 * Orchestrates technical background services (WebSocket, Toasters) and 
 * manages the structural layout relationship between navigation and content.
 */
const AppLayout = () => {
    // Initialize real-time synchronization on mount
    const { connected } = useWebSocket();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Global Notifications */}
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'font-semibold text-sm rounded-xl border border-slate-100 shadow-xl',
                    duration: 4000,
                }}
            />

            {/* Tactical Navigation Layers */}
            <Navbar />
            <Sidebar />

            {/* Main Engagement Area */}
            <main className="pt-16 lg:pl-64 transition-all duration-300">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)] relative">
                    {/* Subtle Molecular Aesthetic Layer (CSS-implemented fallback) */}
                    <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden -z-10">
                        <div className="absolute top-20 right-[10%] w-72 h-72 bg-indigo-200/30 rounded-full blur-[120px]" />
                        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-emerald-100/20 rounded-full blur-[150px]" />
                    </div>

                    {/* Dynamic View Port */}
                    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Outlet />
                    </div>
                </div>

                {/* Footer / Status Bar Wrapper */}
                <footer className="px-8 py-6 text-center">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        MedGuard AI Clinical Engine v1.0.0 | System Status: 
                        <span className={connected ? "text-emerald-500 ml-1" : "text-amber-500 ml-1"}>
                            {connected ? "SYNCED" : "RECONNECTING"}
                        </span>
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default AppLayout;
