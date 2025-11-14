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
import { Picker } from '@react-native-picker/picker';
import { apiRequest } from '../../../config/api.config';
import { StorageService } from '../../../services/storage';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function CreateJogadorScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        telefone: '',
        data_nascimento: '',
        genero: 'masculino',
        cpf: '',
        cidade: '',
        estado: '',
        nivel_habilidade: 'iniciante',
        posicao_preferida: 'ambos',
        bio: '',
        altura: '',
        peso: '',
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Máscaras de formatação
    const formatCPF = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/^(\d{3})(\d)/, '$1.$2')
                .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1-$2');
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

    const formatDate = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    };

    const handleCPFChange = (text) => {
        const formatted = formatCPF(text);
        handleInputChange('cpf', formatted);
    };

    const handlePhoneChange = (text) => {
        const formatted = formatPhone(text);
        handleInputChange('telefone', formatted);
    };

    const handleDateChange = (text) => {
        const formatted = formatDate(text);
        handleInputChange('data_nascimento', formatted);
    };

    const validateForm = () => {
        const cpfNumbers = formData.cpf.replace(/\D/g, '');

        if (formData.cpf && cpfNumbers.length !== 11) {
            Alert.alert('Erro', 'CPF deve ter 11 dígitos');
            return false;
        }

        if (formData.data_nascimento) {
            const dateNumbers = formData.data_nascimento.replace(/\D/g, '');
            if (dateNumbers.length !== 8) {
                Alert.alert('Erro', 'Data de nascimento inválida');
                return false;
            }
        }

        if (formData.estado && formData.estado.length !== 2) {
            Alert.alert('Erro', 'Estado deve ter 2 caracteres (ex: SP, RJ)');
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
                user_id: user.id,
                telefone: formData.telefone.replace(/\D/g, '') || null,
                data_nascimento: formData.data_nascimento || null,
                genero: formData.genero,
                cpf: formData.cpf.replace(/\D/g, '') || null,
                cidade: formData.cidade.trim() || null,
                estado: formData.estado.trim().toUpperCase() || null,
                nivel_habilidade: formData.nivel_habilidade,
                posicao_preferida: formData.posicao_preferida,
                bio: formData.bio.trim() || null,
                altura: formData.altura ? parseFloat(formData.altura) : null,
                peso: formData.peso ? parseFloat(formData.peso) : null,
            };

            const response = await apiRequest('/api/jogadores', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            console.log('✅ Perfil de jogador criado:', response);

            Alert.alert(
                'Sucesso',
                'Perfil de jogador cadastrado com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/src/screens/user_jogador/HomeScreen')
                    },
                ]
            );

        } catch (error) {
            console.error('❌ Erro ao criar perfil de jogador:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível cadastrar o perfil. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
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
                        <Ionicons name="arrow-back" size={24} color={Colors.secondary.ocean} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Completar Perfil</Text>
                    <Text style={styles.subtitle}>Preencha seus dados para começar a jogar</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color={Colors.secondary.ocean} />
                        <Text style={styles.infoText}>
                            Complete seu perfil para participar de partidas e campeonatos
                        </Text>
                    </View>

                    {/* CPF */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CPF</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="card" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChangeText={handleCPFChange}
                                keyboardType="numeric"
                                maxLength={14}
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Telefone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefone</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="(00) 00000-0000"
                                value={formData.telefone}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                                maxLength={15}
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Data de Nascimento */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Data de Nascimento</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color={Colors.neutral.charcoal} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="DD/MM/AAAA"
                                value={formData.data_nascimento}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Gênero */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gênero</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="male-female" size={20} color={Colors.neutral.charcoal} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.genero}
                                onValueChange={(value) => handleInputChange('genero', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Masculino" value="masculino" />
                                <Picker.Item label="Feminino" value="feminino" />
                                <Picker.Item label="Outro" value="outro" />
                            </Picker>
                        </View>
                    </View>

                    {/* Cidade e Estado */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.label}>Cidade</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="Ex: São Paulo"
                                value={formData.cidade}
                                onChangeText={(text) => handleInputChange('cidade', text)}
                                maxLength={100}
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Estado</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="SP"
                                value={formData.estado}
                                onChangeText={(text) => handleInputChange('estado', text.toUpperCase())}
                                maxLength={2}
                                autoCapitalize="characters"
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Altura e Peso */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Altura (cm)</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="Ex: 180"
                                value={formData.altura}
                                onChangeText={(text) => handleInputChange('altura', text)}
                                keyboardType="numeric"
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Peso (kg)</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="Ex: 75"
                                value={formData.peso}
                                onChangeText={(text) => handleInputChange('peso', text)}
                                keyboardType="numeric"
                                placeholderTextColor={Colors.neutral.charcoal}
                            />
                        </View>
                    </View>

                    {/* Nível de Habilidade */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nível de Habilidade</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="star" size={20} color={Colors.neutral.charcoal} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.nivel_habilidade}
                                onValueChange={(value) => handleInputChange('nivel_habilidade', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Iniciante" value="iniciante" />
                                <Picker.Item label="Intermediário" value="intermediario" />
                                <Picker.Item label="Avançado" value="avancado" />
                                <Picker.Item label="Profissional" value="profissional" />
                            </Picker>
                        </View>
                    </View>

                    {/* Posição Preferida */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Posição Preferida</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="american-football" size={20} color={Colors.neutral.charcoal} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.posicao_preferida}
                                onValueChange={(value) => handleInputChange('posicao_preferida', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Levantador" value="levantador" />
                                <Picker.Item label="Atacante" value="atacante" />
                                <Picker.Item label="Ambos" value="ambos" />
                            </Picker>
                        </View>
                    </View>

                    {/* Biografia */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Sobre Você</Text>
                        <TextInput
                            style={[styles.inputFull, styles.textArea]}
                            placeholder="Conte um pouco sobre sua experiência no futevôlei..."
                            value={formData.bio}
                            onChangeText={(text) => handleInputChange('bio', text)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={Colors.neutral.charcoal}
                        />
                        <Text style={styles.helperText}>
                            Descreva sua experiência, objetivos e estilo de jogo
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
                                <ActivityIndicator color={Colors.neutral.navyDeep} size="small" />
                                <Text style={[styles.submitButtonText, {marginLeft: Spacing.sm}]}>Salvando...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.navyDeep} />
                                <Text style={[styles.submitButtonText, {marginLeft: Spacing.sm}]}>Completar Perfil</Text>
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
        backgroundColor: Colors.neutral.sandLight,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    header: {
        marginBottom: Spacing.xxxl,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.base,
        gap: Spacing.xs,
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
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
    },
    form: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        ...ComponentStyles.card,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${Colors.secondary.ocean}15`,
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: Typography.sizes.bodySmall,
        color: Colors.secondary.ocean,
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
    inputFull: {
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
        borderRadius: BorderRadius.input,
        padding: Spacing.md,
        fontSize: Typography.sizes.body,
        color: Colors.neutral.navyDeep,
    },
    textArea: {
        minHeight: 100,
        paddingTop: Spacing.md,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
        borderRadius: BorderRadius.input,
        paddingLeft: Spacing.md,
    },
    pickerIcon: {
        marginRight: Spacing.sm,
    },
    picker: {
        flex: 1,
        color: Colors.neutral.navyDeep,
    },
    submitButton: {
        backgroundColor: Colors.primary.mikasaBright,
        padding: Spacing.base,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
        marginTop: Spacing.md,
        ...ComponentStyles.buttonPrimary,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonText: {
        color: Colors.neutral.navyDeep,
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },
});
