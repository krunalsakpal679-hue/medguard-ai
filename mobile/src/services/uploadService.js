import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import axios from 'axios'
import Constants from 'expo-constants'

const API_BASE = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1'

export const uploadService = {
    /**
     * Request permissions and capture a clinical document via primary camera.
     */
    takePhoto: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            throw new Error('Camera permission denied')
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        })

        if (!result.canceled) {
            return result.assets[0].uri
        }
        return null
    },

    /**
     * Launch internal image gallery to pick clinical prescription scan.
     */
    pickFromGallery: async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        })

        if (!result.canceled) {
            return result.assets[0].uri
        }
        return null
    },

    /**
     * Launch document picker for PDF-based clinical prescriptions.
     */
    pickDocument: async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
            copyToCacheDirectory: true,
        })

        if (!result.canceled) {
            return result.assets[0].uri
        }
        return null
    },

    /**
     * Stream binary asset to MedGuard storage for AI analysis.
     */
    uploadPrescription: async (fileUri, token) => {
        const formData = new FormData()
        
        // Prepare file name and type
        const filename = fileUri.split('/').pop()
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : `image`

        formData.append('file', {
            uri: fileUri,
            name: filename,
            type: type === 'application/pdf' ? 'application/pdf' : type,
        })

        const response = await axios.post(`${API_BASE}/upload/prescription`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        })

        return response.data
    },

    /**
     * Synchronize with background OCR pipeline status.
     */
    pollOCRStatus: async (upload_id, token) => {
        const response = await axios.get(`${API_BASE}/upload/${upload_id}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return response.data
    },

    /**
     * Directly tokenize and parse drug identities from raw clinical text.
     */
    parseText: async (text, token) => {
        const response = await axios.post(`${API_BASE}/upload/text`, { text }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return response.data
    }
}

export default uploadService
