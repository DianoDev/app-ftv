import React, {useState} from 'react';
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
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles, Icons } from '../../styles/theme';

export default function JogadorHomeScreen() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá, Jogador!</Text>
                        <Text style={styles.subtitle}>Pronto para jogar?</Text>
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
                            <Ionicons name="log-out-outline" size={20} color={Colors.neutral.white} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Cards de Ações Rápidas */}
                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>

                    <View style={styles.cardsContainer}>
                        <TouchableOpacity style={[styles.card, styles.cardPrimary]} activeOpacity={0.8}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="game-controller" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Partidas</Text>
                            <Text style={styles.cardDescription}>Encontrar jogos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSecondary]} activeOpacity={0.8}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="people" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Times</Text>
                            <Text style={styles.cardDescription}>Meus times</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSuccess]} activeOpacity={0.8}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="trophy" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Torneios</Text>
                            <Text style={styles.cardDescription}>Ver competições</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardWarning]} activeOpacity={0.8}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="bar-chart" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Estatísticas</Text>
                            <Text style={styles.cardDescription}>Meu desempenho</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Minhas Estatísticas */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Minhas Estatísticas</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Partidas</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>18</Text>
                            <Text style={styles.statLabel}>Vitórias</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>75%</Text>
                            <Text style={styles.statLabel}>Taxa de Vitória</Text>
                        </View>
                    </View>
                </View>

                {/* Próximas Partidas */}
                <View style={styles.matchesSection}>
                    <Text style={styles.sectionTitle}>Próximas Partidas</Text>

                    <TouchableOpacity style={styles.matchCard} activeOpacity={0.8}>
                        <View style={styles.matchHeader}>
                            <View style={styles.matchDateBadge}>
                                <Ionicons name="calendar" size={16} color={Colors.secondary.ocean} />
                                <Text style={styles.matchDate}>Sábado, 09/11</Text>
                            </View>
                            <View style={styles.matchTimeBadge}>
                                <Ionicons name="time" size={16} color={Colors.neutral.charcoal} />
                                <Text style={styles.matchTime}>14:00</Text>
                            </View>
                        </View>
                        <View style={styles.matchBody}>
                            <Text style={styles.matchTitle}>Jogo Amistoso</Text>
                            <View style={styles.matchInfo}>
                                <Ionicons name="location" size={16} color={Colors.neutral.charcoal} />
                                <Text style={styles.matchLocation}>Arena Praia do Forte</Text>
                            </View>
                            <View style={styles.matchInfo}>
                                <Ionicons name="people" size={16} color={Colors.accent.lime} />
                                <Text style={styles.matchPlayers}>6/8 jogadores confirmados</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.matchButton} activeOpacity={0.8}>
                            <Text style={styles.matchButtonText}>Ver Detalhes</Text>
                            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.navyDeep} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.matchCard} activeOpacity={0.8}>
                        <View style={styles.matchHeader}>
                            <View style={styles.matchDateBadge}>
                                <Ionicons name="calendar" size={16} color={Colors.secondary.ocean} />
                                <Text style={styles.matchDate}>Domingo, 10/11</Text>
                            </View>
                            <View style={styles.matchTimeBadge}>
                                <Ionicons name="time" size={16} color={Colors.neutral.charcoal} />
                                <Text style={styles.matchTime}>16:00</Text>
                            </View>
                        </View>
                        <View style={styles.matchBody}>
                            <Text style={styles.matchTitle}>Torneio Verão 2024</Text>
                            <View style={styles.matchInfo}>
                                <Ionicons name="location" size={16} color={Colors.neutral.charcoal} />
                                <Text style={styles.matchLocation}>Arena Beach Sports</Text>
                            </View>
                            <View style={styles.matchInfo}>
                                <Ionicons name="trophy" size={16} color={Colors.accent.coral} />
                                <Text style={styles.matchPlayers}>Fase Classificatória</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.matchButton} activeOpacity={0.8}>
                            <Text style={styles.matchButtonText}>Ver Detalhes</Text>
                            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.navyDeep} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                {/* Notificações */}
                <View style={styles.notificationsSection}>
                    <Text style={styles.sectionTitle}>Notificações</Text>

                    <View style={styles.notificationCard}>
                        <View style={styles.notificationIconContainer}>
                            <Ionicons name="notifications" size={24} color={Colors.accent.lime} />
                        </View>
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>Nova partida disponível!</Text>
                            <Text style={styles.notificationText}>
                                Seu amigo João criou uma partida para amanhã
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.neutral.charcoal} />
                    </View>

                    <View style={styles.notificationCard}>
                        <View style={styles.notificationIconContainer}>
                            <Ionicons name="alert-circle" size={24} color={Colors.accent.coral} />
                        </View>
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>Lembrete de partida</Text>
                            <Text style={styles.notificationText}>
                                Você tem uma partida em 2 horas
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.neutral.charcoal} />
                    </View>
                </View>
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
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    greeting: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
    },
    subtitle: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
    },
    logoutButton: {
        backgroundColor: Colors.accent.coral,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.button,
        minWidth: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActions: {
        marginBottom: Spacing.xxxl,
    },
    sectionTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.base,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    card: {
        width: '48%',
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        ...ComponentStyles.card,
    },
    cardPrimary: {
        backgroundColor: Colors.accent.lime,
    },
    cardSecondary: {
        backgroundColor: Colors.secondary.ocean,
    },
    cardSuccess: {
        backgroundColor: Colors.accent.coral,
    },
    cardWarning: {
        backgroundColor: Colors.primary.mikasaBright,
    },
    cardIconContainer: {
        marginBottom: Spacing.sm,
    },
    cardTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.white,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.white,
        opacity: 0.9,
        textAlign: 'center',
    },
    statsSection: {
        marginBottom: Spacing.xxxl,
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
    statNumber: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.accent.lime,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
    },
    matchesSection: {
        marginBottom: Spacing.xxxl,
    },
    matchCard: {
        backgroundColor: Colors.neutral.white,
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        ...ComponentStyles.card,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    matchDateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    matchTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    matchDate: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.secondary.ocean,
    },
    matchTime: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.charcoal,
    },
    matchBody: {
        marginBottom: Spacing.md,
    },
    matchTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },
    matchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    matchLocation: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
    },
    matchPlayers: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
    },
    matchButton: {
        backgroundColor: Colors.primary.mikasaBright,
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    matchButtonText: {
        color: Colors.neutral.navyDeep,
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.bodySmall,
    },
    notificationsSection: {
        marginBottom: Spacing.xxxl,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: Colors.neutral.white,
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        alignItems: 'center',
        ...ComponentStyles.card,
    },
    notificationIconContainer: {
        marginRight: Spacing.md,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.xs,
    },
    notificationText: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
    },
});