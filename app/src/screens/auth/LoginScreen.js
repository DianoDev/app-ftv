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
    SafeAreaView,
    Image,
} from 'react-native';
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
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color="#FFD300"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                placeholderTextColor="#666"
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
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color="#FFD300"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#666"
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
                                    name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'}
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
                                <ActivityIndicator color="#000" size="small"/>
                                <Text style={[styles.buttonText, {marginLeft: 10}]}>
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
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color="#FFD300"
                        style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                        Seus dados estão seguros conosco
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: Spacing.xl,
    },

    header: {
        alignItems: "center",
        marginBottom: Spacing.xxl,
    },

    logoContainer: {
        marginBottom: Spacing.lg,
        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        width: 200,
        height: 200,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFD300",
        marginBottom: Spacing.xs,
        textAlign: "center",
        letterSpacing: 0.5,
    },

    subtitle: {
        fontSize: 15,
        color: "#999",
        textAlign: "center",
        letterSpacing: 0.3,
    },

    form: {
        backgroundColor: "#0a0a0a",
        borderRadius: 20,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: "#1a1a1a",
        shadowColor: "#FFD300",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },

    inputGroup: {
        marginBottom: Spacing.lg,
    },

    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFD300",
        marginBottom: Spacing.sm,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        borderWidth: 1.5,
        borderColor: "#222",
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        height: 52,
    },

    inputIcon: {
        marginRight: Spacing.sm,
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: "#FFF",
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        borderWidth: 1.5,
        borderColor: "#222",
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        height: 52,
    },

    passwordInput: {
        flex: 1,
        fontSize: 15,
        color: "#FFF",
    },

    eyeButton: {
        padding: Spacing.xs,
    },

    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: Spacing.lg,
        marginTop: -Spacing.xs,
    },

    forgotPasswordText: {
        color: "#FFD300",
        fontSize: 13,
        fontWeight: "600",
    },

    button: {
        backgroundColor: "#FFD300",
        borderRadius: 12,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.sm,
        shadowColor: "#FFD300",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.lg,
        gap: Spacing.xs,
    },

    footerText: {
        fontSize: 14,
        color: "#999",
    },

    linkText: {
        fontSize: 14,
        color: "#FFD300",
        fontWeight: "700",
        textDecorationLine: "underline",
    },

    linkDisabled: {
        opacity: 0.5,
    },

    infoBox: {
        marginTop: Spacing.xl,
        backgroundColor: "#0a0a0a",
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#1a1a1a",
        flexDirection: "row",
        alignItems: "center",
    },

    infoIcon: {
        marginRight: Spacing.sm,
    },

    infoText: {
        flex: 1,
        fontSize: 12,
        color: "#999",
        letterSpacing: 0.3,
    },
});