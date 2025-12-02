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
import { AmizadeService } from '../../../services/amizadeService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function ListAmigosScreen() {
    const router = useRouter();
    const [amigos, setAmigos] = useState([]);
    const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('amigos'); // 'amigos' ou 'pendentes'

    const fetchData = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            // Buscar amigos
            const amigosResult = await AmizadeService.listarAmigos();
            if (amigosResult.success) {
                setAmigos(amigosResult.data || []);
            }

            // Buscar solicitações pendentes
            const pendentesResult = await AmizadeService.listarSolicitacoesPendentes();
            if (pendentesResult.success) {
                setSolicitacoesPendentes(pendentesResult.data || []);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(false);
    }, []);

    const handleAceitarSolicitacao = async (amizadeId) => {
        try {
            const result = await AmizadeService.aceitarSolicitacao(amizadeId);

            if (result.success) {
                Alert.alert('Sucesso', result.message);
                fetchData();
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Erro ao aceitar solicitação:', error);
            Alert.alert('Erro', 'Não foi possível aceitar a solicitação');
        }
    };

    const handleRecusarSolicitacao = async (amizadeId) => {
        try {
            const result = await AmizadeService.recusarSolicitacao(amizadeId);

            if (result.success) {
                Alert.alert('Sucesso', result.message);
                fetchData();
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Erro ao recusar solicitação:', error);
            Alert.alert('Erro', 'Não foi possível recusar a solicitação');
        }
    };

    const handleRemoverAmigo = async (amigoId) => {
        Alert.alert(
            'Remover Amigo',
            'Tem certeza que deseja remover este amigo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Remover',
                    onPress: async () => {
                        try {
                            const result = await AmizadeService.removerAmigo(amigoId);

                            if (result.success) {
                                Alert.alert('Sucesso', result.message);
                                fetchData();
                            } else {
                                Alert.alert('Erro', result.message);
                            }
                        } catch (error) {
                            console.error('Erro ao remover amigo:', error);
                            Alert.alert('Erro', 'Não foi possível remover o amigo');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const handleAdicionarAmigo = () => {
        router.push('/src/screens/user_jogador/amigos/AdicionarAmigoScreen');
    };

    const renderAmigoItem = ({ item }) => (
        <View style={styles.amigoCard}>
            <View style={styles.amigoHeader}>
                <View style={styles.amigoIconContainer}>
                    <Ionicons name="person" size={24} color="#FFD300" />
                </View>
                <View style={styles.amigoInfo}>
                    <Text style={styles.amigoNome}>{item.nome}</Text>
                    <Text style={styles.amigoEmail}>{item.email || item.usuario?.email || ''}</Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoverAmigo(item.id)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="person-remove" size={18} color="#FF5252" />
                    <Text style={styles.removeButtonText}>Remover</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSolicitacaoItem = ({ item }) => (
        <View style={styles.amigoCard}>
            <View style={styles.amigoHeader}>
                <View style={styles.amigoIconContainer}>
                    <Ionicons name="person-add" size={24} color="#FFD300" />
                </View>
                <View style={styles.amigoInfo}>
                    <Text style={styles.amigoNome}>{item.nome || 'Nome não disponível'}</Text>
                    <Text style={styles.amigoEmail}>{item.usuario?.email || ''}</Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAceitarSolicitacao(item.id)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark-circle" size={18} color="#000000" />
                    <Text style={styles.acceptButtonText}>Aceitar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleRecusarSolicitacao(item.id)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close-circle" size={18} color="#FF5252" />
                    <Text style={styles.declineButtonText}>Recusar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name={activeTab === 'amigos' ? 'people-outline' : 'person-add-outline'}
                    size={64}
                    color="#2a2a2a"
                />
                <Text style={styles.emptyTitle}>
                    {activeTab === 'amigos' ? 'Nenhum amigo ainda' : 'Nenhuma solicitação pendente'}
                </Text>
                <Text style={styles.emptyDescription}>
                    {activeTab === 'amigos'
                        ? 'Adicione amigos para começar a jogar juntos!'
                        : 'Você não possui solicitações pendentes no momento'}
                </Text>
                {activeTab === 'amigos' && (
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={handleAdicionarAmigo}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="person-add" size={20} color="#000000" />
                        <Text style={styles.emptyButtonText}>Adicionar Amigo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentData = activeTab === 'amigos' ? amigos : solicitacoesPendentes;

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
                    <Text style={styles.headerTitle}>Amigos</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAdicionarAmigo}
                >
                    <Ionicons name="person-add" size={28} color="#FFD300" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'amigos' && styles.activeTab]}
                    onPress={() => setActiveTab('amigos')}
                >
                    <Text style={[styles.tabText, activeTab === 'amigos' && styles.activeTabText]}>
                        Meus Amigos
                    </Text>
                    {amigos.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{amigos.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pendentes' && styles.activeTab]}
                    onPress={() => setActiveTab('pendentes')}
                >
                    <Text style={[styles.tabText, activeTab === 'pendentes' && styles.activeTabText]}>
                        Solicitações
                    </Text>
                    {solicitacoesPendentes.length > 0 && (
                        <View style={[styles.badge, styles.badgeAlert]}>
                            <Text style={styles.badgeText}>{solicitacoesPendentes.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Lista */}
            <FlatList
                data={currentData}
                renderItem={activeTab === 'amigos' ? renderAmigoItem : renderSolicitacaoItem}
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
    addButton: {
        padding: Spacing.xs,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.xs,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFD300',
    },
    tabText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        fontWeight: Typography.fonts.headingWeight,
    },
    activeTabText: {
        color: '#FFD300',
    },
    badge: {
        backgroundColor: '#FFD300',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeAlert: {
        backgroundColor: '#FF5252',
    },
    badgeText: {
        fontSize: 11,
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxxl,
    },
    amigoCard: {
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
    amigoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    amigoIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    amigoInfo: {
        flex: 1,
    },
    amigoNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    amigoEmail: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
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
    acceptButton: {
        backgroundColor: '#FFD300',
    },
    acceptButtonText: {
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.bodySmall,
    },
    declineButton: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    declineButtonText: {
        color: '#FF5252',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.bodySmall,
    },
    removeButton: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    removeButtonText: {
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
