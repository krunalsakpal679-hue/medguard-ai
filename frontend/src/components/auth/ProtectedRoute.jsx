import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Loader2, ShieldAlert, Undo2 } from 'lucide-react'

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore()
    const location = useLocation()
    
    // Global Loading State during session check
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-16 h-16 text-brand animate-spin" />
                <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Clinical Session...</p>
            </div>
        )
    }
    
    // Redirect if not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    
    // Role Check: Ensure clinical personnel access
    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-fade-in">
                <div className="bg-danger/10 p-6 rounded-full mb-8 shadow-xl shadow-danger/5">
                    <ShieldAlert className="w-24 h-24 text-danger animate-bounce" />
                </div>
                
                <h1 className="text-4xl font-display font-black text-slate-900 mb-2">Access Denied</h1>
                <p className="max-w-md text-slate-500 font-medium mb-10 leading-relaxed">
                    This clinical gateway requires administrative medical privileges. 
                    Your current account ({user?.email}) does not have these permissions.
                </p>
                
                <button 
                  onClick={() => window.history.back()} 
                  className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-all hover:scale-105"
                >
                    <Undo2 className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                    Restore Previous Session
                </button>
            </div>
        )
    }
    
    return children
}

export default ProtectedRoute
