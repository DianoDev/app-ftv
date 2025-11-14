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
                setComprimento(data.comprimento || '');
                setLargura(data.largura || '');
                setValorHora(data.valor_hora ? formatCurrency(data.valor_hora) : '');
                setCoberta(data.coberta || false);
                setIluminacao(data.iluminacao !== false); // Default true
                setAtiva(data.ativa !== false); // Default true
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

    const handleValorHoraChange = (text) => {
        // Remove tudo exceto números
        const numericValue = text.replace(/[^0-9]/g, '');

        if (numericValue === '') {
            setValorHora('');
            return;
        }

        // Converte para centavos e formata
        const value = parseInt(numericValue) / 100;
        setValorHora(formatCurrency(value));
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
                valor_hora: valorHora ? unformatCurrency(valorHora) : null,
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
            console.log(response.data,'response')
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
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.mikasaBright} />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
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
                    <Text style={styles.title}>Editar Quadra</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome da Quadra */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Nome da Quadra <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="grid"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Quadra 1"
                                value={nome}
                                onChangeText={setNome}
                                maxLength={50}
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Dimensões */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Comprimento</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="resize"
                                    size={20}
                                    color={Colors.neutral.charcoal}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 40m"
                                    value={comprimento}
                                    onChangeText={setComprimento}
                                    placeholderTextColor={Colors.neutral.charcoal}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Largura</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="resize"
                                    size={20}
                                    color={Colors.neutral.charcoal}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 20m"
                                    value={largura}
                                    onChangeText={setLargura}
                                    placeholderTextColor={Colors.neutral.charcoal}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Valor por Hora */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valor por Hora</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="cash"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={valorHora}
                                onChangeText={handleValorHoraChange}
                                keyboardType="numeric"
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
                                value={coberta}
                                onValueChange={setCoberta}
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
                                value={iluminacao}
                                onValueChange={setIluminacao}
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
                                value={ativa}
                                onValueChange={setAtiva}
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
                                value={observacoes}
                                onChangeText={setObservacoes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Botões */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => router.back()}
                            disabled={saving}
                        >
                            <Ionicons name="close-circle" size={20} color={Colors.neutral.charcoal} />
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color={Colors.neutral.navyDeep} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.navyDeep} />
                                    <Text style={styles.submitButtonText}>Salvar Alterações</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
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
    required: {
        color: Colors.status.error,
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
    buttonContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    button: {
        flex: 1,
        paddingVertical: Spacing.base,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    cancelButton: {
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
    },
    cancelButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.charcoal,
    },
    submitButton: {
        backgroundColor: Colors.primary.mikasaBright,
        ...ComponentStyles.buttonPrimary,
    },
    submitButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
    },
});