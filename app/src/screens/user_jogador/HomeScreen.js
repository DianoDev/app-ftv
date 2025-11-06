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

export default function JogadorHomeScreen() {
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
                        <Text style={styles.greeting}>Olá, Jogador! 🏐</Text>
                        <Text style={styles.subtitle}>Pronto para jogar?</Text>
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
                            <Text style={styles.cardIcon}>🎮</Text>
                            <Text style={styles.cardTitle}>Partidas</Text>
                            <Text style={styles.cardDescription}>Encontrar jogos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSecondary]}>
                            <Text style={styles.cardIcon}>👥</Text>
                            <Text style={styles.cardTitle}>Times</Text>
                            <Text style={styles.cardDescription}>Meus times</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSuccess]}>
                            <Text style={styles.cardIcon}>🏆</Text>
                            <Text style={styles.cardTitle}>Torneios</Text>
                            <Text style={styles.cardDescription}>Ver competições</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardWarning]}>
                            <Text style={styles.cardIcon}>📊</Text>
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

                    <View style={styles.matchCard}>
                        <View style={styles.matchHeader}>
                            <Text style={styles.matchDate}>Sábado, 09/11</Text>
                            <Text style={styles.matchTime}>14:00</Text>
                        </View>
                        <View style={styles.matchBody}>
                            <Text style={styles.matchTitle}>Jogo Amistoso</Text>
                            <Text style={styles.matchLocation}>📍 Arena Praia do Forte</Text>
                            <Text style={styles.matchPlayers}>👥 6/8 jogadores confirmados</Text>
                        </View>
                        <TouchableOpacity style={styles.matchButton}>
                            <Text style={styles.matchButtonText}>Ver Detalhes</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.matchCard}>
                        <View style={styles.matchHeader}>
                            <Text style={styles.matchDate}>Domingo, 10/11</Text>
                            <Text style={styles.matchTime}>16:00</Text>
                        </View>
                        <View style={styles.matchBody}>
                            <Text style={styles.matchTitle}>Torneio Verão 2024</Text>
                            <Text style={styles.matchLocation}>📍 Arena Beach Sports</Text>
                            <Text style={styles.matchPlayers}>🏆 Fase Classificatória</Text>
                        </View>
                        <TouchableOpacity style={styles.matchButton}>
                            <Text style={styles.matchButtonText}>Ver Detalhes</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notificações */}
                <View style={styles.notificationsSection}>
                    <Text style={styles.sectionTitle}>Notificações</Text>

                    <View style={styles.notificationCard}>
                        <Text style={styles.notificationIcon}>🔔</Text>
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>Nova partida disponível!</Text>
                            <Text style={styles.notificationText}>
                                Seu amigo João criou uma partida para amanhã
                            </Text>
                        </View>
                    </View>

                    <View style={styles.notificationCard}>
                        <Text style={styles.notificationIcon}>⚠️</Text>
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>Lembrete de partida</Text>
                            <Text style={styles.notificationText}>
                                Você tem uma partida em 2 horas
                            </Text>
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
        backgroundColor: '#34C759',
    },
    cardSecondary: {
        backgroundColor: '#007AFF',
    },
    cardSuccess: {
        backgroundColor: '#FF9500',
    },
    cardWarning: {
        backgroundColor: '#5856D6',
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
        color: '#34C759',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    matchesSection: {
        marginBottom: 30,
    },
    matchCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    matchDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    matchTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    matchBody: {
        marginBottom: 12,
    },
    matchTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1b1b18',
        marginBottom: 8,
    },
    matchLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    matchPlayers: {
        fontSize: 14,
        color: '#666',
    },
    matchButton: {
        backgroundColor: '#34C759',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    matchButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    notificationsSection: {
        marginBottom: 30,
    },
    notificationCard: {
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
    },
    notificationIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 4,
    },
    notificationText: {
        fontSize: 12,
        color: '#666',
    },
});