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
    Modal,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomSelect from '../../../components/CustomSelect';
import { SolicitacaoRachaService } from '../../../services/solicitacaoRachaService';
import { ArenaService } from '../../../services/arenaService';
import { AmizadeService } from '../../../services/amizadeService';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function CreateSolicitacaoRachaScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingArenas, setLoadingArenas] = useState(true);
    const [arenas, setArenas] = useState([]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePickerInicio, setShowTimePickerInicio] = useState(false);
    const [showTimePickerFim, setShowTimePickerFim] = useState(false);

    const [parceiroModal, setParceiroModal] = useState(false);
    const [parceiro, setParceiro] = useState(null);
    const [amigos, setAmigos] = useState([]);
    const [loadingAmigos, setLoadingAmigos] = useState(false);
    const [searchAmigo, setSearchAmigo] = useState('');

    const [formData, setFormData] = useState({
        arena_id: '',
        data_jogo: new Date(),
        hora_inicio: '',
        hora_fim: '',
        limite_participantes: '',
        valor_estimado: '',
        valor_por_pessoa: '',
        nivel_sugerido: '',
        tipo_inscricao: 'ambos', // 'individual', 'dupla', 'ambos'
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

    const loadAmigos = async () => {
        try {
            setLoadingAmigos(true);
            const result = await AmizadeService.listarAmigos();

            if (result.success) {
                setAmigos(result.data || []);
            }
        } catch (error) {
            console.error('Erro ao carregar amigos:', error);
        } finally {
            setLoadingAmigos(false);
        }
    };

    const handleOpenParceiroModal = () => {
        loadAmigos();
        setParceiroModal(true);
    };

    const handleSelectParceiro = (amigo) => {
        setParceiro(amigo);
        setParceiroModal(false);
        setSearchAmigo('');
    };

    const handleRemoveParceiro = () => {
        setParceiro(null);
    };

    const filteredAmigos = amigos.filter(amigo =>
        amigo.name?.toLowerCase().includes(searchAmigo.toLowerCase()) ||
        amigo.email?.toLowerCase().includes(searchAmigo.toLowerCase())
    );

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

        // Validações de tipo_inscricao
        if (formData.tipo_inscricao === 'dupla' && !parceiro) {
            Alert.alert('Erro', 'Para racha em dupla, é obrigatório selecionar um parceiro');
            return false;
        }

        if (formData.tipo_inscricao === 'individual' && parceiro) {
            Alert.alert('Erro', 'Para racha individual, não é permitido adicionar parceiro');
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
                tipo_inscricao: formData.tipo_inscricao,
            };

            if (parceiro) {
                dataToSend.parceiro_id = parceiro.id;
            }
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
                    parceiro
                        ? 'Solicitação de racha criada com sucesso! Você e seu parceiro formarão uma dupla.'
                        : 'Solicitação de racha criada com sucesso!',
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
                        <CustomSelect
                            value={formData.arena_id}
                            onValueChange={(value) => handleInputChange('arena_id', value)}
                            placeholder="Selecione uma arena"
                            options={[
                                ...arenas.map((arena) => ({
                                    label: `${arena.nome} - ${arena.cidade}/${arena.estado}`,
                                    value: arena.id.toString(),
                                }))
                            ]}
                        />
                    </View>

                    {/* Tipo de Inscrição */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="git-network" size={18} color="#FFD300" /> Tipo de Inscrição
                        </Text>
                        <Text style={styles.helperText}>
                            {formData.tipo_inscricao === 'individual' && 'Apenas inscrições individuais serão permitidas'}
                            {formData.tipo_inscricao === 'dupla' && 'Todos devem se inscrever em dupla'}
                            {formData.tipo_inscricao === 'ambos' && 'Permite inscrições individuais e em dupla'}
                        </Text>
                        <CustomSelect
                            value={formData.tipo_inscricao}
                            onValueChange={(value) => {
                                // Se mudar para individual e já tem parceiro, pedir confirmação
                                if (value === 'individual' && parceiro) {
                                    Alert.alert(
                                        'Atenção',
                                        'Ao selecionar inscrição individual, o parceiro será removido.',
                                        [
                                            {
                                                text: 'Cancelar',
                                                style: 'cancel',
                                            },
                                            {
                                                text: 'Confirmar',
                                                onPress: () => {
                                                    handleRemoveParceiro();
                                                    handleInputChange('tipo_inscricao', value);
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    // Para outros casos, altera normalmente
                                    handleInputChange('tipo_inscricao', value);
                                }
                            }}
                            options={[
                                { label: 'Individual', value: 'individual' },
                                { label: 'Dupla', value: 'dupla' },
                                { label: 'Ambos (Individual ou Dupla)', value: 'ambos' },
                            ]}
                        />
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

                    {/* Parceiro (Dupla) - Só aparece se não for individual */}
                    {formData.tipo_inscricao !== 'individual' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="people-circle" size={18} color="#FFD300" />
                                {' '}Parceiro {formData.tipo_inscricao === 'dupla' ? '(Obrigatório)' : '(Opcional)'}
                            </Text>
                            <Text style={styles.helperText}>
                                {formData.tipo_inscricao === 'dupla'
                                    ? 'Para racha em dupla, você deve selecionar um parceiro para formar sua dupla fixa'
                                    : 'Selecione um amigo para formar uma dupla fixa neste racha'
                                }
                            </Text>

                            {parceiro ? (
                                <View style={styles.parceiroCard}>
                                    <View style={styles.parceiroInfo}>
                                        <Ionicons name="person-circle" size={40} color="#FFD300" />
                                        <View style={styles.parceiroDetails}>
                                            <Text style={styles.parceiroName}>{parceiro.name}</Text>
                                            <Text style={styles.parceiroEmail}>{parceiro.email}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={handleRemoveParceiro}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.selectParceiroButton}
                                    onPress={handleOpenParceiroModal}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color="#FFD300" />
                                    <Text style={styles.selectParceiroText}>Selecionar Parceiro</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

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

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nível Sugerido</Text>
                            <CustomSelect
                                value={formData.nivel_sugerido}
                                onValueChange={(value) => handleInputChange('nivel_sugerido', value)}
                                placeholder="Qualquer nível"
                                options={[
                                    { label: 'Qualquer nível', value: '' },
                                    { label: 'Iniciante', value: 'iniciante' },
                                    { label: 'Intermediário', value: 'intermediario' },
                                    { label: 'Avançado', value: 'avancado' },
                                    { label: 'Profissional', value: 'profissional' },
                                    { label: 'Misto', value: 'misto' },
                                ]}
                            />
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

            {/* Modal de Seleção de Parceiro */}
            <Modal
                visible={parceiroModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setParceiroModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Parceiro</Text>
                            <TouchableOpacity onPress={() => setParceiroModal(false)}>
                                <Ionicons name="close" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#999999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar amigo..."
                                placeholderTextColor="#666666"
                                value={searchAmigo}
                                onChangeText={setSearchAmigo}
                            />
                        </View>

                        {loadingAmigos ? (
                            <View style={styles.modalLoadingContainer}>
                                <ActivityIndicator size="large" color="#FFD300" />
                                <Text style={styles.loadingText}>Carregando amigos...</Text>
                            </View>
                        ) : filteredAmigos.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={48} color="#666666" />
                                <Text style={styles.emptyText}>
                                    {searchAmigo ? 'Nenhum amigo encontrado' : 'Você ainda não tem amigos'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredAmigos}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.amigoItem}
                                        onPress={() => handleSelectParceiro(item)}
                                    >
                                        <Ionicons name="person-circle" size={40} color="#FFD300" />
                                        <View style={styles.amigoInfo}>
                                            <Text style={styles.amigoName}>{item.name}</Text>
                                            <Text style={styles.amigoEmail}>{item.email}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color="#999999" />
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.amigosList}
                            />
                        )}
                    </View>
                </View>
            </Modal>
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
    helperText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginBottom: Spacing.sm,
    },
    parceiroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2a2a2a',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    parceiroInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    parceiroDetails: {
        flex: 1,
    },
    parceiroName: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    parceiroEmail: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    removeButton: {
        padding: Spacing.xs,
    },
    selectParceiroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderStyle: 'dashed',
        gap: Spacing.sm,
    },
    selectParceiroText: {
        fontSize: Typography.sizes.body,
        color: '#FFD300',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        margin: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    modalLoadingContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
    },
    amigosList: {
        padding: Spacing.md,
    },
    amigoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    amigoInfo: {
        flex: 1,
    },
    amigoName: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    amigoEmail: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
});