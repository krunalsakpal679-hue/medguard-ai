import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    Dimensions, 
    TouchableOpacity, 
    SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pill, Scan, Bot } from 'lucide-react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring,
    interpolateColor
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: "Check Drug Interactions Safely",
        desc: "Advanced AI-powered pharmacological audit to detect high-risk molecular interactions instantly.",
        icon: Pill,
        color: '#6366f1'
    },
    {
        id: '2',
        title: "Scan Prescriptions with AI",
        desc: "Digitize clinical documents with high-fidelity OCR and extract molecular identities automatically.",
        icon: Scan,
        color: '#14b8a6'
    },
    {
        id: '3',
        title: "Multilingual AI Assistant",
        desc: "Communicate with our clinical companion in English, Hindi, or Gujarati for rapid pharmacological insights.",
        icon: Bot,
        color: '#1e293b'
    }
];

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const flatListRef = useRef();

    const handleOnboardingComplete = async () => {
        await AsyncStorage.setItem('@onboarding_complete', 'true');
        navigation.replace('Login');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleOnboardingComplete();
        }
    };

    const Slide = ({ item }) => {
        const Icon = item.icon;
        return (
            <View style={styles.slide}>
                <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                    <Icon size={120} color={item.color} />
                </View>
                <View style={styles.textWrapper}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.desc}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity 
                style={styles.skipBtn}
                onPress={handleOnboardingComplete}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onScroll={(event) => {
                    scrollX.value = event.nativeEvent.contentOffset.x;
                }}
                onMomentumScrollEnd={(event) => {
                    setCurrentIndex(Math.floor(event.nativeEvent.contentOffset.x / width));
                }}
                renderItem={({ item }) => <Slide item={item} />}
            />

            <View style={styles.footer}>
                <View style={styles.dotRow}>
                    {SLIDES.map((_, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.dot, 
                                { backgroundColor: index === currentIndex ? '#6366f1' : '#e2e8f0', width: index === currentIndex ? 24 : 8 }
                            ]} 
                        />
                    ))}
                </View>

                <TouchableOpacity 
                    style={styles.nextBtn}
                    onPress={handleNext}
                >
                    <Text style={styles.nextText}>
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    skipBtn: { alignSelf: 'flex-end', padding: 20 },
    skipText: { fontSize: 13, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    slide: { width, height: height * 0.7, alignItems: 'center', justifyContent: 'center', padding: 40 },
    iconWrapper: { width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 60 },
    textWrapper: { alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: 20, letterSpacing: -0.5 },
    description: { fontSize: 15, fontWeight: 'bold', color: '#64748b', textAlign: 'center', lineHeight: 24 },
    footer: { padding: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dotRow: { flexDirection: 'row', gap: 6 },
    dot: { height: 8, borderRadius: 4 },
    nextBtn: { paddingHorizontal: 30, height: 60, backgroundColor: '#1e293b', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    nextText: { color: '#fff', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});

export default OnboardingScreen;
