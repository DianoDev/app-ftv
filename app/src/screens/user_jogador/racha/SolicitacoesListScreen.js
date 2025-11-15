import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SolicitacaoRachaService } from '../../../services/solicitacaoRachaService';
import { StorageService } from '../../../services/storage';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function SolicitacoesListScreen() {
    const router = useRouter();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('abertas');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadUserData();
        loadSolicitacoes();
    }, [activeTab]);

    const loadUserData = async () => {
        const user = await StorageService.getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    };

    const loadSolicitacoes = async (page = 1) => {
        try {
            setLoading(page === 1);

            const params = {
                page,
                perPage: 10,
            };

            if (activeTab === 'abertas') {
                params.abertas = true;
            }

            const result = await SolicitacaoRachaService.listSolicitacoes(params);

            if (result.success) {
                const newSolicitacoes = result.data.data || [];

                if (page === 1) {
                    setSolicitacoes(newSolicitacoes);
                } else {
                    setSolicitacoes(prev => [...prev, ...newSolicitacoes]);
                }

                setCurrentPage(result.data.current_page || page);
                setHasMore((result.data.current_page || page) < (result.data.last_page || 1));
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar solicitações');
            }
        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            Alert.alert('Erro', 'Erro ao carregar solicitações');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadSolicitacoes(1);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadSolicitacoes(currentPage + 1);
        }
    };

    const handleParticipar = async (solicitacao) => {
        if (actionLoading) return;

        setActionLoading(solicitacao.id);
        const result = await SolicitacaoRachaService.participar(solicitacao.id);
        setActionLoading(null);

        if (result.success) {
            Alert.alert('Sucesso', result.message);
            handleRefresh();
        } else {
            Alert.alert('Erro', result.message);
        }
    };

    const handleSair = async (solicitacao) => {
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
                        setActionLoading(solicitacao.id);
                        const result = await SolicitacaoRachaService.sair(solicitacao.id);
                        setActionLoading(null);

                        if (result.success) {
                            Alert.alert('Sucesso', result.message);
                            handleRefresh();
                        } else {
                            Alert.alert('Erro', result.message);
                        }
                    }
                }
            ]
        );
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
        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
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

    const isUserParticipating = (solicitacao) => {
        // Aqui você pode verificar se o usuário está na lista de participantes
        // Por enquanto, vamos retornar false
        return false;
    };

    const isSolicitacaoFull = (solicitacao) => {
        const totalParticipantes = (solicitacao.participantes_count || 0) + 1; // +1 para o criador
        return totalParticipantes >= solicitacao.limite_participantes;
    };

    const handleCardPress = (item) => {
        router.push({
            pathname: '/src/screens/user_jogador/racha/SolicitacaoDetailScreen',
            params: { solicitacaoId: item.id }
        });
    };

    const renderSolicitacaoCard = ({ item }) => {
        const isCriador = currentUserId === item.criador_id;
        const isParticipating = isUserParticipating(item);
        const isFull = isSolicitacaoFull(item);
        const totalParticipantes = (item.participantes_count || 0) + 1; // +1 para o criador

        return (
            <TouchableOpacity
                style={styles.solicitacaoCard}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.9}
            >
                {/* Header com data e status */}
                <View style={styles.cardHeader}>
                    <View style={styles.dateSection}>
                        <Text style={styles.dayOfWeek}>{formatDayOfWeek(item.data_jogo)}</Text>
                        <Text style={styles.dateDay}>{formatDate(item.data_jogo).split('/')[0]}</Text>
                        <Text style={styles.dateMonth}>{formatDate(item.data_jogo).split('/')[1]}</Text>
                    </View>

                    <View style={styles.mainInfo}>
                        <Text style={styles.arenaName} numberOfLines={1}>
                            {item.arena?.nome || 'Arena'}
                        </Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={Colors.neutral.charcoal} />
                            <Text style={styles.locationText}>
                                {item.arena?.cidade || ''}, {item.arena?.estado || ''}
                            </Text>
                        </View>
                        <View style={styles.timeRow}>
                            <Ionicons name="time-outline" size={14} color={Colors.primary.mikasaBright} />
                            <Text style={styles.timeText}>
                                {item.hora_inicio} - {item.hora_fim}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                {/* Descrição */}
                {item.descricao && (
                    <Text style={styles.descricao} numberOfLines={2}>
                        {item.descricao}
                    </Text>
                )}

                {/* Informações adicionais */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="people" size={18} color={Colors.primary.mikasaBright} />
                        <Text style={styles.infoText}>
                            {totalParticipantes}/{item.limite_participantes}
                        </Text>
                    </View>

                    {item.nivel_sugerido && (
                        <View style={styles.infoItem}>
                            <Ionicons name="trophy" size={18} color={Colors.status.warning} />
                            <Text style={styles.infoText}>{item.nivel_sugerido}</Text>
                        </View>
                    )}

                    {item.valor_por_pessoa && (
                        <View style={styles.infoItem}>
                            <Ionicons name="cash" size={18} color={Colors.status.success} />
                            <Text style={styles.infoText}>
                                R$ {parseFloat(item.valor_por_pessoa).toFixed(2)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Botões de ação */}
                {item.status === 'aberta' && currentUserId && (
                    <View style={styles.actionsRow}>
                        {isCriador ? (
                            <View style={styles.creatorBadge}>
                                <Ionicons name="star" size={16} color={Colors.primary.mikasaBright} />
                                <Text style={styles.creatorText}>Você é o criador</Text>
                            </View>
                        ) : isParticipating ? (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.leaveButton]}
                                onPress={() => handleSair(item)}
                                disabled={actionLoading === item.id}
                                activeOpacity={0.7}
                            >
                                {actionLoading === item.id ? (
                                    <ActivityIndicator size="small" color={Colors.neutral.white} />
                                ) : (
                                    <>
                                        <Ionicons name="log-out-outline" size={20} color={Colors.neutral.white} />
                                        <Text style={styles.actionButtonText}>Sair</Text>
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
                                onPress={() => handleParticipar(item)}
                                disabled={isFull || actionLoading === item.id}
                                activeOpacity={0.7}
                            >
                                {actionLoading === item.id ? (
                                    <ActivityIndicator size="small" color={Colors.neutral.white} />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={20} color={Colors.neutral.white} />
                                        <Text style={styles.actionButtonText}>
                                            {isFull ? 'Lotado' : 'Entrar'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="tennisball-outline" size={64} color={Colors.neutral.sandLight} />
            <Text style={styles.emptyTitle}>Nenhuma solicitação encontrada</Text>
            <Text style={styles.emptyText}>
                {activeTab === 'abertas'
                    ? 'Não há solicitações abertas no momento'
                    : 'Não há solicitações cadastradas'}
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loading || currentPage === 1) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary.mikasaBright} />
            </View>
        );
    };

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
                <Text style={styles.headerTitle}>Rachas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen')}
                >
                    <Ionicons name="add-circle" size={28} color={Colors.primary.mikasaBright} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'abertas' && styles.tabActive]}
                    onPress={() => setActiveTab('abertas')}
                >
                    <Text style={[styles.tabText, activeTab === 'abertas' && styles.tabTextActive]}>
                        Abertas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'todas' && styles.tabActive]}
                    onPress={() => setActiveTab('todas')}
                >
                    <Text style={[styles.tabText, activeTab === 'todas' && styles.tabTextActive]}>
                        Todas
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results Info */}
            {!loading && solicitacoes.length > 0 && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                        {solicitacoes.length} {solicitacoes.length === 1 ? 'solicitação' : 'solicitações'}
                    </Text>
                </View>
            )}

            {/* Solicitações List */}
            {loading && currentPage === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.mikasaBright} />
                    <Text style={styles.loadingText}>Carregando solicitações...</Text>
                </View>
            ) : (
                <FlatList
                    data={solicitacoes}
                    renderItem={renderSolicitacaoCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyList}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[Colors.primary.mikasaBright]}
                        />
                    }
                />
            )}
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
    addButton: {
        padding: Spacing.xs,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.neutral.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.sandLight,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: Colors.primary.mikasaBright,
    },
    tabText: {
        ...Typography.body,
        color: Colors.neutral.charcoal,
    },
    tabTextActive: {
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
    },
    resultsInfo: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.neutral.white,
    },
    resultsText: {
        ...Typography.caption,
        color: Colors.neutral.charcoal,
    },
    listContent: {
        padding: Spacing.md,
        flexGrow: 1,
    },
    solicitacaoCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    dateSection: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
        backgroundColor: Colors.primary.mikasaBright + '15',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.xs,
    },
    dayOfWeek: {
        ...Typography.caption,
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
        fontSize: 11,
    },
    dateDay: {
        ...Typography.h2,
        color: Colors.primary.mikasaBright,
        fontSize: 24,
        fontWeight: 'bold',
    },
    dateMonth: {
        ...Typography.caption,
        color: Colors.primary.mikasaBright,
        fontSize: 11,
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    arenaName: {
        ...Typography.h3,
        color: Colors.neutral.deepCharcoal,
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        ...Typography.caption,
        color: Colors.neutral.charcoal,
        marginLeft: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    timeText: {
        ...Typography.caption,
        color: Colors.primary.mikasaBright,
        marginLeft: 4,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: Spacing.xs,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
        fontSize: 11,
    },
    descricao: {
        ...Typography.body,
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.sm,
        fontSize: 13,
        lineHeight: 18,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        ...Typography.caption,
        color: Colors.neutral.deepCharcoal,
        fontSize: 13,
        fontWeight: '500',
    },
    actionsRow: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.sandLight,
    },
    creatorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xs,
        gap: 6,
    },
    creatorText: {
        ...Typography.body,
        color: Colors.primary.mikasaBright,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: 6,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
    },
    emptyTitle: {
        ...Typography.h3,
        color: Colors.neutral.deepCharcoal,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
});
