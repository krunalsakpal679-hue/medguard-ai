export const config = {
    apiUrl: (import.meta.env.VITE_API_URL || "https://medguard-ai-7bcu.onrender.com").endsWith("/api/v1") 
            ? (import.meta.env.VITE_API_URL || "https://medguard-ai-7bcu.onrender.com") 
            : `${import.meta.env.VITE_API_URL || "https://medguard-ai-7bcu.onrender.com"}/api/v1`,
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    isProduction: import.meta.env.VITE_ENVIRONMENT === "production",
    isDevelopment: import.meta.env.DEV,
    version: "1.0.0",
    backendUrl: import.meta.env.VITE_API_URL || "https://medguard-ai-7bcu.onrender.com"
};

if (config.isProduction && config.apiUrl && config.apiUrl.includes("localhost")) {
    console.warn("CRITICAL: Production frontend using localhost API endpoint");
}

export const { apiUrl, googleClientId, isProduction, isDevelopment, version, backendUrl } = config;
export default config;
