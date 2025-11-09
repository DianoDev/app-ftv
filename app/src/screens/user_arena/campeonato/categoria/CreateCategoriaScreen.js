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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StorageService } from '../../../../services/storage';
import { API_CONFIG } from '../../../../config/api.config';
import { formatCurrency, unformatCurrency } from '../../../../utils/formatters';

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
        { value: '', label: 'Selecione' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Feminino', label: 'Feminino' },
        { value: 'Misto', label: 'Misto' },
    ];

    // Opções de nível
    const nivelOptions = [
        { value: '', label: 'Selecione' },
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nova Categoria</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome da Categoria */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Nome da Categoria <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Masculino A, Feminino B"
                            value={nome}
                            onChangeText={setNome}
                            maxLength={100}
                        />
                    </View>

                    {/* Gênero */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gênero</Text>
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
                        <Text style={styles.label}>Nível</Text>
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
                            <Text style={styles.label}>Máximo de Duplas</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 16"
                                value={maxDuplas}
                                onChangeText={setMaxDuplas}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Valor da Inscrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={valorInscricao}
                                onChangeText={handleValorInscricaoChange}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Premiação */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💰 Premiação</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>1º Lugar</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={premiacao1Lugar}
                                onChangeText={(text) => handlePremiacaoChange(text, setPremiacao1Lugar)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>2º Lugar</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={premiacao2Lugar}
                                onChangeText={(text) => handlePremiacaoChange(text, setPremiacao2Lugar)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>3º Lugar</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                value={premiacao3Lugar}
                                onChangeText={(text) => handlePremiacaoChange(text, setPremiacao3Lugar)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            Após criar a categoria, você poderá gerenciar as inscrições das duplas.
                        </Text>
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
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Criar Categoria</Text>
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
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginBottom: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1b1b18',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 8,
    },
    required: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#1b1b18',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },
    optionButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    optionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    optionButtonTextActive: {
        color: '#fff',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#34C759',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});