import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Custom hook for interacting with the MedGuard Report Service.
 * Orchestrates the download of clinical PDF diagnostics.
 */
export const useReportDownload = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const { token } = useAuthStore();

    const downloadPredictionReport = async (predictionId) => {
        if (!predictionId) return;
        
        const toastId = toast.loading('Synthesizing Clinical Report...');
        setIsDownloading(true);

        try {
            const response = await axios.get(
                `${API_BASE}/reports/prediction/${predictionId}`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                    responseType: 'blob', // Critical for binary PDF data
                }
            );

            // Create a local blob URL for the downloaded PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Trigger the browser download interaction
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `medguard_report_${predictionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup: remove link and revoke the blob URL to free memory
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Report Downloaded Successfully', { id: toastId });
        } catch (error) {
            console.error('Report download failure:', error);
            toast.error('Failed to generate report. Please try again.', { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    return {
        downloadPredictionReport,
        isDownloading
    };
};
