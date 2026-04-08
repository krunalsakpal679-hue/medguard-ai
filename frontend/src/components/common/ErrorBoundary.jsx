import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        logger.error("COMPONENT_CRASH", { error, errorInfo });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
                    <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl shadow-slate-200/50 p-12 text-center border border-slate-100">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <AlertCircle size={40} />
                        </div>
                        
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
                            System Disturbance
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
                            A critical rendering error occurred in the clinical UI pipeline.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-10 p-6 bg-slate-900 rounded-2xl text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-rose-400 break-words">
                                    {this.state.error?.toString()}
                                </p>
                                <pre className="text-[10px] font-mono text-slate-500 mt-2">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={this.handleRetry}
                                className="h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                            >
                                <RefreshCw size={16} /> Restore Sequence
                            </button>
                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                            >
                                <Home size={16} /> Return to Safety
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
