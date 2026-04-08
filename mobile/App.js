import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'

import AppNavigator from './src/navigation/AppNavigator'
import { useAuthStore } from './src/store/authStore'
import './src/i18n/config' // Initialize internationalization

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function App() {
    const { loadStoredAuth, isLoading } = useAuthStore()
    
    // Modern Typography loading
    const [fontsLoaded] = useFonts({
        'Inter-Regular': Inter_400Regular,
        'Inter-Bold': Inter_700Bold,
        'Inter-Black': Inter_900Black,
    })

    useEffect(() => {
        const prepareApp = async () => {
            // Restore clinical session from SecureStore
            await loadStoredAuth()
            
            if (fontsLoaded) {
                // All resources ready, hide splash
                await SplashScreen.hideAsync()
            }
        }
        prepareApp()
    }, [fontsLoaded])

    // Wait for fonts and auth initialization before rendering
    if (!fontsLoaded || isLoading) {
        return null 
    }

    return (
        <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" translucent />
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
})
