import React, { useState } from 'react';
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
import { StorageService } from '../../services/storage';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles, Icons } from '../../styles/theme';

export default function ArenaHomeScreen() {
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

    // Função para navegar para a tela de nova quadra
    const handleNovaQuadra = () => {
        router.push('/src/screens/user_arena/quadras/CreateQuadraScreen');
    };
    const handleListQuadra = () => {
        router.push('/src/screens/user_arena/quadras/ListQuadrasScreen');
    };

    const handleListCampeonato = () => {
        router.push('/src/screens/user_arena/campeonato/ListCampeonatoScreen');
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá, Arena!</Text>
                        <Text style={styles.subtitle}>Bem-vindo ao painel da arena</Text>
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
                                <Ionicons name="calendar" size={28} color={Colors.neutral.navyDeep} />
                            </View>
                            <Text style={styles.cardTitle}>Agendamentos</Text>
                            <Text style={styles.cardDescription}>Gerenciar reservas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.card, styles.cardSecondary]}
                            onPress={handleListQuadra}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="grid" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Quadras</Text>
                            <Text style={styles.cardDescription}>Ver disponibilidade</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.card, styles.cardSuccess]}
                            onPress={handleListCampeonato}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="trophy" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Campeonato</Text>
                            <Text style={styles.cardDescription}>Gerenciar torneios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardWarning]} activeOpacity={0.8}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="settings" size={28} color={Colors.neutral.white} />
                            </View>
                            <Text style={styles.cardTitle}>Configurações</Text>
                            <Text style={styles.cardDescription}>Perfil da arena</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Botão destaque para adicionar quadra */}
                <TouchableOpacity
                    style={styles.addQuadraButton}
                    onPress={handleNovaQuadra}
                    activeOpacity={0.8}
                >
                    <View style={styles.addQuadraIconContainer}>
                        <Ionicons name="add-circle" size={40} color={Colors.accent.lime} />
                    </View>
                    <View style={styles.addQuadraContent}>
                        <Text style={styles.addQuadraTitle}>Cadastrar Nova Quadra</Text>
                        <Text style={styles.addQuadraDescription}>
                            Adicione uma nova quadra à sua arena
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.neutral.charcoal} />
                </TouchableOpacity>

                {/* Estatísticas Rápidas */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Hoje</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>8</Text>
                            <Text style={styles.statLabel}>Agendamentos</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>4/6</Text>
                            <Text style={styles.statLabel}>Quadras Ocupadas</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>R$ 1.2k</Text>
                            <Text style={styles.statLabel}>Receita</Text>
                        </View>
                    </View>
                </View>

                {/* Próximos Agendamentos */}
                <View style={styles.appointmentsSection}>
                    <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>

                    <View style={styles.appointmentCard}>
                        <View style={styles.appointmentTime}>
                            <Ionicons name="time" size={20} color={Colors.neutral.white} style={{ marginBottom: 4 }} />
                            <Text style={styles.appointmentHour}>14:00</Text>
                        </View>
                        <View style={styles.appointmentInfo}>
                            <Text style={styles.appointmentTitle}>Quadra 1 - Jogo Amistoso</Text>
                            <Text style={styles.appointmentDetail}>João Silva e equipe</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.neutral.charcoal} />
                    </View>

                    <View style={styles.appointmentCard}>
                        <View style={styles.appointmentTime}>
                            <Ionicons name="time" size={20} color={Colors.neutral.white} style={{ marginBottom: 4 }} />
                            <Text style={styles.appointmentHour}>16:00</Text>
                        </View>
                        <View style={styles.appointmentInfo}>
                            <Text style={styles.appointmentTitle}>Quadra 2 - Treino</Text>
                            <Text style={styles.appointmentDetail}>Time Águias</Text>
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
        backgroundColor: Colors.primary.mikasaBright,
    },
    cardSecondary: {
        backgroundColor: Colors.secondary.ocean,
    },
    cardSuccess: {
        backgroundColor: Colors.accent.coral,
    },
    cardWarning: {
        backgroundColor: Colors.accent.lime,
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
    addQuadraButton: {
        flexDirection: 'row',
        backgroundColor: Colors.neutral.white,
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.xxxl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.accent.lime,
        borderStyle: 'dashed',
        ...ComponentStyles.card,
    },
    addQuadraIconContainer: {
        marginRight: Spacing.base,
    },
    addQuadraContent: {
        flex: 1,
    },
    addQuadraTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.accent.lime,
        marginBottom: Spacing.xs,
    },
    addQuadraDescription: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
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
        color: Colors.primary.mikasaBright,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
    },
    appointmentsSection: {
        marginBottom: Spacing.xxxl,
    },
    appointmentCard: {
        flexDirection: 'row',
        backgroundColor: Colors.neutral.white,
        padding: Spacing.base,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        alignItems: 'center',
        ...ComponentStyles.card,
    },
    appointmentTime: {
        backgroundColor: Colors.secondary.ocean,
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        marginRight: Spacing.base,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 60,
    },
    appointmentHour: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.neutral.white,
    },
    appointmentInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    appointmentTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.xs,
    },
    appointmentDetail: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
    },
});