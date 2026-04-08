import React, { useEffect, useState } from 'react'
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    ActivityIndicator, 
    SafeAreaView, 
    KeyboardAvoidingView, 
    Platform,
    Image
} from 'react-native'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, LogIn } from 'lucide-react-native'

// Ensure browser session can complete correctly
WebBrowser.maybeCompleteAuthSession()

const LoginScreen = () => {
    const { t } = useTranslation()
    const { login, error, setError, clearError } = useAuthStore()
    const [loading, setLoading] = useState(false)

    // Configuration for Google Identity Services OIDC
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: 'your-android-client-id.apps.googleusercontent.com',
        iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
        webClientId: 'your-web-client-id.apps.googleusercontent.com',
    })

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params
            handleGoogleSignIn(id_token)
        } else if (response?.type === 'error') {
            setError(t('auth_error_generic'))
        }
    }, [response])

    const handleGoogleSignIn = async (idToken) => {
        setLoading(true)
        clearError()
        try {
            const result = await authService.googleSignIn(idToken)
            await login(result.access_token, result.user)
        } catch (err) {
            console.error("Login failure", err)
            setError(t('auth_error_google'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gradientOverlay}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    {/* Brand Identity Section */}
                    <View style={styles.logoSlot}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.emojiLogo}>🏥</Text>
                            <View style={styles.shieldIcon}>
                                <ShieldCheck size={40} color="#2E7D32" />
                            </View>
                        </View>
                        <Text style={styles.appName}>{t('app_name')}</Text>
                        <Text style={styles.tagline}>{t('tagline')}</Text>
                    </View>

                    {/* Authentication Actions */}
                    <View style={styles.actionSlot}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
                        ) : (
                            <TouchableOpacity 
                                style={styles.googleButton} 
                                onPress={() => promptAsync()}
                                disabled={!request}
                            >
                                <LogIn size={20} color="#2E7D32" />
                                <Text style={styles.googleButtonText}>{t('login_with_google')}</Text>
                            </TouchableOpacity>
                        )}

                        {error && <Text style={styles.errorText}>{error}</Text>}
                        
                        <Text style={styles.disclaimer}>
                            {t('auth_disclaimer')}
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A237E', // Background Fallback
    },
    gradientOverlay: {
        flex: 1,
        backgroundColor: 'rgba(21, 101, 192, 0.85)', // Medical Blue tint
    },
    inner: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoSlot: {
        alignItems: 'center',
    },
    logoContainer: {
        width: 140,
        height: 140,
        backgroundColor: '#ffffff',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16.00,
        elevation: 24,
    },
    emojiLogo: {
        fontSize: 64,
    },
    shieldIcon: {
        position: 'absolute',
        bottom: -15,
        right: -15,
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#ffffff',
    },
    appName: {
        fontSize: 36,
        fontWeight: '900',
        color: '#ffffff',
        marginTop: 24,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 14,
        color: '#E3F2FD',
        marginTop: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    actionSlot: {
        width: '100%',
        alignItems: 'center',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        width: '100%',
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    googleButtonText: {
        color: '#2E7D32',
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 12,
    },
    loader: {
        marginVertical: 12,
    },
    errorText: {
        color: '#FFCDD2',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 15,
        textAlign: 'center',
    },
    disclaimer: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 30,
        lineHeight: 18,
    }
})

export default LoginScreen
