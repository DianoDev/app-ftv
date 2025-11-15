import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SolicitacaoRachaService } from '../../../services/solicitacaoRachaService';
import { ArenaService } from '../../../services/arenaService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function SolicitacaoDetailScreen() {
    const router = useRouter();
    const { solicitacaoId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [solicitacao, setSolicitacao] = useState(null);
    const [isParticipating, setIsParticipating] = useState(false);
    const [isCriador, setIsCriador] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [jogadoresDisponiveis, setJogadoresDisponiveis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingJogadores, setLoadingJogadores] = useState(false);

    useEffect(() => {
        loadSolicitacao();
    }, [solicitacaoId]);

    const loadSolicitacao = async () => {
        try {
            setLoading(true);
            const result = await SolicitacaoRachaService.getSolicitacao(solicitacaoId);
            console.log('Resultado completo:', JSON.stringify(result, null, 2));

            if (result.success) {
                // Adaptar estrutura de dados
                const solicitacaoData = result.data.solicitacao || result.data;

                console.log('Solicitação:', solicitacaoData);
                console.log('Arena:', solicitacaoData.arena);
                console.log('Criador:', solicitacaoData.criador);
                console.log('Participantes:', solicitacaoData.participantes);

                // Se arena não veio carregada, buscar separadamente
                if (!solicitacaoData.arena && solicitacaoData.arena_id) {
                    const arenaResult = await ArenaService.getArena(solicitacaoData.arena_id);
                    if (arenaResult.success) {
                        solicitacaoData.arena = arenaResult.data;
                    }
                }

                setSolicitacao(solicitacaoData);
                setIsParticipating(result.data.is_participating || false);
                setIsCriador(result.data.is_criador || false);
            } else {
                Alert.alert('Erro', result.message);
                router.back();
            }
        } catch (error) {
            console.error('Error loading solicitacao:', error);
            Alert.alert('Erro', 'Erro ao carregar detalhes');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const loadJogadoresDisponiveis = async (search = '') => {
        try {
            setLoadingJogadores(true);
            const result = await SolicitacaoRachaService.getJogadoresDisponiveis(solicitacaoId, search);

            if (result.success) {
                setJogadoresDisponiveis(result.data.data || []);
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Error loading jogadores:', error);
        } finally {
            setLoadingJogadores(false);
        }
    };

    const handleParticipar = async () => {
        if (actionLoading) return;

        setActionLoading(true);
        const result = await SolicitacaoRachaService.participar(solicitacaoId);
        setActionLoading(false);

        if (result.success) {
            Alert.alert('Sucesso', result.message);
            loadSolicitacao();
        } else {
            Alert.alert('Erro', result.message);
        }
    };

    const handleSair = async () => {
        if (actionLoading) return;

        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja sair deste racha?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        const result = await SolicitacaoRachaService.sair(solicitacaoId);
                        setActionLoading(false);

                        if (result.success) {
                            Alert.alert('Sucesso', result.message);
                            loadSolicitacao();
                        } else {
                            Alert.alert('Erro', result.message);
                        }
                    }
                }
            ]
        );
    };

    const handleConvidar = async (jogadorId) => {
        const result = await SolicitacaoRachaService.convidar(solicitacaoId, jogadorId);

        if (result.success) {
            Alert.alert('Sucesso', result.message);
            setModalVisible(false);
            loadSolicitacao();
        } else {
            Alert.alert('Erro', result.message);
        }
    };

    const openConvidarModal = () => {
        setModalVisible(true);
        loadJogadoresDisponiveis();
    };

    const handleSearch = () => {
        loadJogadoresDisponiveis(searchTerm);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[date.getDay()];
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'aberta':
                return Colors.status.success;
            case 'confirmada':
                return Colors.primary.mikasaBright;
            case 'cancelada':
                return Colors.status.error;
            case 'concluida':
                return Colors.neutral.charcoal;
            default:
                return Colors.neutral.charcoal;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'aberta':
                return 'Aberta';
            case 'confirmada':
                return 'Confirmada';
            case 'cancelada':
                return 'Cancelada';
            case 'concluida':
                return 'Concluída';
            default:
                return status;
        }
    };

    const renderJogadorItem = ({ item }) => (
        <TouchableOpacity
            style={styles.jogadorItem}
            onPress={() => handleConvidar(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.jogadorAvatar}>
                <Ionicons name="person" size={24} color={Colors.primary.mikasaBright} />
            </View>
            <View style={styles.jogadorInfo}>
                <Text style={styles.jogadorNome}>{item.name}</Text>
                {item.cidade && item.estado && (
                    <Text style={styles.jogadorLocalidade}>
                        {item.cidade}, {item.estado}
                    </Text>
                )}
                {item.nivel_habilidade && (
                    <Text style={styles.jogadorNivel}>{item.nivel_habilidade}</Text>
                )}
            </View>
            <Ionicons name="add-circle" size={24} color={Colors.accent.lime} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.mikasaBright} />
                    <Text style={styles.loadingText}>Carregando detalhes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!solicitacao) {
        return null;
    }

    const totalParticipantes = (solicitacao.participantes?.length || 0) + 1; // +1 para o criador
    const isFull = totalParticipantes >= solicitacao.limite_participantes;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.neutral.deepCharcoal} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalhes do Racha</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Card Principal */}
                <View style={styles.mainCard}>
                    {/* Data e Status */}
                    <View style={styles.dateStatusRow}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateDay}>{formatDate(solicitacao.data_jogo).split('/')[0]}</Text>
                            <Text style={styles.dateMonth}>{formatDate(solicitacao.data_jogo).split('/')[1]}</Text>
                        </View>
                        <View style={styles.dateInfo}>
                            <Text style={styles.dayOfWeek}>{formatDayOfWeek(solicitacao.data_jogo)}</Text>
                            <View style={styles.timeRow}>
                                <Ionicons name="time-outline" size={16} color={Colors.primary.mikasaBright} />
                                <Text style={styles.timeText}>
                                    {solicitacao.hora_inicio} - {solicitacao.hora_fim}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(solicitacao.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(solicitacao.status) }]}>
                                {getStatusLabel(solicitacao.status)}
                            </Text>
                        </View>
                    </View>

                    {/* Arena */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color={Colors.primary.mikasaBright} />
                            <Text style={styles.sectionTitle}>Local</Text>
                        </View>
                        {solicitacao.arena ? (
                            <>
                                <Text style={styles.arenaName}>{solicitacao.arena.nome || 'Arena'}</Text>
                                {solicitacao.arena.endereco && (
                                    <Text style={styles.arenaEndereco}>{solicitacao.arena.endereco}</Text>
                                )}
                                <Text style={styles.arenaLocalidade}>
                                    {solicitacao.arena.cidade || ''}, {solicitacao.arena.estado || ''}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.arenaName}>Arena ID: {solicitacao.arena_id}</Text>
                        )}
                    </View>

                    {/* Descrição */}
                    {solicitacao.descricao && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={20} color={Colors.primary.mikasaBright} />
                                <Text style={styles.sectionTitle}>Descrição</Text>
                            </View>
                            <Text style={styles.descricao}>{solicitacao.descricao}</Text>
                        </View>
                    )}

                    {/* Informações */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoCard}>
                            <Ionicons name="people" size={24} color={Colors.primary.mikasaBright} />
                            <Text style={styles.infoLabel}>Participantes</Text>
                            <Text style={styles.infoValue}>{totalParticipantes}/{solicitacao.limite_participantes}</Text>
                        </View>

                        {solicitacao.nivel_sugerido && (
                            <View style={styles.infoCard}>
                                <Ionicons name="trophy" size={24} color={Colors.status.warning} />
                                <Text style={styles.infoLabel}>Nível</Text>
                                <Text style={styles.infoValue}>{solicitacao.nivel_sugerido}</Text>
                            </View>
                        )}

                        {solicitacao.valor_por_pessoa && (
                            <View style={styles.infoCard}>
                                <Ionicons name="cash" size={24} color={Colors.status.success} />
                                <Text style={styles.infoLabel}>Valor</Text>
                                <Text style={styles.infoValue}>R$ {parseFloat(solicitacao.valor_por_pessoa).toFixed(2)}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Lista de Participantes */}
                <View style={styles.participantesCard}>
                    <View style={styles.participantesHeader}>
                        <Text style={styles.participantesTitle}>Participantes ({totalParticipantes})</Text>
                        {(isCriador || isParticipating) && solicitacao.status === 'aberta' && !isFull && (
                            <TouchableOpacity
                                style={styles.convidarButton}
                                onPress={openConvidarModal}
                            >
                                <Ionicons name="person-add" size={20} color={Colors.neutral.white} />
                                <Text style={styles.convidarButtonText}>Convidar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Criador */}
                    <View style={styles.participanteItem}>
                        <View style={styles.participanteAvatar}>
                            <Ionicons name="person" size={24} color={Colors.primary.mikasaBright} />
                        </View>
                        <View style={styles.participanteInfo}>
                            <Text style={styles.participanteNome}>
                                {solicitacao.criador?.name || `Criador (ID: ${solicitacao.criador_id})`}
                            </Text>
                            <View style={styles.criadorBadge}>
                                <Ionicons name="star" size={12} color={Colors.primary.mikasaBright} />
                                <Text style={styles.criadorText}>Criador</Text>
                            </View>
                        </View>
                    </View>

                    {/* Outros Participantes */}
                    {solicitacao.participantes && Array.isArray(solicitacao.participantes) && solicitacao.participantes.length > 0 ? (
                        solicitacao.participantes.map((participante, index) => (
                            <View key={index} style={styles.participanteItem}>
                                <View style={styles.participanteAvatar}>
                                    <Ionicons name="person" size={24} color={Colors.accent.lime} />
                                </View>
                                <View style={styles.participanteInfo}>
                                    <Text style={styles.participanteNome}>
                                        {participante.usuario?.name || `Jogador (ID: ${participante.usuario_id})`}
                                    </Text>
                                    {participante.status === 'convidado' && (
                                        <Text style={styles.participanteStatus}>Convidado</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : null}
                </View>

                {/* Botão de Ação */}
                {solicitacao.status === 'aberta' && (
                    <View style={styles.actionSection}>
                        {isCriador ? (
                            <View style={styles.creatorInfo}>
                                <Ionicons name="star" size={24} color={Colors.primary.mikasaBright} />
                                <Text style={styles.creatorInfoText}>Você é o criador deste racha</Text>
                            </View>
                        ) : isParticipating ? (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.leaveButton]}
                                onPress={handleSair}
                                disabled={actionLoading}
                                activeOpacity={0.7}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color={Colors.neutral.white} />
                                ) : (
                                    <>
                                        <Ionicons name="log-out-outline" size={24} color={Colors.neutral.white} />
                                        <Text style={styles.actionButtonText}>Sair do Racha</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.joinButton,
                                    isFull && styles.actionButtonDisabled
                                ]}
                                onPress={handleParticipar}
                                disabled={isFull || actionLoading}
                                activeOpacity={0.7}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color={Colors.neutral.white} />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={24} color={Colors.neutral.white} />
                                        <Text style={styles.actionButtonText}>
                                            {isFull ? 'Racha Lotado' : 'Entrar no Racha'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modal de Convidar */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Convidar Jogador</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={Colors.neutral.charcoal} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputContainer}>
                                <Ionicons name="search" size={20} color={Colors.neutral.charcoal} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar por nome..."
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    onSubmitEditing={handleSearch}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={handleSearch}
                            >
                                <Text style={styles.searchButtonText}>Buscar</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingJogadores ? (
                            <View style={styles.modalLoadingContainer}>
                                <ActivityIndicator size="large" color={Colors.primary.mikasaBright} />
                            </View>
                        ) : (
                            <FlatList
                                data={jogadoresDisponiveis}
                                renderItem={renderJogadorItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.jogadoresList}
                                ListEmptyComponent={
                                    <View style={styles.emptyJogadores}>
                                        <Text style={styles.emptyJogadoresText}>Nenhum jogador disponível</Text>
                                    </View>
                                }
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
        backgroundColor: Colors.neutral.sandLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.neutral.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.sandLight,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.neutral.deepCharcoal,
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
        ...Typography.body,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.sm,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    mainCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dateStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    dateBox: {
        width: 70,
        height: 70,
        backgroundColor: Colors.primary.mikasaBright + '15',
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    dateDay: {
        ...Typography.h1,
        color: Colors.primary.mikasaBright,
        fontSize: 32,
        fontWeight: 'bold',
    },
    dateMonth: {
        ...Typography.caption,
        color: Colors.primary.mikasaBright,
        fontSize: 14,
    },
    dateInfo: {
        flex: 1,
    },
    dayOfWeek: {
        ...Typography.h3,
        color: Colors.neutral.deepCharcoal,
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        ...Typography.body,
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
        fontSize: 12,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.neutral.deepCharcoal,
    },
    arenaName: {
        ...Typography.h2,
        color: Colors.neutral.deepCharcoal,
        marginBottom: 4,
    },
    arenaEndereco: {
        ...Typography.body,
        color: Colors.neutral.charcoal,
        marginBottom: 2,
    },
    arenaLocalidade: {
        ...Typography.caption,
        color: Colors.neutral.charcoal,
    },
    descricao: {
        ...Typography.body,
        color: Colors.neutral.charcoal,
        lineHeight: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    infoCard: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: Colors.neutral.sandLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
    },
    infoLabel: {
        ...Typography.caption,
        color: Colors.neutral.charcoal,
        marginTop: 4,
    },
    infoValue: {
        ...Typography.h3,
        color: Colors.neutral.deepCharcoal,
        marginTop: 2,
    },
    participantesCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    participantesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    participantesTitle: {
        ...Typography.h3,
        color: Colors.neutral.deepCharcoal,
    },
    convidarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent.lime,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        gap: 4,
    },
    convidarButtonText: {
        ...Typography.caption,
        color: Colors.neutral.white,
        fontWeight: '600',
    },
    participanteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.sandLight,
    },
    participanteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.neutral.sandLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    participanteInfo: {
        flex: 1,
    },
    participanteNome: {
        ...Typography.body,
        color: Colors.neutral.deepCharcoal,
        fontWeight: '500',
    },
    participanteStatus: {
        ...Typography.caption,
        color: Colors.neutral.charcoal,
        fontStyle: 'italic',
    },
    criadorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    criadorText: {
        ...Typography.caption,
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
    },
    actionSection: {
        marginBottom: Spacing.md,
    },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.mikasaBright + '15',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    creatorInfoText: {
        ...Typography.body,
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    joinButton: {
        backgroundColor: Colors.accent.lime,
    },
    leaveButton: {
        backgroundColor: Colors.status.error,
    },
    actionButtonDisabled: {
        backgroundColor: Colors.neutral.charcoal,
        opacity: 0.5,
    },
    actionButtonText: {
        ...Typography.button,
        color: Colors.neutral.white,
        fontWeight: '600',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.neutral.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        ...Typography.h2,
        color: Colors.neutral.deepCharcoal,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.sandLight,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        ...Typography.body,
        color: Colors.neutral.deepCharcoal,
    },
    searchButton: {
        backgroundColor: Colors.primary.mikasaBright,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
    },
    searchButtonText: {
        ...Typography.button,
        color: Colors.neutral.white,
        fontWeight: '600',
    },
    modalLoadingContainer: {
        paddingVertical: Spacing.xl * 2,
        alignItems: 'center',
    },
    jogadoresList: {
        paddingBottom: Spacing.xl,
    },
    jogadorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.sandLight,
    },
    jogadorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary.mikasaBright + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    jogadorInfo: {
        flex: 1,
    },
    jogadorNome: {
        ...Typography.body,
        color: Colors.neutral.deepCharcoal,
        fontWeight: '600',
        marginBottom: 2,
    },
    jogadorLocalidade: {
        ...Typography.caption,
        color: Colors.neutral.charcoal,
    },
    jogadorNivel: {
        ...Typography.caption,
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
    },
    emptyJogadores: {
        paddingVertical: Spacing.xl * 2,
        alignItems: 'center',
    },
    emptyJogadoresText: {
        ...Typography.body,
        color: Colors.neutral.charcoal,
    },
});
