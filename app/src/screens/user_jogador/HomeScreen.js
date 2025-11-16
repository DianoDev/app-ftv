import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StorageService } from "../../services/storage";
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../styles/theme';

export default function JogadorHomeScreen() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userName, setUserName] = useState('Jogador');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await StorageService.getUser();
            if (user && user.nome) {
                setUserName(user.nome.split(' ')[0]); // Pega apenas o primeiro nome
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await StorageService.logout();
            console.log('✅ Logout realizado com sucesso');
            router.replace('/src/screens/auth/LoginScreen');
        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);

            Alert.alert(
                'Aviso',
                'Houve um problema ao fazer logout, mas seus dados locais foram limpos.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/src/screens/auth/LoginScreen'),
                    },
                ]
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Confirmar Logout',
            'Deseja realmente sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    onPress: handleLogout,
                    style: 'destructive',
                },
            ]
        );
    };

    // Navegações para as novas telas
    const navigateToArenas = () => {
        router.push('/src/screens/user_jogador/mapa/ArenasMapScreen');
    };

    const navigateToRachas = () => {
        router.push('/src/screens/user_jogador/mapa/RachasMapScreen');
    };

    const navigateToCreateRacha = () => {
        router.push('/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen');
    };

    const navigateToProfile = () => {
        router.push('/src/screens/user_jogador/jogador/EditJogadorScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={32} color="#FFD300" />
                        </View>
                        <View>
                            <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
                            <Text style={styles.subtitle}>Pronto para jogar?</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={confirmLogout}
                        disabled={isLoggingOut}
                        activeOpacity={0.8}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#FFD300" size="small" />
                        ) : (
                            <Ionicons name="log-out-outline" size={22} color="#FFD300" />
                        )}
                    </TouchableOpacity>
                </View>


                {/* Menu Principal */}
                <View style={styles.mainMenu}>
                    <Text style={styles.sectionTitle}>Menu Principal</Text>

                    <View style={styles.menuGrid}>
                        {/* Arenas */}
                        <TouchableOpacity
                            style={styles.menuCard}
                            onPress={navigateToArenas}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="location" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Arenas</Text>
                            <Text style={styles.menuCardDescription}>Encontre quadras próximas</Text>
                        </TouchableOpacity>

                        {/* Rachas */}
                        <TouchableOpacity
                            style={styles.menuCard}
                            onPress={navigateToRachas}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="tennisball" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Rachas</Text>
                            <Text style={styles.menuCardDescription}>Partidas disponíveis</Text>
                        </TouchableOpacity>

                        {/* Perfil */}
                        <TouchableOpacity
                            style={styles.menuCard}
                            onPress={navigateToProfile}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="person" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Perfil</Text>
                            <Text style={styles.menuCardDescription}>Meus dados</Text>
                        </TouchableOpacity>

                        {/* Ranking */}
                        <TouchableOpacity
                            style={[styles.menuCard, styles.menuCardRanking]}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="trophy" size={32}  color="#000000"  />
                            </View>
                            <Text style={styles.menuCardTitle}>Ranking</Text>
                            <Text style={styles.menuCardDescription}>Ver classificação</Text>
                        </TouchableOpacity>

                        {/* Torneios */}
                        <TouchableOpacity
                            style={[styles.menuCard, styles.menuCardTournaments]}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="medal" size={32}  color="#000000"  />
                            </View>
                            <Text style={styles.menuCardTitle}>Torneios</Text>
                            <Text style={styles.menuCardDescription}>Competições</Text>
                        </TouchableOpacity>

                        {/* Estatísticas */}
                        <TouchableOpacity
                            style={[styles.menuCard, styles.menuCardStats]}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="bar-chart" size={32}  color="#000000"  />
                            </View>
                            <Text style={styles.menuCardTitle}>Estatísticas</Text>
                            <Text style={styles.menuCardDescription}>Meu desempenho</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Estatísticas Rápidas */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Minhas Estatísticas</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="game-controller" size={24} color="#FFD300" />
                            </View>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Partidas</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="checkmark-circle" size={24} color="#FFD300" />
                            </View>
                            <Text style={styles.statNumber}>18</Text>
                            <Text style={styles.statLabel}>Vitórias</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="trending-up" size={24} color="#FFD300" />
                            </View>
                            <Text style={styles.statNumber}>75%</Text>
                            <Text style={styles.statLabel}>Win Rate</Text>
                        </View>
                    </View>
                </View>

                {/* Próximos Rachas */}
                <View style={styles.upcomingSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Próximos Rachas</Text>
                        <TouchableOpacity onPress={navigateToRachas}>
                            <Text style={styles.seeAllText}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.rachaCard}
                        onPress={navigateToRachas}
                        activeOpacity={0.8}
                    >
                        <View style={styles.rachaHeader}>
                            <View style={styles.rachaDateContainer}>
                                <Text style={styles.rachaDay}>SAB</Text>
                                <Text style={styles.rachaDate}>09/11</Text>
                            </View>
                            <View style={styles.rachaTimeContainer}>
                                <Ionicons name="time" size={16} color="#FFD300" />
                                <Text style={styles.rachaTime}>14:00</Text>
                            </View>
                        </View>
                        <View style={styles.rachaBody}>
                            <Text style={styles.rachaTitle}>Arena Praia do Forte</Text>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="people" size={16} color="#FFD300" />
                                <Text style={styles.rachaInfoText}>6/8 confirmados</Text>
                            </View>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="location" size={16} color="#999999" />
                                <Text style={styles.rachaInfoText}>Copacabana, RJ</Text>
                            </View>
                        </View>
                        <View style={styles.rachaFooter}>
                            <View style={styles.rachaStatusBadge}>
                                <Text style={styles.rachaStatusText}>Vagas Disponíveis</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.rachaCard}
                        onPress={navigateToRachas}
                        activeOpacity={0.8}
                    >
                        <View style={styles.rachaHeader}>
                            <View style={styles.rachaDateContainer}>
                                <Text style={styles.rachaDay}>DOM</Text>
                                <Text style={styles.rachaDate}>10/11</Text>
                            </View>
                            <View style={styles.rachaTimeContainer}>
                                <Ionicons name="time" size={16} color="#FFD300" />
                                <Text style={styles.rachaTime}>16:00</Text>
                            </View>
                        </View>
                        <View style={styles.rachaBody}>
                            <Text style={styles.rachaTitle}>Arena Beach Sports</Text>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="people" size={16} color="#999999" />
                                <Text style={styles.rachaInfoText}>8/8 confirmados</Text>
                            </View>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="location" size={16} color="#999999" />
                                <Text style={styles.rachaInfoText}>Ipanema, RJ</Text>
                            </View>
                        </View>
                        <View style={styles.rachaFooter}>
                            <View style={[styles.rachaStatusBadge, styles.rachaStatusFull]}>
                                <Text style={[styles.rachaStatusText, styles.rachaStatusFullText]}>Completo</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Dicas Rápidas */}
                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>Dica do Dia 💡</Text>

                    <View style={styles.tipCard}>
                        <View style={styles.tipIconContainer}>
                            <Ionicons name="bulb" size={32} color="#000000" />
                        </View>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Explore novas arenas!</Text>
                            <Text style={styles.tipText}>
                                Conheça diferentes quadras e encontre a perfeita para você jogar.
                            </Text>
                            <TouchableOpacity
                                style={styles.tipButton}
                                onPress={navigateToArenas}
                            >
                                <Text style={styles.tipButtonText}>Ver Arenas</Text>
                                <Ionicons name="arrow-forward" size={16} color="#FFD300" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a', // Fundo escuro tecnológico
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        backgroundColor: '#0a0a0a',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        flex: 1,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD300',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    greeting: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: '#1a1a1a',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFD300',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // Menu Principal
    mainMenu: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.md,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    menuCard: {
        width: '48%',
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        minHeight: 140,
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 3,
    },
    menuIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFD300',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        elevation: 3,
    },
    menuCardTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFD300',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    menuCardDescription: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
    },

    // Estatísticas
    statsSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        marginBottom: Spacing.xs,
    },
    statNumber: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.numbersWeight,
        color: '#FFD300',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
    },

    // Próximos Rachas
    upcomingSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    seeAllText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#FFD300',
        fontWeight: Typography.fonts.headingWeight,
    },
    rachaCard: {
        backgroundColor: '#1a1a1a',
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    rachaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    rachaDateContainer: {
        alignItems: 'center',
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    rachaDay: {
        fontSize: 10,
        fontWeight: Typography.fonts.headingWeight,
        color: '#000000',
        letterSpacing: 0.5,
    },
    rachaDate: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.displayWeight,
        color: '#000000',
    },
    rachaTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: '#2a2a2a',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    rachaTime: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    rachaBody: {
        marginBottom: Spacing.sm,
    },
    rachaTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    rachaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: 4,
    },
    rachaInfoText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
    },
    rachaFooter: {
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        paddingTop: Spacing.sm,
    },
    rachaStatusBadge: {
        backgroundColor: 'rgba(255, 211, 0, 0.15)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    rachaStatusText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: Typography.fonts.headingWeight,
    },
    rachaStatusFull: {
        backgroundColor: 'rgba(153, 153, 153, 0.15)',
        borderColor: '#666666',
    },
    rachaStatusFullText: {
        color: '#999999',
    },

    // Dicas
    tipsSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    tipCard: {
        backgroundColor: '#1a1a1a',
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        flexDirection: 'row',
        gap: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tipIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFD300',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    tipText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    tipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    tipButtonText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#FFD300',
        fontWeight: Typography.fonts.headingWeight,
    },
    bottomSpacer: {
        height: Spacing.xl,
    },
});