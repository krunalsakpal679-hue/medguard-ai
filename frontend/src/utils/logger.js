const IS_DEV = process.env.NODE_ENV === 'development';
const MAX_LOGS = 100;
let errorCache = [];

/**
 * High-fidelity clinical logger for frontend telemetry.
 */
export const logger = {
    debug: (msg, data = {}) => {
        if (!IS_DEV) return;
        console.log(`🔍 [DEBUG] ${msg}`, data);
    },

    info: (msg, data = {}) => {
        if (!IS_DEV) return;
        console.log(`%cℹ️ [INFO] ${msg}`, 'color: #3b82f6; font-weight: bold;', data);
    },

    warn: (msg, data = {}) => {
        console.warn(`⚠️ [WARN] ${msg}`, data);
    },

    error: (msg, data = {}) => {
        console.error(`%c❌ [ERROR] ${msg}`, 'color: #f43f5e; font-weight: bold;', data);
        
        // Cache for diagnostic retrieval
        errorCache.push({
            msg,
            data,
            timestamp: new Date().toISOString()
        });
        
        if (errorCache.length > MAX_LOGS) errorCache.shift();
    },

    getErrorLog: () => [...errorCache],
    
    clearLog: () => {
        errorCache = [];
    }
};
