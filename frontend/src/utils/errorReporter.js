import { logger } from './logger';

const API_MESSAGES = {
    400: "Invalid request. Please check your analytical input.",
    401: "Clinical session expired. Please re-authenticate.",
    403: "Administrative clearance required.",
    404: "The requested clinical resource was not found.",
    422: "Unprocessable molecular data format.",
    429: "High pipeline traffic. Please wait for sync.",
    500: "Server disturbance. Clinical engineering notified."
};

export const reportApiError = (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    logger.error("API_FAILURE", { status, message, url: error.config?.url });

    return {
        userMessage: API_MESSAGES[status] || "A synchronization disturbance occurred.",
        shouldLogout: status === 401,
        shouldRetry: status >= 500,
        status: status
    };
};

export const reportError = (error, context = {}) => {
    const payload = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        route: window.location.pathname,
        ...context
    };

    if (process.env.NODE_ENV === 'development') {
        logger.error("SYSTEM_EXCEPTION", payload);
    } else {
        // Future: POST to /api/v1/logs/client-error
        logger.error("PROD_EXCEPTION_LOGGED", payload);
    }
};

export const setupGlobalErrorHandlers = () => {
    window.onerror = (message, source, lineno, colno, error) => {
        reportError(error || { message }, { source, lineno, colno });
    };

    window.addEventListener('unhandledrejection', (event) => {
        reportError(new Error(event.reason), { type: 'Promise Rejection' });
    });
};
