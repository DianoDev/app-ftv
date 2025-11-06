import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfessorHomeScreen() {
    const router = useRouter();

    const handleLogout = () => {
        // TODO: Limpar AsyncStorage
        router.replace('/src/screens/auth/LoginScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá, Professor! 📚</Text>
                        <Text style={styles.subtitle}>Gerencie suas aulas e alunos</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </View>

                {/* Cards de Ações Rápidas */}
                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>

                    <View style={styles.cardsContainer}>
                        <TouchableOpacity style={[styles.card, styles.cardPrimary]}>
                            <Text style={styles.cardIcon}>📅</Text>
                            <Text style={styles.cardTitle}>Aulas</Text>
                            <Text style={styles.cardDescription}>Gerenciar agenda</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSecondary]}>
                            <Text style={styles.cardIcon}>👥</Text>
                            <Text style={styles.cardTitle}>Alunos</Text>
                            <Text style={styles.cardDescription}>Ver lista de alunos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSuccess]}>
                            <Text style={styles.cardIcon}>📊</Text>
                            <Text style={styles.cardTitle}>Progresso</Text>
                            <Text style={styles.cardDescription}>Acompanhar evolução</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardWarning]}>
                            <Text style={styles.cardIcon}>💰</Text>
                            <Text style={styles.cardTitle}>Pagamentos</Text>
                            <Text style={styles.cardDescription}>Ver recebimentos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Estatísticas do Dia */}
                <View style={styles.statsSection}>
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
                <View style={styles.classesSection}>
                    <Text style={styles.sectionTitle}>Próximas Aulas</Text>

                    <View style={styles.classCard}>
                        <View style={styles.classTime}>
                            <Text style={styles.classHour}>10:00</Text>
                            <Text style={styles.classDuration}>1h30</Text>
                        </View>
                        <View style={styles.classInfo}>
                            <Text style={styles.classTitle}>Técnicas de Saque</Text>
                            <Text style={styles.classStudents}>👥 8 alunos • Iniciante</Text>
                            <Text style={styles.classLocation}>📍 Arena Beach Club</Text>
                        </View>
                        <View style={styles.classStatus}>
                            <View style={[styles.statusBadge, styles.statusConfirmed]}>
                                <Text style={styles.statusText}>✓</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.classCard}>
                        <View style={styles.classTime}>
                            <Text style={styles.classHour}>14:00</Text>
                            <Text style={styles.classDuration}>2h</Text>
                        </View>
                        <View style={styles.classInfo}>
                            <Text style={styles.classTitle}>Tática de Jogo</Text>
                            <Text style={styles.classStudents}>👥 6 alunos • Avançado</Text>
                            <Text style={styles.classLocation}>📍 Praia do Futuro</Text>
                        </View>
                        <View style={styles.classStatus}>
                            <View style={[styles.statusBadge, styles.statusPending]}>
                                <Text style={styles.statusText}>!</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.classCard}>
                        <View style={styles.classTime}>
                            <Text style={styles.classHour}>17:00</Text>
                            <Text style={styles.classDuration}>1h</Text>
                        </View>
                        <View style={styles.classInfo}>
                            <Text style={styles.classTitle}>Aula Particular</Text>
                            <Text style={styles.classStudents}>👤 1 aluno • Intermediário</Text>
                            <Text style={styles.classLocation}>📍 Arena Praia Verde</Text>
                        </View>
                        <View style={styles.classStatus}>
                            <View style={[styles.statusBadge, styles.statusConfirmed]}>
                                <Text style={styles.statusText}>✓</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Solicitações Pendentes */}
                <View style={styles.requestsSection}>
                    <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>

                    <View style={styles.requestCard}>
                        <View style={styles.requestInfo}>
                            <Text style={styles.requestName}>Maria Santos</Text>
                            <Text style={styles.requestDetails}>Aula experimental • Iniciante</Text>
                            <Text style={styles.requestTime}>Há 2 horas</Text>
                        </View>
                        <View style={styles.requestActions}>
                            <TouchableOpacity style={styles.acceptButton}>
                                <Text style={styles.acceptButtonText}>✓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton}>
                                <Text style={styles.rejectButtonText}>✕</Text>
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
                            <TouchableOpacity style={styles.acceptButton}>
                                <Text style={styles.acceptButtonText}>✓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton}>
                                <Text style={styles.rejectButtonText}>✕</Text>
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
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1b1b18',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
    },
    quickActions: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 16,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '48%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    cardPrimary: {
        backgroundColor: '#5856D6',
    },
    cardSecondary: {
        backgroundColor: '#007AFF',
    },
    cardSuccess: {
        backgroundColor: '#34C759',
    },
    cardWarning: {
        backgroundColor: '#FF9500',
    },
    cardIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
    },
    statsSection: {
        marginBottom: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5856D6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    classesSection: {
        marginBottom: 30,
    },
    classCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    classTime: {
        backgroundColor: '#5856D6',
        padding: 12,
        borderRadius: 8,
        marginRight: 16,
        alignItems: 'center',
        minWidth: 60,
    },
    classHour: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    classDuration: {
        fontSize: 12,
        color: '#fff',
        marginTop: 4,
    },
    classInfo: {
        flex: 1,
    },
    classTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 4,
    },
    classStudents: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    classLocation: {
        fontSize: 14,
        color: '#666',
    },
    classStatus: {
        marginLeft: 12,
    },
    statusBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusConfirmed: {
        backgroundColor: '#34C759',
    },
    statusPending: {
        backgroundColor: '#FF9500',
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    requestsSection: {
        marginBottom: 30,
    },
    requestCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    requestInfo: {
        flex: 1,
    },
    requestName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 4,
    },
    requestDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    requestTime: {
        fontSize: 12,
        color: '#999',
    },
    requestActions: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        backgroundColor: '#34C759',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    rejectButton: {
        backgroundColor: '#ff4444',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});