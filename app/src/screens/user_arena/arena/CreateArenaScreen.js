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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { apiRequest } from '../../../config/api.config';
import { StorageService } from '../../../services/storage';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

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
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nova Arena</Text>
                    <Text style={styles.subtitle}>Cadastre uma nova arena</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome da Arena *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="business" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Arena Esportiva Central"
                                value={formData.nome}
                                onChangeText={(text) => handleInputChange('nome', text)}
                                maxLength={100}
                                placeholderTextColor="#666666"
                            />
                        </View>
                        <Text style={styles.helperText}>Máximo 100 caracteres</Text>
                    </View>

                    {/* Descrição */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={[styles.inputFull, styles.textArea]}
                            placeholder="Descreva a arena, suas características e diferenciais..."
                            value={formData.descricao}
                            onChangeText={(text) => handleInputChange('descricao', text)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#666666"
                        />
                    </View>

                    {/* CNPJ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CNPJ</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="00.000.000/0000-00"
                                value={formData.cnpj}
                                onChangeText={handleCNPJChange}
                                keyboardType="numeric"
                                maxLength={18}
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Endereço */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Endereço *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Rua, número, bairro"
                                value={formData.endereco}
                                onChangeText={(text) => handleInputChange('endereco', text)}
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Cidade e Estado */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.label}>Cidade *</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="Ex: São Paulo"
                                value={formData.cidade}
                                onChangeText={(text) => handleInputChange('cidade', text)}
                                maxLength={100}
                                placeholderTextColor="#666666"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Estado *</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="SP"
                                value={formData.estado}
                                onChangeText={(text) => handleInputChange('estado', text.toUpperCase())}
                                maxLength={2}
                                autoCapitalize="characters"
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* CEP */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CEP</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="00000-000"
                                value={formData.cep}
                                onChangeText={handleCEPChange}
                                keyboardType="numeric"
                                maxLength={9}
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* Telefone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefone</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="(00) 0000-0000"
                                value={formData.telefone}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                                maxLength={15}
                                placeholderTextColor="#666666"
                            />
                        </View>
                    </View>

                    {/* WhatsApp */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WhatsApp</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="logo-whatsapp" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="(00) 00000-0000"
                                value={formData.whatsapp}
                                onChangeText={handleWhatsAppChange}
                                keyboardType="phone-pad"
                                maxLength={15}
                                placeholderTextColor="#666666"
                            />
                        </View>
                        <Text style={styles.helperText}>
                            Número para contato via WhatsApp
                        </Text>
                    </View>

                    {/* Botão de Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#000000" size="small" />
                                <Text style={[styles.submitButtonText, {marginLeft: Spacing.sm}]}>Cadastrando...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="checkmark-circle" size={20} color="#000000" />
                                <Text style={[styles.submitButtonText, {marginLeft: Spacing.sm}]}>Cadastrar Arena</Text>
                            </View>
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
        backgroundColor: "#0a0a0a",
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    header: {
        marginBottom: Spacing.xxxl,
    },
    backButton: {
        padding: Spacing.xs,
        marginBottom: Spacing.base,
    },
    title: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: "#FFFFFF",
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.caption,
        color: "#999999",
        textAlign: 'center',
    },
    form: {
        backgroundColor: "#1a1a1a",
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        shadowColor: "#FFD300",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.label,
        fontWeight: Typography.fonts.headingWeight,
        color: "#FFFFFF",
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
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
        color: "#FFFFFF",
    },
    inputFull: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        borderRadius: BorderRadius.input,
        padding: Spacing.md,
        fontSize: Typography.sizes.body,
        color: "#FFFFFF",
    },
    textArea: {
        minHeight: 100,
        paddingTop: Spacing.md,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: Typography.sizes.caption,
        color: "#999999",
        marginTop: Spacing.xs,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    submitButton: {
        backgroundColor: "#FFD300",
        padding: Spacing.base,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
        marginTop: Spacing.md,
        shadowColor: "#FFD300",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonText: {
        color: "#000000",
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },
});