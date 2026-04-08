import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Animated, 
    RefreshControl,
    Dimensions
} from 'react-native';
import { Camera, FlaskConical, MessageSquare, History, Activity, ShieldCheck, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SAFETY_TIPS = [
    "Always check for interactions between OTC drugs and prescriptions.",
    "Grapefruit juice can interfere with many medications.",
    "Do not crush or chew sustained-release tablets.",
    "Store medicines in a cool, dry place away from sunlight.",
    "Complete the full course of antibiotics as prescribed.",
    "Avoid alcohol when taking pain medications or antihistamines.",
    "Keep an updated list of all medications in your wallet.",
    "Take medication at the same time every day for maximum efficacy.",
    "Double-check pediatric doses using an oral syringe.",
    "Dispose of expired medications at a local pharmacy."
];

const HomeScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [120, 80],
        extrapolate: 'clamp'
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [1, 0.95],
        extrapolate: 'clamp'
    });

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    const tipIndex = new Date().getDate() % 10;

    const QuickAction = ({ icon: Icon, title, route, color }) => (
        <TouchableOpacity 
            style={[styles.actionCard, { shadowColor: color }]}
            onPress={() => navigation.navigate(route)}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Icon size={28} color={color} />
            </View>
            <Text style={styles.actionTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>Dr. Sarah Wilson</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <View style={styles.avatarPlaceholder} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Daily Tip */}
                <View style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                        <ShieldCheck size={20} color="#059669" />
                        <Text style={styles.tipBadge}>Daily Safety Insight</Text>
                    </View>
                    <Text style={styles.tipText}>{SAFETY_TIPS[tipIndex]}</Text>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.grid}>
                    <QuickAction icon={Camera} title="Scan Rx" route="Upload" color="#6366f1" />
                    <QuickAction icon={FlaskConical} title="Check Drugs" route="Interaction" color="#ec4899" />
                    <QuickAction icon={MessageSquare} title="Ask AI" route="Chat" color="#14b8a6" />
                    <QuickAction icon={History} title="History" route="History" color="#f59e0b" />
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Audits</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('History')}>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {[1, 2, 3].map((_, i) => (
                        <TouchableOpacity key={i} style={styles.activityCard}>
                            <View style={styles.activityInfo}>
                                <Text style={styles.drugNames}>Metformin, Glipizide</Text>
                                <Text style={styles.timeAgo}>3 hours ago</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: '#ecfdf5' }]}>
                                <Text style={[styles.statusText, { color: '#059669' }]}>SAFE</Text>
                                <ChevronRight size={16} color="#059669" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 40,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    welcomeText: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    userName: { fontSize: 22, color: '#0f172a', fontWeight: '900', letterSpacing: -0.5 },
    profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', padding: 2 },
    avatarPlaceholder: { flex: 1, borderRadius: 20, backgroundColor: '#cbd5e1' },
    scrollContent: { padding: 20, paddingTop: 10 },
    tipCard: {
        backgroundColor: '#ecfdf5',
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d1fae5'
    },
    tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    tipBadge: { fontSize: 10, fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8 },
    tipText: { fontSize: 14, color: '#064e3b', fontWeight: 'bold', lineHeight: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between', marginBottom: 30 },
    actionCard: {
        width: (width - 55) / 2,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 28,
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15
    },
    iconContainer: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    actionTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    section: { marginTop: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, color: '#0f172a', fontWeight: '900' },
    viewAll: { color: '#6366f1', fontSize: 13, fontWeight: '800' },
    activityCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    activityInfo: { flex: 1 },
    drugNames: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
    timeAgo: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '900', marginRight: 4 }
});

export default HomeScreen;
