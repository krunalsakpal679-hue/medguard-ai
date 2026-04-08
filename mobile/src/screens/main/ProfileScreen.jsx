import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { User, Mail, Shield, Globe, Trash2, LogOut, ChevronRight, Activity, Calendar } from 'lucide-react-native';

const ProfileScreen = () => {
    const [lang, setLang] = useState('EN');
    const [biometric, setBiometric] = useState(true);

    const handleSignOut = () => {
        Alert.alert(
            "Security Protocol",
            "Are you sure you want to terminate the current clinical session?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: () => console.log("Sign Out") }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, label, value, onPress, toggle }) => (
        <TouchableOpacity 
            onPress={onPress} 
            style={styles.settingItem}
            disabled={toggle !== undefined}
        >
            <View style={styles.settingIcon}>
                <Icon size={20} color="#64748b" />
            </View>
            <Text style={styles.settingLabel}>{label}</Text>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            {toggle !== undefined ? (
                <Switch 
                    value={value} 
                    onValueChange={toggle}
                    trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                />
            ) : (
                <ChevronRight size={18} color="#cbd5e1" />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarInitial}>SW</Text>
                </View>
                <Text style={styles.name}>Dr. Sarah Wilson</Text>
                <Text style={styles.email}>s.wilson@hospital.org</Text>
                
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Activity size={20} color="#6366f1" />
                        <Text style={styles.statVal}>128</Text>
                        <Text style={styles.statLabel}>Audits</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Calendar size={20} color="#6366f1" />
                        <Text style={styles.statVal}>Oct '23</Text>
                        <Text style={styles.statLabel}>Joined</Text>
                    </View>
                </View>
            </View>

            {/* Account Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                <SettingItem icon={User} label="Personal Identity" />
                <SettingItem icon={Mail} label="Contact Calibration" />
                <SettingItem icon={Globe} label="Language Preference" value={lang} onPress={() => setLang(lang === 'EN' ? 'HI' : 'EN')} />
            </View>

            {/* Security Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security & Privacy</Text>
                <SettingItem icon={Shield} label="Biometric Unlock" value={biometric} toggle={setBiometric} />
                <SettingItem icon={Trash2} label="Clear Analytical Cache" onPress={() => Alert.alert("Cache Cleared", "The molecular local database has been refreshed.")} />
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
                <LogOut size={20} color="#f43f5e" />
                <Text style={styles.logoutText}>Terminate Clinical Session</Text>
            </TouchableOpacity>

            <Text style={styles.version}>MedGuard AI v1.0.4 (Pipeline Stable)</Text>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
    avatarInitial: { fontSize: 32, fontWeight: '900', color: '#fff' },
    name: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
    email: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', marginBottom: 30 },
    statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 24 },
    statBox: { alignItems: 'center', paddingHorizontal: 20 },
    statVal: { fontSize: 16, fontWeight: '900', color: '#1e293b', marginTop: 4 },
    statLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
    statDivider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
    section: { padding: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginLeft: 10 },
    settingItem: { backgroundColor: '#fff', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    settingIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    settingValue: { fontSize: 13, fontWeight: '900', color: '#6366f1', marginRight: 10 },
    logoutBtn: { margin: 24, padding: 20, backgroundColor: '#fff', borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: '#fee2e2' },
    logoutText: { color: '#f43f5e', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
    version: { textAlign: 'center', color: '#cbd5e1', fontSize: 11, fontWeight: 'bold', marginBottom: 10 }
});

export default ProfileScreen;
