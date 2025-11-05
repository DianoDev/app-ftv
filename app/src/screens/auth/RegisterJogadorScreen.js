import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function RegisterJogador() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);

    const testarConexao = async () => {
        setLoading(true);
        setError(null);
        setApiResponse(null);

        try {
            console.log('Iniciando requisição para API...');

            const response = await axios.get('http://localhost:8000/api/teste', {
                timeout: 5000, // 5 segundos de timeout
            });

            console.log('Resposta recebida:', response.data);
            setApiResponse(response.data);
            Alert.alert('Sucesso! 🎉', `Resposta da API: ${response.data}`);

        } catch (err) {
            console.error('Erro na requisição:', err);

            let errorMessage = 'Erro desconhecido';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Timeout: A API demorou muito para responder';
            } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network')) {
                errorMessage = 'Erro de rede: Verifique se a API está rodando e se você está usando o IP correto';
            } else if (err.response) {
                errorMessage = `Erro ${err.response.status}: ${err.response.data}`;
            } else {
                errorMessage = err.message;
            }

            setError(errorMessage);
            Alert.alert('Erro na conexão ❌', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Cadastro de Jogador 🏐</Text>
                <Text style={styles.subtitle}>Teste de Conexão com API</Text>
            </View>

            <View style={styles.testContainer}>
                <TouchableOpacity
                    style={[styles.testButton, loading && styles.testButtonDisabled]}
                    onPress={testarConexao}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.testButtonText}>Testar Conexão com API</Text>
                    )}
                </TouchableOpacity>

                {apiResponse && (
                    <View style={styles.successBox}>
                        <Text style={styles.successTitle}>✅ Conexão bem-sucedida!</Text>
                        <Text style={styles.responseText}>Resposta da API:</Text>
                        <View style={styles.responseBox}>
                            <Text style={styles.responseData}>
                                {typeof apiResponse === 'string'
                                    ? apiResponse
                                    : JSON.stringify(apiResponse, null, 2)}
                            </Text>
                        </View>
                    </View>
                )}

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorTitle}>❌ Erro na conexão</Text>
                        <Text style={styles.errorText}>{error}</Text>

                        <View style={styles.tipsBox}>
                            <Text style={styles.tipsTitle}>💡 Dicas para resolver:</Text>
                            <Text style={styles.tipText}>
                                • Se estiver no Android: use o IP da sua máquina (ex: http://192.168.1.10:8000)
                            </Text>
                            <Text style={styles.tipText}>
                                • Se estiver no iOS: localhost pode não funcionar, use o IP
                            </Text>
                            <Text style={styles.tipText}>
                                • Verifique se a API está rodando: abra http://localhost:8000/api/teste no navegador
                            </Text>
                            <Text style={styles.tipText}>
                                • Verifique se o CORS está habilitado no backend
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>ℹ️ Informações</Text>
                <Text style={styles.infoText}>Endpoint: http://localhost:8000/api/teste</Text>
                <Text style={styles.infoText}>Método: GET</Text>
                <Text style={styles.infoText}>Resposta esperada: "oi"</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginTop: 40,
        marginBottom: 30,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    testContainer: {
        marginBottom: 30,
    },
    testButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    testButtonDisabled: {
        backgroundColor: '#90CAF9',
    },
    testButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    successBox: {
        marginTop: 20,
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    successTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 12,
    },
    responseText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    responseBox: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    responseData: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'monospace',
    },
    errorBox: {
        marginTop: 20,
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C62828',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#D32F2F',
        marginBottom: 16,
        lineHeight: 20,
    },
    tipsBox: {
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#EF6C00',
        marginBottom: 6,
        lineHeight: 18,
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1565C0',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#1976D2',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
});