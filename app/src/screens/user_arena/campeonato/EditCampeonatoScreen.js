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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { formatDate, dateToISO, dateFromISO } from '../../../utils/formatters';
import { validateDate } from '../../../utils/validators';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function EditCampeonatoScreen() {
    const router = useRouter();
    const { campeonatoId } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [tipo, setTipo] = useState('');
    const [regras, setRegras] = useState('');
    const [status, setStatus] = useState('inscricoes_abertas');

    // Carregar dados do campeonato
    useEffect(() => {
        fetchCampeonatoData();
    }, [campeonatoId]);

    const fetchCampeonatoData = async () => {
        try {
            setLoading(true);
            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/campeonatos/${campeonatoId}`,
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
                setNome(data.nome || '');
                setDescricao(data.descricao || '');
                setDataInicio(data.data_inicio ? dateFromISO(data.data_inicio) : '');
                setDataFim(data.data_fim ? dateFromISO(data.data_fim) : '');
                setTipo(data.tipo || '');
                setRegras(data.regras || '');
                setStatus(data.status || 'inscricoes_abertas');
            } else {
                throw new Error(data.message || 'Erro ao carregar dados do campeonato');
            }
        } catch (error) {
            console.error('Erro ao carregar campeonato:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do campeonato');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleDataInicioChange = (text) => {
        const formatted = formatDate(text);
        setDataInicio(formatted);
    };

    const handleDataFimChange = (text) => {
        const formatted = formatDate(text);
        setDataFim(formatted);
    };

    const validateForm = () => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o nome do campeonato');
            return false;
        }

        if (!dataInicio.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a data de início');
            return false;
        }

        if (!validateDate(dataInicio)) {
            Alert.alert('Atenção', 'Data de início inválida. Use o formato DD/MM/AAAA');
            return false;
        }

        if (!dataFim.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a data de fim');
            return false;
        }

        if (!validateDate(dataFim)) {
            Alert.alert('Atenção', 'Data de fim inválida. Use o formato DD/MM/AAAA');
            return false;
        }

        const inicio = dateToISO(dataInicio);
        const fim = dateToISO(dataFim);

        if (fim < inicio) {
            Alert.alert('Atenção', 'A data de fim deve ser posterior à data de início');
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

            const formData = {
                nome: nome.trim(),
                descricao: descricao.trim() || null,
                data_inicio: dateToISO(dataInicio),
                data_fim: dateToISO(dataFim),
                tipo: tipo.trim() || null,
                regras: regras.trim() || null,
                status: status,
            };

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/campeonatos/${campeonatoId}`,
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
                    data.message || 'Campeonato atualizado com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(data.message || 'Erro ao atualizar campeonato');
            }
        } catch (error) {
            console.error('Erro ao atualizar campeonato:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar o campeonato');
        } finally {
            setSaving(false);
        }
    };

    // Status options
    const statusOptions = [
        { value: 'inscricoes_abertas', label: 'Inscrições Abertas' },
        { value: 'em_andamento', label: 'Em Andamento' },
        { value: 'finalizado', label: 'Finalizado' },
        { value: 'cancelado', label: 'Cancelado' },
    ];

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
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.secondary.ocean} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Campeonato</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Nome do Campeonato <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="trophy" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Torneio de Verão 2025"
                                value={nome}
                                onChangeText={setNome}
                                maxLength={200}
                            />
                        </View>
                    </View>

                    {/* Descrição */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text" size={20} color={Colors.neutral.charcoal} style={styles.inputIconTop} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descreva o campeonato..."
                                value={descricao}
                                onChangeText={setDescricao}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Datas */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                Data Início <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/AAAA"
                                    value={dataInicio}
                                    onChangeText={handleDataInicioChange}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                Data Fim <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/AAAA"
                                    value={dataFim}
                                    onChangeText={handleDataFimChange}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Tipo */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="list" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Eliminatória Simples, Round Robin"
                                value={tipo}
                                onChangeText={setTipo}
                                maxLength={30}
                            />
                        </View>
                    </View>

                    {/* Status */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusButtons}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.statusButton,
                                        status === option.value && styles.statusButtonActive
                                    ]}
                                    onPress={() => setStatus(option.value)}
                                >
                                    <Text style={[
                                        styles.statusButtonText,
                                        status === option.value && styles.statusButtonTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Regras */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Regras</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text" size={20} color={Colors.neutral.charcoal} style={styles.inputIconTop} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descreva as regras do campeonato..."
                                value={regras}
                                onChangeText={setRegras}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
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
                                <Text style={styles.submitButtonText}>Salvar Alterações</Text>
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
        paddingBottom: Spacing.xxxl,
    },
    header: {
        backgroundColor: Colors.neutral.white,
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.greyLight,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    backButtonText: {
        fontSize: Typography.sizes.body,
        color: Colors.secondary.ocean,
        fontWeight: Typography.fonts.headingWeight,
    },
    headerTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
    },
    form: {
        backgroundColor: Colors.neutral.white,
        margin: Spacing.base,
        padding: Spacing.lg,
        ...ComponentStyles.card,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },
    required: {
        color: Colors.status.error,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: Spacing.md,
        zIndex: 1,
    },
    inputIconTop: {
        position: 'absolute',
        left: Spacing.md,
        top: Spacing.md,
        zIndex: 1,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
        borderRadius: BorderRadius.input,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxxl + Spacing.sm,
        fontSize: Typography.sizes.body,
        color: Colors.neutral.navyDeep,
    },
    textArea: {
        minHeight: 100,
        paddingTop: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    statusButton: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.button,
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
    },
    statusButtonActive: {
        backgroundColor: Colors.primary.mikasaBright,
        borderColor: Colors.primary.mikasaBright,
    },
    statusButtonText: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.charcoal,
    },
    statusButtonTextActive: {
        color: Colors.neutral.navyDeep,
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
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    submitButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
    },
});