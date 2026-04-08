/**
 * Global environment orchestration for MedGuard UI.
 * Abstracting VITE_ENV for clinical consistency.
 */
export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    isProduction: import.meta.env.VITE_ENVIRONMENT === 'production',
    isDevelopment: import.meta.env.DEV,
    version: '1.0.0',
    clinicalGateway: '/api/v1'
};

export const getApiUrl = (endpoint) => {
    const base = config.apiUrl;
    return `${base}${config.clinicalGateway}${endpoint}`;
};
