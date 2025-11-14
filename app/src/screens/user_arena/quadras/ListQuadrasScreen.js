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
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function QuadrasListScreen() {
    const router = useRouter();
    const [quadras, setQuadras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Buscar quadras da API
    const fetchQuadras = async (pageNumber = 1, showLoading = true) => {
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
                `${API_CONFIG.BASE_URL}/api/quadras/list?current_page=${pageNumber}&per_page=10`,
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
                    setQuadras(data.data || []);
                } else {
                    setQuadras(prev => [...prev, ...(data.data || [])]);
                }

                setTotalPages(data.last_page || 1);
                setHasMore(pageNumber < (data.last_page || 1));
            } else {
                throw new Error(data.message || 'Erro ao buscar quadras');
            }
        } catch (error) {
            console.error('Erro ao buscar quadras:', error);
            Alert.alert('Erro', 'Não foi possível carregar as quadras');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Carregar quadras sempre que a tela ganhar foco (após login, navegação, etc)
    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchQuadras(1);
        }, [])
    );

    // Função de refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchQuadras(1, false);
    }, []);

    // Carregar mais quadras (paginação)
    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchQuadras(nextPage, false);
        }
    };

    // Navegar para tela de edição
    const handleEdit = (quadra) => {
        router.push({
            pathname: '/src/screens/user_arena/quadras/EditQuadraScreen',
            params: { quadraId: quadra.id }
        });
    };

    // Confirmar exclusão
    const confirmDelete = (quadra) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente excluir a quadra "${quadra.nome}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    onPress: () => handleDelete(quadra.id),
                    style: 'destructive',
                },
            ]
        );
    };

    // Excluir quadra
    const handleDelete = async (quadraId) => {
        try {
            const token = await StorageService.getToken();

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/quadras/${quadraId}`,
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
                Alert.alert('Sucesso', data.message || 'Quadra excluída com sucesso!');
                // Recarregar lista
                setPage(1);
                fetchQuadras(1);
            } else {
                throw new Error(data.message || 'Erro ao excluir quadra');
            }
        } catch (error) {
            console.error('Erro ao excluir quadra:', error);
            Alert.alert('Erro', error.message || 'Não foi possível excluir a quadra');
        }
    };

    // Navegar para tela de criar nova quadra
    const handleCreateQuadra = () => {
        router.push('/src/screens/user_arena/quadras/CreateQuadraScreen');
    };

    // Renderizar item da lista
    const renderQuadraItem = ({ item }) => (
        <View style={styles.quadraCard}>
            <View style={styles.quadraHeader}>
                <View style={styles.quadraInfo}>
                    <Text style={styles.quadraNome}>{item.nome}</Text>
                    <View style={styles.badgesContainer}>
                        {item.coberta !== 0 && item.coberta !== null && item.coberta && (
                            <View style={[styles.badge, styles.badgeCoberta]}>
                                <Text style={styles.badgeText}>Coberta</Text>
                            </View>
                        )}
                        {item.iluminacao !== 0 && item.iluminacao !== null && item.iluminacao && (
                            <View style={[styles.badge, styles.badgeIluminacao]}>
                                <Text style={styles.badgeText}>Iluminação</Text>
                            </View>
                        )}
                        {item.ativa ? (
                            <View style={[styles.badge, styles.badgeAtiva]}>
                                <Text style={styles.badgeText}>Ativa</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge, styles.badgeInativa]}>
                                <Text style={styles.badgeText}>Inativa</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusIndicator,
                        item.ativa ? styles.statusAtivo : styles.statusInativo
                    ]} />
                </View>
            </View>

            <View style={styles.quadraDetails}>
                {item.comprimento && item.largura && (
                    <View style={styles.detailRow}>
                        <Ionicons name="resize" size={16} color={Colors.neutral.charcoal} />
                        <Text style={styles.detailLabel}>Dimensões:</Text>
                        <Text style={styles.detailValue}>
                            {item.comprimento} x {item.largura}
                        </Text>
                    </View>
                )}

                {item.valor_hora && (
                    <View style={styles.detailRow}>
                        <Ionicons name="cash" size={16} color={Colors.neutral.charcoal} />
                        <Text style={styles.detailLabel}>Valor/Hora:</Text>
                        <Text style={styles.detailValue}>
                            R$ {parseFloat(item.valor_hora).toFixed(2)}
                        </Text>
                    </View>
                )}

                {item.observacoes && (
                    <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={16} color={Colors.neutral.charcoal} />
                        <Text style={styles.detailLabel}>Observações:</Text>
                        <Text style={styles.observacoesText} numberOfLines={2}>
                            {item.observacoes}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create" size={18} color={Colors.neutral.white} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item)}
                >
                    <Ionicons name="trash" size={18} color={Colors.neutral.white} />
                    <Text style={styles.actionButtonText}>Excluir</Text>
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
                <Ionicons name="grid-outline" size={64} color={Colors.neutral.charcoal} />
                <Text style={styles.emptyTitle}>Nenhuma quadra cadastrada</Text>
                <Text style={styles.emptyDescription}>
                    Comece adicionando sua primeira quadra
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateQuadra}
                >
                    <Ionicons name="add-circle" size={20} color={Colors.neutral.navyDeep} />
                    <Text style={styles.emptyButtonText}>Adicionar Quadra</Text>
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
                    <Text style={styles.loadingText}>Carregando quadras...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Minhas Quadras</Text>
                    <Text style={styles.headerSubtitle}>
                        {quadras.length} {quadras.length === 1 ? 'quadra' : 'quadras'} cadastrada{quadras.length === 1 ? '' : 's'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateQuadra}
                >
                    <Ionicons name="add-circle" size={20} color={Colors.neutral.navyDeep} />
                    <Text style={styles.addButtonText}>Nova</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Quadras */}
            <FlatList
                data={quadras}
                renderItem={renderQuadraItem}
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
    headerTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
    },
    headerSubtitle: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
    },
    addButton: {
        backgroundColor: Colors.primary.mikasaBright,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        ...ComponentStyles.buttonPrimary,
    },
    addButtonText: {
        color: Colors.neutral.navyDeep,
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.body,
    },
    listContent: {
        padding: Spacing.base,
        paddingBottom: Spacing.xxxl,
    },
    quadraCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.base,
        marginBottom: Spacing.base,
        ...ComponentStyles.card,
    },
    quadraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    quadraInfo: {
        flex: 1,
    },
    quadraNome: {
        fontSize: Typography.sizes.h4,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.xs,
    },
    badgeCoberta: {
        backgroundColor: Colors.secondary.oceanLight + '30',
    },
    badgeIluminacao: {
        backgroundColor: Colors.primary.mikasaBright + '30',
    },
    badgeAtiva: {
        backgroundColor: Colors.accent.lime + '30',
    },
    badgeInativa: {
        backgroundColor: Colors.accent.coral + '30',
    },
    badgeText: {
        fontSize: Typography.sizes.caption,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
    },
    statusContainer: {
        marginLeft: Spacing.md,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusAtivo: {
        backgroundColor: Colors.status.success,
    },
    statusInativo: {
        backgroundColor: Colors.status.error,
    },
    quadraDetails: {
        marginBottom: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.greyLight,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        gap: Spacing.xs,
    },
    detailLabel: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        fontWeight: Typography.fonts.headingWeight,
    },
    detailValue: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.navyDeep,
        flex: 1,
    },
    observacoesText: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        flex: 1,
        fontStyle: 'italic',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    actionButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    editButton: {
        backgroundColor: Colors.secondary.ocean,
    },
    deleteButton: {
        backgroundColor: Colors.accent.coral,
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
        paddingVertical: Spacing.huge,
        paddingHorizontal: Spacing.xxxl,
    },
    emptyTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginTop: Spacing.base,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    emptyButton: {
        backgroundColor: Colors.primary.mikasaBright,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        ...ComponentStyles.buttonPrimary,
    },
    emptyButtonText: {
        color: Colors.neutral.navyDeep,
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.body,
    },
});