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
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
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
        // Centralizar mapa no marcador selecionado
        mapRef.current?.animateToRegion({
            latitude: parseFloat(arena.latitude),
            longitude: parseFloat(arena.longitude),
            latitudeDelta: LATITUDE_DELTA / 2,
            longitudeDelta: LONGITUDE_DELTA / 2,
        });
    };

    const handleArenaPress = (arena) => {
        router.push({
            pathname: '/src/screens/user_jogador/arenas/ArenaDetailScreen',
            params: { arenaId: arena.id }
        });
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
                            <Callout onPress={() => handleArenaPress(arena)}>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{arena.nome}</Text>

                                    <View style={styles.calloutInfo}>
                                        <Ionicons name="location-outline" size={14} color="#999999" />
                                        <Text style={styles.calloutText}>
                                            {arena.endereco || `${arena.cidade}, ${arena.estado}`}
                                        </Text>
                                    </View>

                                    {arena.telefone && (
                                        <View style={styles.calloutInfo}>
                                            <Ionicons name="call-outline" size={14} color="#FFD300" />
                                            <Text style={styles.calloutText}>{arena.telefone}</Text>
                                        </View>
                                    )}

                                    {arena.whatsapp && (
                                        <View style={styles.calloutInfo}>
                                            <Ionicons name="logo-whatsapp" size={14} color="#4CAF50" />
                                            <Text style={styles.calloutText}>{arena.whatsapp}</Text>
                                        </View>
                                    )}

                                    {arena.rating && arena.rating > 0 && (
                                        <View style={styles.calloutInfo}>
                                            <Ionicons name="star" size={14} color="#FFD300" />
                                            <Text style={styles.calloutText}>
                                                {arena.rating.toFixed(1)} estrelas
                                            </Text>
                                        </View>
                                    )}

                                    {arena.comodidades && arena.comodidades.length > 0 && (
                                        <View style={styles.comodidadesWrapper}>
                                            <Ionicons name="checkmark-circle-outline" size={14} color="#4CAF50" />
                                            <View style={styles.comodidadesContainer}>
                                                {arena.comodidades.slice(0, 3).map((comodidade, index) => (
                                                    <View key={index} style={styles.comodidadeTag}>
                                                        <Text style={styles.comodidadeText}>{comodidade}</Text>
                                                    </View>
                                                ))}
                                                {arena.comodidades.length > 3 && (
                                                    <Text style={styles.moreComodidades}>
                                                        +{arena.comodidades.length - 3}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    <Text style={styles.calloutLink}>Toque para ver todos os detalhes</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            )}

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

// Estilo do mapa escuro
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
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#6a6a6a" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#2a2a2a" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2a2a2a" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9a9a9a" }]
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
        borderRadius: 15,
        padding: 3,
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    calloutContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        minWidth: 240,
        maxWidth: 280,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    calloutTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    calloutInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 6,
    },
    calloutText: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
        flex: 1,
    },
    comodidadesWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 6,
    },
    comodidadesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        flex: 1,
    },
    comodidadeTag: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    comodidadeText: {
        fontSize: 10,
        color: '#FFD300',
    },
    moreComodidades: {
        fontSize: 10,
        color: '#999999',
        alignSelf: 'center',
    },
    calloutLink: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        marginTop: 10,
        fontWeight: '700',
        textAlign: 'center',
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
