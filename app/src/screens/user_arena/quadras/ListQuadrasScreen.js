import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
                <View style={styles.quadraIconContainer}>
                    <Ionicons name="grid" size={24} color="#FFD300" />
                </View>
                <View style={styles.quadraInfo}>
                    <Text style={styles.quadraNome}>{item.nome}</Text>
                    <View style={styles.badgesContainer}>
                        {item.coberta !== 0 && item.coberta !== null && item.coberta && (
                            <View style={styles.badge}>
                                <Ionicons name="umbrella" size={12} color="#FFD300" />
                                <Text style={styles.badgeText}>Coberta</Text>
                            </View>
                        )}
                        {item.iluminacao !== 0 && item.iluminacao !== null && item.iluminacao && (
                            <View style={styles.badge}>
                                <Ionicons name="bulb" size={12} color="#FFD300" />
                                <Text style={styles.badgeText}>Iluminação</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[
                    styles.statusIndicator,
                    item.ativa ? styles.statusAtivo : styles.statusInativo
                ]} />
            </View>

            <View style={styles.quadraDetails}>
                {item.comprimento && item.largura && (
                    <View style={styles.detailRow}>
                        <Ionicons name="resize" size={16} color="#FFD300" />
                        <Text style={styles.detailLabel}>Dimensões:</Text>
                        <Text style={styles.detailValue}>
                            {item.comprimento} x {item.largura}m
                        </Text>
                    </View>
                )}

                {item.valor_hora && (
                    <View style={styles.detailRow}>
                        <Ionicons name="cash" size={16} color="#FFD300" />
                        <Text style={styles.detailLabel}>Valor/Hora:</Text>
                        <Text style={styles.detailValue}>
                            R$ {parseFloat(item.valor_hora).toFixed(2)}
                        </Text>
                    </View>
                )}

                {item.observacoes && (
                    <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={16} color="#999999" />
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
                    activeOpacity={0.8}
                >
                    <Ionicons name="create" size={18} color="#000000" />
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Renderizar footer com loading de paginação
    const renderFooter = () => {
        if (!loading || page === 1) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FFD300" />
            </View>
        );
    };

    // Renderizar lista vazia
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="grid-outline" size={64} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Nenhuma quadra cadastrada</Text>
                <Text style={styles.emptyDescription}>
                    Comece adicionando sua primeira quadra
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateQuadra}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color="#000000" />
                    <Text style={styles.emptyButtonText}>Adicionar Quadra</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando quadras...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Minhas Quadras</Text>
                    <Text style={styles.headerSubtitle}>
                        {quadras.length} {quadras.length === 1 ? 'quadra' : 'quadras'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateQuadra}
                >
                    <Ionicons name="add-circle" size={28} color="#FFD300" />
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
                        colors={['#FFD300']}
                        tintColor="#FFD300"
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
        backgroundColor: '#0a0a0a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#999999',
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
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginTop: 2,
    },
    addButton: {
        padding: Spacing.xs,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxxl,
    },
    quadraCard: {
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
    quadraHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    quadraIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    quadraInfo: {
        flex: 1,
    },
    quadraNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 211, 0, 0.15)',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFD300',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: Spacing.sm,
    },
    statusAtivo: {
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    statusInativo: {
        backgroundColor: '#999999',
    },
    quadraDetails: {
        marginBottom: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        gap: Spacing.xs,
    },
    detailLabel: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
        fontWeight: Typography.fonts.headingWeight,
    },
    detailValue: {
        fontSize: Typography.sizes.bodySmall,
        color: '#FFFFFF',
        flex: 1,
    },
    observacoesText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
        flex: 1,
        fontStyle: 'italic',
        marginLeft: Spacing.xs,
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
        backgroundColor: '#FFD300',
    },
    deleteButton: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    actionButtonText: {
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.bodySmall,
    },
    deleteButtonText: {
        color: '#FF5252',
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
        color: '#FFFFFF',
        marginTop: Spacing.base,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    emptyButton: {
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.body,
    },
});
