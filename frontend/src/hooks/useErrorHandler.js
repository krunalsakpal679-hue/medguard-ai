import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { reportApiError } from '../utils/errorReporter';

/**
 * Custom hook for resilient clinical async orchestration.
 */
export const useErrorHandler = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleError = useCallback(async (asyncFn) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await asyncFn();
            return result;
        } catch (err) {
            const clinicalError = reportApiError(err);
            
            setError(clinicalError);
            toast.error(clinicalError.userMessage, {
                id: 'clinical-toast-error',
                duration: 4000
            });

            if (clinicalError.shouldLogout) {
                // Future: perform logout logic
            }
            
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = () => setError(null);

    return {
        isLoading,
        error,
        handleError,
        clearError
    };
};
