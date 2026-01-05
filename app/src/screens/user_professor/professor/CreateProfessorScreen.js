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
import { useRouter } from 'expo-router';
import { apiRequest } from '../../../config/api.config';
import { StorageService } from '../../../services/storage';

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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Novo Professor</Text>
                    <Text style={styles.subtitle}>Cadastre uma nova arena</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome da Quadra *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Quadra 1, Quadra Principal"
                            value={formData.nome}
                            onChangeText={(text) => handleInputChange('nome', text)}
                            maxLength={50}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.helperText}>Máximo 50 caracteres</Text>
                    </View>

                    {/* Dimensões */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Comprimento (m)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 18"
                                value={formData.comprimento}
                                onChangeText={(text) => handleInputChange('comprimento', text)}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Largura (m)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 9"
                                value={formData.largura}
                                onChangeText={(text) => handleInputChange('largura', text)}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Valor por hora */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valor por Hora (R$)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 150.00"
                            value={formData.valor_hora}
                            onChangeText={(text) => handleInputChange('valor_hora', text)}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#999"
                        />
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
                                trackColor={{ false: '#ddd', true: '#007AFF' }}
                                thumbColor="#fff"
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
                                trackColor={{ false: '#ddd', true: '#007AFF' }}
                                thumbColor="#fff"
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
                                trackColor={{ false: '#ddd', true: '#007AFF' }}
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
                            value={formData.observacoes}
                            onChangeText={(text) => handleInputChange('observacoes', text)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Botão de Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Cadastrar Quadra</Text>
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
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
    },
    backButton: {
        marginBottom: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1b1b18',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    switchGroup: {
        marginBottom: 20,
    },
    switchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 14,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});