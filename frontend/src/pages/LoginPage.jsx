import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { googleClientId } from '../utils/environment';

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginWithGoogle, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');

        const initializeGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCallback
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleBtn"),
                    { theme: "filled_blue", size: "large", width: "300" }
                );
            }
        };

        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);
        
        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
    }, [isAuthenticated]);

    const handleGoogleCallback = async (response) => {
        const success = await loginWithGoogle(response.credential);
        if (success) {
            toast.success("Identity Synchronized");
            navigate('/dashboard');
        } else {
            toast.error("Cloud Authentication Failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Animated Particles */}
            <div className="absolute inset-0 z-0">
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-indigo-500/10 rounded-full blur-xl animate-pulse"
                        style={{
                            width: Math.random() * 200 + 50,
                            height: Math.random() * 200 + 50,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 10 + 5}s`
                        }}
                    />
                ))}
            </div>

            {/* Login Card */}
            <div className="z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl mx-4">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/20">
                        <span className="text-4xl text-white">🏥</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">MedGuard AI</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Pharmacological Intelligence Engine</p>
                </div>

                <div className="space-y-6 mb-10">
                    {[
                        { icon: "💊", text: "Multi-Drug Interaction Analysis" },
                        { icon: "🔬", text: "Molecular Prediction Scopes" },
                        { icon: "🤖", text: "Clinical AI Chat Assistance" }
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-4 text-slate-300">
                            <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">{feat.icon}</span>
                            <span className="text-sm font-semibold">{feat.text}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div id="googleBtn" className="w-full flex justify-center min-h-[40px]" />
                    
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                        {['EN', 'हिंदी', 'ગુજ'].map(lang => (
                            <button key={lang} className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-white transition-colors">{lang}</button>
                        ))}
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium text-center">
                        Secure connection via Google Cloud. Accessing this node implies agreement with our clinical privacy protocols.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
