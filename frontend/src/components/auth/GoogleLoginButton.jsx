import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Loader2 } from 'lucide-react'

const GoogleLoginButton = () => {
    const googleButtonRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const { loginWithGoogle, error, clearError } = useAuthStore()
    
    useEffect(() => {
        // Dynamically load Google GSI client library
        const script = document.createElement('script')
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.onload = () => {
            // Initializing Google Identity Service
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            })
            
            // Rendering Official Google Auth Button with custom configuration
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'outline',
                size: 'large',
                shape: 'pill',
                logo_alignment: 'left',
                width: 320
            })
        }
        document.body.appendChild(script)
        
        return () => {
             // Cleanup if needed (optional)
        }
    }, [])
    
    /**
     * Handles the callback from Google with the OneTap/Login credential.
     */
    const handleCredentialResponse = async (response) => {
        setLoading(true)
        clearError()
        try {
            await loginWithGoogle(response.credential)
        } catch (err) {
            console.error("Google login error", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 rounded-full animate-fade-in shadow-inner border border-slate-100">
                        <Loader2 className="w-5 h-5 text-brand animate-spin" />
                        <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Validating...</span>
                    </div>
                )}
                <div ref={googleButtonRef} className="z-10 shadow-lg shadow-slate-200/50 rounded-full group hover:shadow-xl transition-all"></div>
            </div>
            
            {/* Visual Error Feedback */}
            {error && (
                <div className="px-4 py-2 bg-danger-light border border-danger/20 rounded-xl animate-slide-up">
                    <p className="text-danger text-xs font-bold uppercase tracking-tight">{error}</p>
                </div>
            )}
        </div>
    )
}

export default GoogleLoginButton
