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
    Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CampeonatoService } from '../../../services/campeonatoService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

const { width } = Dimensions.get('window');

export default function ChaveamentoScreen() {
    const router = useRouter();
    const { categoriaId, categoriaNome } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [fases, setFases] = useState([]);
    const [faseAtiva, setFaseAtiva] = useState(null);

    useEffect(() => {
        loadChaveamento();
    }, [categoriaId]);

    const loadChaveamento = async () => {
        try {
            setLoading(true);
            const result = await CampeonatoService.getTodasFases(categoriaId);

            if (result.success) {
                console.log('Fases carregadas:', result.data);
                setFases(result.data);

                // Selecionar a primeira fase automaticamente
                if (result.data && result.data.length > 0) {
                    setFaseAtiva(result.data[0].fase);
                }
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Erro ao carregar chaveamento:', error);
            Alert.alert('Erro', 'Erro ao carregar chaveamento');
        } finally {
            setLoading(false);
        }
    };

    const getFaseLabel = (fase) => {
        const labels = {
            'oitavas': 'Oitavas de Final',
            'quartas': 'Quartas de Final',
            'semi': 'Semifinal',
            'final': 'Final',
            'disputa_terceiro': 'Disputa 3º Lugar',
            'fase_grupos': 'Fase de Grupos',
        };
        return labels[fase] || fase;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'finalizada':
                return Colors.success;
            case 'em_andamento':
                return Colors.warning;
            case 'pronta':
                return Colors.info;
            case 'aguardando':
                return Colors.textSecondary;
            default:
                return Colors.textSecondary;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'finalizada': 'Finalizada',
            'em_andamento': 'Em andamento',
            'pronta': 'Agendada',
            'aguardando': 'Aguardando',
        };
        return labels[status] || status;
    };

    const renderPartida = (posicao) => {
        const inscricao1 = posicao.inscricao1;
        const inscricao2 = posicao.inscricao2;
        const partida = posicao.partida;
        const vencedor = posicao.inscricao_vencedora_id;

        return (
            <TouchableOpacity
                key={posicao.id}
                style={styles.partidaCard}
                onPress={() => {
                    if (partida) {
                        router.push({
                            pathname: '/src/screens/user_jogador/torneios/PartidaDetailScreen',
                            params: { partidaId: partida.id }
                        });
                    }
                }}
            >
                <View style={styles.partidaHeader}>
                    <Text style={styles.partidaPosicao}>Chave {posicao.posicao}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(posicao.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(posicao.status)}</Text>
                    </View>
                </View>

                <View style={styles.competidoresContainer}>
                    {/* Competidor 1 */}
                    <View style={[
                        styles.competidorRow,
                        vencedor === inscricao1?.id && styles.competidorVencedor
                    ]}>
                        <View style={styles.competidorInfo}>
                            {inscricao1 ? (
                                <>
                                    <Text style={styles.competidorNome}>
                                        {inscricao1.usuario?.nome || 'Jogador'}
                                    </Text>
                                    {inscricao1.parceiro && (
                                        <Text style={styles.parceiroNome}>
                                            / {inscricao1.parceiro.nome}
                                        </Text>
                                    )}
                                    {inscricao1.seed_inscricao1 && (
                                        <Text style={styles.seed}>#{inscricao1.seed_inscricao1}</Text>
                                    )}
                                </>
                            ) : (
                                <Text style={styles.aguardandoText}>Aguardando...</Text>
                            )}
                        </View>
                        {partida && (
                            <Text style={styles.placar}>{partida.sets_inscricao1 || 0}</Text>
                        )}
                        {vencedor === inscricao1?.id && (
                            <Ionicons name="trophy" size={20} color={Colors.warning} />
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Competidor 2 */}
                    <View style={[
                        styles.competidorRow,
                        vencedor === inscricao2?.id && styles.competidorVencedor
                    ]}>
                        <View style={styles.competidorInfo}>
                            {inscricao2 ? (
                                <>
                                    <Text style={styles.competidorNome}>
                                        {inscricao2.usuario?.nome || 'Jogador'}
                                    </Text>
                                    {inscricao2.parceiro && (
                                        <Text style={styles.parceiroNome}>
                                            / {inscricao2.parceiro.nome}
                                        </Text>
                                    )}
                                    {inscricao2.seed_inscricao2 && (
                                        <Text style={styles.seed}>#{inscricao2.seed_inscricao2}</Text>
                                    )}
                                </>
                            ) : (
                                <Text style={styles.aguardandoText}>Aguardando...</Text>
                            )}
                        </View>
                        {partida && (
                            <Text style={styles.placar}>{partida.sets_inscricao2 || 0}</Text>
                        )}
                        {vencedor === inscricao2?.id && (
                            <Ionicons name="trophy" size={20} color={Colors.warning} />
                        )}
                    </View>
                </View>

                {partida?.data_hora && (
                    <View style={styles.partidaFooter}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.dataText}>
                            {new Date(partida.data_hora).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                        {partida.quadra && (
                            <>
                                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
                                <Text style={styles.dataText}>Quadra {partida.quadra.nome}</Text>
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderFaseTab = (fase) => {
        const isActive = faseAtiva === fase.fase;
        return (
            <TouchableOpacity
                key={fase.fase}
                style={[styles.faseTab, isActive && styles.faseTabActive]}
                onPress={() => setFaseAtiva(fase.fase)}
            >
                <Text style={[styles.faseTabText, isActive && styles.faseTabTextActive]}>
                    {getFaseLabel(fase.fase)}
                </Text>
            </TouchableOpacity>
        );
    };

    const faseAtualData = fases.find(f => f.fase === faseAtiva);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Carregando chaveamento...</Text>
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
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Chaveamento</Text>
                    <Text style={styles.headerSubtitle}>{categoriaNome}</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadChaveamento}
                >
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {fases.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="git-network-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.emptyTitle}>Chaveamento não gerado</Text>
                    <Text style={styles.emptyText}>
                        O chaveamento ainda não foi gerado para esta categoria.
                    </Text>
                </View>
            ) : (
                <>
                    {/* Tabs de Fases */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.fasesContainer}
                        contentContainerStyle={styles.fasesContent}
                    >
                        {fases.map(renderFaseTab)}
                    </ScrollView>

                    {/* Partidas da Fase */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {faseAtualData?.posicoes && faseAtualData.posicoes.length > 0 ? (
                            faseAtualData.posicoes.map(renderPartida)
                        ) : (
                            <View style={styles.emptyPhase}>
                                <Text style={styles.emptyPhaseText}>
                                    Nenhuma partida nesta fase
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerContent: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.sizes.xl,
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: Typography.sizes.sm,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 2,
    },
    refreshButton: {
        padding: Spacing.xs,
    },
    fasesContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    fasesContent: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    faseTab: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginHorizontal: Spacing.xs,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
    },
    faseTabActive: {
        backgroundColor: Colors.primary,
    },
    faseTabText: {
        fontSize: Typography.sizes.sm,
        color: Colors.textPrimary,
    },
    faseTabTextActive: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.md,
    },
    partidaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    partidaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    partidaPosicao: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        fontSize: Typography.sizes.xs,
        color: '#FFFFFF',
    },
    competidoresContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    competidorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        minHeight: 50,
    },
    competidorVencedor: {
        backgroundColor: '#FFF9E6',
    },
    competidorInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    competidorNome: {
        fontSize: Typography.sizes.md,
        color: Colors.textPrimary,
    },
    parceiroNome: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    seed: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginLeft: 6,
    },
    aguardandoText: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    placar: {
        fontSize: Typography.sizes.xl,
        color: Colors.textPrimary,
        marginHorizontal: Spacing.sm,
        minWidth: 30,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    partidaFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    dataText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyTitle: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    emptyPhase: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyPhaseText: {
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
});
