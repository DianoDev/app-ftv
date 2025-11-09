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
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { formatDate, dateToISO } from '../../../utils/formatters';
import { validateDate } from '../../../utils/validators';

export default function CreateCampeonatoScreen() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [tipo, setTipo] = useState('');
    const [regras, setRegras] = useState('');

    const handleDataInicioChange = (text) => {
        const formatted = formatDate(text);
        setDataInicio(formatted);
    };

    const handleDataFimChange = (text) => {
        const formatted = formatDate(text);
        setDataFim(formatted);
    };

    const validateForm = () => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o nome do campeonato');
            return false;
        }

        if (!dataInicio.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a data de início');
            return false;
        }

        if (!validateDate(dataInicio)) {
            Alert.alert('Atenção', 'Data de início inválida. Use o formato DD/MM/AAAA');
            return false;
        }

        if (!dataFim.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a data de fim');
            return false;
        }

        if (!validateDate(dataFim)) {
            Alert.alert('Atenção', 'Data de fim inválida. Use o formato DD/MM/AAAA');
            return false;
        }

        // Validar se data fim é posterior à data início
        const inicio = dateToISO(dataInicio);
        const fim = dateToISO(dataFim);

        if (fim < inicio) {
            Alert.alert('Atenção', 'A data de fim deve ser posterior à data de início');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            const token = await StorageService.getToken();

            // Preparar dados para envio
            const formData = {
                nome: nome.trim(),
                descricao: descricao.trim() || null,
                data_inicio: dateToISO(dataInicio),
                data_fim: dateToISO(dataFim),
                tipo: tipo.trim() || null,
                regras: regras.trim() || null,
                status: 'inscricoes_abertas',
            };

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/campeonatos`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Sucesso',
                    data.message || 'Campeonato criado com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(data.message || 'Erro ao criar campeonato');
            }
        } catch (error) {
            console.error('Erro ao criar campeonato:', error);
            Alert.alert('Erro', error.message || 'Não foi possível criar o campeonato');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Novo Campeonato</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome do Campeonato */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Nome do Campeonato <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Torneio de Verão 2025"
                            value={nome}
                            onChangeText={setNome}
                            maxLength={200}
                        />
                    </View>

                    {/* Descrição */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Descreva o campeonato..."
                            value={descricao}
                            onChangeText={setDescricao}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Datas */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                Data Início <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD/MM/AAAA"
                                value={dataInicio}
                                onChangeText={handleDataInicioChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>
                                Data Fim <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD/MM/AAAA"
                                value={dataFim}
                                onChangeText={handleDataFimChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Tipo */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Eliminatória Simples, Round Robin"
                            value={tipo}
                            onChangeText={setTipo}
                            maxLength={30}
                        />
                    </View>

                    {/* Regras */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Regras</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Descreva as regras do campeonato..."
                            value={regras}
                            onChangeText={setRegras}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            Após criar o campeonato, você poderá adicionar categorias e definir premiações.
                        </Text>
                    </View>

                    {/* Botões */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => router.back()}
                            disabled={saving}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Criar Campeonato</Text>
                            )}
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
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginBottom: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1b1b18',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 8,
    },
    required: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#1b1b18',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#34C759',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});