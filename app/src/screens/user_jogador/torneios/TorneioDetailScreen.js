import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CampeonatoService } from '../../../services/campeonatoService';
import { InscricaoCampeonatoService } from '../../../services/inscricaoCampeonatoService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function TorneioDetailScreen() {
    const router = useRouter();
    const { campeonatoId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [campeonato, setCampeonato] = useState(null);
    const [categoriasInscritas, setCategoriasInscritas] = useState([]);

    useEffect(() => {
        loadCampeonato();
    }, [campeonatoId]);

    const loadCampeonato = async () => {
        try {
            setLoading(true);
            const result = await CampeonatoService.getCampeonato(campeonatoId);
            console.log('Result completo:', JSON.stringify(result, null, 2));

            if (result.success) {
                const campeonatoData = result.data.campeonato || result.data;
                console.log('Campeonato carregado:', JSON.stringify(campeonatoData, null, 2));
                setCampeonato(campeonatoData);

                // Verificar inscrições do usuário neste campeonato
                const inscricoesResult = await InscricaoCampeonatoService.verificarInscricoesCampeonato(campeonatoId);
                if (inscricoesResult.success) {
                    setCategoriasInscritas(inscricoesResult.data.categorias || []);
                }
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

    const parsePremiacao = (premiacaoString) => {
        if (!premiacaoString) return null;
        try {
            // Se já for objeto, retorna
            if (typeof premiacaoString === 'object') return premiacaoString;
            // Tenta fazer parse da string JSON
            return JSON.parse(premiacaoString);
        } catch (error) {
            console.error('Erro ao fazer parse da premiação:', error);
            return null;
        }
    };

    const formatPremiacao = (premiacaoObj) => {
        if (!premiacaoObj) return '';
        if (typeof premiacaoObj === 'string') return premiacaoObj;

        // Converte objeto em string formatada
        return Object.entries(premiacaoObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    };

    const calcularVagasDisponiveis = (categoria) => {
        const maxDuplas = categoria.max_duplas || 0;
        const inscricoes = categoria.inscricao_campeonato?.length || 0;
        return Math.max(0, maxDuplas - inscricoes);
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
                            <Ionicons name="trophy" size={28} color="#FFD300" />
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
                                <Ionicons name="information-circle" size={16} color="#FFD300" />
                                <Text style={styles.sectionTitle}>Sobre o Torneio</Text>
                            </View>
                            <Text style={styles.description}>{campeonato.descricao}</Text>
                        </View>
                    )}

                    {/* Informações */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="calendar" size={16} color="#FFD300" />
                            <Text style={styles.sectionTitle}>Informações</Text>
                        </View>

                        {campeonato.data_inicio && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color="#FFD300" />
                                <Text style={styles.infoLabel}>Data de Início:</Text>
                                <Text style={styles.infoValue}>{formatDate(campeonato.data_inicio)}</Text>
                            </View>
                        )}

                        {campeonato.data_fim && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color="#FFD300" />
                                <Text style={styles.infoLabel}>Data de Término:</Text>
                                <Text style={styles.infoValue}>{formatDate(campeonato.data_fim)}</Text>
                            </View>
                        )}

                        {campeonato.tipo && (
                            <View style={styles.infoRow}>
                                <Ionicons name="ribbon-outline" size={16} color="#FFD300" />
                                <Text style={styles.infoLabel}>Tipo:</Text>
                                <Text style={styles.infoValue}>
                                    {campeonato.tipo === 'misto' ? 'Misto' : campeonato.tipo === 'masculino' ? 'Masculino' : campeonato.tipo === 'feminino' ? 'Feminino' : campeonato.tipo}
                                </Text>
                            </View>
                        )}

                        {(campeonato.local || campeonato.arena?.nome) && (
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color="#FFD300" />
                                <Text style={styles.infoLabel}>Local:</Text>
                                <Text style={styles.infoValue}>{campeonato.local || campeonato.arena?.nome}</Text>
                            </View>
                        )}

                        {(campeonato.organizador || campeonato.organizador_nome) && (
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color="#FFD300" />
                                <Text style={styles.infoLabel}>Organizador:</Text>
                                <Text style={styles.infoValue}>{campeonato.organizador || campeonato.organizador_nome}</Text>
                            </View>
                        )}
                    </View>

                    {/* Regulamento / Regras */}
                    {(campeonato.regulamento || campeonato.regras) && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={16} color="#FFD300" />
                                <Text style={styles.sectionTitle}>Regulamento</Text>
                            </View>
                            <Text style={styles.regulamento}>{campeonato.regulamento || campeonato.regras}</Text>
                        </View>
                    )}
                </View>

                {/* Categorias */}
                {(campeonato.categorias || campeonato.categorias_campeonato) &&
                    (campeonato.categorias?.length > 0 || campeonato.categorias_campeonato?.length > 0) && (
                        <View style={styles.categoriasSection}>
                            <View style={styles.categoriasHeader}>
                                <Ionicons name="list" size={18} color="#FFD300" />
                                <Text style={styles.categoriasTitle}>
                                    Categorias ({(campeonato.categorias || campeonato.categorias_campeonato).length})
                                </Text>
                            </View>

                            {(campeonato.categorias || campeonato.categorias_campeonato).map((categoria, index) => {
                                const vagasDisponiveis = calcularVagasDisponiveis(categoria);
                                const premiacaoObj = parsePremiacao(categoria.premiacao);
                                const estaInscrito = categoriasInscritas.includes(categoria.id);

                                return (
                                    <View key={categoria.id || index} style={styles.categoriaCard}>
                                        <View style={styles.categoriaHeader}>
                                            <View style={styles.categoriaIconContainer}>
                                                <Ionicons name="ribbon" size={18} color="#FFD300" />
                                            </View>
                                            <View style={styles.categoriaInfo}>
                                                <View style={styles.categoriaTitleRow}>
                                                    <Text style={styles.categoriaNome}>
                                                        {categoria.nome}
                                                    </Text>
                                                    {estaInscrito && (
                                                        <View style={styles.inscritoCategoryBadge}>
                                                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                                                            <Text style={styles.inscritoCategoryText}>Inscrito</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {categoria.genero && (
                                                    <Text style={styles.categoriaGenero}>
                                                        {categoria.genero === 'M' || categoria.genero === 'masculino' ? 'Masculino' :
                                                            categoria.genero === 'F' || categoria.genero === 'feminino' ? 'Feminino' : 'Misto'}
                                                    </Text>
                                                )}
                                                {categoria.nivel && (
                                                    <Text style={[styles.categoriaGenero, { color: '#999999' }]}>
                                                        Nível: {categoria.nivel.charAt(0).toUpperCase() + categoria.nivel.slice(1)}
                                                    </Text>
                                                )}
                                            </View>
                                            {vagasDisponiveis !== undefined && !estaInscrito && (
                                                <View style={styles.vagasBadge}>
                                                    <Text style={styles.vagasText}>
                                                        {vagasDisponiveis} {vagasDisponiveis === 1 ? 'vaga' : 'vagas'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Detalhes da Categoria */}
                                        <View style={styles.categoriaDetails}>
                                            {categoria.max_duplas && (
                                                <View style={styles.categoriaDetailItem}>
                                                    <Ionicons name="people-outline" size={14} color="#FFD300" />
                                                    <Text style={styles.categoriaDetailText}>
                                                        Máximo de duplas: {categoria.max_duplas}
                                                    </Text>
                                                </View>
                                            )}

                                            {categoria.idade_minima && (
                                                <View style={styles.categoriaDetailItem}>
                                                    <Ionicons name="calendar-outline" size={14} color="#FFD300" />
                                                    <Text style={styles.categoriaDetailText}>
                                                        Idade mínima: {categoria.idade_minima} anos
                                                    </Text>
                                                </View>
                                            )}

                                            {categoria.idade_maxima && (
                                                <View style={styles.categoriaDetailItem}>
                                                    <Ionicons name="calendar-outline" size={14} color="#FFD300" />
                                                    <Text style={styles.categoriaDetailText}>
                                                        Idade máxima: {categoria.idade_maxima} anos
                                                    </Text>
                                                </View>
                                            )}

                                            {categoria.valor_inscricao && (
                                                <View style={styles.categoriaDetailItem}>
                                                    <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                                                    <Text style={[styles.categoriaDetailText, { color: '#4CAF50' }]}>
                                                        R$ {parseFloat(categoria.valor_inscricao).toFixed(2)}
                                                    </Text>
                                                </View>
                                            )}

                                            {premiacaoObj && (
                                                <View style={styles.categoriaDetailItem}>
                                                    <Ionicons name="trophy-outline" size={14} color="#FFD300" />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.categoriaDetailText}>Premiação:</Text>
                                                        {Object.entries(premiacaoObj).map(([posicao, premio], idx) => (
                                                            <Text key={idx} style={[styles.categoriaDetailText, { marginLeft: 8, fontSize: 12, color: '#CCCCCC' }]}>
                                                                • {posicao}: {premio}
                                                            </Text>
                                                        ))}
                                                    </View>
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

                                        {/* Botão de Inscrição ou Status */}
                                        {estaInscrito ? (
                                            <View style={styles.jaInscritoBadge}>
                                                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                                                <Text style={styles.jaInscritoText}>Você já está inscrito nesta categoria</Text>
                                            </View>
                                        ) : (
                                            <>
                                                {(campeonato.status === 'aberto' || campeonato.status === 'inscricoes_abertas') && vagasDisponiveis > 0 && (
                                                    <TouchableOpacity
                                                        style={styles.inscricaoButton}
                                                        activeOpacity={0.7}
                                                        onPress={() => {
                                                            router.push({
                                                                pathname: '/src/screens/user_jogador/torneios/InscricaoScreen',
                                                                params: {
                                                                    campeonatoId: campeonato.id,
                                                                    categoriaId: categoria.id
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <Ionicons name="add-circle" size={18} color="#000000" />
                                                        <Text style={styles.inscricaoButtonText}>
                                                            {categoria.tipo_inscricao === 'solo' ? 'Inscrever' : 'Inscrever Dupla'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}

                                                {(campeonato.status === 'aberto' || campeonato.status === 'inscricoes_abertas') && vagasDisponiveis === 0 && (
                                                    <View style={styles.lotadoBadge}>
                                                        <Ionicons name="alert-circle" size={14} color="#F44336" />
                                                        <Text style={styles.lotadoText}>Categoria Lotada</Text>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                {/* Mensagem caso não tenha categorias */}
                {(!campeonato.categorias && !campeonato.categorias_campeonato) ||
                ((campeonato.categorias?.length === 0 || !campeonato.categorias) &&
                    (campeonato.categorias_campeonato?.length === 0 || !campeonato.categorias_campeonato)) ? (
                    <View style={styles.emptyCategorias}>
                        <Ionicons name="alert-circle-outline" size={40} color="#666666" />
                        <Text style={styles.emptyCategoriasText}>
                            Nenhuma categoria cadastrada para este torneio
                        </Text>
                    </View>
                ) : null}
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
        fontSize: 16,
        fontWeight: '600',
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
        fontSize: 14,
        color: '#999999',
        marginTop: Spacing.sm,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    mainCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    iconContainer: {
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
    titleInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    campeonatoNome: {
        fontSize: 18,
        fontWeight: '700',
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
        fontSize: 11,
        fontWeight: '600',
    },
    section: {
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.xs,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    description: {
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.xs,
    },
    infoLabel: {
        fontSize: 13,
        color: '#999999',
    },
    infoValue: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
    },
    regulamento: {
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    categoriasSection: {
        marginBottom: Spacing.md,
    },
    categoriasHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    categoriasTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    categoriaCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    categoriaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        paddingBottom: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    categoriaIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    categoriaInfo: {
        flex: 1,
    },
    categoriaTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: 2,
        flexWrap: 'wrap',
    },
    categoriaNome: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    inscritoCategoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#4CAF50',
        gap: 3,
    },
    inscritoCategoryText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#4CAF50',
    },
    categoriaGenero: {
        fontSize: 11,
        color: '#FFD300',
        fontWeight: '500',
    },
    vagasBadge: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    vagasText: {
        fontSize: 11,
        color: '#FFD300',
        fontWeight: '600',
    },
    categoriaDetails: {
        gap: 6,
        marginBottom: Spacing.xs,
    },
    categoriaDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoriaDetailText: {
        fontSize: 13,
        color: '#FFFFFF',
    },
    categoriaObservacoes: {
        backgroundColor: '#2a2a2a',
        padding: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.xs,
    },
    categoriaObservacoesText: {
        fontSize: 12,
        color: '#999999',
        lineHeight: 16,
    },
    inscricaoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        gap: 6,
    },
    inscricaoButtonText: {
        fontSize: 13,
        color: '#000000',
        fontWeight: '700',
    },
    lotadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        gap: 6,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    lotadoText: {
        fontSize: 13,
        color: '#F44336',
        fontWeight: '600',
    },
    jaInscritoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        gap: 6,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    jaInscritoText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
    emptyCategorias: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderStyle: 'dashed',
    },
    emptyCategoriasText: {
        fontSize: 13,
        color: '#666666',
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
});