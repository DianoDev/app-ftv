import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../config/api.config';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../styles/theme';

export default function RegisterScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('jogador');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        router.push('/src/screens/auth/LoginScreen');
    };

    const handleRegister = async () => {
        // Validações
        if (!nome || !email || !senha || !confirmarSenha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (senha.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erro', 'Por favor, insira um email válido');
            return;
        }

        setLoading(true);

        try {
            console.log('📝 Iniciando cadastro de usuário...');

            const data = await apiRequest('/api/register/', {
                method: 'POST',
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    password: senha,
                    tipo_usuario: tipoUsuario,
                }),
            });

            console.log(data);

            Alert.alert(
                'Sucesso! 🎉',
                'Cadastro realizado com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Limpar formulário
                            setNome('');
                            setEmail('');
                            setSenha('');
                            setConfirmarSenha('');
                            setTipoUsuario('jogador');
                            handleLogin();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Erro ao cadastrar:', error);

            let errorMessage = 'Não foi possível realizar o cadastro';

            if (error.message.includes('Network request failed')) {
                errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
            } else if (error.message.includes('Timeout')) {
                errorMessage = 'A requisição demorou muito tempo. Tente novamente.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../images/logo2.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Cadastre-se no Futevôlei</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="person" size={16} color="#FFD300" /> Nome Completo
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu nome"
                                placeholderTextColor="#666666"
                                value={nome}
                                onChangeText={setNome}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="mail" size={16} color="#FFD300" /> Email
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                placeholderTextColor="#666666"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="people" size={16} color="#FFD300" /> Tipo de Usuário
                        </Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    tipoUsuario === 'jogador' && styles.radioButtonSelected
                                ]}
                                onPress={() => setTipoUsuario('jogador')}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={tipoUsuario === 'jogador' ? 'radio-button-on' : 'radio-button-off'}
                                    size={20}
                                    color={tipoUsuario === 'jogador' ? '#FFD300' : '#666666'}
                                />
                                <Text style={[
                                    styles.radioLabel,
                                    tipoUsuario === 'jogador' && styles.radioLabelSelected
                                ]}>
                                    Jogador
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    tipoUsuario === 'arena' && styles.radioButtonSelected
                                ]}
                                onPress={() => setTipoUsuario('arena')}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={tipoUsuario === 'arena' ? 'radio-button-on' : 'radio-button-off'}
                                    size={20}
                                    color={tipoUsuario === 'arena' ? '#FFD300' : '#666666'}
                                />
                                <Text style={[
                                    styles.radioLabel,
                                    tipoUsuario === 'arena' && styles.radioLabelSelected
                                ]}>
                                    Arena
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    tipoUsuario === 'professor' && styles.radioButtonSelected
                                ]}
                                onPress={() => setTipoUsuario('professor')}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={tipoUsuario === 'professor' ? 'radio-button-on' : 'radio-button-off'}
                                    size={20}
                                    color={tipoUsuario === 'professor' ? '#FFD300' : '#666666'}
                                />
                                <Text style={[
                                    styles.radioLabel,
                                    tipoUsuario === 'professor' && styles.radioLabelSelected
                                ]}>
                                    Professor
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="lock-closed" size={16} color="#FFD300" /> Senha
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#666666"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="lock-closed" size={16} color="#FFD300" /> Confirmar Senha
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha novamente"
                                placeholderTextColor="#666666"
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#000000" size="small" />
                                <Text style={[styles.buttonText, { marginLeft: 10 }]}>Cadastrando...</Text>
                            </View>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#000000" />
                                <Text style={styles.buttonText}>Cadastrar</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Já tem uma conta?</Text>
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.linkText, loading && styles.linkDisabled]}>
                                Fazer Login
                            </Text>
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
        backgroundColor: '#0a0a0a',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoContainer: {
        marginBottom: Spacing.lg,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
    },
    form: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.card,
        padding: Spacing.xl,
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
    radioGroup: {
        gap: Spacing.sm,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.input,
        backgroundColor: '#2a2a2a',
    },
    radioButtonSelected: {
        borderColor: '#FFD300',
        backgroundColor: '#2a2a2a',
    },
    radioLabel: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    radioLabelSelected: {
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFD300',
    },
    button: {
        backgroundColor: '#FFD300',
        borderRadius: BorderRadius.button,
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    buttonText: {
        color: '#000000',
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
        gap: Spacing.xs,
    },
    footerText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
    },
    linkText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#FFD300',
        fontWeight: Typography.fonts.headingWeight,
    },
    linkDisabled: {
        opacity: 0.5,
    },
});