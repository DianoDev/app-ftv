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
import { useRouter } from 'expo-router';
import { apiRequest } from '../../../config/api.config';
import { StorageService } from '../../../services/storage';

export default function NovaArenaScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        cnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        whatsapp: '',
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Máscaras de formatação
    const formatCNPJ = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 14) {
            return numbers
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
        return value;
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            if (numbers.length <= 10) {
                return numbers
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                return numbers
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{5})(\d)/, '$1-$2');
            }
        }
        return value;
    };

    const formatCEP = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 8) {
            return numbers.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        return value;
    };

    const handleCNPJChange = (text) => {
        const formatted = formatCNPJ(text);
        handleInputChange('cnpj', formatted);
    };

    const handlePhoneChange = (text) => {
        const formatted = formatPhone(text);
        handleInputChange('telefone', formatted);
    };

    const handleWhatsAppChange = (text) => {
        const formatted = formatPhone(text);
        handleInputChange('whatsapp', formatted);
    };

    const handleCEPChange = (text) => {
        const formatted = formatCEP(text);
        handleInputChange('cep', formatted);
    };

    const validateForm = () => {
        if (!formData.nome.trim()) {
            Alert.alert('Erro', 'O nome da arena é obrigatório');
            return false;
        }

        if (formData.nome.length > 100) {
            Alert.alert('Erro', 'O nome deve ter no máximo 100 caracteres');
            return false;
        }

        if (!formData.endereco.trim()) {
            Alert.alert('Erro', 'O endereço é obrigatório');
            return false;
        }

        if (!formData.cidade.trim()) {
            Alert.alert('Erro', 'A cidade é obrigatória');
            return false;
        }

        if (!formData.estado.trim()) {
            Alert.alert('Erro', 'O estado é obrigatório');
            return false;
        }

        if (formData.estado.length !== 2) {
            Alert.alert('Erro', 'O estado deve ter 2 caracteres (ex: SP, RJ)');
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
            const token = await StorageService.getToken();
            const user = await StorageService.getUser();

            if (!token || !user) {
                Alert.alert('Erro', 'Usuário não autenticado');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            // Prepara os dados para envio
            const dataToSend = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim() || null,
                cnpj: formData.cnpj.replace(/\D/g, '') || null,
                endereco: formData.endereco.trim(),
                cidade: formData.cidade.trim(),
                estado: formData.estado.trim().toUpperCase(),
                cep: formData.cep.replace(/\D/g, '') || null,
                telefone: formData.telefone.replace(/\D/g, '') || null,
                whatsapp: formData.whatsapp.replace(/\D/g, '') || null,
            };

            const response = await apiRequest('/api/Arenas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            console.log('✅ Arena criada:', response);

            Alert.alert(
                'Sucesso',
                'Arena cadastrada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/src/screens/user_arena/HomeScreen')
                    },
                ]
            );

        } catch (error) {
            console.error('❌ Erro ao criar arena:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível cadastrar a arena. Tente novamente.'
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
                    <Text style={styles.title}>Nova Arena</Text>
                    <Text style={styles.subtitle}>Cadastre uma nova arena</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome da Arena *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Arena Esportiva Central"
                            value={formData.nome}
                            onChangeText={(text) => handleInputChange('nome', text)}
                            maxLength={100}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.helperText}>Máximo 100 caracteres</Text>
                    </View>

                    {/* Descrição */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Descreva a arena, suas características e diferenciais..."
                            value={formData.descricao}
                            onChangeText={(text) => handleInputChange('descricao', text)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* CNPJ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CNPJ</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChangeText={handleCNPJChange}
                            keyboardType="numeric"
                            maxLength={18}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Endereço */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Endereço *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Rua, número, bairro"
                            value={formData.endereco}
                            onChangeText={(text) => handleInputChange('endereco', text)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Cidade e Estado */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.label}>Cidade *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: São Paulo"
                                value={formData.cidade}
                                onChangeText={(text) => handleInputChange('cidade', text)}
                                maxLength={100}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Estado *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="SP"
                                value={formData.estado}
                                onChangeText={(text) => handleInputChange('estado', text.toUpperCase())}
                                maxLength={2}
                                autoCapitalize="characters"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* CEP */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CEP</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="00000-000"
                            value={formData.cep}
                            onChangeText={handleCEPChange}
                            keyboardType="numeric"
                            maxLength={9}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Telefone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="(00) 0000-0000"
                            value={formData.telefone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            maxLength={15}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* WhatsApp */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WhatsApp</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="(00) 00000-0000"
                            value={formData.whatsapp}
                            onChangeText={handleWhatsAppChange}
                            keyboardType="phone-pad"
                            maxLength={15}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.helperText}>
                            Número para contato via WhatsApp
                        </Text>
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
                            <Text style={styles.submitButtonText}>Cadastrar Arena</Text>
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