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
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles, Icons } from '../../styles/theme';
export default function RegisterScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('jogador');
    const [loading, setLoading] = useState(false);
    const handleLogin = () => {
        router.push( '/src/screens/auth/LoginScreen');
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
                            handleLogin()
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
            <StatusBar style="dark" />
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
                        <Text style={styles.label}>Nome Completo</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu nome"
                                placeholderTextColor={Colors.neutral.charcoal}
                                value={nome}
                                onChangeText={setNome}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                placeholderTextColor={Colors.neutral.charcoal}
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
                        <Text style={styles.label}>Tipo de Usuário</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={[styles.radioButton, tipoUsuario === 'jogador' && styles.radioButtonSelected]}
                                onPress={() => setTipoUsuario('jogador')}
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={tipoUsuario === 'jogador' ? 'radio-button-on' : 'radio-button-off'}
                                    size={24}
                                    color={tipoUsuario === 'jogador' ? Colors.primary.mikasaBright : Colors.neutral.charcoal}
                                />
                                <Text style={[styles.radioLabel, tipoUsuario === 'jogador' && styles.radioLabelSelected]}>Jogador</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.radioButton, tipoUsuario === 'arena' && styles.radioButtonSelected]}
                                onPress={() => setTipoUsuario('arena')}
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={tipoUsuario === 'arena' ? 'radio-button-on' : 'radio-button-off'}
                                    size={24}
                                    color={tipoUsuario === 'arena' ? Colors.primary.mikasaBright : Colors.neutral.charcoal}
                                />
                                <Text style={[styles.radioLabel, tipoUsuario === 'arena' && styles.radioLabelSelected]}>Arena</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.radioButton, tipoUsuario === 'professor' && styles.radioButtonSelected]}
                                onPress={() => setTipoUsuario('professor')}
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={tipoUsuario === 'professor' ? 'radio-button-on' : 'radio-button-off'}
                                    size={24}
                                    color={tipoUsuario === 'professor' ? Colors.primary.mikasaBright : Colors.neutral.charcoal}
                                />
                                <Text style={[styles.radioLabel, tipoUsuario === 'professor' && styles.radioLabelSelected]}>Professor</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha"
                                placeholderTextColor={Colors.neutral.charcoal}
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Senha</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha novamente"
                                placeholderTextColor={Colors.neutral.charcoal}
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
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={[styles.buttonText, { marginLeft: 10 }]}>Cadastrando...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Já tem uma conta?</Text>
                        <TouchableOpacity disabled={loading} activeOpacity={0.7}>
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
        backgroundColor: Colors.neutral.sandLight,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    logoContainer: {
        marginBottom: Spacing.lg,
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
    },
    form: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.xl,
        ...ComponentStyles.card,
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
    radioGroup: {
        flexDirection: 'column',
        gap: Spacing.md,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.neutral.greyLight,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.neutral.white,
    },
    radioButtonSelected: {
        borderColor: Colors.primary.mikasaBright,
        backgroundColor: `${Colors.primary.mikasaBright}10`,
    },
    radioLabel: {
        fontSize: Typography.sizes.body,
        color: Colors.neutral.navyDeep,
    },
    radioLabelSelected: {
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
    },
    button: {
        backgroundColor: Colors.primary.mikasaBright,
        borderRadius: BorderRadius.button,
        padding: Spacing.base,
        alignItems: 'center',
        marginTop: Spacing.sm,
        ...ComponentStyles.buttonPrimary,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.neutral.navyDeep,
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
        color: Colors.neutral.charcoal,
    },
    linkText: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.secondary.ocean,
        fontWeight: Typography.fonts.headingWeight,
    },
    linkDisabled: {
        opacity: 0.5,
    },
});