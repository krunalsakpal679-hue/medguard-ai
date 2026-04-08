import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { ShieldAlert, Info, ChevronDown, ChevronUp, Share2, Bookmark, Pill, Activity } from 'lucide-react-native';

const ResultScreen = ({ route }) => {
    // Mock data if route params are empty
    const results = {
        risk: 'MAJOR',
        score: 0.82,
        drugs: ['Warfarin', 'Aspirin'],
        pairs: [
            { a: 'Warfarin', b: 'Aspirin', severity: 'MAJOR', mechanism: "Aspirin affects platelet aggregation and can also cause gastric mucosal damage, which can increase the risk of bleeding in patients receiving anticoagulants.", notes: "Avoid concurrent use." }
        ],
        alternatives: ['Acetaminophen', 'Clopidogrel (Requires consult)'],
        recommendations: [
            "Monitor prothrombin time (INR) extremely closely.",
            "Watch for signs of internal bleeding (bruising, dark stools).",
            "Consider switching Aspirin to a non-NSAID analgesic if possible."
        ]
    };

    const [expandedPair, setExpandedPair] = useState(null);

    const onShare = async () => {
        try {
            await Share.share({
                message: `MedGuard AI Interaction Report: ${results.risk} Risk found for ${results.drugs.join(' + ')}.`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.topBanner, { backgroundColor: '#be123c' }]}>
                <ShieldAlert color="#fff" size={40} />
                <Text style={styles.riskTitle}>{results.risk} INTERACTION DETECTED</Text>
                <Text style={styles.riskSub}>Potential clinical risk identified for this sequence</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Drugs Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {results.drugs.map((d, i) => (
                        <View key={i} style={styles.drugChip}>
                            <Pill size={14} color="#6366f1" />
                            <Text style={styles.chipText}>{d}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Score Section */}
                <View style={styles.scoreRow}>
                    <View style={styles.scoreCircle}>
                        <Activity size={24} color="#be123c" />
                        <Text style={styles.scoreVal}>{(results.score * 100).toFixed(0)}%</Text>
                        <Text style={styles.scoreLabel}>Potency</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.infoTitle}>Synergism Analysis</Text>
                        <Text style={styles.infoText}>The AI model predicts a high biological synergism between these molecules.</Text>
                    </View>
                </View>

                {/* Pairs Accordion */}
                <Text style={styles.sectionHeader}>Interaction Trace</Text>
                {results.pairs.map((pair, i) => (
                    <TouchableOpacity 
                        key={i} 
                        style={styles.pairCard}
                        onPress={() => setExpandedPair(expandedPair === i ? null : i)}
                    >
                        <View style={styles.pairHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pairNames}>{pair.a} + {pair.b}</Text>
                                <View style={[styles.sevBadge, { backgroundColor: '#fff1f2' }]}>
                                    <Text style={styles.sevText}>MAJOR SEVERITY</Text>
                                </View>
                            </View>
                            {expandedPair === i ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                        </View>
                        
                        {expandedPair === i && (
                            <View style={styles.expandedContent}>
                                <Text style={styles.mechHeader}>Mechanism of Action</Text>
                                <Text style={styles.mechText}>{pair.mechanism}</Text>
                                <View style={styles.notesBox}>
                                    <Info size={16} color="#0f172a" />
                                    <Text style={styles.notesText}>{pair.notes}</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Recommendations */}
                <View style={styles.recSection}>
                    <Text style={styles.sectionHeader}>Clinical Recommendations</Text>
                    {results.recommendations.map((rec, i) => (
                        <View key={i} style={styles.recItem}>
                            <View style={styles.recDot} />
                            <Text style={styles.recText}>{rec}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn}>
                    <Bookmark size={20} color="#6366f1" />
                    <Text style={styles.saveBtnText}>Save Report</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    topBanner: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    riskTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 15, textAlign: 'center' },
    riskSub: { color: '#fff', opacity: 0.8, fontSize: 13, fontWeight: 'bold', marginTop: 5 },
    content: { padding: 24 },
    chipScroll: { marginBottom: 30 },
    drugChip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginRight: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    chipText: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
    scoreCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', borderWith: 4, borderColor: '#be123c10', alignItems: 'center', justifyContent: 'center' },
    scoreVal: { fontSize: 18, fontWeight: '900', color: '#be123c' },
    scoreLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
    scoreInfo: { flex: 1 },
    infoTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
    infoText: { fontSize: 12, color: '#64748b', fontWeight: 'bold', lineHeight: 18 },
    sectionHeader: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    pairCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    pairHeader: { flexDirection: 'row', alignItems: 'center' },
    pairNames: { fontSize: 16, fontWeight: '900', color: '#1e293b', marginBottom: 6 },
    sevBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    sevText: { fontSize: 10, fontWeight: '900', color: '#be123c' },
    expandedContent: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    mechHeader: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 },
    mechText: { fontSize: 14, color: '#475569', fontWeight: 'bold', lineHeight: 22 },
    notesBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 16, marginTop: 15, flexDirection: 'row', gap: 10 },
    notesText: { flex: 1, fontSize: 12, color: '#0f172a', fontWeight: 'bold' },
    recSection: { marginTop: 20 },
    recItem: { flexDirection: 'row', gap: 12, marginBottom: 15 },
    recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6366f1', marginTop: 8 },
    recText: { flex: 1, fontSize: 14, color: '#1e293b', fontWeight: 'bold', lineHeight: 22 },
    footer: { padding: 24, backgroundColor: '#fff', flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    saveBtn: { flex: 1, height: 60, borderRadius: 20, borderWidth: 2, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    saveBtnText: { color: '#6366f1', fontWeight: '900', fontSize: 14 },
    shareBtn: { flex: 1, height: 60, borderRadius: 20, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    shareBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 }
});

export default ResultScreen;
