import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    Download, 
    Share2, 
    FileText,
    ArrowLeft,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { useReportDownload } from '../hooks/useReportDownload';

/**
 * High-fidelity Interaction Results View.
 * Displays calculated risk scores, molecular synergism, and clinical recommendations.
 */
const ResultsPage = () => {
    const { predictionId } = useParams();
    const { downloadReport, isDownloading } = useReportDownload();

    // Mock clinical data (In production, fetch from /api/v1/predictions/{predictionId})
    const result = {
        severity: 'Critical',
        risk_score: 88,
        synergy_score: 0.12,
        drug_a: 'Sertraline',
        drug_b: 'Tramadol',
        mechanism: 'Serotonin Syndrome risk due to combined serotonergic activity. Both drugs inhibit serotonin reuptake, leading to potentially fatal levels of synaptic serotonin.',
        recommendation: 'Immediate intervention required. Do not co-administer. Seek alternative analgesic for patient on SSRI therapy.'
    };

    const getSeverityColor = (sev) => {
        switch(sev) {
            case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Major': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-amber-600 bg-amber-50 border-amber-100';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/predict" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-2">
                        <ArrowLeft size={16} />
                        Back to Predictor
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Analysis Report</h1>
                    <p className="text-slate-500 font-medium">Ref ID: <span className="font-mono">{predictionId}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all">
                        <Share2 size={18} />
                        Share Results
                    </button>
                    <button 
                        onClick={() => downloadReport(predictionId)}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                        <Download size={18} />
                        {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Risk Gauge */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-effect rounded-3xl p-8 relative overflow-hidden"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 ${getSeverityColor(result.severity)}`}>
                        <AlertTriangle size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{result.severity} Interaction Detected</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 mb-2">{result.risk_score}%</h2>
                            <p className="text-lg font-bold text-slate-600 mb-6">Interaction Risk Index</p>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.risk_score}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="bg-rose-500 h-full"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TrendingUp size={16} className="text-emerald-500" />
                                Synergism Score
                            </h3>
                            <p className="text-3xl font-black text-emerald-600">{result.synergy_score}</p>
                            <p className="text-xs text-slate-400 mt-2 font-medium italic">Calculated molecular efficacy increase based on GNN analysis.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Patient Integrity</h3>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="font-black text-slate-800 tracking-tight">Verified Protocol</p>
                                <p className="text-xs text-slate-500">ID: CLINIC-09-AX</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Molecules Analyzed</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-600">{result.drug_a}</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">REUPTAKE INHIBITOR</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-600">{result.drug_b}</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">OPIOID AGONIST</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* In-depth Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="flex items-center gap-2 text-xl font-black text-slate-800 mb-6">
                        <Info className="text-indigo-500" />
                        Clinical Mechanism
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium mb-6">
                        {result.mechanism}
                    </p>
                    <div className="flex gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <FileText className="text-indigo-600 shrink-0" />
                        <p className="text-[11px] text-indigo-700 font-bold leading-normal">
                            This analysis uses the MedGuard R-GCN v2.1 algorithm with 94.2% historical accuracy for serotonergic combinations.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200">
                    <h3 className="flex items-center gap-2 text-xl font-black text-white mb-6">
                        <CheckCircle2 className="text-emerald-400" />
                        Resolution Strategy
                    </h3>
                    <p className="text-slate-300 leading-relaxed font-semibold mb-8">
                        {result.recommendation}
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 text-white">
                            <span className="text-xs font-bold">Alternative Analyzed</span>
                            <span className="text-xs font-black text-emerald-400">Celecoxib (+8.2% safety)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
