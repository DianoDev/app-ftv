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
                        rota = '/src/screens/user_jogador/HomeScreen';
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
            <StatusBar style="dark"/>
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
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={styles.title}>Bem-vindo ao FTV APP</Text>
                    <Text style={styles.subtitle}>Faça login para continuar</Text>
                </View>

                <View style={styles.form}>
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
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={Colors.neutral.charcoal}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Digite sua senha"
                                placeholderTextColor={Colors.neutral.charcoal}
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
                                    color={Colors.neutral.charcoal}
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
                                <ActivityIndicator color="#fff" size="small"/>
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
                        name="information-circle"
                        size={20}
                        color={Colors.accent.coral}
                        style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                        Use suas credenciais cadastradas para entrar
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000", // fundo preto total
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: Spacing.xl,
    },

    header: {
        alignItems: "center",
        marginBottom: Spacing.xxxl,
    },

    title: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: "#FFD300", // amarelo neon
        marginBottom: Spacing.xs,
        textAlign: "center",
    },

    subtitle: {
        fontSize: Typography.sizes.body,
        color: "#CCCCCC",
        textAlign: "center",
    },

    form: {
        backgroundColor: "#111111",
        borderRadius: BorderRadius.card,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: "#FFD30055",
    },

    label: {
        fontSize: Typography.sizes.label,
        fontWeight: Typography.fonts.headingWeight,
        color: "#FFD300",
        marginBottom: Spacing.sm,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        borderWidth: 1,
        borderColor: "#FFD300",
        borderRadius: BorderRadius.input,
        paddingHorizontal: Spacing.md,
    },

    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.body,
        color: "#FFF",
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        borderWidth: 1,
        borderColor: "#FFD300",
        borderRadius: BorderRadius.input,
        paddingHorizontal: Spacing.md,
    },

    forgotPasswordText: {
        color: "#FFD300",
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
    },

    button: {
        backgroundColor: "#FFD300",
        borderRadius: BorderRadius.button,
        padding: Spacing.base,
        alignItems: "center",
        marginTop: Spacing.sm,
    },

    buttonText: {
        color: "#000",
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },

    footerText: {
        fontSize: Typography.sizes.bodySmall,
        color: "#FFF",
    },

    linkText: {
        fontSize: Typography.sizes.bodySmall,
        color: "#FFD300",
        fontWeight: Typography.fonts.headingWeight,
    },

    infoBox: {
        marginTop: Spacing.lg,
        backgroundColor: "#0d0d0d",
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: "#FFD300",
        flexDirection: "row",
        alignItems: "center",
    },

    infoText: {
        flex: 1,
        fontSize: Typography.sizes.caption,
        color: "#FFF",
    },
});
