import * as Linking from 'expo-linking';

/**
 * High-fidelity deep linking configuration for clinical navigation.
 */
export const linkingConfig = {
    prefixes: [Linking.createURL('/'), 'medguard://'],
    config: {
        screens: {
            Main: {
                screens: {
                    Result: {
                        path: 'prediction/:predictionId',
                        parse: {
                            predictionId: (id) => `${id}`,
                        },
                    },
                    DrugDetail: {
                        path: 'drug/:drugId',
                        parse: {
                            drugId: (id) => `${id}`,
                        },
                    },
                    Chat: 'chat',
                },
            },
        },
    },
};

export const handleInitialLink = async (navigation) => {
    const url = await Linking.getInitialURL();
    if (url) {
        const { path, queryParams } = Linking.parse(url);
        console.log(`COLD_START_DEEP_LINK: ${path}`, queryParams);
        // Navigation typically handled by React Navigation container via linking prop
    }
};

export const createInternalLink = (screen, params = {}) => {
    return Linking.createURL(screen, { queryParams: params });
};
