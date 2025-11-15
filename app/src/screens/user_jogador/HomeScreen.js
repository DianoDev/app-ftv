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
        router.push('/src/screens/user_jogador/arenas/ArenasListScreen');
    };

    const navigateToRachas = () => {
        router.push('/src/screens/user_jogador/racha/SolicitacoesListScreen');
    };

    const navigateToCreateRacha = () => {
        router.push('/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen');
    };

    const navigateToProfile = () => {
        router.push('/src/screens/user_jogador/jogador/EditJogadorScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={32} color={Colors.primary.mikasaBright} />
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
                            <ActivityIndicator color={Colors.neutral.white} size="small" />
                        ) : (
                            <Ionicons name="log-out-outline" size={22} color={Colors.neutral.white} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Botão Destaque - Criar Racha */}
                <TouchableOpacity
                    style={styles.heroCard}
                    onPress={navigateToCreateRacha}
                    activeOpacity={0.9}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconContainer}>
                            <Ionicons name="add-circle" size={48} color={Colors.neutral.white} />
                        </View>
                        <View style={styles.heroText}>
                            <Text style={styles.heroTitle}>Criar Novo Racha</Text>
                            <Text style={styles.heroDescription}>
                                Organize uma partida e convide seus amigos
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.neutral.white} />
                </TouchableOpacity>

                {/* Menu Principal */}
                <View style={styles.mainMenu}>
                    <Text style={styles.sectionTitle}>Menu Principal</Text>

                    <View style={styles.menuGrid}>
                        {/* Arenas */}
                        <TouchableOpacity
                            style={[styles.menuCard, styles.menuCardArenas]}
                            onPress={navigateToArenas}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="location" size={32} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.menuCardTitle}>Arenas</Text>
                            <Text style={styles.menuCardDescription}>Encontre quadras próximas</Text>
                        </TouchableOpacity>

                        {/* Rachas */}
                        <TouchableOpacity
                            style={[styles.menuCard, styles.menuCardRachas]}
                            onPress={navigateToRachas}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="tennisball" size={32} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.menuCardTitle}>Rachas</Text>
                            <Text style={styles.menuCardDescription}>Partidas disponíveis</Text>
                        </TouchableOpacity>

                        {/* Perfil */}
                        <TouchableOpacity
                            style={[styles.menuCard, styles.menuCardProfile]}
                            onPress={navigateToProfile}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="person" size={32} color={Colors.neutral.white} />
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
                                <Ionicons name="trophy" size={32} color={Colors.neutral.white} />
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
                                <Ionicons name="medal" size={32} color={Colors.neutral.white} />
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
                                <Ionicons name="bar-chart" size={32} color={Colors.neutral.white} />
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
                                <Ionicons name="game-controller" size={24} color={Colors.accent.lime} />
                            </View>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Partidas</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                            </View>
                            <Text style={styles.statNumber}>18</Text>
                            <Text style={styles.statLabel}>Vitórias</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="trending-up" size={24} color={Colors.primary.mikasaBright} />
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
                                <Ionicons name="time" size={16} color={Colors.neutral.charcoal} />
                                <Text style={styles.rachaTime}>14:00</Text>
                            </View>
                        </View>
                        <View style={styles.rachaBody}>
                            <Text style={styles.rachaTitle}>Arena Praia do Forte</Text>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="people" size={16} color={Colors.accent.lime} />
                                <Text style={styles.rachaInfoText}>6/8 confirmados</Text>
                            </View>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="location" size={16} color={Colors.neutral.charcoal} />
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
                                <Ionicons name="time" size={16} color={Colors.neutral.charcoal} />
                                <Text style={styles.rachaTime}>16:00</Text>
                            </View>
                        </View>
                        <View style={styles.rachaBody}>
                            <Text style={styles.rachaTitle}>Arena Beach Sports</Text>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="people" size={16} color={Colors.accent.coral} />
                                <Text style={styles.rachaInfoText}>8/8 confirmados</Text>
                            </View>
                            <View style={styles.rachaInfo}>
                                <Ionicons name="location" size={16} color={Colors.neutral.charcoal} />
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
                            <Ionicons name="bulb" size={32} color={Colors.primary.mikasaBright} />
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
                                <Ionicons name="arrow-forward" size={16} color={Colors.primary.mikasaBright} />
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
        backgroundColor: Colors.neutral.sandLight,
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
        backgroundColor: Colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...ComponentStyles.card,
    },
    greeting: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
    },
    subtitle: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: Colors.accent.coral,
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...ComponentStyles.card,
    },

    // Hero Card - Criar Racha
    heroCard: {
        backgroundColor: Colors.accent.lime,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...ComponentStyles.card,
        shadowColor: Colors.accent.lime,
        shadowOpacity: 0.3,
        elevation: 8,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.md,
    },
    heroIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroText: {
        flex: 1,
    },
    heroTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.white,
        marginBottom: Spacing.xs,
    },
    heroDescription: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.white,
        opacity: 0.95,
    },

    // Menu Principal
    mainMenu: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
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
        ...ComponentStyles.card,
        minHeight: 140,
    },
    menuCardArenas: {
        backgroundColor: Colors.secondary.ocean,
    },
    menuCardRachas: {
        backgroundColor: Colors.accent.lime,
    },
    menuCardProfile: {
        backgroundColor: Colors.primary.mikasaBright,
    },
    menuCardRanking: {
        backgroundColor: Colors.accent.coral,
    },
    menuCardTournaments: {
        backgroundColor: '#9B59B6',
    },
    menuCardStats: {
        backgroundColor: '#3498DB',
    },
    menuIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    menuCardTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.white,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    menuCardDescription: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.white,
        opacity: 0.9,
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
        backgroundColor: Colors.neutral.white,
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        ...ComponentStyles.card,
    },
    statIconContainer: {
        marginBottom: Spacing.xs,
    },
    statNumber: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
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
        color: Colors.accent.lime,
        fontWeight: Typography.fonts.headingWeight,
    },
    rachaCard: {
        backgroundColor: Colors.neutral.white,
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        ...ComponentStyles.card,
    },
    rachaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    rachaDateContainer: {
        alignItems: 'center',
        backgroundColor: Colors.accent.lime + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    rachaDay: {
        fontSize: 10,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.accent.lime,
        letterSpacing: 0.5,
    },
    rachaDate: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.accent.lime,
    },
    rachaTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.neutral.sandLight,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    rachaTime: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.charcoal,
    },
    rachaBody: {
        marginBottom: Spacing.sm,
    },
    rachaTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
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
        color: Colors.neutral.charcoal,
    },
    rachaFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.sandLight,
        paddingTop: Spacing.sm,
    },
    rachaStatusBadge: {
        backgroundColor: Colors.accent.lime + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    rachaStatusText: {
        fontSize: Typography.sizes.caption,
        color: Colors.accent.lime,
        fontWeight: Typography.fonts.headingWeight,
    },
    rachaStatusFull: {
        backgroundColor: Colors.neutral.sandLight,
    },
    rachaStatusFullText: {
        color: Colors.neutral.charcoal,
    },

    // Dicas
    tipsSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    tipCard: {
        backgroundColor: Colors.neutral.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        flexDirection: 'row',
        gap: Spacing.md,
        ...ComponentStyles.card,
    },
    tipIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary.mikasaBright + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.xs,
    },
    tipText: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
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
        color: Colors.primary.mikasaBright,
        fontWeight: Typography.fonts.headingWeight,
    },
    bottomSpacer: {
        height: Spacing.xl,
    },
});
