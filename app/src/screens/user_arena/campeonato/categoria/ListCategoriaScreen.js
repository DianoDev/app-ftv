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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StorageService } from '../../../../services/storage';
import { API_CONFIG } from '../../../../config/api.config';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../../styles/theme';

export default function CategoriasListScreen() {
    const router = useRouter();
    const { campeonatoId, campeonatoNome } = useLocalSearchParams();

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Buscar categorias da API
    const fetchCategorias = async (showLoading = true) => {
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
                `${API_CONFIG.BASE_URL}/api/categorias-campeonato/list?campeonato_id=${campeonatoId}`,
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
                setCategorias(data.data || []);
            } else {
                throw new Error(data.message || 'Erro ao buscar categorias');
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            Alert.alert('Erro', 'Não foi possível carregar as categorias');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Carregar categorias sempre que a tela ganhar foco
    useFocusEffect(
        useCallback(() => {
            fetchCategorias();
        }, [campeonatoId])
    );

    // Função de refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCategorias(false);
    }, []);

    // Navegar para tela de edição
    const handleEdit = (categoria) => {
        router.push({
            pathname: '/src/screens/user_arena/campeonato/categoria/EditCategoriaScreen',
            params: {
                categoriaId: categoria.id,
                campeonatoId: campeonatoId
            }
        });
    };

    // Confirmar exclusão
    const confirmDelete = (categoria) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente excluir a categoria "${categoria.nome}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    onPress: () => handleDelete(categoria.id),
                    style: 'destructive',
                },
            ]
        );
    };

    // Excluir categoria
    const handleDelete = async (categoriaId) => {
        try {
            const token = await StorageService.getToken();

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/categorias-campeonato/${categoriaId}`,
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
                Alert.alert('Sucesso', data.message || 'Categoria excluída com sucesso!');
                fetchCategorias();
            } else {
                throw new Error(data.message || 'Erro ao excluir categoria');
            }
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            Alert.alert('Erro', error.message || 'Não foi possível excluir a categoria');
        }
    };

    // Navegar para tela de criar nova categoria
    const handleCreateCategoria = () => {
        router.push({
            pathname: '/src/screens/user_arena/campeonato/categoria/CreateCategoriaScreen',
            params: { campeonatoId: campeonatoId }
        });
    };

    // Obter cor do status
    const getStatusColor = (status) => {
        switch (status) {
            case 'inscricoes_abertas':
                return Colors.accent.success;
            case 'em_andamento':
                return Colors.neutral.charcoal.ocean;
            case 'finalizado':
                return Colors.text.secondary;
            case 'cancelado':
                return Colors.accent.error;
            default:
                return Colors.text.tertiary;
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
    const renderCategoriaItem = ({ item }) => (
        <View style={styles.categoriaCard}>
            <View style={styles.categoriaHeader}>
                <View style={styles.categoriaInfo}>
                    <Text style={styles.categoriaNome}>{item.nome}</Text>
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

            <View style={styles.categoriaDetails}>
                {item.genero && (
                    <View style={styles.detailRow}>
                        <Ionicons name="people" size={20} color={Colors.primary.mikasaBright} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Gênero:</Text>
                            <Text style={styles.detailValue}>{item.genero}</Text>
                        </View>
                    </View>
                )}

                {item.nivel && (
                    <View style={styles.detailRow}>
                        <Ionicons name="star" size={20} color={Colors.primary.mikasaBright} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Nível:</Text>
                            <Text style={styles.detailValue}>{item.nivel}</Text>
                        </View>
                    </View>
                )}

                {item.max_duplas && (
                    <View style={styles.detailRow}>
                        <Ionicons name="options" size={20} color={Colors.primary.mikasaBright} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Máximo de Duplas:</Text>
                            <Text style={styles.detailValue}>{item.max_duplas}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={20} color={Colors.primary.mikasaBright} />
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Valor da Inscrição:</Text>
                        <Text style={styles.detailValue}>
                            R$ {parseFloat(item.valor_inscricao || 0).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create-outline" size={20} color={Colors.neutral.white} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item)}
                >
                    <Ionicons name="trash-outline" size={20} color={Colors.neutral.white} />
                    <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Renderizar lista vazia
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="list-outline" size={64} color={Colors.text.tertiary} />
                <Text style={styles.emptyTitle}>Nenhuma categoria cadastrada</Text>
                <Text style={styles.emptyDescription}>
                    Adicione categorias para organizar o campeonato
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateCategoria}
                >
                    <Ionicons name="add-circle-outline" size={24} color={Colors.neutral.white} />
                    <Text style={styles.emptyButtonText}>Adicionar Categoria</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.mikasaBright} />
                    <Text style={styles.loadingText}>Carregando categorias...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.secondary.ocean} />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Categorias</Text>
                    <Text style={styles.headerSubtitle}>{campeonatoNome}</Text>
                    <Text style={styles.headerCount}>
                        {categorias.length} {categorias.length === 1 ? 'categoria' : 'categorias'}
                    </Text>
                </View>
            </View>

            {/* Lista de Categorias */}
            <FlatList
                data={categorias}
                renderItem={renderCategoriaItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary.mikasaBright]}
                    />
                }
                ListEmptyComponent={renderEmpty}
            />

            {/* FAB - Floating Action Button */}
            {categorias.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCreateCategoria}
                >
                    <Ionicons name="add" size={28} color={Colors.neutral.white} />
                </TouchableOpacity>
            )}
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
        marginTop: Spacing.sm,
        ...Typography.body,
        color: Colors.neutral.charcoal
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.neutral.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.border,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.xs,
    },
    backButtonText: {
        ...Typography.body,
        color: Colors.neutral.charcoal.ocean,
        fontWeight: '600',
    },
    headerTitleContainer: {
        marginBottom: Spacing.sm,
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.text.secondary,
    },
    headerSubtitle: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
    },
    headerCount: {
        ...Typography.small,
        color: Colors.text.tertiary,
        marginTop: Spacing.xs,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 80,
    },
    categoriaCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        ...ComponentStyles.card,
    },
    categoriaHeader: {
        marginBottom: Spacing.sm,
    },
    categoriaInfo: {
        flex: 1,
    },
    categoriaNome: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.lightGray,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    statusText: {
        ...Typography.small,
        fontWeight: '600',
    },
    categoriaDetails: {
        marginBottom: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.border,
        gap: Spacing.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        ...Typography.small,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
    detailValue: {
        ...Typography.body,
        color: Colors.text.primary,
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    editButton: {
        backgroundColor: Colors.neutral.charcoal.ocean,
    },
    deleteButton: {
        backgroundColor: Colors.accent.error,
    },
    actionButtonText: {
        ...Typography.body,
        color: Colors.neutral.white,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    emptyDescription: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.primary.mikasaBright,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    emptyButtonText: {
        ...Typography.body,
        color: Colors.neutral.white,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary.mikasaBright,
        justifyContent: 'center',
        alignItems: 'center',
        ...ComponentStyles.shadow,
        elevation: 8,
    },
});