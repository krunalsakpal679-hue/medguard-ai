import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { History, Calendar, FlaskConical, ChevronRight, Filter, Search } from 'lucide-react-native';

const HistoryScreen = ({ navigation }) => {
    const [filter, setFilter] = useState('ALL');

    const historyData = [
        { id: '1', date: '21 Oct, 2023', drugs: ['Metformin', 'Aspirin'], risk: 'MODERATE', color: '#fb923c' },
        { id: '2', date: '19 Oct, 2023', drugs: ['Warfarin', 'Ibuprofen'], risk: 'MAJOR', color: '#f43f5e' },
        { id: '3', date: '15 Oct, 2023', drugs: ['Amoxicillin', 'Water'], risk: 'SAFE', color: '#10b981' },
    ];

    const FilterBtn = ({ label }) => (
        <TouchableOpacity 
            onPress={() => setFilter(label)}
            style={[styles.filterBtn, filter === label && styles.filterBtnActive]}
        >
            <Text style={[styles.filterText, filter === label && styles.filterTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Result', { predictionId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.dateBox}>
                    <Calendar size={14} color="#94a3b8" />
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${item.color}15` }]}>
                    <Text style={[styles.badgeText, { color: item.color }]}>{item.risk}</Text>
                </View>
            </View>

            <View style={styles.drugSection}>
                <View style={styles.drugIcon}>
                    <FlaskConical size={18} color="#6366f1" />
                </View>
                <Text style={styles.drugList} numberOfLines={1}>
                    {item.drugs.join(', ')}
                </Text>
                <ChevronRight size={20} color="#cbd5e1" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Clinical History</Text>
                <View style={styles.searchBar}>
                    <Search size={18} color="#94a3b8" />
                    <Text style={styles.searchPlaceholder}>Search previous audits...</Text>
                </View>
            </View>

            <View style={styles.filterRow}>
                <FilterBtn label="ALL" />
                <FilterBtn label="DANGER" />
                <FilterBtn label="WARNING" />
                <FilterBtn label="SAFE" />
            </View>

            <FlatList
                data={historyData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <History size={64} color="#e2e8f0" />
                        <Text style={styles.emptyTitle}>No History Found</Text>
                        <Text style={styles.emptySub}>Your pharmacological audits will appear here.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
    searchBar: { height: 50, backgroundColor: '#f1f5f9', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
    searchPlaceholder: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' },
    filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingVertical: 15 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9' },
    filterBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    filterText: { fontSize: 11, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },
    filterTextActive: { color: '#fff' },
    list: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dateBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '900' },
    drugSection: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    drugIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
    drugList: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1e293b' },
    empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#94a3b8', fontWeight: 'bold', marginTop: 8, textAlign: 'center', width: '70%', lineHeight: 20 }
});

export default HistoryScreen;
