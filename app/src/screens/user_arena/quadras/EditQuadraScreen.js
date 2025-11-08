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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { formatCurrency, unformatCurrency } from '../../../utils/formatters';

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
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                    <Text style={styles.headerTitle}>Editar Quadra</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome da Quadra */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Nome da Quadra <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Quadra 1"
                            value={nome}
                            onChangeText={setNome}
                            maxLength={50}
                        />
                    </View>

                    {/* Dimensões */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Comprimento</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 40m"
                                value={comprimento}
                                onChangeText={setComprimento}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Largura</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 20m"
                                value={largura}
                                onChangeText={setLargura}
                            />
                        </View>
                    </View>

                    {/* Valor por Hora */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valor por Hora</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="R$ 0,00"
                            value={valorHora}
                            onChangeText={handleValorHoraChange}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Switches */}
                    <View style={styles.switchGroup}>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Quadra Coberta</Text>
                            <Switch
                                value={coberta}
                                onValueChange={setCoberta}
                                trackColor={{ false: '#d0d0d0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Iluminação</Text>
                            <Switch
                                value={iluminacao}
                                onValueChange={setIluminacao}
                                trackColor={{ false: '#d0d0d0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Quadra Ativa</Text>
                            <Switch
                                value={ativa}
                                onValueChange={setAtiva}
                                trackColor={{ false: '#d0d0d0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>

                    {/* Observações */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Observações</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Informações adicionais sobre a quadra..."
                            value={observacoes}
                            onChangeText={setObservacoes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
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
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
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
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    switchGroup: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    switchLabel: {
        fontSize: 16,
        color: '#1b1b18',
        fontWeight: '500',
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
        backgroundColor: '#007AFF',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});