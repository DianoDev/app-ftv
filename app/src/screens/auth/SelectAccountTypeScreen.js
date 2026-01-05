import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '../../styles/theme';
const SelectAccountTypeScreen = ({ navigation }) => {
    const router = useRouter();
  const accountTypes = [
    {
      type: 'jogador',
      title: 'Jogador',
      description: 'Encontre partidas, arenas e professores',
      icon: 'person',
      color: Colors.secondary.ocean,
      route: '/src/screens/auth/RegisterJogadorScreen',
    },
    {
      type: 'professor',
      title: 'Professor',
      description: 'Ofereça aulas e treinamentos',
      icon: 'school',
      color: Colors.accent.lime,
      route: '/src/screens/auth/RegisterProfessorScreen',
    },
    {
      type: 'arena',
      title: 'Arena',
      description: 'Cadastre seu espaço esportivo',
      icon: 'location',
      color: Colors.accent.coral,
      route: '/src/screens/auth/RegisterArenaScreen',
    },
  ];

    const handleSelectType = (route) => {
        router.push(route);
    };

  return (
      <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../images/logo2.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Bem-vindo ao Futevôlei!</Text>
              <Text style={styles.subtitle}>Escolha o tipo de conta que você deseja criar</Text>
            </View>

            <View style={styles.cardsContainer}>
              {accountTypes.map((account) => (
                <TouchableOpacity
                  key={account.type}
                  style={styles.card}
                  onPress={() => handleSelectType(account.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, { backgroundColor: account.color }]}>
                    <Ionicons name={account.icon} size={32} color={Colors.neutral.white} />
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{account.title}</Text>
                    <Text style={styles.cardDescription}>{account.description}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={24} color={Colors.neutral.charcoal} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.push('/src/screens/auth/LoginScreen')}>
                <Text style={styles.footerText}>
                  Já tem uma conta? <Text style={styles.footerLink}>Faça login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.sandLight,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  header: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.fonts.displayWeight,
    color: Colors.neutral.navyDeep,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.neutral.charcoal,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  cardsContainer: {
    gap: Spacing.base,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...ComponentStyles.card,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.avatar,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.fonts.headingWeight,
    color: Colors.neutral.navyDeep,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutral.charcoal,
    lineHeight: Typography.sizes.bodySmall * Typography.lineHeights.normal,
  },
  footer: {
    marginTop: Spacing.xxxl,
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutral.charcoal,
  },
  footerLink: {
    fontWeight: Typography.fonts.headingWeight,
    color: Colors.secondary.ocean,
  },
});

export default SelectAccountTypeScreen;
