import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ArenaService } from '../../../services/arenaService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function ArenasMapScreen() {
    const router = useRouter();
    const mapRef = useRef(null);
    const [arenas, setArenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArena, setSelectedArena] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [region, setRegion] = useState({
        latitude: -23.5505, // São Paulo como padrão
        longitude: -46.6333,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useEffect(() => {
        loadArenas();
    }, []);

    const loadArenas = async () => {
        try {
            setLoading(true);
            const result = await ArenaService.listArenas({ perPage: 100 });

            if (result.success) {
                const arenasData = result.data.data || [];

                // Filtrar apenas arenas com latitude e longitude válidas
                const arenasComLocalizacao = arenasData.filter(
                    arena => arena.latitude && arena.longitude
                );

                setArenas(arenasComLocalizacao);

                // Se houver arenas, centralizar o mapa na primeira
                if (arenasComLocalizacao.length > 0) {
                    const firstArena = arenasComLocalizacao[0];
                    setRegion({
                        latitude: parseFloat(firstArena.latitude),
                        longitude: parseFloat(firstArena.longitude),
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    });
                }
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar arenas');
            }
        } catch (error) {
            console.error('Erro ao carregar arenas:', error);
            Alert.alert('Erro', 'Erro ao carregar arenas');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (arena) => {
        setSelectedArena(arena);
        setModalVisible(true);

        // Centralizar mapa no marcador selecionado
        mapRef.current?.animateToRegion({
            latitude: parseFloat(arena.latitude),
            longitude: parseFloat(arena.longitude),
            latitudeDelta: LATITUDE_DELTA / 2,
            longitudeDelta: LONGITUDE_DELTA / 2,
        });
    };

    const handleArenaPress = (arena) => {
        setModalVisible(false);
        router.push({
            pathname: '/src/screens/user_jogador/arenas/ArenaDetailScreen',
            params: { arenaId: arena.id }
        });
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedArena(null);
    };

    const handleMyLocation = () => {
        // Aqui você pode implementar a obtenção da localização do usuário
        // Por enquanto, vamos apenas resetar para a região inicial
        if (arenas.length > 0) {
            const firstArena = arenas[0];
            mapRef.current?.animateToRegion({
                latitude: parseFloat(firstArena.latitude),
                longitude: parseFloat(firstArena.longitude),
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            });
        }
    };

    const handleFitAllMarkers = () => {
        if (arenas.length > 0) {
            mapRef.current?.fitToCoordinates(
                arenas.map(arena => ({
                    latitude: parseFloat(arena.latitude),
                    longitude: parseFloat(arena.longitude),
                })),
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );
        }
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
                <Text style={styles.headerTitle}>Mapa de Arenas</Text>
                <TouchableOpacity
                    style={styles.listButton}
                    onPress={() => router.push('/src/screens/user_jogador/arenas/ArenasListScreen')}
                >
                    <Ionicons name="list" size={24} color="#FFD300" />
                </TouchableOpacity>
            </View>

            {/* Map */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando arenas...</Text>
                </View>
            ) : arenas.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="location-outline" size={64} color="#2a2a2a" />
                    <Text style={styles.emptyTitle}>Nenhuma arena encontrada</Text>
                    <Text style={styles.emptyText}>
                        Não há arenas com localização cadastrada
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
                    {arenas.map((arena) => (
                        <Marker
                            key={arena.id}
                            coordinate={{
                                latitude: parseFloat(arena.latitude),
                                longitude: parseFloat(arena.longitude),
                            }}
                            onPress={() => handleMarkerPress(arena)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.marker}>
                                    <Ionicons name="location" size={20} color="#FFD300" />
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
                        {selectedArena && (
                            <>
                                {/* Header do Modal */}
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderLeft}>
                                        <Ionicons
                                            name="location"
                                            size={24}
                                            color="#FFD300"
                                        />
                                        <Text style={styles.modalTitle}>
                                            {selectedArena.nome}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={closeModal}>
                                        <Ionicons name="close" size={28} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                {/* Informações */}
                                <ScrollView style={styles.modalScroll}>
                                    {/* Localização */}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoIcon}>
                                            <Ionicons name="location-outline" size={20} color="#FFD300" />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Endereço</Text>
                                            <Text style={styles.infoValue}>
                                                {selectedArena.endereco || `${selectedArena.cidade}, ${selectedArena.estado}`}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Cidade/Estado */}
                                    {selectedArena.cidade && selectedArena.estado && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="map-outline" size={20} color="#FFD300" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Cidade</Text>
                                                <Text style={styles.infoValue}>
                                                    {selectedArena.cidade}, {selectedArena.estado}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Telefone */}
                                    {selectedArena.telefone && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="call-outline" size={20} color="#FFD300" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Telefone</Text>
                                                <Text style={styles.infoValue}>
                                                    {selectedArena.telefone}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* WhatsApp */}
                                    {selectedArena.whatsapp && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="logo-whatsapp" size={20} color="#4CAF50" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>WhatsApp</Text>
                                                <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                                                    {selectedArena.whatsapp}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Avaliação */}
                                    {selectedArena.rating != null && selectedArena.rating > 0 && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="star" size={20} color="#FFD300" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Avaliação</Text>
                                                <Text style={styles.infoValue}>
                                                    {Number(selectedArena.rating).toFixed(1)} estrelas
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Comodidades */}
                                    {selectedArena.comodidades && selectedArena.comodidades.length > 0 && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Comodidades</Text>
                                                <View style={styles.comodidadesContainer}>
                                                    {selectedArena.comodidades.map((comodidade, index) => (
                                                        <View key={index} style={styles.comodidadeTag}>
                                                            <Text style={styles.comodidadeText}>{comodidade}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Descrição */}
                                    {selectedArena.descricao && (
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="document-text-outline" size={20} color="#FFD300" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Descrição</Text>
                                                <Text style={styles.infoValue}>
                                                    {selectedArena.descricao}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                {/* Botão Ver Detalhes */}
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => handleArenaPress(selectedArena)}
                                >
                                    <Text style={styles.detailsButtonText}>Ver Detalhes Completos</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#0a0a0a" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Info Badge */}
            {!loading && arenas.length > 0 && (
                <View style={styles.infoBadge}>
                    <Ionicons name="location" size={16} color="#FFD300" />
                    <Text style={styles.infoText}>
                        {arenas.length} {arenas.length === 1 ? 'arena' : 'arenas'}
                    </Text>
                </View>
            )}

            {/* Action Buttons */}
            {!loading && arenas.length > 0 && (
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
    },
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        backgroundColor: '#0a0a0a',
        borderRadius: 18,
        padding: 6,
        borderWidth: 2,
        borderColor: '#FFD300',
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
    modalScroll: {
        maxHeight: height * 0.5,
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
    comodidadesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    comodidadeTag: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    comodidadeText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '500',
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
