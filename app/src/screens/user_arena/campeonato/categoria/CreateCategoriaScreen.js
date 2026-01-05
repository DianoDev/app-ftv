import React, { useState } from 'react';
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
import { StorageService } from '../../../../services/storage';
import { API_CONFIG } from '../../../../config/api.config';
import { formatCurrency, unformatCurrency } from '../../../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../../styles/theme';

export default function CreateCategoriaScreen() {
    const router = useRouter();
    const { campeonatoId } = useLocalSearchParams();
    const [saving, setSaving] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [genero, setGenero] = useState('');
    const [nivel, setNivel] = useState('');
    const [maxDuplas, setMaxDuplas] = useState('');
    const [valorInscricao, setValorInscricao] = useState('');
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

            // Preparar dados para envio
            const formData = {
                campeonato_id: parseInt(campeonatoId),
                nome: nome.trim(),
                genero: genero || null,
                nivel: nivel || null,
                max_duplas: maxDuplas ? parseInt(maxDuplas) : null,
                valor_inscricao: valorInscricao ? unformatCurrency(valorInscricao) : 0,
                premiacao: premiacao ? JSON.stringify(premiacao) : null,
                status: 'inscricoes_abertas',
            };

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/categorias-campeonato`,
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
                    data.message || 'Categoria criada com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(data.message || 'Erro ao criar categoria');
            }
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            Alert.alert('Erro', error.message || 'Não foi possível criar a categoria');
        } finally {
            setSaving(false);
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
                        <Text style={styles.title}>Nova Categoria</Text>
                        <Text style={styles.subtitle}>Crie uma nova categoria</Text>
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
                                <Text style={styles.submitButtonText}>Criar Categoria</Text>
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