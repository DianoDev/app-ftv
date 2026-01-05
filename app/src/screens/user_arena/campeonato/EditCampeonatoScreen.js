import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
                    'Campeonato atualizado com sucesso!',
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
                        <Text style={styles.title}>Editar Campeonato</Text>
                        <Text style={styles.subtitle}>Atualize os dados do campeonato</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="trophy" size={16} color="#FFD300" /> Nome do Campeonato *
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Campeonato de Verão 2024"
                                value={nome}
                                onChangeText={setNome}
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Descrição */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="document-text" size={16} color="#FFD300" /> Descrição
                        </Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descrição do campeonato..."
                                value={descricao}
                                onChangeText={setDescricao}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Datas */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                <Ionicons name="calendar" size={16} color="#FFD300" /> Data Início *
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/AAAA"
                                    value={dataInicio}
                                    onChangeText={handleDataInicioChange}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                <Ionicons name="calendar" size={16} color="#FFD300" /> Data Fim *
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/AAAA"
                                    value={dataFim}
                                    onChangeText={handleDataFimChange}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Tipo */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="ribbon" size={16} color="#FFD300" /> Tipo
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Eliminatória, Pontos Corridos"
                                value={tipo}
                                onChangeText={setTipo}
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Regras */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="list" size={16} color="#FFD300" /> Regras
                        </Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Regras do campeonato..."
                                value={regras}
                                onChangeText={setRegras}
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
                                <Text style={styles.submitButtonText}>Atualizar Campeonato</Text>
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
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfWidth: {
        flex: 1,
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
