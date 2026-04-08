import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6366f1',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return null;
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
        })).data;
        
        // Sync with Clinical Backend
        try {
            await axios.post('/api/v1/users/push-token', {
                token: token,
                platform: Platform.OS
            });
        } catch (e) {
            console.error("TOKEN_SYNC_FAILURE", e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

export const setupNotificationHandlers = (navigation) => {
    // Background Response Handler
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        const { data } = response.notification.request.content;
        
        if (data.type === 'PREDICTION_READY' && data.predictionId) {
            navigation.navigate('Result', { predictionId: data.predictionId });
        } else if (data.type === 'CHAT_MESSAGE') {
            navigation.navigate('Chat');
        }
    });

    return () => {
        Notifications.removeNotificationSubscription(responseListener);
    };
};

export const scheduleLocalNotification = async (title, body, data = {}, seconds = 1) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: 'default'
        },
        trigger: { seconds },
    });
};
