import React, { useState, useEffect } from 'react'
import { 
    View, 
    Text, 
    Pressable, 
    StyleSheet, 
    ScrollView,
    TouchableOpacity 
} from 'react-native'
import { Check, Info, Library, CheckCircle2, Circle } from 'lucide-react-native'

const DrugPillSelector = ({ drugs = [], onSelectionChange }) => {
    const [selectedDrugs, setSelectedDrugs] = useState([])

    /**
     * Toggles a drug's selection state and notifies the parent logic.
     */
    const toggleDrug = (drugName) => {
        let newSelection
        if (selectedDrugs.includes(drugName)) {
            newSelection = selectedDrugs.filter(d => d !== drugName)
        } else {
            newSelection = [...selectedDrugs, drugName]
        }
        setSelectedDrugs(newSelection)
        onSelectionChange?.(newSelection)
    }

    /**
     * Batch Clinical Selection Utilities.
     */
    const selectAll = () => {
        const allNames = drugs.map(d => d.name)
        setSelectedDrugs(allNames)
        onSelectionChange?.(allNames)
    }

    const deselectAll = () => {
        setSelectedDrugs([])
        onSelectionChange?.([])
    }

    if (drugs.length === 0) return null

    return (
        <View style={styles.container}>
            {/* Action Bar */}
            <View style={styles.header}>
                <Text style={styles.title}>Detected Medications</Text>
                <View style={styles.utility}>
                    <TouchableOpacity onPress={selectAll}>
                        <Text style={styles.utilBtn}>All</Text>
                    </TouchableOpacity>
                    <Text style={styles.separator}>|</Text>
                    <TouchableOpacity onPress={deselectAll}>
                        <Text style={styles.utilBtn}>None</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pill Cloud */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillCloud}>
                {drugs.map((drug, index) => {
                    const isSelected = selectedDrugs.includes(drug.name)
                    const confidence = drug.confidence ? Math.round(drug.confidence * 100) : 0

                    return (
                        <Pressable 
                            key={index}
                            onPress={() => toggleDrug(drug.name)}
                            style={[
                                styles.pill,
                                isSelected ? styles.pillSelected : styles.pillUnselected
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                {isSelected ? (
                                    <CheckCircle2 size={16} color="#ffffff" strokeWidth={3} />
                                ) : (
                                    <Circle size={16} color="#90A4AE" />
                                )}
                            </View>
                            
                            <View>
                                <Text style={[
                                    styles.drugName,
                                    isSelected ? styles.nameSelected : styles.nameUnselected
                                ]}>
                                    {drug.name}
                                </Text>
                                <View style={[
                                    styles.confidenceBadge,
                                    isSelected ? styles.badgeSelected : styles.badgeUnselected
                                ]}>
                                    <Text style={styles.confidenceText}>{confidence}% AI Match</Text>
                                </View>
                            </View>
                        </Pressable>
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: '900',
        color: '#37474F',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    utility: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    utilBtn: {
        fontSize: 12,
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    separator: {
        marginHorizontal: 8,
        color: '#CFD8DC',
    },
    pillCloud: {
        paddingHorizontal: 15,
        paddingBottom: 5,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    pillSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    pillUnselected: {
        backgroundColor: '#ffffff',
        borderColor: '#F5F5F7',
    },
    iconContainer: {
        marginRight: 10,
    },
    drugName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    nameSelected: {
        color: '#ffffff',
    },
    nameUnselected: {
        color: '#455A64',
    },
    confidenceBadge: {
        marginTop: 2,
        paddingHorizontal: 5,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeSelected: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    badgeUnselected: {
        backgroundColor: '#F1F8E9',
    },
    confidenceText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#4caf50',
    }
})

export default DrugPillSelector
