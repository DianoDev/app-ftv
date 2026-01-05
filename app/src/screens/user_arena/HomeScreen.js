import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StorageService } from '../../services/storage';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles, Icons } from '../../styles/theme';

export default function ArenaHomeScreen() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userName, setUserName] = useState('Arena');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await StorageService.getUser();
            if (user && user.nome) {
                setUserName(user.nome.split(' ')[0]);
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
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="business" size={32} color="#FFD300" />
                        </View>
                        <View>
                            <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
                            <Text style={styles.subtitle}>Painel da Arena</Text>
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
                        <TouchableOpacity
                            style={styles.menuCard}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="calendar" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Agendamentos</Text>
                            <Text style={styles.menuCardDescription}>Gerenciar reservas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuCard}
                            onPress={handleListQuadra}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="grid" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Quadras</Text>
                            <Text style={styles.menuCardDescription}>Ver disponibilidade</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuCard}
                            onPress={handleListCampeonato}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="trophy" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Campeonatos</Text>
                            <Text style={styles.menuCardDescription}>Gerenciar torneios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuCard}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="settings" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Configurações</Text>
                            <Text style={styles.menuCardDescription}>Perfil da arena</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuCard}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="bar-chart" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Relatórios</Text>
                            <Text style={styles.menuCardDescription}>Análises e dados</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuCard}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="wallet" size={32} color="#000000" />
                            </View>
                            <Text style={styles.menuCardTitle}>Financeiro</Text>
                            <Text style={styles.menuCardDescription}>Receitas e gastos</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Estatísticas Rápidas */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Estatísticas de Hoje</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="calendar" size={24} color="#FFD300" />
                            </View>
                            <Text style={styles.statNumber}>8</Text>
                            <Text style={styles.statLabel}>Agendamentos</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="grid" size={24} color="#FFD300" />
                            </View>
                            <Text style={styles.statNumber}>4/6</Text>
                            <Text style={styles.statLabel}>Quadras Ocupadas</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="cash" size={24} color="#FFD300" />
                            </View>
                            <Text style={styles.statNumber}>R$ 1.2k</Text>
                            <Text style={styles.statLabel}>Receita</Text>
                        </View>
                    </View>
                </View>

                {/* Próximos Agendamentos */}
                <View style={styles.appointmentsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.appointmentCard} activeOpacity={0.8}>
                        <View style={styles.appointmentHeader}>
                            <View style={styles.appointmentDateContainer}>
                                <Text style={styles.appointmentDay}>HOJE</Text>
                                <Text style={styles.appointmentDate}>14:00</Text>
                            </View>
                            <View style={styles.appointmentTimeContainer}>
                                <Ionicons name="time" size={16} color="#FFD300" />
                                <Text style={styles.appointmentTime}>2h</Text>
                            </View>
                        </View>
                        <View style={styles.appointmentBody}>
                            <Text style={styles.appointmentTitle}>Quadra 1 - Jogo Amistoso</Text>
                            <View style={styles.appointmentInfo}>
                                <Ionicons name="person" size={16} color="#999999" />
                                <Text style={styles.appointmentInfoText}>João Silva e equipe</Text>
                            </View>
                        </View>
                        <View style={styles.appointmentFooter}>
                            <View style={styles.appointmentStatusBadge}>
                                <Text style={styles.appointmentStatusText}>Confirmado</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.appointmentCard} activeOpacity={0.8}>
                        <View style={styles.appointmentHeader}>
                            <View style={styles.appointmentDateContainer}>
                                <Text style={styles.appointmentDay}>HOJE</Text>
                                <Text style={styles.appointmentDate}>16:00</Text>
                            </View>
                            <View style={styles.appointmentTimeContainer}>
                                <Ionicons name="time" size={16} color="#FFD300" />
                                <Text style={styles.appointmentTime}>1h</Text>
                            </View>
                        </View>
                        <View style={styles.appointmentBody}>
                            <Text style={styles.appointmentTitle}>Quadra 2 - Treino</Text>
                            <View style={styles.appointmentInfo}>
                                <Ionicons name="people" size={16} color="#999999" />
                                <Text style={styles.appointmentInfoText}>Time Águias</Text>
                            </View>
                        </View>
                        <View style={styles.appointmentFooter}>
                            <View style={styles.appointmentStatusBadge}>
                                <Text style={styles.appointmentStatusText}>Confirmado</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
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
    actionSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    addQuadraButton: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD300',
        shadowColor: '#FFD300',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addQuadraIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFD300',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    addQuadraContent: {
        flex: 1,
    },
    addQuadraTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    addQuadraDescription: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
    },
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
    appointmentsSection: {
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
    appointmentCard: {
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
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    appointmentDateContainer: {
        alignItems: 'center',
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    appointmentDay: {
        fontSize: 10,
        fontWeight: Typography.fonts.headingWeight,
        color: '#000000',
        letterSpacing: 0.5,
    },
    appointmentDate: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.displayWeight,
        color: '#000000',
    },
    appointmentTimeContainer: {
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
    appointmentTime: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    appointmentBody: {
        marginBottom: Spacing.sm,
    },
    appointmentTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    appointmentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: 4,
    },
    appointmentInfoText: {
        fontSize: Typography.sizes.bodySmall,
        color: '#999999',
    },
    appointmentFooter: {
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        paddingTop: Spacing.sm,
    },
    appointmentStatusBadge: {
        backgroundColor: 'rgba(255, 211, 0, 0.15)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    appointmentStatusText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: Typography.fonts.headingWeight,
    },
    bottomSpacer: {
        height: Spacing.xl,
    },
});