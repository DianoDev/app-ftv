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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {StorageService} from "../../services/storage";
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/theme';

export default function ProfessorHomeScreen() {
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
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá, Professor! 📚</Text>
                        <Text style={styles.subtitle}>Gerencie suas aulas e alunos</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={confirmLogout}
                        disabled={isLoggingOut}
                        activeOpacity={0.8}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#000000" size="small" />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={18} color="#000000" />
                                <Text style={styles.logoutText}>Sair</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Cards de Ações Rápidas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>

                    <View style={styles.cardsContainer}>
                        <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
                            <View style={styles.quickCardIcon}>
                                <Ionicons name="calendar" size={28} color="#FFD300" />
                            </View>
                            <Text style={styles.quickCardTitle}>Aulas</Text>
                            <Text style={styles.quickCardDescription}>Gerenciar agenda</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
                            <View style={styles.quickCardIcon}>
                                <Ionicons name="people" size={28} color="#FFD300" />
                            </View>
                            <Text style={styles.quickCardTitle}>Alunos</Text>
                            <Text style={styles.quickCardDescription}>Ver lista de alunos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
                            <View style={styles.quickCardIcon}>
                                <Ionicons name="stats-chart" size={28} color="#FFD300" />
                            </View>
                            <Text style={styles.quickCardTitle}>Progresso</Text>
                            <Text style={styles.quickCardDescription}>Acompanhar evolução</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
                            <View style={styles.quickCardIcon}>
                                <Ionicons name="cash" size={28} color="#FFD300" />
                            </View>
                            <Text style={styles.quickCardTitle}>Pagamentos</Text>
                            <Text style={styles.quickCardDescription}>Ver recebimentos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Estatísticas do Dia */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hoje</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>5</Text>
                            <Text style={styles.statLabel}>Aulas</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>32</Text>
                            <Text style={styles.statLabel}>Alunos Ativos</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>4.8</Text>
                            <Text style={styles.statLabel}>Avaliação</Text>
                        </View>
                    </View>
                </View>

                {/* Próximas Aulas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Próximas Aulas</Text>

                    <View style={styles.classCard}>
                        <View style={styles.classTime}>
                            <Text style={styles.classHour}>10:00</Text>
                            <Text style={styles.classDuration}>1h30</Text>
                        </View>
                        <View style={styles.classInfo}>
                            <Text style={styles.classTitle}>Técnicas de Saque</Text>
                            <View style={styles.classDetail}>
                                <Ionicons name="people" size={14} color="#FFD300" />
                                <Text style={styles.classDetailText}>8 alunos • Iniciante</Text>
                            </View>
                            <View style={styles.classDetail}>
                                <Ionicons name="location" size={14} color="#FFD300" />
                                <Text style={styles.classDetailText}>Arena Beach Club</Text>
                            </View>
                        </View>
                        <View style={styles.statusBadgeConfirmed}>
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.classCard}>
                        <View style={styles.classTime}>
                            <Text style={styles.classHour}>14:00</Text>
                            <Text style={styles.classDuration}>2h</Text>
                        </View>
                        <View style={styles.classInfo}>
                            <Text style={styles.classTitle}>Tática de Jogo</Text>
                            <View style={styles.classDetail}>
                                <Ionicons name="people" size={14} color="#FFD300" />
                                <Text style={styles.classDetailText}>6 alunos • Avançado</Text>
                            </View>
                            <View style={styles.classDetail}>
                                <Ionicons name="location" size={14} color="#FFD300" />
                                <Text style={styles.classDetailText}>Praia do Futuro</Text>
                            </View>
                        </View>
                        <View style={styles.statusBadgePending}>
                            <Ionicons name="alert" size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.classCard}>
                        <View style={styles.classTime}>
                            <Text style={styles.classHour}>17:00</Text>
                            <Text style={styles.classDuration}>1h</Text>
                        </View>
                        <View style={styles.classInfo}>
                            <Text style={styles.classTitle}>Aula Particular</Text>
                            <View style={styles.classDetail}>
                                <Ionicons name="person" size={14} color="#FFD300" />
                                <Text style={styles.classDetailText}>1 aluno • Intermediário</Text>
                            </View>
                            <View style={styles.classDetail}>
                                <Ionicons name="location" size={14} color="#FFD300" />
                                <Text style={styles.classDetailText}>Arena Praia Verde</Text>
                            </View>
                        </View>
                        <View style={styles.statusBadgeConfirmed}>
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </View>
                    </View>
                </View>

                {/* Solicitações Pendentes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>

                    <View style={styles.requestCard}>
                        <View style={styles.requestInfo}>
                            <Text style={styles.requestName}>Maria Santos</Text>
                            <Text style={styles.requestDetails}>Aula experimental • Iniciante</Text>
                            <Text style={styles.requestTime}>Há 2 horas</Text>
                        </View>
                        <View style={styles.requestActions}>
                            <TouchableOpacity style={styles.acceptButton} activeOpacity={0.8}>
                                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton} activeOpacity={0.8}>
                                <Ionicons name="close" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.requestCard}>
                        <View style={styles.requestInfo}>
                            <Text style={styles.requestName}>Carlos Oliveira</Text>
                            <Text style={styles.requestDetails}>Aula em grupo • Intermediário</Text>
                            <Text style={styles.requestTime}>Há 5 horas</Text>
                        </View>
                        <View style={styles.requestActions}>
                            <TouchableOpacity style={styles.acceptButton} activeOpacity={0.8}>
                                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton} activeOpacity={0.8}>
                                <Ionicons name="close" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        padding: Spacing.lg,
        paddingBottom: Spacing.huge,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginTop: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.button,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    logoutText: {
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.small,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.md,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    quickCard: {
        width: '48%',
        backgroundColor: '#1a1a1a',
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        alignItems: 'center',
    },
    quickCardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    quickCardTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    quickCardDescription: {
        fontSize: Typography.sizes.small,
        color: '#999999',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    statNumber: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFD300',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: Typography.sizes.small,
        color: '#999999',
        textAlign: 'center',
    },
    classCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        padding: Spacing.md,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        alignItems: 'center',
    },
    classTime: {
        backgroundColor: '#2a2a2a',
        padding: Spacing.md,
        borderRadius: BorderRadius.input,
        marginRight: Spacing.md,
        alignItems: 'center',
        minWidth: 60,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    classHour: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFD300',
    },
    classDuration: {
        fontSize: Typography.sizes.small,
        color: '#FFFFFF',
        marginTop: 4,
    },
    classInfo: {
        flex: 1,
    },
    classTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    classDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: 2,
    },
    classDetailText: {
        fontSize: Typography.sizes.small,
        color: '#999999',
    },
    statusBadgeConfirmed: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#00FF88',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    statusBadgePending: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF9500',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    requestCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        padding: Spacing.md,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        alignItems: 'center',
    },
    requestInfo: {
        flex: 1,
    },
    requestName: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    requestDetails: {
        fontSize: Typography.sizes.small,
        color: '#999999',
        marginBottom: 2,
    },
    requestTime: {
        fontSize: Typography.sizes.caption,
        color: '#666666',
    },
    requestActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    acceptButton: {
        backgroundColor: '#00FF88',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButton: {
        backgroundColor: '#FF4444',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});