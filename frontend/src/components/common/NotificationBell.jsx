import React, { useState } from 'react';
import { Bell, X, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

/**
 * Animated Notification Bell for the Clinical Dashboard.
 * Integrates with the WebSocket layer to show live unread alerts.
 */
const NotificationBell = () => {
    const { connected, notifications, clearNotification } = useWebSocket();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'OCR_COMPLETE': return <Info className="text-blue-500 w-4 h-4" />;
            case 'SYSTEM_ALERT': return <AlertTriangle className="text-amber-500 w-4 h-4" />;
            case 'PREDICTION_READY': return <ShieldCheck className="text-emerald-500 w-4 h-4" />;
            default: return <Bell className="text-slate-400 w-4 h-4" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-300 relative ${
                    isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
                
                {/* Connection Status Indicator */}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    connected ? 'bg-emerald-500' : 'bg-slate-300'
                }`} title={connected ? "Real-time Connected" : "Connecting..."} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Clinical Alerts</h3>
                            {unreadCount > 0 && (
                                <button className="text-[10px] text-indigo-600 font-bold hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="text-slate-300 w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-slate-500 italic">No new diagnostics in queue</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative"
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">{getIcon(notif.type)}</div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-800 font-medium leading-tight mb-1">
                                                    {notif.type === 'OCR_COMPLETE' ? 'Prescription Digitized' : 
                                                     notif.type === 'PREDICTION_READY' ? 'Analysis Finalized' : 
                                                     'System Update'}
                                                </p>
                                                <p className="text-xs text-slate-500 line-clamp-2">
                                                    {notif.data?.message || 'New clinical data is ready for review.'}
                                                </p>
                                                <span className="text-[10px] text-slate-400 mt-2 block italic">
                                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => clearNotification(notif.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                                            >
                                                <X className="w-3 h-3 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-slate-50 text-center">
                            <button className="text-xs text-slate-500 font-medium hover:text-indigo-600 transition-colors">
                                View Full Clinical History
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
