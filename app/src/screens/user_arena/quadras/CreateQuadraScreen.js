import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../../config/api.config';
import { StorageService } from '../../../services/storage';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function NovaQuadraScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        comprimento: '',
        largura: '',
        valor_hora: '',
        coberta: false,
        iluminacao: true,
        ativa: true,
        observacoes: '',
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.nome.trim()) {
            Alert.alert('Erro', 'O nome da quadra é obrigatório');
            return false;
        }

        if (formData.nome.length > 50) {
            Alert.alert('Erro', 'O nome da quadra deve ter no máximo 50 caracteres');
            return false;
        }

        if (formData.valor_hora && isNaN(parseFloat(formData.valor_hora))) {
            Alert.alert('Erro', 'O valor por hora deve ser um número válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Recupera o token e o usuário
            const token = await StorageService.getToken();
            const user = await StorageService.getUser();

            if (!token || !user) {
                Alert.alert('Erro', 'Usuário não autenticado');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            // Prepara os dados para envio
            const dataToSend = {
                arena_id: user.arena_id || user.id, // Ajuste conforme estrutura do seu user
                nome: formData.nome.trim(),
                comprimento: formData.comprimento || null,
                largura: formData.largura || null,
                valor_hora: formData.valor_hora ? parseFloat(formData.valor_hora) : null,
                coberta: formData.coberta,
                iluminacao: formData.iluminacao,
                ativa: formData.ativa,
                observacoes: formData.observacoes.trim() || null,
            };

            // Faz a requisição
            const response = await apiRequest('/api/quadras', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            console.log('✅ Quadra criada:', response);

            Alert.alert(
                'Sucesso',
                'Quadra cadastrada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );

        } catch (error) {
            console.error('❌ Erro ao criar quadra:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível cadastrar a quadra. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.secondary.ocean} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nova Quadra</Text>
                    <Text style={styles.subtitle}>Cadastre uma nova quadra na sua arena</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome da Quadra *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="grid"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Quadra 1, Quadra Principal"
                                value={formData.nome}
                                onChangeText={(text) => handleInputChange('nome', text)}
                                maxLength={50}
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                        <Text style={styles.helperText}>Máximo 50 caracteres</Text>
                    </View>

                    {/* Dimensões */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Comprimento (m)</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="resize"
                                    size={20}
                                    color={Colors.neutral.charcoal}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 18"
                                    value={formData.comprimento}
                                    onChangeText={(text) => handleInputChange('comprimento', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.neutral.charcoal}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Largura (m)</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="resize"
                                    size={20}
                                    color={Colors.neutral.charcoal}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 9"
                                    value={formData.largura}
                                    onChangeText={(text) => handleInputChange('largura', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.neutral.charcoal}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Valor por hora */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valor por Hora (R$)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="cash"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 150.00"
                                value={formData.valor_hora}
                                onChangeText={(text) => handleInputChange('valor_hora', text)}
                                keyboardType="decimal-pad"
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Switches */}
                    <View style={styles.switchGroup}>
                        <View style={styles.switchItem}>
                            <View>
                                <Text style={styles.switchLabel}>Quadra Coberta</Text>
                                <Text style={styles.switchDescription}>A quadra possui cobertura</Text>
                            </View>
                            <Switch
                                value={formData.coberta}
                                onValueChange={(value) => handleInputChange('coberta', value)}
                                trackColor={{ false: Colors.neutral.greyLight, true: Colors.primary.mikasaBright }}
                                thumbColor={Colors.neutral.white}
                            />
                        </View>

                        <View style={styles.switchItem}>
                            <View>
                                <Text style={styles.switchLabel}>Iluminação</Text>
                                <Text style={styles.switchDescription}>A quadra possui iluminação</Text>
                            </View>
                            <Switch
                                value={formData.iluminacao}
                                onValueChange={(value) => handleInputChange('iluminacao', value)}
                                trackColor={{ false: Colors.neutral.greyLight, true: Colors.primary.mikasaBright }}
                                thumbColor={Colors.neutral.white}
                            />
                        </View>

                        <View style={styles.switchItem}>
                            <View>
                                <Text style={styles.switchLabel}>Quadra Ativa</Text>
                                <Text style={styles.switchDescription}>Disponível para agendamentos</Text>
                            </View>
                            <Switch
                                value={formData.ativa}
                                onValueChange={(value) => handleInputChange('ativa', value)}
                                trackColor={{ false: Colors.neutral.greyLight, true: Colors.primary.mikasaBright }}
                                thumbColor={Colors.neutral.white}
                            />
                        </View>
                    </View>

                    {/* Observações */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Observações</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <Ionicons
                                name="document-text"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Informações adicionais sobre a quadra..."
                                value={formData.observacoes}
                                onChangeText={(text) => handleInputChange('observacoes', text)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Botão de Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.neutral.navyDeep} size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.navyDeep} />
                                <Text style={styles.submitButtonText}>Cadastrar Quadra</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.sandLight,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.huge,
    },
    header: {
        marginBottom: Spacing.xxxl,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.base,
    },
    backButtonText: {
        fontSize: Typography.sizes.body,
        color: Colors.secondary.ocean,
        fontWeight: Typography.fonts.headingWeight,
    },
    title: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
    },
    form: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        ...ComponentStyles.card,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.label,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
        borderRadius: BorderRadius.input,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.body,
        color: Colors.neutral.navyDeep,
    },
    textAreaContainer: {
        alignItems: 'flex-start',
        paddingTop: Spacing.md,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    switchGroup: {
        marginBottom: Spacing.lg,
    },
    switchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.greyLight,
    },
    switchLabel: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.xs,
    },
    switchDescription: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
    },
    submitButton: {
        backgroundColor: Colors.primary.mikasaBright,
        padding: Spacing.base,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        ...ComponentStyles.buttonPrimary,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: Colors.neutral.navyDeep,
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },
});