import React, { useState, useRef, useEffect } from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Animated,
    TextInput,
    Alert,
    Dimensions
} from 'react-native'
import { Camera, FileText, Image as ImageIcon, Send, ScanText, Trash2 } from 'lucide-react-native'
import { uploadService } from '../../services/uploadService'
import { useAuthStore } from '../../store/authStore'
import DrugPillSelector from '../../components/DrugPillSelector'
import { useTranslation } from 'react-i18next'

const { width } = Dimensions.get('window')

const UploadScreen = ({ navigation }) => {
    const { t } = useTranslation()
    const { token } = useAuthStore()
    
    // State - Imaging
    const [imageUri, setImageUri] = useState(null)
    const [uploadProgress] = useState(new Animated.Value(0))
    const [isUploading, setIsUploading] = useState(false)
    
    // State - OCR Analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [extractedDrugs, setExtractedDrugs] = useState([])
    const [selectedDrugNames, setSelectedDrugNames] = useState([])
    
    // State - Manual Entry
    const [manualText, setManualText] = useState('')

    /**
     * Resets the clinical scanning session.
     */
    const clearSession = () => {
        setImageUri(null)
        setExtractedDrugs([])
        setManualText('')
        uploadProgress.setValue(0)
    }

    /**
     * Visual animation for upload simulation/progress.
     */
    const animateUpload = () => {
        uploadProgress.setValue(0)
        Animated.timing(uploadProgress, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false
        }).start()
    }

    const handleTakePhoto = async () => {
        const uri = await uploadService.takePhoto()
        if (uri) setImageUri(uri)
    }

    const handlePickGallery = async () => {
        const uri = await uploadService.pickFromGallery()
        if (uri) setImageUri(uri)
    }

    /**
     * Production execution: Uploads binary file and polls for AI extraction completion.
     */
    const handleExtract = async () => {
        if (!imageUri) return
        
        setIsUploading(true)
        animateUpload()
        
        try {
            const uploadResult = await uploadService.uploadPrescription(imageUri, token)
            
            setIsUploading(false)
            setIsAnalyzing(true)
            
            // Start Polling for OCR Status
            const pollInterval = setInterval(async () => {
                try {
                    const status = await uploadService.pollOCRStatus(uploadResult.upload_id, token)
                    if (status.ocr_status === 'completed') {
                        clearInterval(pollInterval)
                        // Transform extracted drugs into expected format for the pill selector
                        const formatted = status.extracted_drugs.map(name => ({
                            name,
                            confidence: status.confidence_scores[name] || 0.9
                        }))
                        setExtractedDrugs(formatted)
                        setIsAnalyzing(false)
                        Alert.alert("Success", "Drugs extracted successfully.")
                    } else if (status.ocr_status === 'failed') {
                        clearInterval(pollInterval)
                        setIsAnalyzing(false)
                        Alert.alert("Error", "OCR extraction failed.")
                    }
                } catch (e) {
                    clearInterval(pollInterval)
                    setIsAnalyzing(false)
                    console.error("Polling error", e)
                }
            }, 2000)

        } catch (err) {
            setIsUploading(false)
            Alert.alert("Upload Failed", "Could not connect to medical gateway.")
        }
    }

    const handleManualParse = async () => {
        if (!manualText) return
        setIsAnalyzing(true)
        try {
            const result = await uploadService.parseText(manualText, token)
            const formatted = result.extracted_drugs.map(name => ({
                name,
                confidence: result.confidence
            }))
            setExtractedDrugs(formatted)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const startInteractionCheck = () => {
        if (selectedDrugNames.length === 0) {
            Alert.alert("Selection Required", "Please select at least one medication to check.")
            return
        }
        navigation.navigate('Result', { drugs: selectedDrugNames })
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Scan Prescription</Text>
                {imageUri && (
                    <TouchableOpacity onPress={clearSession}>
                        <Trash2 size={24} color="#D32F2F" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Imaging Options */}
            {!imageUri ? (
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={[styles.card, styles.cameraCard]} onPress={handleTakePhoto}>
                        <View style={styles.iconCircle}>
                            <Camera size={28} color="#2E7D32" />
                        </View>
                        <Text style={styles.cardTitle}>Take Photo</Text>
                        <Text style={styles.cardSub}>Scan physical paper</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.card, styles.galleryCard]} onPress={handlePickGallery}>
                        <View style={styles.iconCircle}>
                            <ImageIcon size={28} color="#1A237E" />
                        </View>
                        <Text style={styles.cardTitle}>Upload Image</Text>
                        <Text style={styles.cardSub}>Choose from library</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    
                    {isUploading && (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>Uploading Evidence...</Text>
                            <View style={styles.progressBarBg}>
                                <Animated.View style={[styles.progressBarFill, {
                                    width: uploadProgress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }]} />
                            </View>
                        </View>
                    )}

                    {!isUploading && !isAnalyzing && extractedDrugs.length === 0 && (
                        <TouchableOpacity style={styles.extractButton} onPress={handleExtract}>
                            <ScanText size={20} color="#ffffff" />
                            <Text style={styles.extractButtonText}>Analyze Clinical Text</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Analysis State */}
            {isAnalyzing && (
                <View style={styles.analyzingBox}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.analyzingText}>AI is extracting medication identifiers...</Text>
                </View>
            )}

            {/* Extraction Results */}
            {extractedDrugs.length > 0 && (
                <View style={styles.resultBox}>
                    <DrugPillSelector 
                        drugs={extractedDrugs} 
                        onSelectionChange={setSelectedDrugNames}
                    />
                    
                    <TouchableOpacity 
                        style={[styles.checkButton, { opacity: selectedDrugNames.length > 0 ? 1 : 0.6 }]} 
                        onPress={startInteractionCheck}
                    >
                        <Send size={20} color="#ffffff" />
                        <Text style={styles.checkButtonText}>Check Selected ({selectedDrugNames.length})</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Manual Entry Fallback */}
            {!imageUri && (
                <View style={styles.manualEntry}>
                    <Text style={styles.sectionTitle}>Manual Interpretation</Text>
                    <TextInput 
                        style={styles.textInput}
                        placeholder="Type medication names here (e.g. Aspirin, Lincocin)..."
                        placeholderTextColor="#90A4AE"
                        multiline
                        value={manualText}
                        onChangeText={setManualText}
                    />
                    <TouchableOpacity style={styles.parseButton} onPress={handleManualParse}>
                        <Text style={styles.parseBtnText}>Parse Names</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            <View style={{ height: 100 }} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A237E',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    card: {
        width: (width - 60) / 2,
        padding: 20,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    cameraCard: {
        backgroundColor: '#E8F5E9',
    },
    galleryCard: {
        backgroundColor: '#E8EAF6',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#37474F',
    },
    cardSub: {
        fontSize: 10,
        color: '#78909C',
        marginTop: 5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    previewContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 30,
        padding: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        marginBottom: 20,
    },
    extractButton: {
        flexDirection: 'row',
        backgroundColor: '#2E7D32',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    extractButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900',
        marginLeft: 10,
    },
    progressContainer: {
        width: '100%',
    },
    progressText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1A237E',
        marginBottom: 8,
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: '#E8EAF6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2E7D32',
    },
    analyzingBox: {
        alignItems: 'center',
        marginVertical: 30,
    },
    analyzingText: {
        marginTop: 15,
        fontSize: 14,
        color: '#455A64',
        fontWeight: 'bold',
    },
    resultBox: {
        marginTop: 20,
    },
    checkButton: {
        flexDirection: 'row',
        backgroundColor: '#1A237E',
        paddingVertical: 20,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    checkButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 10,
    },
    manualEntry: {
        marginTop: 40,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#78909C',
        textTransform: 'uppercase',
        marginBottom: 15,
    },
    textInput: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        minHeight: 120,
        fontSize: 16,
        color: '#37474F',
        borderWidth: 1,
        borderColor: '#E8EAF6',
    },
    parseButton: {
        alignSelf: 'flex-end',
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    parseBtnText: {
        color: '#2E7D32',
        fontWeight: 'bold',
    }
})

export default UploadScreen
