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
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SolicitacaoRachaService } from '../../../services/solicitacaoRachaService';
import { ArenaService } from '../../../services/arenaService';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function CreateSolicitacaoRachaScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingArenas, setLoadingArenas] = useState(true);
    const [arenas, setArenas] = useState([]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePickerInicio, setShowTimePickerInicio] = useState(false);
    const [showTimePickerFim, setShowTimePickerFim] = useState(false);

    const [formData, setFormData] = useState({
        arena_id: '',
        data_jogo: new Date(),
        hora_inicio: '',
        hora_fim: '',
        limite_participantes: '',
        valor_estimado: '',
        valor_por_pessoa: '',
        nivel_sugerido: '',
        descricao: '',
        observacoes: '',
    });

    useEffect(() => {
        loadArenas();
    }, []);

    const loadArenas = async () => {
        try {
            setLoadingArenas(true);
            const result = await ArenaService.listArenas({ perPage: 100 });

            if (result.success) {
                setArenas(result.data.data || []);
            } else {
                Alert.alert('Erro', 'Não foi possível carregar as arenas');
            }
        } catch (error) {
            console.error('Erro ao carregar arenas:', error);
            Alert.alert('Erro', 'Erro ao carregar arenas');
        } finally {
            setLoadingArenas(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDateToBR = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateToAPI = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            handleInputChange('data_jogo', selectedDate);
        }
    };

    const onChangeTimeInicio = (event, selectedTime) => {
        setShowTimePickerInicio(Platform.OS === 'ios');
        if (selectedTime) {
            const timeString = formatTime(selectedTime);
            handleInputChange('hora_inicio', timeString);
        }
    };

    const onChangeTimeFim = (event, selectedTime) => {
        setShowTimePickerFim(Platform.OS === 'ios');
        if (selectedTime) {
            const timeString = formatTime(selectedTime);
            handleInputChange('hora_fim', timeString);
        }
    };

    const validateForm = () => {
        if (!formData.arena_id) {
            Alert.alert('Erro', 'Selecione uma arena');
            return false;
        }

        if (!formData.hora_inicio) {
            Alert.alert('Erro', 'Informe a hora de início');
            return false;
        }

        if (!formData.hora_fim) {
            Alert.alert('Erro', 'Informe a hora de fim');
            return false;
        }

        if (!formData.limite_participantes || parseInt(formData.limite_participantes) < 2) {
            Alert.alert('Erro', 'Informe o limite de participantes (mínimo 2)');
            return false;
        }

        if (formData.hora_inicio >= formData.hora_fim) {
            Alert.alert('Erro', 'A hora de fim deve ser posterior à hora de início');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const dataToSend = {
                arena_id: parseInt(formData.arena_id),
                data_jogo: formatDateToAPI(formData.data_jogo),
                hora_inicio: formData.hora_inicio,
                hora_fim: formData.hora_fim,
                limite_participantes: parseInt(formData.limite_participantes),
            };

            if (formData.valor_estimado) {
                dataToSend.valor_estimado = parseFloat(formData.valor_estimado);
            }
            if (formData.valor_por_pessoa) {
                dataToSend.valor_por_pessoa = parseFloat(formData.valor_por_pessoa);
            }
            if (formData.nivel_sugerido) {
                dataToSend.nivel_sugerido = formData.nivel_sugerido;
            }
            if (formData.descricao) {
                dataToSend.descricao = formData.descricao;
            }
            if (formData.observacoes) {
                dataToSend.observacoes = formData.observacoes;
            }

            const result = await SolicitacaoRachaService.createSolicitacao(dataToSend);

            if (result.success) {
                Alert.alert(
                    'Sucesso!',
                    'Solicitação de racha criada com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back()
                        }
                    ]
                );
            } else {
                Alert.alert('Erro', result.message || 'Erro ao criar solicitação');
            }
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            Alert.alert('Erro', 'Erro ao criar solicitação de racha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Solicitação</Text>
                <View style={styles.headerRight} />
            </View>

            {loadingArenas ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando arenas...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Arena */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="location" size={18} color="#FFD300" /> Arena
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.arena_id}
                                onValueChange={(value) => handleInputChange('arena_id', value)}
                                style={styles.picker}
                                dropdownIconColor="#FFD300"
                            >
                                <Picker.Item label="Selecione uma arena" value="" color="#999999" />
                                {arenas.map((arena) => (
                                    <Picker.Item
                                        key={arena.id}
                                        label={`${arena.nome} - ${arena.cidade}/${arena.estado}`}
                                        value={arena.id.toString()}
                                        color="#FFFFFF"
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Data e Horário */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="calendar" size={18} color="#FFD300" /> Data e Horário
                        </Text>

                        {/* Data */}
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#FFD300" />
                            <Text style={styles.dateButtonText}>
                                {formatDateToBR(formData.data_jogo)}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.data_jogo}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                                minimumDate={new Date()}
                            />
                        )}

                        {/* Horários */}
                        <View style={styles.timeContainer}>
                            <View style={styles.timeInputContainer}>
                                <Text style={styles.label}>Hora Início *</Text>
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => setShowTimePickerInicio(true)}
                                >
                                    <Ionicons name="time-outline" size={20} color="#FFD300" />
                                    <Text style={styles.timeButtonText}>
                                        {formData.hora_inicio || 'HH:MM'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.timeInputContainer}>
                                <Text style={styles.label}>Hora Fim *</Text>
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => setShowTimePickerFim(true)}
                                >
                                    <Ionicons name="time-outline" size={20} color="#FFD300" />
                                    <Text style={styles.timeButtonText}>
                                        {formData.hora_fim || 'HH:MM'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showTimePickerInicio && (
                            <DateTimePicker
                                value={new Date()}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onChangeTimeInicio}
                            />
                        )}

                        {showTimePickerFim && (
                            <DateTimePicker
                                value={new Date()}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onChangeTimeFim}
                            />
                        )}
                    </View>

                    {/* Participantes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="people" size={18} color="#FFD300" /> Participantes
                        </Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Limite de Participantes *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 10"
                                placeholderTextColor="#666666"
                                value={formData.limite_participantes}
                                onChangeText={(value) => handleInputChange('limite_participantes', value)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Nível Sugerido</Text>
                            <Picker
                                selectedValue={formData.nivel_sugerido}
                                onValueChange={(value) => handleInputChange('nivel_sugerido', value)}
                                style={styles.picker}
                                dropdownIconColor="#FFD300"
                            >
                                <Picker.Item label="Qualquer nível" value="" color="#999999" />
                                <Picker.Item label="Iniciante" value="iniciante" color="#FFFFFF" />
                                <Picker.Item label="Intermediário" value="intermediario" color="#FFFFFF" />
                                <Picker.Item label="Avançado" value="avancado" color="#FFFFFF" />
                                <Picker.Item label="Profissional" value="profissional" color="#FFFFFF" />
                                <Picker.Item label="Misto" value="misto" color="#FFFFFF" />
                            </Picker>
                        </View>
                    </View>

                    {/* Valores */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="cash" size={18} color="#FFD300" /> Valores (opcional)
                        </Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Valor Total Estimado</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 200.00"
                                placeholderTextColor="#666666"
                                value={formData.valor_estimado}
                                onChangeText={(value) => handleInputChange('valor_estimado', value)}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Valor por Pessoa</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 25.00"
                                placeholderTextColor="#666666"
                                value={formData.valor_por_pessoa}
                                onChangeText={(value) => handleInputChange('valor_por_pessoa', value)}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    {/* Descrição */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="document-text" size={18} color="#FFD300" /> Informações Adicionais
                        </Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descreva brevemente o racha..."
                                placeholderTextColor="#666666"
                                value={formData.descricao}
                                onChangeText={(value) => handleInputChange('descricao', value)}
                                multiline
                                numberOfLines={3}
                                maxLength={500}
                            />
                            <Text style={styles.charCount}>{formData.descricao.length}/500</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Observações</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Observações importantes (ex: trazer bola, vestiário, etc)..."
                                placeholderTextColor="#666666"
                                value={formData.observacoes}
                                onChangeText={(value) => handleInputChange('observacoes', value)}
                                multiline
                                numberOfLines={3}
                                maxLength={1000}
                            />
                            <Text style={styles.charCount}>{formData.observacoes.length}/1000</Text>
                        </View>
                    </View>

                    {/* Botão Criar */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#000000" />
                                <Text style={styles.submitButtonText}>Criar Solicitação</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    headerRight: {
        width: 40,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    section: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.md,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: Spacing.sm,
    },
    charCount: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'right',
        marginTop: Spacing.xxs,
    },
    pickerContainer: {
        marginBottom: Spacing.sm,
    },
    picker: {
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.md,
        color: '#FFFFFF',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    dateButtonText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    timeContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    timeInputContainer: {
        flex: 1,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    timeButtonText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    submitButton: {
        backgroundColor: '#FFD300',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        marginTop: Spacing.md,
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
        fontSize: 16,
        color: '#000000',
        fontWeight: '600',
    },
    bottomSpacer: {
        height: Spacing.xl,
    },
});