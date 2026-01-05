import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {apiRequest} from '../../config/api.config';
import {StorageService} from '../../services/storage';
import {Colors, Typography, Spacing, BorderRadius, ComponentStyles} from '../../styles/theme';

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
            console.log(data.data.user,'data.data.user.subtipo')
            if (data.data.user.subtipo === null) {
                switch (tipoUsuario) {
                    case 'arena':
                        rota = '/src/screens/user_arena/arena/CreateArenaScreen';
                        break;
                    case 'jogador':
                        rota = '/src/screens/user_jogador/jogador/CreateJogadorScreen';
                        break;
                    case 'professor':
                        rota = '/src/screens/user_professor/professor/CreateProfessorScreen';
                        break;
                    default:
                        console.warn('⚠️ Tipo de usuário desconhecido:', tipoUsuario);
                        Alert.alert('Erro', 'Tipo de usuário não reconhecido');
                        return;
                }
            } else {
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
            [{text: 'OK'}]
        );
    };

    const handleCadastro = () => {
        router.push('/src/screens/auth/RegisterScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light"/>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Bem-vindo de volta!</Text>
                    <Text style={styles.subtitle}>Entre para continuar sua jornada</Text>
                </View>

                <View style={styles.form}>
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
                            <Ionicons name="lock-closed" size={16} color="#FFD300" /> Senha
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#666666"
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
                                <Ionicons
                                    name={mostrarSenha ? 'eye' : 'eye-off'}
                                    size={20}
                                    color="#FFD300"
                                />
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
                                <ActivityIndicator color="#000000" size="small"/>
                                <Text style={[styles.buttonText, {marginLeft: 10}]}>
                                    Entrando...
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Ionicons name="log-in" size={20} color="#000000" />
                                <Text style={styles.buttonText}>Entrar</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Não tem uma conta?</Text>
                        <TouchableOpacity
                            disabled={loading}
                            activeOpacity={0.8}
                            onPress={handleCadastro}
                        >
                            <Text style={[styles.linkText, loading && styles.linkDisabled]}>
                                Cadastre-se
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
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    logo: {
        width: 200,
        height: 200,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.input,
        paddingHorizontal: Spacing.md,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    eyeButton: {
        padding: Spacing.xs,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.md,
        marginTop: -Spacing.xs,
    },
    forgotPasswordText: {
        color: '#FFD300',
        fontSize: Typography.sizes.small,
        fontWeight: Typography.fonts.headingWeight,
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