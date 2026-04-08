import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
let pollInterval = null

/**
 * Clinical asset upload and OCR synchronization logic.
 */
export const uploadService = {
    /**
     * Stream binary clinical document to MedGuard storage.
     */
    async uploadFile(file, token) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post(`${API_BASE}/upload/prescription`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    /**
     * Poll for AI extraction status until 'completed' or 'failed'.
     */
    pollStatus(uploadId, token, onUpdate) {
        this.cancelPoll()
        
        pollInterval = setInterval(async () => {
            try {
                const response = await axios.get(`${API_BASE}/upload/${uploadId}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                
                onUpdate(response.data)
                
                if (response.data.ocr_status === 'completed' || response.data.ocr_status === 'failed') {
                    this.cancelPoll()
                }
            } catch (err) {
                console.error("Clinical Polling Error", err)
                this.cancelPoll()
            }
        }, 2000)
    },

    /**
     * Direct clinical text parsing via NLP engine.
     */
    async parseText(text, token) {
        const response = await axios.post(`${API_BASE}/upload/text`, { text }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return response.data
    },

    /**
     * Clean up active clinical monitoring cycles.
     */
    cancelPoll() {
        if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
        }
    }
}
