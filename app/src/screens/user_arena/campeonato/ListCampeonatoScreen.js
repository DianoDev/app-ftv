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
import { useRouter, useFocusEffect } from 'expo-router';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { dateFromISO } from '../../../utils/formatters';

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
                    <Text style={styles.detailIcon}>📅</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Período:</Text>
                        <Text style={styles.detailValue}>
                            {dateFromISO(item.data_inicio)} até {dateFromISO(item.data_fim)}
                        </Text>
                    </View>
                </View>

                {item.tipo && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🏆</Text>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Tipo:</Text>
                            <Text style={styles.detailValue}>{item.tipo}</Text>
                        </View>
                    </View>
                )}

                {item.arena_id && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🏟️</Text>
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
                    <Text style={styles.actionButtonText}>📋 Categorias</Text>
                </TouchableOpacity>

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
                    <Text style={styles.actionButtonText}>🗑️</Text>
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
                <Text style={styles.emptyIcon}>🏆</Text>
                <Text style={styles.emptyTitle}>Nenhum campeonato cadastrado</Text>
                <Text style={styles.emptyDescription}>
                    Comece criando seu primeiro campeonato
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateCampeonato}
                >
                    <Text style={styles.emptyButtonText}>+ Criar Campeonato</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Carregando campeonatos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Campeonatos</Text>
                        <Text style={styles.headerSubtitle}>
                            {campeonatos.length} {campeonatos.length === 1 ? 'campeonato' : 'campeonatos'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateCampeonato}
                >
                    <Text style={styles.addButtonText}>+ Novo</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Campeonatos */}
            <FlatList
                data={campeonatos}
                renderItem={renderCampeonatoItem}
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
    headerLeft: {
        flex: 1,
    },
    backButton: {
        marginBottom: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerInfo: {
        marginTop: 4,
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
        marginLeft: 12,
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
    campeonatoCard: {
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
    campeonatoHeader: {
        marginBottom: 12,
    },
    campeonatoInfo: {
        flex: 1,
    },
    campeonatoNome: {
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
    descricao: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    campeonatoDetails: {
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesButton: {
        backgroundColor: '#AF52DE',
        flex: 1,
    },
    editButton: {
        backgroundColor: '#007AFF',
        flex: 1,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        minWidth: 50,
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