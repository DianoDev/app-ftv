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
import { StorageService } from '../../../../services/storage';
import { API_CONFIG } from '../../../../config/api.config';
import { formatCurrency, unformatCurrency } from '../../../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../../styles/theme';

export default function EditCategoriaScreen() {
    const router = useRouter();
    const { categoriaId, campeonatoId } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [genero, setGenero] = useState('');
    const [nivel, setNivel] = useState('');
    const [maxDuplas, setMaxDuplas] = useState('');
    const [valorInscricao, setValorInscricao] = useState('');
    const [status, setStatus] = useState('inscricoes_abertas');
    const [premiacao1Lugar, setPremiacao1Lugar] = useState('');
    const [premiacao2Lugar, setPremiacao2Lugar] = useState('');
    const [premiacao3Lugar, setPremiacao3Lugar] = useState('');

    // Opções de gênero
    const generoOptions = [
        { value: '', label: 'Nenhum' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Feminino', label: 'Feminino' },
        { value: 'Misto', label: 'Misto' },
    ];

    // Opções de nível
    const nivelOptions = [
        { value: '', label: 'Nenhum' },
        { value: 'Iniciante', label: 'Iniciante' },
        { value: 'Intermediário', label: 'Intermediário' },
        { value: 'Avançado', label: 'Avançado' },
        { value: 'Profissional', label: 'Profissional' },
    ];

    // Status options
    const statusOptions = [
        { value: 'inscricoes_abertas', label: 'Inscrições Abertas' },
        { value: 'em_andamento', label: 'Em Andamento' },
        { value: 'finalizado', label: 'Finalizado' },
        { value: 'cancelado', label: 'Cancelado' },
    ];

    // Carregar dados da categoria
    useEffect(() => {
        fetchCategoriaData();
    }, [categoriaId]);

    const fetchCategoriaData = async () => {
        try {
            setLoading(true);
            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/categorias-campeonato/${categoriaId}`,
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
                setGenero(data.genero || '');
                setNivel(data.nivel || '');
                setMaxDuplas(data.max_duplas ? data.max_duplas.toString() : '');
                setValorInscricao(data.valor_inscricao ? formatCurrency(data.valor_inscricao) : '');
                setStatus(data.status || 'inscricoes_abertas');

                // Carregar premiação se existir
                if (data.premiacao) {
                    try {
                        const premiacao = typeof data.premiacao === 'string'
                            ? JSON.parse(data.premiacao)
                            : data.premiacao;

                        if (premiacao['1º Lugar']) {
                            setPremiacao1Lugar(formatCurrency(premiacao['1º Lugar']));
                        }
                        if (premiacao['2º Lugar']) {
                            setPremiacao2Lugar(formatCurrency(premiacao['2º Lugar']));
                        }
                        if (premiacao['3º Lugar']) {
                            setPremiacao3Lugar(formatCurrency(premiacao['3º Lugar']));
                        }
                    } catch (e) {
                        console.error('Erro ao parsear premiação:', e);
                    }
                }
            } else {
                throw new Error(data.message || 'Erro ao carregar dados da categoria');
            }
        } catch (error) {
            console.error('Erro ao carregar categoria:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da categoria');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleValorInscricaoChange = (text) => {
        const numericValue = text.replace(/[^0-9]/g, '');

        if (numericValue === '') {
            setValorInscricao('');
            return;
        }

        const value = parseInt(numericValue) / 100;
        setValorInscricao(formatCurrency(value));
    };

    const handlePremiacaoChange = (text, setter) => {
        const numericValue = text.replace(/[^0-9]/g, '');

        if (numericValue === '') {
            setter('');
            return;
        }

        const value = parseInt(numericValue) / 100;
        setter(formatCurrency(value));
    };

    const validateForm = () => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o nome da categoria');
            return false;
        }

        if (maxDuplas && isNaN(parseInt(maxDuplas))) {
            Alert.alert('Atenção', 'Número máximo de duplas inválido');
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

            // Preparar premiação em JSON
            let premiacao = null;
            if (premiacao1Lugar || premiacao2Lugar || premiacao3Lugar) {
                premiacao = {
                    '1º Lugar': premiacao1Lugar ? unformatCurrency(premiacao1Lugar) : null,
                    '2º Lugar': premiacao2Lugar ? unformatCurrency(premiacao2Lugar) : null,
                    '3º Lugar': premiacao3Lugar ? unformatCurrency(premiacao3Lugar) : null,
                };
            }

            const formData = {
                nome: nome.trim(),
                genero: genero || null,
                nivel: nivel || null,
                max_duplas: maxDuplas ? parseInt(maxDuplas) : null,
                valor_inscricao: valorInscricao ? unformatCurrency(valorInscricao) : 0,
                premiacao: premiacao ? JSON.stringify(premiacao) : null,
                status: status,
            };

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/categorias-campeonato/${categoriaId}`,
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
                    data.message || 'Categoria atualizada com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(data.message || 'Erro ao atualizar categoria');
            }
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a categoria');
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
                        <Text style={styles.title}>Editar Categoria</Text>
                        <Text style={styles.subtitle}>Atualize os dados da categoria</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="pricetag" size={16} color="#FFD300" /> Nome da Categoria *
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Masculino A, Feminino B"
                                value={nome}
                                onChangeText={setNome}
                                placeholderTextColor="#666666"
                                maxLength={100}
                            />
                        </View>
                    </View>

                    {/* Gênero */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="people" size={16} color="#FFD300" /> Gênero
                        </Text>
                        <View style={styles.optionsContainer}>
                            {generoOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        genero === option.value && styles.optionButtonActive
                                    ]}
                                    onPress={() => setGenero(option.value)}
                                >
                                    <Text style={[
                                        styles.optionButtonText,
                                        genero === option.value && styles.optionButtonTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Nível */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="star" size={16} color="#FFD300" /> Nível
                        </Text>
                        <View style={styles.optionsContainer}>
                            {nivelOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        nivel === option.value && styles.optionButtonActive
                                    ]}
                                    onPress={() => setNivel(option.value)}
                                >
                                    <Text style={[
                                        styles.optionButtonText,
                                        nivel === option.value && styles.optionButtonTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Configurações */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                <Ionicons name="options" size={16} color="#FFD300" /> Máx. Duplas
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 16"
                                    value={maxDuplas}
                                    onChangeText={setMaxDuplas}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                <Ionicons name="cash-outline" size={16} color="#FFD300" /> Inscrição
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="R$ 0,00"
                                    value={valorInscricao}
                                    onChangeText={handleValorInscricaoChange}
                                    keyboardType="numeric"
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Status */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="flag" size={16} color="#FFD300" /> Status
                        </Text>
                        <View style={styles.optionsContainer}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        status === option.value && styles.optionButtonActive
                                    ]}
                                    onPress={() => setStatus(option.value)}
                                >
                                    <Text style={[
                                        styles.optionButtonText,
                                        status === option.value && styles.optionButtonTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Premiação */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="trophy" size={16} color="#FFD300" /> 1º Lugar
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={premiacao1Lugar}
                                onChangeText={(text) => handlePremiacaoChange(text, setPremiacao1Lugar)}
                                keyboardType="numeric"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="trophy" size={16} color="#FFD300" /> 2º Lugar
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={premiacao2Lugar}
                                onChangeText={(text) => handlePremiacaoChange(text, setPremiacao2Lugar)}
                                keyboardType="numeric"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="trophy" size={16} color="#FFD300" /> 3º Lugar
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={premiacao3Lugar}
                                onChangeText={(text) => handlePremiacaoChange(text, setPremiacao3Lugar)}
                                keyboardType="numeric"
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
                                <Text style={styles.submitButtonText}>Salvar Alterações</Text>
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
        marginTop: Spacing.sm,
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
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    optionButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.input,
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    optionButtonActive: {
        backgroundColor: '#FFD300',
        borderColor: '#FFD300',
    },
    optionButtonText: {
        fontSize: Typography.sizes.small,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    optionButtonTextActive: {
        color: '#000000',
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