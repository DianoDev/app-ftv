import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const TestApiConnection = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Configuração da URL base da API
    // Para Android Emulator use: http://10.0.2.2:8000
    // Para iOS Simulator use: http://localhost:8000
    // Para dispositivo físico use o IP da sua máquina na rede local
    const API_BASE_URL = 'http://10.0.2.2:8000'; // Ajuste conforme necessário

    const testConnection = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            console.log('Tentando conectar em:', `${API_BASE_URL}/api/teste`);

            const result = await fetch(`${API_BASE_URL}/api/teste`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            console.log('Status da resposta:', result.status);

            if (!result.ok) {
                throw new Error(`HTTP Error: ${result.status}`);
            }

            const data = await result.json();
            console.log('Dados recebidos:', data);

            setResponse(data);
        } catch (err: any) {
            console.error('Erro na conexão:', err);
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Teste de Conexão API</Text>
                    <Text style={styles.subtitle}>Laravel Backend → React Native</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Endpoint:</Text>
                    <Text style={styles.infoText}>{API_BASE_URL}/api/teste</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={testConnection}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Testar Conexão</Text>
                    )}
                </TouchableOpacity>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorTitle}>❌ Erro de Conexão</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <Text style={styles.helpText}>
                            Verifique se:{'\n'}
                            • O container Docker está rodando{'\n'}
                            • O Laravel está em http://localhost:8000{'\n'}
                            • A URL está correta para seu ambiente{'\n'}
                            • O CORS está configurado no Laravel
                        </Text>
                    </View>
                )}

                {response && (
                    <View style={styles.successBox}>
                        <Text style={styles.successTitle}>✅ Conexão Bem-Sucedida!</Text>
                        <Text style={styles.responseLabel}>Resposta da API:</Text>
                        <View style={styles.responseBox}>
                            <Text style={styles.responseText}>
                                {JSON.stringify(response, null, 2)}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.tipsBox}>
                    <Text style={styles.tipsTitle}>💡 Dicas de Configuração:</Text>
                    <Text style={styles.tipsText}>
                        <Text style={styles.bold}>Android Emulator:</Text> {'\n'}
                        Use http://10.0.2.2:8000{'\n\n'}

                        <Text style={styles.bold}>iOS Simulator:</Text> {'\n'}
                        Use http://localhost:8000{'\n\n'}

                        <Text style={styles.bold}>Dispositivo Físico:</Text> {'\n'}
                        Use o IP local da sua máquina{'\n'}
                        Ex: http://192.168.1.100:8000
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    infoBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600',
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorBox: {
        backgroundColor: '#ffebee',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ef5350',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#c62828',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: '#c62828',
        marginBottom: 10,
        fontFamily: 'monospace',
    },
    helpText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    successBox: {
        backgroundColor: '#e8f5e9',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#66bb6a',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 10,
    },
    responseLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600',
    },
    responseBox: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
    },
    responseText: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'monospace',
    },
    tipsBox: {
        backgroundColor: '#fff3e0',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffb74d',
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e65100',
        marginBottom: 10,
    },
    tipsText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },
});

export default TestApiConnection;