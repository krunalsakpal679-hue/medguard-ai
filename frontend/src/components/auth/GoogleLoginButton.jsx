import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

/**
 * Google Identity Services button.
 * Works on both Login and Register pages.
 * Shows toast notifications on success and failure.
 */
const GoogleLoginButton = () => {
    const googleButtonRef = useRef(null)
    const [loading, setLoading]   = useState(false)
    const [toast, setToast]       = useState(null) // { type: 'success'|'error', msg: string }
    const { loginWithGoogle, error, clearError } = useAuthStore()
    const navigate = useNavigate()

    const showToast = (type, msg) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3500)
    }

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId) {
            console.warn('VITE_GOOGLE_CLIENT_ID not set')
            return
        }

        const initGoogle = () => {
            if (!window.google || !googleButtonRef.current) return
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
            })
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'outline',
                size: 'large',
                shape: 'rectangular',
                logo_alignment: 'center',
                width: googleButtonRef.current?.offsetWidth || 400,
                text: 'continue_with',
            })
        }

        // If script already loaded
        if (window.google) { initGoogle(); return }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = initGoogle
        document.body.appendChild(script)
    }, [])

    const handleCredentialResponse = async (response) => {
        setLoading(true)
        clearError()
        try {
            await loginWithGoogle(response.credential)
            showToast('success', '✓ Signed in with Google! Redirecting...')
            setTimeout(() => navigate('/dashboard'), 1200)
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Google sign-in failed. Please try again.'
            showToast('error', msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative w-full">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-white transition-all ${
                    toast.type === 'success' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-red-600 shadow-red-500/30'
                }`}>
                    {toast.type === 'success'
                        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        : <XCircle className="w-5 h-5 flex-shrink-0" />
                    }
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Google Button Container */}
            <div className="relative w-full">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 rounded-lg border border-slate-100">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        <span className="ml-2 text-xs font-bold text-slate-600 uppercase tracking-widest">Verifying with Google...</span>
                    </div>
                )}
                <div
                    ref={googleButtonRef}
                    className="w-full flex justify-center"
                    style={{ minHeight: '44px' }}
                />
            </div>

            {/* Auth Store Error */}
            {error && !loading && (
                <div className="mt-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">
                    {error}
                </div>
            )}
        </div>
    )
}

export default GoogleLoginButton
