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
                return '#4CAF50';
            case 'confirmada':
                return '#FFD300';
            case 'cancelada':
                return '#F44336';
            case 'concluida':
                return '#999999';
            default:
                return '#999999';
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
        return false;
    };

    const isSolicitacaoFull = (solicitacao) => {
        const totalParticipantes = (solicitacao.participantes_count || 0) + 1;
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
        const totalParticipantes = (item.participantes_count || 0) + 1;

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
                            <Ionicons name="location-outline" size={14} color="#999999" />
                            <Text style={styles.locationText}>
                                {item.arena?.cidade || ''}, {item.arena?.estado || ''}
                            </Text>
                        </View>
                        <View style={styles.timeRow}>
                            <Ionicons name="time-outline" size={14} color="#FFD300" />
                            <Text style={styles.timeText}>
                                {item.hora_inicio} - {item.hora_fim}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status) }]}>
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
                        <Ionicons name="people" size={18} color="#FFD300" />
                        <Text style={styles.infoText}>
                            {totalParticipantes}/{item.limite_participantes}
                        </Text>
                    </View>

                    {item.nivel_sugerido && (
                        <View style={styles.infoItem}>
                            <Ionicons name="trophy" size={18} color="#FFD300" />
                            <Text style={styles.infoText}>{item.nivel_sugerido}</Text>
                        </View>
                    )}

                    {item.valor_por_pessoa && (
                        <View style={styles.infoItem}>
                            <Ionicons name="cash" size={18} color="#4CAF50" />
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
                                <Ionicons name="star" size={16} color="#FFD300" />
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
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <>
                                        <Ionicons name="log-out-outline" size={20} color="#000000" />
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
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={20} color="#000000" />
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
            <Ionicons name="tennisball-outline" size={64} color="#2a2a2a" />
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
                <ActivityIndicator size="small" color="#FFD300" />
            </View>
        );
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
                <Text style={styles.headerTitle}>Rachas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen')}
                >
                    <Ionicons name="add-circle" size={28} color="#FFD300" />
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
                    <ActivityIndicator size="large" color="#FFD300" />
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
                            colors={['#FFD300']}
                            tintColor="#FFD300"
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
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    addButton: {
        padding: Spacing.xs,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#FFD300',
    },
    tabText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
    },
    tabTextActive: {
        color: '#FFD300',
        fontWeight: '600',
    },
    resultsInfo: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: '#0a0a0a',
    },
    resultsText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    listContent: {
        padding: Spacing.md,
        flexGrow: 1,
    },
    solicitacaoCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        backgroundColor: '#FFD300',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.xs,
    },
    dayOfWeek: {
        fontSize: 11,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: 0.5,
    },
    dateDay: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    dateMonth: {
        fontSize: 11,
        color: '#000000',
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    arenaName: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginLeft: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    timeText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        marginLeft: 4,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: Spacing.xs,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    descricao: {
        fontSize: 13,
        color: '#999999',
        marginBottom: Spacing.sm,
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
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    actionsRow: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    creatorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xs,
        gap: 6,
    },
    creatorText: {
        fontSize: Typography.sizes.body,
        color: '#FFD300',
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
        backgroundColor: '#FFD300',
    },
    leaveButton: {
        backgroundColor: '#F44336',
    },
    actionButtonDisabled: {
        backgroundColor: '#666666',
        opacity: 0.5,
    },
    actionButtonText: {
        fontSize: Typography.sizes.body,
        color: '#000000',
        fontWeight: '600',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
    },
    emptyTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptyText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
});