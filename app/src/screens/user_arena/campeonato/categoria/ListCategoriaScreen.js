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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StorageService } from '../../../../services/storage';
import { API_CONFIG } from '../../../../config/api.config';

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
                return '#34C759';
            case 'em_andamento':
                return '#007AFF';
            case 'finalizado':
                return '#666';
            case 'cancelado':
                return '#FF3B30';
            default:
                return '#999';
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
                        <Text style={styles.detailIcon}>👥</Text>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Gênero:</Text>
                            <Text style={styles.detailValue}>{item.genero}</Text>
                        </View>
                    </View>
                )}

                {item.nivel && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>⭐</Text>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Nível:</Text>
                            <Text style={styles.detailValue}>{item.nivel}</Text>
                        </View>
                    </View>
                )}

                {item.max_duplas && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>👫</Text>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Máximo de Duplas:</Text>
                            <Text style={styles.detailValue}>{item.max_duplas}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💰</Text>
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

    // Renderizar lista vazia
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>Nenhuma categoria cadastrada</Text>
                <Text style={styles.emptyDescription}>
                    Adicione categorias para organizar o campeonato
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateCategoria}
                >
                    <Text style={styles.emptyButtonText}>+ Adicionar Categoria</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Carregando categorias...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Categorias</Text>
                    <Text style={styles.headerSubtitle}>{campeonatoNome}</Text>
                    <Text style={styles.headerCount}>
                        {categorias.length} {categorias.length === 1 ? 'categoria' : 'categorias'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateCategoria}
                >
                    <Text style={styles.addButtonText}>+ Nova</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Categorias */}
            <FlatList
                data={categorias}
                renderItem={renderCategoriaItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                    />
                }
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
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginBottom: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerTitleContainer: {
        marginBottom: 12,
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
    headerCount: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: '#34C759',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
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
    categoriaCard: {
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
    categoriaHeader: {
        marginBottom: 12,
    },
    categoriaInfo: {
        flex: 1,
    },
    categoriaNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    categoriaDetails: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    detailIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        color: '#1b1b18',
        marginTop: 2,
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