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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { apiRequest } from '../../config/api.config';
import { StorageService } from '../../services/storage';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleLogin = async () => {
        // Validações
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erro', 'Por favor, insira um email válido');
            return;
        }

        setLoading(true);

        try {
            console.log('🔐 Iniciando login...');

            const data = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: senha,
                }),
            });

            console.log('✅ Login realizado com sucesso:', data);

            // Extrair dados do usuário
            const user = data.data.user;
            const tipoUsuario = user.tipo_usuario;

            console.log('👤 data:', data.data.token);

            await StorageService.saveUser(user);
            await StorageService.saveToken(data.data.token);

            // Redirecionar baseado no tipo de usuário
            let rota = '';

            switch (tipoUsuario) {
                case 'arena':
                    rota = '/src/screens/user_arena/HomeScreen';
                    break;
                case 'jogador':
                    rota = '/src/screens/user_jogador/HomeScreen';
                    break;
                case 'professor':
                    rota = '/src/screens/user_professor/HomeScreen';
                    break;
                default:
                    console.warn('⚠️ Tipo de usuário desconhecido:', tipoUsuario);
                    Alert.alert('Erro', 'Tipo de usuário não reconhecido');
                    return;
            }

            console.log('📍 Redirecionando para:', rota);

            // Limpar campos
            setEmail('');
            setSenha('');

            // Usar replace para não permitir voltar à tela de login
            router.replace(rota);

        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);

            let errorMessage = 'Não foi possível realizar o login';

            if (error.message.includes('401')) {
                errorMessage = 'Email ou senha incorretos';
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
            } else if (error.message.includes('Timeout')) {
                errorMessage = 'A requisição demorou muito tempo. Tente novamente.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Erro ao fazer login', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEsqueceuSenha = () => {
        Alert.alert(
            'Recuperar Senha',
            'Funcionalidade em desenvolvimento',
            [{ text: 'OK' }]
        );
    };

    const handleCadastro = () => {
        router.push('/register');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Bem-vindo</Text>
                    <Text style={styles.subtitle}>Faça login para continuar</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#999"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry={!mostrarSenha}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setMostrarSenha(!mostrarSenha)}
                                disabled={loading}
                            >
                                <Text style={styles.eyeIcon}>
                                    {mostrarSenha ? '👁️' : '👁️‍🗨️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={handleEsqueceuSenha}
                        disabled={loading}
                    >
                        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                                    Entrando...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Não tem uma conta?</Text>
                        <TouchableOpacity
                            disabled={loading}
                            activeOpacity={0.7}
                            onPress={handleCadastro}
                        >
                            <Text style={[styles.linkText, loading && styles.linkDisabled]}>
                                Cadastre-se
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        💡 Use suas credenciais cadastradas para entrar
                    </Text>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
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
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1b1b18',
    },
    eyeButton: {
        padding: 12,
    },
    eyeIcon: {
        fontSize: 20,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#99c9ff',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 4,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    linkText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    linkDisabled: {
        color: '#99c9ff',
    },
    infoBox: {
        marginTop: 20,
        backgroundColor: '#fff3e0',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffb74d',
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});