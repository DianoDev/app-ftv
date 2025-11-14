import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { dateFromISO } from '../../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function CampeonatosListScreen() {
    const router = useRouter();
    const [campeonatos, setCampeonatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Buscar campeonatos da API
    const fetchCampeonatos = async (pageNumber = 1, showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/campeonatos/list?current_page=${pageNumber}&per_page=10`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                if (pageNumber === 1) {
                    setCampeonatos(data.data || []);
                } else {
                    setCampeonatos(prev => [...prev, ...(data.data || [])]);
                }

                setTotalPages(data.last_page || 1);
                setHasMore(pageNumber < (data.last_page || 1));
            } else {
                throw new Error(data.message || 'Erro ao buscar campeonatos');
            }
        } catch (error) {
            console.error('Erro ao buscar campeonatos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os campeonatos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Carregar campeonatos sempre que a tela ganhar foco
    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchCampeonatos(1);
        }, [])
    );

    // Função de refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchCampeonatos(1, false);
    }, []);

    // Carregar mais campeonatos (paginação)
    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCampeonatos(nextPage, false);
        }
    };

    // Navegar para tela de edição
    const handleEdit = (campeonato) => {
        router.push({
            pathname: '/src/screens/user_arena/campeonato/EditCampeonatoScreen',
            params: { campeonatoId: campeonato.id }
        });
    };

    // Navegar para tela de categorias
    const handleCategorias = (campeonato) => {
        router.push({
            pathname: '/src/screens/user_arena/campeonato/categoria/ListCategoriaScreen',
            params: {
                campeonatoId: campeonato.id,
                campeonatoNome: campeonato.nome
            }
        });
    };

    // Confirmar exclusão
    const confirmDelete = (campeonato) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente excluir o campeonato "${campeonato.nome}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    onPress: () => handleDelete(campeonato.id),
                    style: 'destructive',
                },
            ]
        );
    };

    // Excluir campeonato
    const handleDelete = async (campeonatoId) => {
        try {
            const token = await StorageService.getToken();

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/campeonatos/${campeonatoId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sucesso', data.message || 'Campeonato excluído com sucesso!');
                setPage(1);
                fetchCampeonatos(1);
            } else {
                throw new Error(data.message || 'Erro ao excluir campeonato');
            }
        } catch (error) {
            console.error('Erro ao excluir campeonato:', error);
            Alert.alert('Erro', error.message || 'Não foi possível excluir o campeonato');
        }
    };

    // Navegar para tela de criar novo campeonato
    const handleCreateCampeonato = () => {
        router.push('/src/screens/user_arena/campeonato/CreateCampeonatoScreen');
    };

    // Obter cor do status
    const getStatusColor = (status) => {
        switch (status) {
            case 'inscricoes_abertas':
                return Colors.accent.lime;
            case 'em_andamento':
                return Colors.secondary.ocean;
            case 'finalizado':
                return Colors.neutral.charcoal;
            case 'cancelado':
                return Colors.status.error;
            default:
                return Colors.neutral.charcoal;
        }
    };

    // Obter texto do status
    const getStatusText = (status) => {
        switch (status) {
            case 'inscricoes_abertas':
                return 'Inscrições Abertas';
            case 'em_andamento':
                return 'Em Andamento';
            case 'finalizado':
                return 'Finalizado';
            case 'cancelado':
                return 'Cancelado';
            default:
                return status;
        }
    };

    // Renderizar item da lista
    const renderCampeonatoItem = ({ item }) => (
        <View style={styles.campeonatoCard}>
            <View style={styles.campeonatoHeader}>
                <View style={styles.campeonatoInfo}>
                    <Text style={styles.campeonatoNome}>{item.nome}</Text>
                    <View style={styles.statusBadge}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: getStatusColor(item.status) }
                            ]}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                </View>
            </View>

            {item.descricao && (
                <Text style={styles.descricao} numberOfLines={2}>
                    {item.descricao}
                </Text>
            )}

            <View style={styles.campeonatoDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={18} color={Colors.neutral.charcoal} />
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Período:</Text>
                        <Text style={styles.detailValue}>
                            {dateFromISO(item.data_inicio)} até {dateFromISO(item.data_fim)}
                        </Text>
                    </View>
                </View>

                {item.tipo && (
                    <View style={styles.detailRow}>
                        <Ionicons name="trophy" size={18} color={Colors.neutral.charcoal} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Tipo:</Text>
                            <Text style={styles.detailValue}>{item.tipo}</Text>
                        </View>
                    </View>
                )}

                {item.arena_id && (
                    <View style={styles.detailRow}>
                        <Ionicons name="grid" size={18} color={Colors.neutral.charcoal} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Arena Definida</Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.categoriesButton]}
                    onPress={() => handleCategorias(item)}
                >
                    <Ionicons name="list" size={16} color={Colors.neutral.white} />
                    <Text style={styles.actionButtonText}>Categorias</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="pencil" size={16} color={Colors.neutral.white} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item)}
                >
                    <Ionicons name="trash" size={16} color={Colors.neutral.white} />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Renderizar footer com loading de paginação
    const renderFooter = () => {
        if (!loading || page === 1) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary.mikasaBright} />
            </View>
        );
    };

    // Renderizar lista vazia
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color={Colors.neutral.charcoal} />
                <Text style={styles.emptyTitle}>Nenhum campeonato cadastrado</Text>
                <Text style={styles.emptyDescription}>
                    Comece criando seu primeiro campeonato
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateCampeonato}
                >
                    <Ionicons name="add-circle" size={20} color={Colors.neutral.navyDeep} />
                    <Text style={styles.emptyButtonText}>Criar Campeonato</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.mikasaBright} />
                    <Text style={styles.loadingText}>Carregando campeonatos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.secondary.ocean} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Campeonatos</Text>
                        <Text style={styles.headerSubtitle}>
                            {campeonatos.length} {campeonatos.length === 1 ? 'campeonato' : 'campeonatos'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Lista de Campeonatos */}
            <FlatList
                data={campeonatos}
                renderItem={renderCampeonatoItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary.mikasaBright]}
                        tintColor={Colors.primary.mikasaBright}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
            />

            {/* FAB Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleCreateCampeonato}
            >
                <Ionicons name="add" size={28} color={Colors.neutral.navyDeep} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.sandLight,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.neutral.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.greyLight,
    },
    headerLeft: {
        flex: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    backButtonText: {
        fontSize: Typography.sizes.body,
        color: Colors.secondary.ocean,
        fontWeight: Typography.fonts.headingWeight,
    },
    headerInfo: {
        marginTop: Spacing.xs,
    },
    headerTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
    },
    headerSubtitle: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
    },
    listContent: {
        padding: Spacing.base,
        paddingBottom: 80,
    },
    campeonatoCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.base,
        marginBottom: Spacing.base,
        ...ComponentStyles.card,
    },
    campeonatoHeader: {
        marginBottom: Spacing.md,
    },
    campeonatoInfo: {
        flex: 1,
    },
    campeonatoNome: {
        fontSize: Typography.sizes.h5,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.greyLight,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs + 2,
    },
    statusText: {
        fontSize: Typography.sizes.caption,
        fontWeight: Typography.fonts.headingWeight,
    },
    descricao: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.md,
        fontStyle: 'italic',
        lineHeight: Typography.sizes.bodySmall * Typography.lineHeights.normal,
    },
    campeonatoDetails: {
        marginBottom: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.greyLight,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        fontWeight: Typography.fonts.headingWeight,
    },
    detailValue: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.navyDeep,
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesButton: {
        backgroundColor: Colors.secondary.ocean,
        flex: 1,
    },
    editButton: {
        backgroundColor: Colors.accent.lime,
        flex: 1,
    },
    deleteButton: {
        backgroundColor: Colors.status.error,
        minWidth: 50,
    },
    actionButtonText: {
        color: Colors.neutral.white,
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.bodySmall,
    },
    footerLoader: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: Spacing.xxxl,
    },
    emptyTitle: {
        fontSize: Typography.sizes.h4,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginTop: Spacing.base,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    emptyButton: {
        flexDirection: 'row',
        gap: Spacing.sm,
        backgroundColor: Colors.primary.mikasaBright,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
    },
    emptyButtonText: {
        color: Colors.neutral.navyDeep,
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.body,
    },
    fab: {
        position: 'absolute',
        right: Spacing.base,
        bottom: Spacing.base,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary.mikasaBright,
        alignItems: 'center',
        justifyContent: 'center',
        ...ComponentStyles.card,
    },
});