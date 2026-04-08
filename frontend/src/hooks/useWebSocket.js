import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

/**
 * Custom hook for managing a resilient WebSocket connection with auto-reconnect.
 * Orchestrates clinical real-time notifications for the dashboard.
 */
export const useWebSocket = () => {
    const { token, user } = useAuthStore();
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);

    const connect = useCallback(() => {
        if (!token) return;

        // Prevent multiple connections
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `${WS_BASE}/${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('MedGuard WebSocket: Connection established.');
            setConnected(true);
            reconnectAttemptsRef.current = 0;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleMessage(message);
        };

        ws.onclose = (event) => {
            setConnected(false);
            console.warn(`MedGuard WebSocket: Connection closed (${event.code}). Attempting reconnect...`);
            
            // Exponential backoff for reconnection
            const backoff = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current += 1;
                connect();
            }, backoff);
        };

        ws.onerror = (err) => {
            console.error('MedGuard WebSocket: Error encountered.', err);
            ws.close();
        };

        socketRef.current = ws;
    }, [token]);

    const handleMessage = (message) => {
        switch (message.type) {
            case 'connected':
                // Initial handshake confirmed
                break;

            case 'OCR_COMPLETE':
                toast.success('Clinical Image Digested: OCR Process Complete');
                addNotification(message);
                break;

            case 'PREDICTION_READY':
                toast('Diagnostic Ready: Clinical analysis pipeline finished.', {
                    icon: '🔬',
                });
                addNotification(message);
                break;

            case 'SYSTEM_ALERT':
                toast.error(`Clinical System Alert: ${message.data.message}`);
                addNotification(message);
                break;

            case 'pong':
                // Keep-alive response
                break;

            default:
                addNotification(message);
        }
    };

    const addNotification = (notif) => {
        setNotifications(prev => [
            { id: Date.now(), ...notif, read: false },
            ...prev
        ].slice(0, 50)); // Keep last 50
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        connect();
        
        // Keep-alive ping every 30 seconds
        const pingInterval = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);

        return () => {
            clearInterval(pingInterval);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) socketRef.current.close();
        };
    }, [connect]);

    return {
        connected,
        notifications,
        clearNotification
    };
};
