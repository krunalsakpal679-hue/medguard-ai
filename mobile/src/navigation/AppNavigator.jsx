import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, StyleSheet } from 'react-native'
import { Home, Camera, Clock, User, ShieldCheck } from 'lucide-react-native'
import { useAuthStore } from '../store/authStore'

// Screens (Dummy components for base navigation structure)
const Placeholder = ({ name }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7' }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#1A237E' }}>{name} Gateway</Text>
    </View>
)

import LoginScreen from '../screens/auth/LoginScreen'
import UploadScreen from '../screens/main/UploadScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

/**
 * Main Application Hub: Tab-driven clinical interface.
 */
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') return <Home size={size} color={color} />
                    if (route.name === 'Scan') return <Camera size={size} color={color} />
                    if (route.name === 'History') return <Clock size={size} color={color} />
                    if (route.name === 'Profile') return <User size={size} color={color} />
                },
                tabBarActiveTintColor: '#2E7D32',
                tabBarInactiveTintColor: '#9E9E9E',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                headerShown: false,
            })}
        >
            <Tab.Screen name="Dashboard" component={() => <Placeholder name="Dashboard" />} />
            <Tab.Screen 
              name="Scan" 
              component={UploadScreen} 
              options={{
                  tabBarBadge: "NEW",
                  tabBarBadgeStyle: styles.tabBadge
              }}
            />
            <Tab.Screen name="History" component={() => <Placeholder name="Interaction Logs" />} />
            <Tab.Screen name="Profile" component={() => <Placeholder name="Clinical Profile" />} />
        </Tab.Navigator>
    )
}

/**
 * Primary Stack: Handles conditional logic for Auth vs Main flow.
 */
const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore()

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
                <Stack.Screen name="Main" component={MainTabs} />
            )}
        </Stack.Navigator>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        height: 90,
        backgroundColor: '#ffffff',
        borderTopWidth: 0,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tabBadge: {
        backgroundColor: '#D32F2F',
        color: '#ffffff',
        fontSize: 8,
        fontWeight: '900',
        borderRadius: 6,
    }
})

export default AppNavigator
