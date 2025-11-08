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
import {useFocusEffect, useRouter} from 'expo-router';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';

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
                    <Text style={styles.badgesContainer}>
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
                        {!item.ativa && (
                            <View style={[styles.badge, styles.badgeInativa]}>
                                <Text style={styles.badgeText}>Inativa</Text>
                            </View>
                        )}
                        {item.ativa && (
                            <View style={[styles.badge, styles.statusAtivo]}>
                                <Text style={styles.badgeText}>Ativo</Text>
                            </View>
                        )}
                    </Text>
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
                        <Text style={styles.detailLabel}>Dimensões:</Text>
                        <Text style={styles.detailValue}>
                            {item.comprimento} x {item.largura}
                        </Text>
                    </View>
                )}

                {item.valor_hora && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Valor/Hora:</Text>
                        <Text style={styles.detailValue}>
                            R$ {parseFloat(item.valor_hora).toFixed(2)}
                        </Text>
                    </View>
                )}

                {item.observacoes && (
                    <View style={styles.detailRow}>
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
                    <Text style={styles.actionButtonText}>✏️ Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item)}
                >
                    <Text style={styles.actionButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Renderizar footer com loading de paginação
    const renderFooter = () => {
        if (!loading || page === 1) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    };

    // Renderizar lista vazia
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏟️</Text>
                <Text style={styles.emptyTitle}>Nenhuma quadra cadastrada</Text>
                <Text style={styles.emptyDescription}>
                    Comece adicionando sua primeira quadra
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateQuadra}
                >
                    <Text style={styles.emptyButtonText}>+ Adicionar Quadra</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Carregando quadras...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
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
                    <Text style={styles.addButtonText}>+ Nova</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Quadras */}
            <FlatList
                data={quadras}
                renderItem={renderQuadraItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
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
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1b1b18',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#34C759',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    quadraCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quadraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    quadraInfo: {
        flex: 1,
    },
    quadraNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 8,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeCoberta: {
        backgroundColor: '#E3F2FD',
    },
    badgeIluminacao: {
        backgroundColor: '#FFF9C4',
    },
    badgeInativa: {
        backgroundColor: '#FFEBEE',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },
    statusContainer: {
        marginLeft: 12,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusAtivo: {
        backgroundColor: '#34C759',
    },
    statusInativo: {
        backgroundColor: '#FF3B30',
    },
    quadraDetails: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginRight: 8,
        minWidth: 100,
    },
    detailValue: {
        fontSize: 14,
        color: '#1b1b18',
        flex: 1,
    },
    observacoesText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        fontStyle: 'italic',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#34C759',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});