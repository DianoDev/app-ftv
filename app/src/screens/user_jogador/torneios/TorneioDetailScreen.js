import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CampeonatoService } from '../../../services/campeonatoService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function TorneioDetailScreen() {
    const router = useRouter();
    const { campeonatoId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [campeonato, setCampeonato] = useState(null);

    useEffect(() => {
        loadCampeonato();
    }, [campeonatoId]);

    const loadCampeonato = async () => {
        try {
            setLoading(true);
            const result = await CampeonatoService.getCampeonato(campeonatoId);

            if (result.success) {
                const campeonatoData = result.data.campeonato || result.data;
                console.log('Campeonato carregado:', campeonatoData);
                setCampeonato(campeonatoData);
            } else {
                Alert.alert('Erro', result.message);
                router.back();
            }
        } catch (error) {
            console.error('Erro ao carregar campeonato:', error);
            Alert.alert('Erro', 'Erro ao carregar detalhes do torneio');
            router.back();
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando detalhes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!campeonato) {
        return null;
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
                <Text style={styles.headerTitle}>Detalhes do Torneio</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Card Principal */}
                <View style={styles.mainCard}>
                    {/* Nome e Status */}
                    <View style={styles.titleSection}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="trophy" size={40} color="#FFD300" />
                        </View>
                        <View style={styles.titleInfo}>
                            <Text style={styles.campeonatoNome}>{campeonato.nome}</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(campeonato.status) + '20', borderColor: getStatusColor(campeonato.status) }
                            ]}>
                                <Text style={[styles.statusText, { color: getStatusColor(campeonato.status) }]}>
                                    {getStatusLabel(campeonato.status)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Descrição */}
                    {campeonato.descricao && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="information-circle" size={20} color="#FFD300" />
                                <Text style={styles.sectionTitle}>Sobre o Torneio</Text>
                            </View>
                            <Text style={styles.description}>{campeonato.descricao}</Text>
                        </View>
                    )}

                    {/* Informações */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="calendar" size={20} color="#FFD300" />
                            <Text style={styles.sectionTitle}>Informações</Text>
                        </View>

                        {campeonato.data_inicio && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={18} color="#FFD300" />
                                <Text style={styles.infoLabel}>Data de Início:</Text>
                                <Text style={styles.infoValue}>{formatDate(campeonato.data_inicio)}</Text>
                            </View>
                        )}

                        {campeonato.data_fim && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={18} color="#FFD300" />
                                <Text style={styles.infoLabel}>Data de Término:</Text>
                                <Text style={styles.infoValue}>{formatDate(campeonato.data_fim)}</Text>
                            </View>
                        )}

                        {campeonato.local && (
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={18} color="#FFD300" />
                                <Text style={styles.infoLabel}>Local:</Text>
                                <Text style={styles.infoValue}>{campeonato.local}</Text>
                            </View>
                        )}

                        {campeonato.organizador && (
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={18} color="#FFD300" />
                                <Text style={styles.infoLabel}>Organizador:</Text>
                                <Text style={styles.infoValue}>{campeonato.organizador}</Text>
                            </View>
                        )}
                    </View>

                    {/* Regulamento */}
                    {campeonato.regulamento && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={20} color="#FFD300" />
                                <Text style={styles.sectionTitle}>Regulamento</Text>
                            </View>
                            <Text style={styles.regulamento}>{campeonato.regulamento}</Text>
                        </View>
                    )}
                </View>

                {/* Categorias */}
                {campeonato.categorias && campeonato.categorias.length > 0 && (
                    <View style={styles.categoriasSection}>
                        <View style={styles.categoriasHeader}>
                            <Ionicons name="list" size={24} color="#FFD300" />
                            <Text style={styles.categoriasTitle}>
                                Categorias ({campeonato.categorias.length})
                            </Text>
                        </View>

                        {campeonato.categorias.map((categoria, index) => (
                            <View key={categoria.id || index} style={styles.categoriaCard}>
                                <View style={styles.categoriaHeader}>
                                    <View style={styles.categoriaIconContainer}>
                                        <Ionicons name="ribbon" size={24} color="#FFD300" />
                                    </View>
                                    <View style={styles.categoriaInfo}>
                                        <Text style={styles.categoriaNome}>
                                            {categoria.nome}
                                        </Text>
                                        {categoria.genero && (
                                            <Text style={styles.categoriaGenero}>
                                                {categoria.genero === 'M' ? 'Masculino' : categoria.genero === 'F' ? 'Feminino' : 'Misto'}
                                            </Text>
                                        )}
                                    </View>
                                    {categoria.vagas_disponiveis !== undefined && (
                                        <View style={styles.vagasBadge}>
                                            <Text style={styles.vagasText}>
                                                {categoria.vagas_disponiveis} vagas
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Detalhes da Categoria */}
                                <View style={styles.categoriaDetails}>
                                    {categoria.idade_minima && (
                                        <View style={styles.categoriaDetailItem}>
                                            <Ionicons name="calendar-outline" size={16} color="#FFD300" />
                                            <Text style={styles.categoriaDetailText}>
                                                Idade mínima: {categoria.idade_minima} anos
                                            </Text>
                                        </View>
                                    )}

                                    {categoria.idade_maxima && (
                                        <View style={styles.categoriaDetailItem}>
                                            <Ionicons name="calendar-outline" size={16} color="#FFD300" />
                                            <Text style={styles.categoriaDetailText}>
                                                Idade máxima: {categoria.idade_maxima} anos
                                            </Text>
                                        </View>
                                    )}

                                    {categoria.numero_jogadores && (
                                        <View style={styles.categoriaDetailItem}>
                                            <Ionicons name="people-outline" size={16} color="#FFD300" />
                                            <Text style={styles.categoriaDetailText}>
                                                {categoria.numero_jogadores} jogadores por time
                                            </Text>
                                        </View>
                                    )}

                                    {categoria.valor_inscricao && (
                                        <View style={styles.categoriaDetailItem}>
                                            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
                                            <Text style={[styles.categoriaDetailText, { color: '#4CAF50' }]}>
                                                R$ {parseFloat(categoria.valor_inscricao).toFixed(2)}
                                            </Text>
                                        </View>
                                    )}

                                    {categoria.premiacao && (
                                        <View style={styles.categoriaDetailItem}>
                                            <Ionicons name="trophy-outline" size={16} color="#FFD300" />
                                            <Text style={styles.categoriaDetailText}>
                                                Premiação: {categoria.premiacao}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Observações */}
                                {categoria.observacoes && (
                                    <View style={styles.categoriaObservacoes}>
                                        <Text style={styles.categoriaObservacoesText}>
                                            {categoria.observacoes}
                                        </Text>
                                    </View>
                                )}

                                {/* Botão de Inscrição */}
                                {campeonato.status === 'aberto' && categoria.vagas_disponiveis > 0 && (
                                    <TouchableOpacity
                                        style={styles.inscricaoButton}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            Alert.alert(
                                                'Inscrição',
                                                'Funcionalidade de inscrição em desenvolvimento',
                                                [{ text: 'OK' }]
                                            );
                                        }}
                                    >
                                        <Ionicons name="add-circle" size={20} color="#000000" />
                                        <Text style={styles.inscricaoButtonText}>
                                            Inscrever Time
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {campeonato.status === 'aberto' && categoria.vagas_disponiveis === 0 && (
                                    <View style={styles.lotadoBadge}>
                                        <Ionicons name="alert-circle" size={16} color="#F44336" />
                                        <Text style={styles.lotadoText}>Categoria Lotada</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Mensagem caso não tenha categorias */}
                {(!campeonato.categorias || campeonato.categorias.length === 0) && (
                    <View style={styles.emptyCategorias}>
                        <Ionicons name="alert-circle-outline" size={48} color="#666666" />
                        <Text style={styles.emptyCategoriasText}>
                            Nenhuma categoria cadastrada para este torneio
                        </Text>
                    </View>
                )}
            </ScrollView>
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
    scrollContent: {
        padding: Spacing.md,
    },
    mainCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
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
    titleSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    titleInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    campeonatoNome: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFD300',
        marginBottom: Spacing.xs,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
    },
    statusText: {
        fontSize: Typography.sizes.caption,
        fontWeight: '600',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    description: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.xs,
    },
    infoLabel: {
        fontSize: Typography.sizes.body,
        color: '#999999',
    },
    infoValue: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
    },
    regulamento: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    categoriasSection: {
        marginBottom: Spacing.md,
    },
    categoriasHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    categoriasTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    categoriaCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    categoriaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    categoriaIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    categoriaInfo: {
        flex: 1,
    },
    categoriaNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    categoriaGenero: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '500',
    },
    vagasBadge: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    vagasText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '600',
    },
    categoriaDetails: {
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    categoriaDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoriaDetailText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    categoriaObservacoes: {
        backgroundColor: '#2a2a2a',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    categoriaObservacoesText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        lineHeight: 18,
    },
    inscricaoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    inscricaoButtonText: {
        fontSize: Typography.sizes.body,
        color: '#000000',
        fontWeight: '700',
    },
    lotadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: 8,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    lotadoText: {
        fontSize: Typography.sizes.body,
        color: '#F44336',
        fontWeight: '600',
    },
    emptyCategorias: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl * 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderStyle: 'dashed',
    },
    emptyCategoriasText: {
        fontSize: Typography.sizes.body,
        color: '#666666',
        marginTop: Spacing.md,
        textAlign: 'center',
    },
});
