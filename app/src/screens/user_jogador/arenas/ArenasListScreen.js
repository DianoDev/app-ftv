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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ArenaService } from '../../../services/arenaService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function ArenasListScreen() {
    const router = useRouter();
    const [arenas, setArenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadArenas();
    }, []);

    const loadArenas = async (page = 1, search = '') => {
        try {
            setLoading(page === 1);

            let result;
            if (search.trim()) {
                result = await ArenaService.searchArenas(search, { page, perPage: 10 });
            } else {
                result = await ArenaService.listArenas({ page, perPage: 10 });
            }

            if (result.success) {
                const newArenas = result.data.data || [];

                if (page === 1) {
                    setArenas(newArenas);
                } else {
                    setArenas(prev => [...prev, ...newArenas]);
                }

                setCurrentPage(result.data.current_page || page);
                setTotalPages(result.data.last_page || 1);
                setHasMore((result.data.current_page || page) < (result.data.last_page || 1));
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar arenas');
            }
        } catch (error) {
            console.error('Erro ao carregar arenas:', error);
            Alert.alert('Erro', 'Erro ao carregar arenas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadArenas(1, searchTerm);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadArenas(currentPage + 1, searchTerm);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setArenas([]);
        loadArenas(1, searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        setArenas([]);
        loadArenas(1, '');
    };

    const handleArenaPress = (arena) => {
        router.push({
            pathname: '/src/screens/user_jogador/arenas/ArenaDetailScreen',
            params: { arenaId: arena.id }
        });
    };

    const renderArenaCard = ({ item }) => (
        <TouchableOpacity
            style={styles.arenaCard}
            onPress={() => handleArenaPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.arenaHeader}>
                <View style={styles.arenaIconContainer}>
                    <Ionicons name="location" size={24} color="#FFD300" />
                </View>
                <View style={styles.arenaInfo}>
                    <Text style={styles.arenaName}>{item.nome}</Text>
                    <Text style={styles.arenaLocation}>
                        <Ionicons name="location-outline" size={14} color="#999999" />
                        {' '}{item.cidade}, {item.estado}
                    </Text>
                </View>
                {item.rating > 0 && (
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD300" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                )}
            </View>

            {item.descricao && (
                <Text style={styles.arenaDescription} numberOfLines={2}>
                    {item.descricao}
                </Text>
            )}

            <View style={styles.arenaFooter}>
                {item.telefone && (
                    <View style={styles.footerItem}>
                        <Ionicons name="call-outline" size={14} color="#FFD300" />
                        <Text style={styles.footerText}>{item.telefone}</Text>
                    </View>
                )}
                {item.whatsapp && (
                    <View style={styles.footerItem}>
                        <Ionicons name="logo-whatsapp" size={14} color="#4CAF50" />
                        <Text style={styles.footerText}>{item.whatsapp}</Text>
                    </View>
                )}
            </View>

            {item.comodidades && item.comodidades.length > 0 && (
                <View style={styles.comodidadesContainer}>
                    {item.comodidades.slice(0, 3).map((comodidade, index) => (
                        <View key={index} style={styles.comodidadeTag}>
                            <Text style={styles.comodidadeText}>{comodidade}</Text>
                        </View>
                    ))}
                    {item.comodidades.length > 3 && (
                        <Text style={styles.moreComodidades}>+{item.comodidades.length - 3}</Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#2a2a2a" />
            <Text style={styles.emptyTitle}>Nenhuma arena encontrada</Text>
            <Text style={styles.emptyText}>
                {searchTerm ? 'Tente buscar por outro termo' : 'Não há arenas cadastradas no momento'}
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
                <Text style={styles.headerTitle}>Arenas</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#FFD300" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar arena por nome ou cidade..."
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

            {/* Results Info */}
            {!loading && arenas.length > 0 && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                        {arenas.length} {arenas.length === 1 ? 'arena encontrada' : 'arenas encontradas'}
                    </Text>
                </View>
            )}

            {/* Arenas List */}
            {loading && currentPage === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando arenas...</Text>
                </View>
            ) : (
                <FlatList
                    data={arenas}
                    renderItem={renderArenaCard}
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
    arenaCard: {
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
    arenaHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    arenaIconContainer: {
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
    arenaInfo: {
        flex: 1,
    },
    arenaName: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xxs,
    },
    arenaLocation: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 211, 0, 0.15)',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        gap: 2,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    ratingText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '600',
    },
    arenaDescription: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginBottom: Spacing.sm,
    },
    arenaFooter: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xxs,
    },
    footerText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
    },
    comodidadesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    comodidadeTag: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    comodidadeText: {
        fontSize: 11,
        color: '#FFD300',
    },
    moreComodidades: {
        fontSize: 11,
        color: '#999999',
        alignSelf: 'center',
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