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
import { dateFromISO } from '../../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../../styles/theme';

export default function ListCampeonatoScreen() {
    const router = useRouter();
    const [campeonatos, setCampeonatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCampeonatos = async (showLoading = true) => {
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
                `${API_CONFIG.BASE_URL}/api/campeonatos/list`,
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
                setCampeonatos(data.data || []);
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

    useFocusEffect(
        useCallback(() => {
            fetchCampeonatos();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCampeonatos(false);
    }, []);

    const handleEdit = (campeonato) => {
        router.push({
            pathname: '/src/screens/user_arena/campeonato/EditCampeonatoScreen',
            params: { campeonatoId: campeonato.id }
        });
    };

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
                fetchCampeonatos();
            } else {
                throw new Error(data.message || 'Erro ao excluir campeonato');
            }
        } catch (error) {
            console.error('Erro ao excluir campeonato:', error);
            Alert.alert('Erro', error.message || 'Não foi possível excluir o campeonato');
        }
    };

    const handleCreateCampeonato = () => {
        router.push('/src/screens/user_arena/campeonato/CreateCampeonatoScreen');
    };

    const handleCategorias = (campeonato) => {
        router.push({
            pathname: '/src/screens/user_arena/campeonato/categoria/ListCategoriaScreen',
            params: { campeonatoId: campeonato.id }
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'inscricoes_abertas': { label: 'Inscrições Abertas', color: '#4CAF50' },
            'em_andamento': { label: 'Em Andamento', color: '#FFD300' },
            'finalizado': { label: 'Finalizado', color: '#999999' },
            'cancelado': { label: 'Cancelado', color: '#FF5252' },
        };

        return statusMap[status] || { label: status, color: '#999999' };
    };

    const renderCampeonatoItem = ({ item }) => {
        const statusInfo = getStatusBadge(item.status);

        return (
            <View style={styles.campeonatoCard}>
                <View style={styles.campeonatoHeader}>
                    <View style={styles.campeonatoIconContainer}>
                        <Ionicons name="trophy" size={24} color="#FFD300" />
                    </View>
                    <View style={styles.campeonatoInfo}>
                        <View style={styles.nomeContainer}>
                            <Text style={styles.campeonatoNome}>{item.nome}</Text>
                            <TouchableOpacity
                                onPress={() => handleEdit(item)}
                                style={styles.editIconButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={20} color="#FFD300" />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20`, borderColor: statusInfo.color }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.label}
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
                    {item.data_inicio && item.data_fim && (
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={16} color="#FFD300" />
                            <Text style={styles.detailLabel}>Período:</Text>
                            <Text style={styles.detailValue}>
                                {dateFromISO(item.data_inicio)} - {dateFromISO(item.data_fim)}
                            </Text>
                        </View>
                    )}

                    {item.tipo && (
                        <View style={styles.detailRow}>
                            <Ionicons name="ribbon" size={16} color="#FFD300" />
                            <Text style={styles.detailLabel}>Tipo:</Text>
                            <Text style={styles.detailValue}>{item.tipo}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.categoriaButton]}
                        onPress={() => handleCategorias(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="list" size={18} color="#000000" />
                        <Text style={styles.actionButtonText}>Categorias</Text>
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
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Nenhum campeonato cadastrado</Text>
                <Text style={styles.emptyDescription}>
                    Comece criando seu primeiro campeonato
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateCampeonato}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color="#000000" />
                    <Text style={styles.emptyButtonText}>Criar Campeonato</Text>
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
                    <Text style={styles.loadingText}>Carregando campeonatos...</Text>
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
                    <Text style={styles.headerTitle}>Meus Campeonatos</Text>
                    <Text style={styles.headerSubtitle}>
                        {campeonatos.length} {campeonatos.length === 1 ? 'campeonato' : 'campeonatos'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateCampeonato}
                >
                    <Ionicons name="add-circle" size={28} color="#FFD300" />
                </TouchableOpacity>
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
                        colors={['#FFD300']}
                        tintColor="#FFD300"
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
    campeonatoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    campeonatoIconContainer: {
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
    campeonatoInfo: {
        flex: 1,
    },
    nomeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    editIconButton: {
        padding: 6,
    },
    campeonatoNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.xs,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: Typography.fonts.headingWeight,
    },
    descricao: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
        marginBottom: Spacing.md,
        fontStyle: 'italic',
    },
    campeonatoDetails: {
        marginBottom: Spacing.md,
        paddingTop: Spacing.sm,
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
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
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
    categoriaButton:{
        backgroundColor: '#FFD300',
        padding: Spacing.base,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

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
