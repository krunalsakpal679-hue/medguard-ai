import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

/**
 * High-priority OTA update synchronization for the MedGuard mobile node.
 * Ensures the pharmacological logic is always current.
 */
export const checkForUpdates = async () => {
    if (__DEV__) return; // Disable for development synchronization

    try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
            Alert.alert(
                "Clinical Update Ready",
                "A newer version of the analytical pipeline is available. Synchronize now?",
                [
                    { text: "Later", style: "cancel" },
                    { 
                        text: "Sync Now", 
                        onPress: async () => {
                            await Updates.fetchUpdateAsync();
                            await Updates.reloadAsync();
                        }
                    }
                ]
            );
        }
    } catch (error) {
        console.error("OTA_SYNC_FAILURE", error);
    }
};
