import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SolicitacaoRachaService } from '../../../services/solicitacaoRachaService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function RachasMapScreen() {
    const router = useRouter();
    const mapRef = useRef(null);
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
    const [showOnlyOpen, setShowOnlyOpen] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [region, setRegion] = useState({
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useEffect(() => {
        loadSolicitacoes();
    }, [showOnlyOpen]);

    const loadSolicitacoes = async () => {
        try {
            setLoading(true);
            const params = {
                perPage: 100,
            };

            if (showOnlyOpen) {
                params.abertas = true;
            }

            const result = await SolicitacaoRachaService.listSolicitacoes(params);

            if (result.success) {
                const solicitacoesData = result.data.data || [];
                const solicitacoesComLocalizacao = solicitacoesData.filter(
                    solicitacao => solicitacao.arena?.latitude && solicitacao.arena?.longitude
                );
                setSolicitacoes(solicitacoesComLocalizacao);

                if (solicitacoesComLocalizacao.length > 0) {
                    const firstSolicitacao = solicitacoesComLocalizacao[0];
                    setRegion({
                        latitude: parseFloat(firstSolicitacao.arena.latitude),
                        longitude: parseFloat(firstSolicitacao.arena.longitude),
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    });
                }
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar rachas');
            }
        } catch (error) {
            console.error('Erro ao carregar rachas:', error);
            Alert.alert('Erro', 'Erro ao carregar rachas');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (solicitacao) => {
        setSelectedSolicitacao(solicitacao);
        setModalVisible(true);

        // Centralizar mapa no marcador selecionado
        mapRef.current?.animateToRegion({
            latitude: parseFloat(solicitacao.arena.latitude),
            longitude: parseFloat(solicitacao.arena.longitude),
            latitudeDelta: LATITUDE_DELTA / 2,
            longitudeDelta: LONGITUDE_DELTA / 2,
        });
    };

    const handleSolicitacaoPress = (solicitacao) => {
        setModalVisible(false);
        router.push({
            pathname: '/src/screens/user_jogador/racha/SolicitacaoDetailScreen',
            params: { solicitacaoId: solicitacao.id }
        });
    };

    const handleMyLocation = () => {
        if (solicitacoes.length > 0) {
            const firstSolicitacao = solicitacoes[0];
            mapRef.current?.animateToRegion({
                latitude: parseFloat(firstSolicitacao.arena.latitude),
                longitude: parseFloat(firstSolicitacao.arena.longitude),
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            });
        }
    };

    const handleFitAllMarkers = () => {
        if (solicitacoes.length > 0) {
            mapRef.current?.fitToCoordinates(
                solicitacoes.map(solicitacao => ({
                    latitude: parseFloat(solicitacao.arena.latitude),
                    longitude: parseFloat(solicitacao.arena.longitude),
                })),
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'aberta':
                return '#4CAF50';
            case 'confirmada':
                return '#FFD300';
            case 'cancelada':
                return '#F44336';
            case 'concluida':
                return '#999999';
            default:
                return '#999999';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'aberta':
                return 'Aberta';
            case 'confirmada':
                return 'Confirmada';
            case 'cancelada':
                return 'Cancelada';
            case 'concluida':
                return 'Concluída';
            default:
                return status;
        }
    };

    const toggleShowOnlyOpen = () => {
        setShowOnlyOpen(!showOnlyOpen);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedSolicitacao(null);
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
                <Text style={styles.headerTitle}>Mapa de Rachas</Text>
                <TouchableOpacity
                    style={styles.listButton}
                    onPress={() => router.push('/src/screens/user_jogador/racha/SolicitacoesListScreen')}
                >
                    <Ionicons name="list" size={24} color="#FFD300" />
                </TouchableOpacity>
            </View>

            {/* Map */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando rachas...</Text>
                </View>
            ) : solicitacoes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="tennisball-outline" size={64} color="#2a2a2a" />
                    <Text style={styles.emptyTitle}>Nenhum racha encontrado</Text>
                    <Text style={styles.emptyText}>
                        {showOnlyOpen
                            ? 'Não há rachas abertos com localização no momento'
                            : 'Não há rachas com localização cadastrados'}
                    </Text>
                </View>
            ) : (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    customMapStyle={mapStyle}
                >
                    {solicitacoes.map((solicitacao) => (
                        <Marker
                            key={solicitacao.id}
                            coordinate={{
                                latitude: parseFloat(solicitacao.arena.latitude),
                                longitude: parseFloat(solicitacao.arena.longitude),
                            }}
                            onPress={() => handleMarkerPress(solicitacao)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[
                                    styles.marker,
                                    { borderColor: getStatusColor(solicitacao.status) }
                                ]}>
                                    <Ionicons
                                        name="tennisball"
                                        size={20}
                                        color={getStatusColor(solicitacao.status)}
                                    />
                                </View>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}

            {/* Modal de Detalhes */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedSolicitacao && (
                            <>
                                {/* Header do Modal */}
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderLeft}>
                                        <Ionicons
                                            name="tennisball"
                                            size={24}
                                            color={getStatusColor(selectedSolicitacao.status)}
                                        />
                                        <Text style={styles.modalTitle}>
                                            {selectedSolicitacao.arena?.nome || 'Arena'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={closeModal}>
                                        <Ionicons name="close" size={28} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                {/* Status Badge */}
                                <View style={[
                                    styles.modalStatusBadge,
                                    {
                                        backgroundColor: getStatusColor(selectedSolicitacao.status) + '20',
                                        borderColor: getStatusColor(selectedSolicitacao.status)
                                    }
                                ]}>
                                    <Text style={[
                                        styles.modalStatusText,
                                        { color: getStatusColor(selectedSolicitacao.status) }
                                    ]}>
                                        {getStatusLabel(selectedSolicitacao.status)}
                                    </Text>
                                </View>

                                {/* Informações */}
                                <ScrollView style={styles.modalScroll}>
                                    {/* Data e Hora */}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoIcon}>
                                            <Ionicons name="calendar-outline" size={20} color="#FFD300" />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Data e Hora</Text>
                                            <Text style={styles.infoValue}>
                                                {formatDate(selectedSolicitacao.data_jogo)} às {selectedSolicitacao.hora_inicio}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Participantes */}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoIcon}>
                                            <Ionicons name="people-outline" size={20} color="#FFD300" />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Participantes</Text>
                                            <Text style={styles.infoValue}>
                                                {(selectedSolicitacao.participantes_count || 0) + 1} de {selectedSolicitacao.limite_participantes}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Valor */}
                                    {selectedSolicitacao.valor_por_pessoa && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Valor por Pessoa</Text>
                                                <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                                                    R$ {parseFloat(selectedSolicitacao.valor_por_pessoa).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Localização */}
                                    {selectedSolicitacao.arena?.endereco && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="location-outline" size={20} color="#FFD300" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Endereço</Text>
                                                <Text style={styles.infoValue}>
                                                    {selectedSolicitacao.arena.endereco}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Observações */}
                                    {selectedSolicitacao.observacoes && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="document-text-outline" size={20} color="#FFD300" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Observações</Text>
                                                <Text style={styles.infoValue}>
                                                    {selectedSolicitacao.observacoes}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                {/* Botão Ver Detalhes */}
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => handleSolicitacaoPress(selectedSolicitacao)}
                                >
                                    <Text style={styles.detailsButtonText}>Ver Detalhes Completos</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#0a0a0a" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Filter Badge */}
            {!loading && (
                <TouchableOpacity
                    style={styles.filterBadge}
                    onPress={toggleShowOnlyOpen}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={showOnlyOpen ? "filter" : "filter-outline"}
                        size={16}
                        color="#FFD300"
                    />
                    <Text style={styles.filterText}>
                        {showOnlyOpen ? 'Abertas' : 'Todas'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Info Badge */}
            {!loading && solicitacoes.length > 0 && (
                <View style={styles.infoBadge}>
                    <Ionicons name="tennisball" size={16} color="#FFD300" />
                    <Text style={styles.infoText}>
                        {solicitacoes.length} {solicitacoes.length === 1 ? 'racha' : 'rachas'}
                    </Text>
                </View>
            )}

            {/* Action Buttons */}
            {!loading && solicitacoes.length > 0 && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleMyLocation}
                    >
                        <Ionicons name="navigate" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleFitAllMarkers}
                    >
                        <Ionicons name="expand" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

// Estilo do mapa escuro - atualizado para remover POIs
const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#1a1a1a" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1a1a1a" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#2a2a2a" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.business",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#2a2a2a" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2a2a2a" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9a9a9a" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road.local",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#0a0a0a" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#4a4a4a" }]
    }
];

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
    listButton: {
        padding: Spacing.xs,
    },
    map: {
        flex: 1,
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
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        backgroundColor: '#0a0a0a',
        borderRadius: 18,
        padding: 6,
        borderWidth: 2,
    },
    // Estilos do Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        maxHeight: height * 0.75,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    modalTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
    },
    modalStatusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.lg,
    },
    modalStatusText: {
        fontSize: Typography.sizes.body,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    modalScroll: {
        maxHeight: height * 0.4,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    infoIcon: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    detailsButton: {
        backgroundColor: '#FFD300',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.lg,
        gap: Spacing.xs,
    },
    detailsButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: '700',
        color: '#0a0a0a',
    },
    filterBadge: {
        position: 'absolute',
        top: 80,
        left: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: '#FFD300',
        gap: 6,
    },
    filterText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    infoBadge: {
        position: 'absolute',
        top: 80,
        right: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: '#FFD300',
        gap: 6,
    },
    infoText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    actionButtons: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.md,
        gap: Spacing.sm,
    },
    actionButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD300',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});