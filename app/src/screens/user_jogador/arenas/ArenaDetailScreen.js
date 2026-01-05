import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ArenaService } from '../../../services/arenaService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function ArenaDetailScreen() {
    const router = useRouter();
    const { arenaId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [arena, setArena] = useState(null);

    useEffect(() => {
        loadArena();
    }, [arenaId]);

    const loadArena = async () => {
        try {
            setLoading(true);
            const result = await ArenaService.getArena(arenaId);

            if (result.success) {
                const arenaData = result.data.arena || result.data;
                console.log('Arena carregada:', arenaData);
                setArena(arenaData);
            } else {
                Alert.alert('Erro', result.message);
                router.back();
            }
        } catch (error) {
            console.error('Erro ao carregar arena:', error);
            Alert.alert('Erro', 'Erro ao carregar detalhes da arena');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleCallPhone = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleOpenWhatsApp = (whatsapp) => {
        const phoneNumber = whatsapp.replace(/\D/g, '');
        Linking.openURL(`whatsapp://send?phone=55${phoneNumber}`);
    };

    const handleOpenMaps = () => {
        if (arena.latitude && arena.longitude) {
            const url = `https://www.google.com/maps/search/?api=1&query=${arena.latitude},${arena.longitude}`;
            Linking.openURL(url);
        } else if (arena.endereco) {
            const address = encodeURIComponent(`${arena.endereco}, ${arena.cidade}, ${arena.estado}`);
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
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

    if (!arena) {
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
                <Text style={styles.headerTitle}>Detalhes da Arena</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Card Principal */}
                <View style={styles.mainCard}>
                    {/* Nome e Avaliação */}
                    <View style={styles.titleSection}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="location" size={32} color="#FFD300" />
                        </View>
                        <View style={styles.titleInfo}>
                            <Text style={styles.arenaName}>{arena.nome}</Text>
                            {arena.rating != null && arena.rating > 0 && (
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={18} color="#FFD300" />
                                    <Text style={styles.ratingText}>{Number(arena.rating).toFixed(1)}</Text>
                                    <Text style={styles.ratingLabel}>estrelas</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Localização */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="map" size={20} color="#FFD300" />
                            <Text style={styles.sectionTitle}>Localização</Text>
                        </View>
                        {arena.endereco && (
                            <Text style={styles.address}>{arena.endereco}</Text>
                        )}
                        <Text style={styles.city}>
                            {arena.cidade}, {arena.estado}
                        </Text>
                        {(arena.latitude && arena.longitude) || arena.endereco ? (
                            <TouchableOpacity
                                style={styles.mapButton}
                                onPress={handleOpenMaps}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                                <Text style={styles.mapButtonText}>Abrir no Maps</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Contato */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="call" size={20} color="#FFD300" />
                            <Text style={styles.sectionTitle}>Contato</Text>
                        </View>
                        <View style={styles.contactButtons}>
                            {arena.telefone && (
                                <TouchableOpacity
                                    style={styles.contactButton}
                                    onPress={() => handleCallPhone(arena.telefone)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="call-outline" size={20} color="#FFD300" />
                                    <Text style={styles.contactButtonText}>{arena.telefone}</Text>
                                </TouchableOpacity>
                            )}
                            {arena.whatsapp && (
                                <TouchableOpacity
                                    style={[styles.contactButton, styles.whatsappButton]}
                                    onPress={() => handleOpenWhatsApp(arena.whatsapp)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="logo-whatsapp" size={20} color="#4CAF50" />
                                    <Text style={[styles.contactButtonText, { color: '#4CAF50' }]}>
                                        {arena.whatsapp}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Descrição */}
                    {arena.descricao && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="information-circle" size={20} color="#FFD300" />
                                <Text style={styles.sectionTitle}>Sobre</Text>
                            </View>
                            <Text style={styles.description}>{arena.descricao}</Text>
                        </View>
                    )}

                    {/* Comodidades */}
                    {arena.comodidades && arena.comodidades.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                <Text style={styles.sectionTitle}>Comodidades</Text>
                            </View>
                            <View style={styles.comodidadesGrid}>
                                {arena.comodidades.map((comodidade, index) => (
                                    <View key={index} style={styles.comodidadeItem}>
                                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                                        <Text style={styles.comodidadeText}>{comodidade}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Quadras */}
                {arena.quadras && arena.quadras.length > 0 && (
                    <View style={styles.quadrasSection}>
                        <View style={styles.quadrasHeader}>
                            <Ionicons name="football" size={24} color="#FFD300" />
                            <Text style={styles.quadrasTitle}>
                                Quadras ({arena.quadras.length})
                            </Text>
                        </View>

                        {arena.quadras.map((quadra, index) => (
                            <View key={quadra.id || index} style={styles.quadraCard}>
                                <View style={styles.quadraHeader}>
                                    <View style={styles.quadraIconContainer}>
                                        <Ionicons name="football-outline" size={24} color="#FFD300" />
                                    </View>
                                    <View style={styles.quadraInfo}>
                                        <Text style={styles.quadraNome}>
                                            {quadra.nome || `Quadra ${index + 1}`}
                                        </Text>
                                        {quadra.tipo && (
                                            <Text style={styles.quadraTipo}>{quadra.tipo}</Text>
                                        )}
                                    </View>
                                    {quadra.ativa !== undefined && (
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: quadra.ativa ? '#4CAF50' : '#F44336' }
                                        ]}>
                                            <Text style={styles.statusText}>
                                                {quadra.ativa ? 'Ativa' : 'Inativa'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Detalhes da Quadra */}
                                <View style={styles.quadraDetails}>
                                    {quadra.tamanho && (
                                        <View style={styles.quadraDetailItem}>
                                            <Ionicons name="resize-outline" size={18} color="#FFD300" />
                                            <Text style={styles.quadraDetailLabel}>Tamanho:</Text>
                                            <Text style={styles.quadraDetailValue}>{quadra.tamanho}</Text>
                                        </View>
                                    )}

                                    {quadra.tipo_piso && (
                                        <View style={styles.quadraDetailItem}>
                                            <Ionicons name="layers-outline" size={18} color="#FFD300" />
                                            <Text style={styles.quadraDetailLabel}>Piso:</Text>
                                            <Text style={styles.quadraDetailValue}>{quadra.tipo_piso}</Text>
                                        </View>
                                    )}

                                    {quadra.capacidade_jogadores && (
                                        <View style={styles.quadraDetailItem}>
                                            <Ionicons name="people-outline" size={18} color="#FFD300" />
                                            <Text style={styles.quadraDetailLabel}>Capacidade:</Text>
                                            <Text style={styles.quadraDetailValue}>
                                                {quadra.capacidade_jogadores} jogadores
                                            </Text>
                                        </View>
                                    )}

                                    {quadra.coberta !== undefined && (
                                        <View style={styles.quadraDetailItem}>
                                            <Ionicons
                                                name={quadra.coberta ? "umbrella" : "sunny-outline"}
                                                size={18}
                                                color="#FFD300"
                                            />
                                            <Text style={styles.quadraDetailLabel}>
                                                {quadra.coberta ? 'Coberta' : 'Descoberta'}
                                            </Text>
                                        </View>
                                    )}

                                    {quadra.iluminacao !== undefined && (
                                        <View style={styles.quadraDetailItem}>
                                            <Ionicons
                                                name={quadra.iluminacao ? "bulb" : "bulb-outline"}
                                                size={18}
                                                color={quadra.iluminacao ? "#FFD300" : "#666666"}
                                            />
                                            <Text style={styles.quadraDetailLabel}>
                                                {quadra.iluminacao ? 'Com iluminação' : 'Sem iluminação'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Observações da Quadra */}
                                {quadra.observacoes && (
                                    <View style={styles.quadraObservacoes}>
                                        <Text style={styles.quadraObservacoesLabel}>Observações:</Text>
                                        <Text style={styles.quadraObservacoesText}>
                                            {quadra.observacoes}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Mensagem caso não tenha quadras */}
                {(!arena.quadras || arena.quadras.length === 0) && (
                    <View style={styles.emptyQuadras}>
                        <Ionicons name="alert-circle-outline" size={48} color="#666666" />
                        <Text style={styles.emptyQuadrasText}>
                            Nenhuma quadra cadastrada para esta arena
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
        width: 60,
        height: 60,
        borderRadius: 30,
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
    arenaName: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFD300',
        marginBottom: Spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: Typography.sizes.h3,
        fontWeight: '700',
        color: '#FFD300',
    },
    ratingLabel: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
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
    address: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    city: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginBottom: Spacing.sm,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FFD300',
        alignSelf: 'flex-start',
    },
    mapButtonText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    contactButtons: {
        gap: Spacing.sm,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    whatsappButton: {
        borderColor: '#4CAF50',
    },
    contactButtonText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    description: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    comodidadesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    comodidadeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: 6,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    comodidadeText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    quadrasSection: {
        marginBottom: Spacing.md,
    },
    quadrasHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    quadrasTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    quadraCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    quadraHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    quadraIconContainer: {
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
    quadraInfo: {
        flex: 1,
    },
    quadraNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    quadraTipo: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    quadraDetails: {
        gap: Spacing.sm,
    },
    quadraDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quadraDetailLabel: {
        fontSize: Typography.sizes.body,
        color: '#999999',
    },
    quadraDetailValue: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    quadraObservacoes: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    quadraObservacoesLabel: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginBottom: 4,
    },
    quadraObservacoesText: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    emptyQuadras: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl * 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderStyle: 'dashed',
    },
    emptyQuadrasText: {
        fontSize: Typography.sizes.body,
        color: '#666666',
        marginTop: Spacing.md,
        textAlign: 'center',
    },
});
