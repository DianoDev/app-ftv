import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CampeonatoService } from '../../../services/campeonatoService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function TorneiosListScreen() {
    const router = useRouter();
    const [campeonatos, setCampeonatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, aberto, em_andamento, finalizado

    useEffect(() => {
        loadCampeonatos();
    }, [filterStatus]);

    const loadCampeonatos = async (page = 1, search = '') => {
        try {
            setLoading(page === 1);

            const params = {
                page,
                perPage: 10,
            };

            if (search.trim()) {
                params.search = search;
            }

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const result = await CampeonatoService.listCampeonatos(params);

            if (result.success) {
                const newCampeonatos = result.data.data || [];

                if (page === 1) {
                    setCampeonatos(newCampeonatos);
                } else {
                    setCampeonatos(prev => [...prev, ...newCampeonatos]);
                }

                setCurrentPage(result.data.current_page || page);
                setTotalPages(result.data.last_page || 1);
                setHasMore((result.data.current_page || page) < (result.data.last_page || 1));
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar torneios');
            }
        } catch (error) {
            console.error('Erro ao carregar torneios:', error);
            Alert.alert('Erro', 'Erro ao carregar torneios');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadCampeonatos(1, searchTerm);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadCampeonatos(currentPage + 1, searchTerm);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setCampeonatos([]);
        loadCampeonatos(1, searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        setCampeonatos([]);
        loadCampeonatos(1, '');
    };

    const handleCampeonatoPress = (campeonato) => {
        router.push({
            pathname: '/src/screens/user_jogador/torneios/TorneioDetailScreen',
            params: { campeonatoId: campeonato.id }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'inscricoes_abertas':
            case 'aberto':
                return '#4CAF50';
            case 'em_andamento':
                return '#FFD300';
            case 'finalizado':
                return '#999999';
            case 'cancelado':
                return '#F44336';
            default:
                return '#999999';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'inscricoes_abertas':
            case 'aberto':
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

    const renderCampeonatoCard = ({ item }) => (
        <TouchableOpacity
            style={styles.campeonatoCard}
            onPress={() => handleCampeonatoPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="trophy" size={28} color="#FFD300" />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.campeonatoNome} numberOfLines={2}>
                        {item.nome}
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status) }
                    ]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>
            </View>

            {item.descricao && (
                <Text style={styles.descricao} numberOfLines={3}>
                    {item.descricao}
                </Text>
            )}

            <View style={styles.infoRow}>
                {item.data_inicio && (
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color="#FFD300" />
                        <Text style={styles.infoText}>
                            Início: {formatDate(item.data_inicio)}
                        </Text>
                    </View>
                )}

                {item.data_fim && (
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color="#FFD300" />
                        <Text style={styles.infoText}>
                            Fim: {formatDate(item.data_fim)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.infoRow}>
                {item.categorias_count !== undefined && (
                    <View style={styles.infoItem}>
                        <Ionicons name="list" size={16} color="#FFD300" />
                        <Text style={styles.infoText}>
                            {item.categorias_count} {item.categorias_count === 1 ? 'Categoria' : 'Categorias'}
                        </Text>
                    </View>
                )}

                {item.local && (
                    <View style={styles.infoItem}>
                        <Ionicons name="location-outline" size={16} color="#FFD300" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.local}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.verDetalhes}>Toque para ver categorias e detalhes</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFD300" />
            </View>
        </TouchableOpacity>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#2a2a2a" />
            <Text style={styles.emptyTitle}>Nenhum torneio encontrado</Text>
            <Text style={styles.emptyText}>
                {searchTerm
                    ? 'Tente buscar por outro termo'
                    : filterStatus !== 'all'
                        ? `Não há torneios com status "${getStatusLabel(filterStatus)}"`
                        : 'Não há torneios cadastrados no momento'}
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

    const renderFilterButton = (status, label) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
            ]}
            onPress={() => {
                setFilterStatus(status);
                setCurrentPage(1);
                setCampeonatos([]);
            }}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Torneios</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#FFD300" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar torneio..."
                        placeholderTextColor="#666666"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Ionicons name="close-circle" size={20} color="#999999" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <Text style={styles.searchButtonText}>Buscar</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {renderFilterButton('all', 'Todos')}
                    {renderFilterButton('inscricoes_abertas', 'Inscrições Abertas')}
                    {renderFilterButton('em_andamento', 'Em Andamento')}
                    {renderFilterButton('finalizado', 'Finalizados')}
                </ScrollView>
            </View>

            {/* Results Info */}
            {!loading && campeonatos.length > 0 && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                        {campeonatos.length} {campeonatos.length === 1 ? 'torneio encontrado' : 'torneios encontrados'}
                    </Text>
                </View>
            )}

            {/* Campeonatos List */}
            {loading && currentPage === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando torneios...</Text>
                </View>
            ) : (
                <FlatList
                    data={campeonatos}
                    renderItem={renderCampeonatoCard}
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
    headerRight: {
        width: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: '#0a0a0a',
        gap: Spacing.sm,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    searchButton: {
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
    },
    searchButtonText: {
        fontSize: Typography.sizes.body,
        color: '#000000',
        fontWeight: '600',
    },
    filtersContainer: {
        backgroundColor: '#0a0a0a',
        paddingVertical: Spacing.sm,
    },
    filtersContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    filterButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    filterButtonActive: {
        backgroundColor: '#FFD300',
        borderColor: '#FFD300',
    },
    filterButtonText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#000000',
        fontWeight: '700',
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
    campeonatoCard: {
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
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    campeonatoNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    descricao: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xs,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    verDetalhes: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
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
        paddingHorizontal: Spacing.xl,
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
});
