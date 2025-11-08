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
import { StorageService } from '../../services/storage';

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


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá, Arena! 🏟️</Text>
                        <Text style={styles.subtitle}>Bem-vindo ao painel da arena</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={confirmLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.logoutText}>Sair</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Cards de Ações Rápidas */}
                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>

                    <View style={styles.cardsContainer}>
                        <TouchableOpacity style={[styles.card, styles.cardPrimary]}>
                            <Text style={styles.cardIcon}>📅</Text>
                            <Text style={styles.cardTitle}>Agendamentos</Text>
                            <Text style={styles.cardDescription}>Gerenciar reservas</Text>
                        </TouchableOpacity>

                        {/* CARD ATUALIZADO - Agora com navegação */}
                        <TouchableOpacity
                            style={[styles.card, styles.cardSecondary]}
                            onPress={handleListQuadra}
                        >
                            <Text style={styles.cardIcon}>🏐</Text>
                            <Text style={styles.cardTitle}>Quadras</Text>
                            <Text style={styles.cardDescription}>Ver disponibilidade</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardSuccess]}>
                            <Text style={styles.cardIcon}>💰</Text>
                            <Text style={styles.cardTitle}>Financeiro</Text>
                            <Text style={styles.cardDescription}>Receitas e pagamentos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardWarning]}>
                            <Text style={styles.cardIcon}>⚙️</Text>
                            <Text style={styles.cardTitle}>Configurações</Text>
                            <Text style={styles.cardDescription}>Perfil da arena</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Botão destaque para adicionar quadra */}
                <TouchableOpacity
                    style={styles.addQuadraButton}
                    onPress={handleNovaQuadra}
                >
                    <Text style={styles.addQuadraIcon}>➕</Text>
                    <View style={styles.addQuadraContent}>
                        <Text style={styles.addQuadraTitle}>Cadastrar Nova Quadra</Text>
                        <Text style={styles.addQuadraDescription}>
                            Adicione uma nova quadra à sua arena
                        </Text>
                    </View>
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
                            <Text style={styles.appointmentHour}>14:00</Text>
                        </View>
                        <View style={styles.appointmentInfo}>
                            <Text style={styles.appointmentTitle}>Quadra 1 - Jogo Amistoso</Text>
                            <Text style={styles.appointmentDetail}>João Silva e equipe</Text>
                        </View>
                    </View>

                    <View style={styles.appointmentCard}>
                        <View style={styles.appointmentTime}>
                            <Text style={styles.appointmentHour}>16:00</Text>
                        </View>
                        <View style={styles.appointmentInfo}>
                            <Text style={styles.appointmentTitle}>Quadra 2 - Treino</Text>
                            <Text style={styles.appointmentDetail}>Time Águias</Text>
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
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: '#007AFF',
    },
    cardSecondary: {
        backgroundColor: '#34C759',
    },
    cardSuccess: {
        backgroundColor: '#FF9500',
    },
    cardWarning: {
        backgroundColor: '#AF52DE',
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
    // NOVO: Botão destaque para adicionar quadra
    addQuadraButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#34C759',
        borderStyle: 'dashed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    addQuadraIcon: {
        fontSize: 36,
        marginRight: 16,
    },
    addQuadraContent: {
        flex: 1,
    },
    addQuadraTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34C759',
        marginBottom: 4,
    },
    addQuadraDescription: {
        fontSize: 14,
        color: '#666',
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
        color: '#007AFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    appointmentsSection: {
        marginBottom: 30,
    },
    appointmentCard: {
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
    appointmentTime: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appointmentHour: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    appointmentInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    appointmentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1b1b18',
        marginBottom: 4,
    },
    appointmentDetail: {
        fontSize: 14,
        color: '#666',
    },
});