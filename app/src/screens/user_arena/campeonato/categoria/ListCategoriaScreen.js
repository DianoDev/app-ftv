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
                return '#00FF88';
            case 'em_andamento':
                return '#4A9EFF';
            case 'finalizado':
                return '#999999';
            case 'cancelado':
                return '#FF4444';
            default:
                return '#666666';
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
                <View style={styles.categoriaTitleRow}>
                    <Ionicons name="pricetag" size={20} color="#FFD300" />
                    <Text style={styles.categoriaNome}>{item.nome}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.categoriaDetails}>
                {item.genero && (
                    <View style={styles.detailItem}>
                        <Ionicons name="people" size={16} color="#FFD300" />
                        <Text style={styles.detailText}>{item.genero}</Text>
                    </View>
                )}

                {item.nivel && (
                    <View style={styles.detailItem}>
                        <Ionicons name="star" size={16} color="#FFD300" />
                        <Text style={styles.detailText}>{item.nivel}</Text>
                    </View>
                )}

                {item.max_duplas && (
                    <View style={styles.detailItem}>
                        <Ionicons name="options" size={16} color="#FFD300" />
                        <Text style={styles.detailText}>{item.max_duplas} duplas</Text>
                    </View>
                )}

                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#FFD300" />
                    <Text style={styles.detailText}>
                        R$ {parseFloat(item.valor_inscricao || 0).toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create-outline" size={18} color="#000000" />
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(item)}
                >
                    <Ionicons name="trash-outline" size={18} color="#FF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Renderizar lista vazia
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="list-outline" size={64} color="#FFD300" />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma categoria</Text>
                <Text style={styles.emptyDescription}>
                    Adicione categorias para organizar o campeonato
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateCategoria}
                >
                    <Ionicons name="add-circle" size={20} color="#000000" />
                    <Text style={styles.emptyButtonText}>Criar Categoria</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando categorias...</Text>
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
                    <Text style={styles.title}>Categorias</Text>
                    <Text style={styles.subtitle}>{campeonatoNome}</Text>
                </View>
                <View style={styles.headerRight} />
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
                        colors={['#FFD300']}
                        tintColor="#FFD300"
                    />
                }
                ListEmptyComponent={renderEmpty}
            />

            {/* FAB - Floating Action Button */}
            {categorias.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCreateCategoria}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#000000" />
                </TouchableOpacity>
            )}
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
        marginTop: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#999999',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        backgroundColor: '#1a1a1a',
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
    headerRight: {
        width: 40,
    },
    title: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    categoriaCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    categoriaHeader: {
        marginBottom: Spacing.md,
    },
    categoriaTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    categoriaNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: Typography.sizes.small,
        fontWeight: Typography.fonts.headingWeight,
    },
    categoriaDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: '#2a2a2a',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.input,
    },
    detailText: {
        fontSize: Typography.sizes.small,
        color: '#FFFFFF',
        fontWeight: Typography.fonts.bodyWeight,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    editButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#000000',
    },
    deleteButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.button,
        borderWidth: 1,
        borderColor: '#FF4444',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: Spacing.xl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: '#2a2a2a',
    },
    emptyTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#000000',
    },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFD300',
        justifyContent: 'center',
        alignItems: 'center',

    },
});