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

export default function PartidaDetailScreen() {
    const router = useRouter();
    const { partidaId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [partida, setPartida] = useState(null);

    useEffect(() => {
        loadPartida();
    }, [partidaId]);

    const loadPartida = async () => {
        try {
            setLoading(true);
            const result = await CampeonatoService.getPartida(partidaId);

            if (result.success) {
                console.log('Partida carregada:', result.data);
                setPartida(result.data);
            } else {
                Alert.alert('Erro', result.message);
                router.back();
            }
        } catch (error) {
            console.error('Erro ao carregar partida:', error);
            Alert.alert('Erro', 'Erro ao carregar detalhes da partida');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'finalizada':
                return Colors.success;
            case 'em_andamento':
                return Colors.warning;
            case 'agendada':
                return Colors.info;
            case 'wo':
                return Colors.error;
            default:
                return Colors.textSecondary;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'finalizada': 'Finalizada',
            'em_andamento': 'Em andamento',
            'agendada': 'Agendada',
            'wo': 'W.O.',
        };
        return labels[status] || status;
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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Carregando partida...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!partida) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Partida não encontrada</Text>
                </View>
            </SafeAreaView>
        );
    }

    const inscricao1 = partida.inscricao1;
    const inscricao2 = partida.inscricao2;
    const vencedor = partida.inscricao_vencedora_id;

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
                    <Text style={styles.headerTitle}>Detalhes da Partida</Text>
                    <Text style={styles.headerSubtitle}>{getFaseLabel(partida.fase)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadPartida}
                >
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(partida.status) }]}>
                            <Text style={styles.statusText}>{getStatusLabel(partida.status)}</Text>
                        </View>
                    </View>
                </View>

                {/* Placar Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Placar</Text>

                    {/* Competidor 1 */}
                    <View style={[
                        styles.competidorCard,
                        vencedor === inscricao1?.id && styles.competidorVencedor
                    ]}>
                        <View style={styles.competidorHeader}>
                            <View style={styles.competidorInfo}>
                                <Text style={styles.competidorNome}>
                                    {inscricao1?.usuario?.nome || 'Jogador 1'}
                                </Text>
                                {inscricao1?.parceiro && (
                                    <Text style={styles.parceiroNome}>
                                        {inscricao1.parceiro.nome}
                                    </Text>
                                )}
                            </View>
                            {vencedor === inscricao1?.id && (
                                <Ionicons name="trophy" size={28} color={Colors.warning} />
                            )}
                        </View>
                        <Text style={styles.placarNumero}>{partida.sets_inscricao1 || 0}</Text>
                    </View>

                    <View style={styles.versus}>
                        <Text style={styles.versusText}>VS</Text>
                    </View>

                    {/* Competidor 2 */}
                    <View style={[
                        styles.competidorCard,
                        vencedor === inscricao2?.id && styles.competidorVencedor
                    ]}>
                        <View style={styles.competidorHeader}>
                            <View style={styles.competidorInfo}>
                                <Text style={styles.competidorNome}>
                                    {inscricao2?.usuario?.nome || 'Jogador 2'}
                                </Text>
                                {inscricao2?.parceiro && (
                                    <Text style={styles.parceiroNome}>
                                        {inscricao2.parceiro.nome}
                                    </Text>
                                )}
                            </View>
                            {vencedor === inscricao2?.id && (
                                <Ionicons name="trophy" size={28} color={Colors.warning} />
                            )}
                        </View>
                        <Text style={styles.placarNumero}>{partida.sets_inscricao2 || 0}</Text>
                    </View>
                </View>

                {/* Informações da Partida */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Informações</Text>

                    {partida.data_hora && (
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.infoLabel}>Data/Hora:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(partida.data_hora).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    )}

                    {partida.quadra && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.infoLabel}>Quadra:</Text>
                            <Text style={styles.infoValue}>{partida.quadra.nome}</Text>
                        </View>
                    )}

                    {partida.arbitro && (
                        <View style={styles.infoRow}>
                            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.infoLabel}>Árbitro:</Text>
                            <Text style={styles.infoValue}>{partida.arbitro.nome}</Text>
                        </View>
                    )}

                    {partida.duracao_minutos && (
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.infoLabel}>Duração:</Text>
                            <Text style={styles.infoValue}>{partida.duracao_minutos} minutos</Text>
                        </View>
                    )}

                    {partida.iniciada_em && (
                        <View style={styles.infoRow}>
                            <Ionicons name="play-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.infoLabel}>Início:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(partida.iniciada_em).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    )}

                    {partida.finalizada_em && (
                        <View style={styles.infoRow}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.infoLabel}>Término:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(partida.finalizada_em).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Observações */}
                {partida.observacoes && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Observações</Text>
                        <Text style={styles.observacoesText}>{partida.observacoes}</Text>
                    </View>
                )}

                {/* Sets Detalhados */}
                {partida.sets && partida.sets.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Sets</Text>
                        {partida.sets.map((set, index) => (
                            <View key={set.id} style={styles.setRow}>
                                <Text style={styles.setNumero}>Set {set.numero}</Text>
                                <View style={styles.setPlacar}>
                                    <Text style={styles.setPlacarText}>
                                        {set.pontos_inscricao1} x {set.pontos_inscricao2}
                                    </Text>
                                </View>
                                {set.inscricao_vencedora_set_id && (
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
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
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.md,
    },
    card: {
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
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    statusText: {
        fontSize: Typography.sizes.md,
        color: '#FFFFFF',
    },
    competidorCard: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    competidorVencedor: {
        backgroundColor: '#FFF9E6',
        borderWidth: 2,
        borderColor: Colors.warning,
    },
    competidorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    competidorInfo: {
        flex: 1,
    },
    competidorNome: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
    },
    parceiroNome: {
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    placarNumero: {
        fontSize: 48,
        color: Colors.primary,
        textAlign: 'center',
    },
    versus: {
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    versusText: {
        fontSize: Typography.sizes.lg,
        color: Colors.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoLabel: {
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        marginLeft: Spacing.sm,
        width: 100,
    },
    infoValue: {
        flex: 1,
        fontSize: Typography.sizes.md,
        color: Colors.textPrimary,
    },
    observacoesText: {
        fontSize: Typography.sizes.md,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    setNumero: {
        fontSize: Typography.sizes.md,
        color: Colors.textPrimary,
        width: 80,
    },
    setPlacar: {
        flex: 1,
    },
    setPlacarText: {
        fontSize: Typography.sizes.lg,
        color: Colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: Typography.sizes.lg,
        color: Colors.textSecondary,
    },
});
