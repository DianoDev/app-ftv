import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
const SelectAccountTypeScreen = ({ navigation }) => {
    const router = useRouter();
  const accountTypes = [
    {
      type: 'jogador',
      title: 'Jogador',
      description: 'Encontre partidas, arenas e professores',
      icon: 'volleyball',
      color: '#2196F3',
      route: '/src/screens/auth/RegisterJogadorScreen',
    },
    {
      type: 'professor',
      title: 'Professor',
      description: 'Ofereça aulas e treinamentos',
      icon: 'whistle',
      color: '#4CAF50',
      route: '/src/screens/auth/RegisterProfessorScreen',
    },
    {
      type: 'arena',
      title: 'Arena',
      description: 'Cadastre seu espaço esportivo',
      icon: 'map-marker',
      color: '#FF9800',
      route: '/src/screens/auth/RegisterArenaScreen',
    },
  ];

    const handleSelectType = (route) => {
        router.push(route);
    };

  return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo ao FutevôleiApp! 🏐</Text>
          <Text style={styles.subtitle}>Escolha o tipo de conta que você deseja criar</Text>
        </View>

        <View style={styles.cardsContainer}>
          {accountTypes.map((account) => (
            <TouchableOpacity
              key={account.type}
              style={[styles.card, { borderLeftColor: account.color }]}
              onPress={() => handleSelectType(account.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: account.color }]}>
                <Icon name={account.icon} size={40} color="#fff" />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{account.title}</Text>
                <Text style={styles.cardDescription}>{account.description}</Text>
              </View>

              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Já tem uma conta? <Text style={styles.footerLink}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  footerLink: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default SelectAccountTypeScreen;
