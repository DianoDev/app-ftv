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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { JogadorService } from '../../../services/jogadorService';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function EditJogadorScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [jogadorId, setJogadorId] = useState(null);
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

    useEffect(() => {
        loadJogadorData();
    }, []);

    const loadJogadorData = async () => {
        try {
            setLoading(true);
            const result = await JogadorService.getMe();

            if (result.success && result.data) {
                const jogador = result.data;
                setJogadorId(jogador.id);

                setFormData({
                    telefone: jogador.telefone ? formatPhone(jogador.telefone) : '',
                    data_nascimento: jogador.data_nascimento ? formatDateFromDB(jogador.data_nascimento) : '',
                    genero: jogador.genero || 'masculino',
                    cpf: jogador.cpf ? formatCPF(jogador.cpf) : '',
                    cidade: jogador.cidade || '',
                    estado: jogador.estado || '',
                    nivel_habilidade: jogador.nivel_habilidade || 'iniciante',
                    posicao_preferida: jogador.posicao_preferida || 'ambos',
                    bio: jogador.bio || '',
                    altura: jogador.altura ? jogador.altura.toString() : '',
                    peso: jogador.peso ? jogador.peso.toString() : '',
                });
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar dados do perfil');
            }
        } catch (error) {
            console.error('Error loading jogador data:', error);
            Alert.alert('Erro', 'Erro ao carregar dados do perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

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

    const formatDateFromDB = (dateString) => {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
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

        if (!jogadorId) {
            Alert.alert('Erro', 'ID do jogador não encontrado');
            return;
        }

        setSaving(true);

        try {
            const dataToSend = {
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

            const result = await JogadorService.update(jogadorId, dataToSend);

            if (result.success) {
                Alert.alert(
                    'Sucesso',
                    'Perfil atualizado com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back()
                        },
                    ]
                );
            } else {
                Alert.alert('Erro', result.message || 'Erro ao atualizar perfil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível atualizar o perfil. Tente novamente.'
            );
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
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFD300" />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Editar Perfil</Text>
                    <Text style={styles.subtitle}>Atualize suas informações</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color="#FFD300" />
                        <Text style={styles.infoText}>
                            Mantenha seu perfil atualizado para melhor experiência
                        </Text>
                    </View>

                    {/* CPF */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CPF</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="card" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="000.000.000-00"
                                placeholderTextColor="#666666"
                                value={formData.cpf}
                                onChangeText={handleCPFChange}
                                keyboardType="numeric"
                                maxLength={14}
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
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#666666"
                                value={formData.telefone}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                        </View>
                    </View>

                    {/* Data de Nascimento */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Data de Nascimento</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor="#666666"
                                value={formData.data_nascimento}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Gênero */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gênero</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.genero}
                                onValueChange={(value) => handleInputChange('genero', value)}
                                style={styles.picker}
                                dropdownIconColor="#FFD300"
                            >
                                <Picker.Item label="Masculino" value="masculino" color="#FFFFFF" />
                                <Picker.Item label="Feminino" value="feminino" color="#FFFFFF" />
                                <Picker.Item label="Outro" value="outro" color="#FFFFFF" />
                            </Picker>
                        </View>
                    </View>

                    {/* Cidade */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Cidade</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Sua cidade"
                                placeholderTextColor="#666666"
                                value={formData.cidade}
                                onChangeText={(text) => handleInputChange('cidade', text)}
                            />
                        </View>
                    </View>

                    {/* Estado */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estado (UF)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="map" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="SP"
                                placeholderTextColor="#666666"
                                value={formData.estado}
                                onChangeText={(text) => handleInputChange('estado', text.toUpperCase())}
                                maxLength={2}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    {/* Nível de Habilidade */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nível de Habilidade</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.nivel_habilidade}
                                onValueChange={(value) => handleInputChange('nivel_habilidade', value)}
                                style={styles.picker}
                                dropdownIconColor="#FFD300"
                            >
                                <Picker.Item label="Iniciante" value="iniciante" color="#FFFFFF" />
                                <Picker.Item label="Intermediário" value="intermediario" color="#FFFFFF" />
                                <Picker.Item label="Avançado" value="avancado" color="#FFFFFF" />
                                <Picker.Item label="Profissional" value="profissional" color="#FFFFFF" />
                            </Picker>
                        </View>
                    </View>

                    {/* Posição Preferida */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Posição Preferida</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.posicao_preferida}
                                onValueChange={(value) => handleInputChange('posicao_preferida', value)}
                                style={styles.picker}
                                dropdownIconColor="#FFD300"
                            >
                                <Picker.Item label="Ambos" value="ambos" color="#FFFFFF" />
                                <Picker.Item label="Esquerda" value="esquerda" color="#FFFFFF" />
                                <Picker.Item label="Direita" value="direita" color="#FFFFFF" />
                            </Picker>
                        </View>
                    </View>

                    {/* Altura */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Altura (cm)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="resize" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="180"
                                placeholderTextColor="#666666"
                                value={formData.altura}
                                onChangeText={(text) => handleInputChange('altura', text)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Peso */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Peso (kg)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="speedometer" size={20} color="#FFD300" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="75"
                                placeholderTextColor="#666666"
                                value={formData.peso}
                                onChangeText={(text) => handleInputChange('peso', text)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Conte um pouco sobre você e sua experiência no vôlei..."
                                placeholderTextColor="#666666"
                                value={formData.bio}
                                onChangeText={(text) => handleInputChange('bio', text)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={styles.charCount}>{formData.bio.length}/500</Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#000000" />
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
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginTop: Spacing.sm,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    header: {
        backgroundColor: '#0a0a0a',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    backButtonText: {
        fontSize: Typography.sizes.body,
        color: '#FFD300',
        marginLeft: Spacing.xs,
        fontWeight: '500',
    },
    title: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.body,
        color: '#999999',
    },
    form: {
        padding: Spacing.lg,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 211, 0, 0.15)',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    infoText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        marginLeft: Spacing.sm,
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.body,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        backgroundColor: '#2a2a2a',
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    textAreaContainer: {
        alignItems: 'flex-start',
        paddingVertical: Spacing.sm,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'right',
        marginTop: Spacing.xxs,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.md,
        backgroundColor: '#2a2a2a',
        overflow: 'hidden',
    },
    picker: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    submitButton: {
        backgroundColor: '#FFD300',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: Typography.sizes.body,
        color: '#000000',
        fontWeight: '600',
    },
});