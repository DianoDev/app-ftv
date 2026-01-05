import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
                arena_id: user.arena_id || user.id,
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
            <StatusBar style="light" />
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
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Nova Quadra</Text>
                        <Text style={styles.subtitle}>Cadastre uma nova quadra na sua arena</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="grid" size={16} color="#FFD300" /> Nome da Quadra *
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Quadra 1, Quadra Principal"
                                value={formData.nome}
                                onChangeText={(text) => handleInputChange('nome', text)}
                                maxLength={50}
                                placeholderTextColor="#666666"
                            />
                        </View>
                        <Text style={styles.helperText}>Máximo 50 caracteres</Text>
                    </View>

                    {/* Dimensões */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                <Ionicons name="resize" size={16} color="#FFD300" /> Comprimento (m)
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 18"
                                    value={formData.comprimento}
                                    onChangeText={(text) => handleInputChange('comprimento', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                <Ionicons name="resize" size={16} color="#FFD300" /> Largura (m)
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 9"
                                    value={formData.largura}
                                    onChangeText={(text) => handleInputChange('largura', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Valor por hora */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="cash" size={16} color="#FFD300" /> Valor por Hora (R$)
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 150.00"
                                value={formData.valor_hora}
                                onChangeText={(text) => handleInputChange('valor_hora', text)}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Switches */}
                    <View style={styles.switchGroup}>
                        <View style={styles.switchItem}>
                            <View style={styles.switchContent}>
                                <View style={styles.switchIconContainer}>
                                    <Ionicons name="umbrella" size={20} color="#FFD300" />
                                </View>
                                <View style={styles.switchTextContainer}>
                                    <Text style={styles.switchLabel}>Quadra Coberta</Text>
                                    <Text style={styles.switchDescription}>A quadra possui cobertura</Text>
                                </View>
                            </View>
                            <Switch
                                value={formData.coberta}
                                onValueChange={(value) => handleInputChange('coberta', value)}
                                trackColor={{ false: '#2a2a2a', true: '#FFD300' }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#2a2a2a"
                            />
                        </View>

                        <View style={styles.switchItem}>
                            <View style={styles.switchContent}>
                                <View style={styles.switchIconContainer}>
                                    <Ionicons name="bulb" size={20} color="#FFD300" />
                                </View>
                                <View style={styles.switchTextContainer}>
                                    <Text style={styles.switchLabel}>Iluminação</Text>
                                    <Text style={styles.switchDescription}>A quadra possui iluminação</Text>
                                </View>
                            </View>
                            <Switch
                                value={formData.iluminacao}
                                onValueChange={(value) => handleInputChange('iluminacao', value)}
                                trackColor={{ false: '#2a2a2a', true: '#FFD300' }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#2a2a2a"
                            />
                        </View>

                        <View style={styles.switchItem}>
                            <View style={styles.switchContent}>
                                <View style={styles.switchIconContainer}>
                                    <Ionicons name="checkmark-circle" size={20} color="#FFD300" />
                                </View>
                                <View style={styles.switchTextContainer}>
                                    <Text style={styles.switchLabel}>Quadra Ativa</Text>
                                    <Text style={styles.switchDescription}>Disponível para agendamentos</Text>
                                </View>
                            </View>
                            <Switch
                                value={formData.ativa}
                                onValueChange={(value) => handleInputChange('ativa', value)}
                                trackColor={{ false: '#2a2a2a', true: '#FFD300' }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#2a2a2a"
                            />
                        </View>
                    </View>

                    {/* Observações */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="document-text" size={16} color="#FFD300" /> Observações
                        </Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Informações adicionais sobre a quadra..."
                                value={formData.observacoes}
                                onChangeText={(text) => handleInputChange('observacoes', text)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Botão de Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000000" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#000000" />
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
        backgroundColor: '#0a0a0a',
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.huge,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerRight: {
        width: 40,
    },
    title: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
    },
    form: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.input,
        paddingHorizontal: Spacing.md,
    },
    input: {
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    textAreaContainer: {
        paddingTop: Spacing.md,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
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
        borderBottomColor: '#2a2a2a',
    },
    switchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    switchIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    switchTextContainer: {
        flex: 1,
    },
    switchLabel: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    submitButton: {
        backgroundColor: '#FFD300',
        padding: Spacing.base,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#000000',
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },
});
