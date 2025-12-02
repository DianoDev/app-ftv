import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

/**
 * Componente CustomSelect - Select customizado para substituir o Picker
 *
 * @param {Object} props
 * @param {string|number} props.value - Valor selecionado
 * @param {Function} props.onValueChange - Callback quando valor muda
 * @param {Array} props.options - Array de opções [{label: string, value: any, color?: string}]
 * @param {string} props.placeholder - Texto quando nenhum valor selecionado
 * @param {Object} props.style - Estilos customizados para o container
 * @param {boolean} props.disabled - Se está desabilitado
 */
export default function CustomSelect({
    value,
    onValueChange,
    options = [],
    placeholder = 'Selecione...',
    style,
    disabled = false,
}) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (selectedValue) => {
        setModalVisible(false);
        if (onValueChange) {
            onValueChange(selectedValue);
        }
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={[
                    styles.selector,
                    disabled && styles.selectorDisabled,
                ]}
                onPress={() => !disabled && setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.selectorText,
                        !selectedOption && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                >
                    {displayText}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={disabled ? '#666666' : '#FFD300'}
                />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecione uma opção</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item, index) => `${item.value}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        item.value === value && styles.optionItemSelected,
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.color && { color: item.color },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Ionicons name="checkmark-circle" size={24} color="#FFD300" />
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.optionsList}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    selector: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
    },
    selectorDisabled: {
        opacity: 0.5,
    },
    selectorText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        flex: 1,
        marginRight: Spacing.xs,
    },
    placeholderText: {
        color: '#999999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '70%',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    optionsList: {
        padding: Spacing.sm,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2a2a2a',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    optionItemSelected: {
        borderColor: '#FFD300',
        backgroundColor: '#FFD30010',
    },
    optionText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        flex: 1,
    },
});
