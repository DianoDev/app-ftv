import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { formatCurrency, unformatCurrency } from '../../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function EditQuadraScreen() {
    const router = useRouter();
    const { quadraId } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [comprimento, setComprimento] = useState('');
    const [largura, setLargura] = useState('');
    const [valorHora, setValorHora] = useState('');
    const [coberta, setCoberta] = useState(false);
    const [iluminacao, setIluminacao] = useState(true);
    const [ativa, setAtiva] = useState(true);
    const [observacoes, setObservacoes] = useState('');

    // Carregar dados da quadra
    useEffect(() => {
        fetchQuadraData();
    }, [quadraId]);

    const fetchQuadraData = async () => {
        try {
            setLoading(true);
            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/quadras/${quadraId}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                // Preencher formulário com dados da quadra
                setNome(data.nome || '');
                setComprimento(data.comprimento ? String(data.comprimento) : '');
                setLargura(data.largura ? String(data.largura) : '');
                setValorHora(data.valor_hora ? String(data.valor_hora) : '');
                setCoberta(data.coberta || false);
                setIluminacao(data.iluminacao !== false);
                setAtiva(data.ativa !== false);
                setObservacoes(data.observacoes || '');
            } else {
                throw new Error(data.message || 'Erro ao carregar dados da quadra');
            }
        } catch (error) {
            console.error('Erro ao carregar quadra:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da quadra');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o nome da quadra');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            const token = await StorageService.getToken();

            // Preparar dados para envio
            const formData = {
                nome: nome.trim(),
                comprimento: comprimento.trim() || null,
                largura: largura.trim() || null,
                valor_hora: valorHora ? parseFloat(valorHora) : null,
                coberta: coberta,
                iluminacao: iluminacao,
                ativa: ativa,
                observacoes: observacoes.trim() || null,
            };

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/quadras/${quadraId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Sucesso',
                    data.message || 'Quadra atualizada com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(data.message || 'Erro ao atualizar quadra');
            }
        } catch (error) {
            console.error('Erro ao atualizar quadra:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a quadra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                        <Text style={styles.title}>Editar Quadra</Text>
                        <Text style={styles.subtitle}>Atualize os dados da quadra</Text>
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
                                value={nome}
                                onChangeText={setNome}
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
                                    value={comprimento}
                                    onChangeText={setComprimento}
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
                                    value={largura}
                                    onChangeText={setLargura}
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
                                value={valorHora}
                                onChangeText={setValorHora}
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
                                value={coberta}
                                onValueChange={setCoberta}
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
                                value={iluminacao}
                                onValueChange={setIluminacao}
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
                                value={ativa}
                                onValueChange={setAtiva}
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
                                value={observacoes}
                                onChangeText={setObservacoes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Botão de Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="#000000" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#000000" />
                                <Text style={styles.submitButtonText}>Atualizar Quadra</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#999999',
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
