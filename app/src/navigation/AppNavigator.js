// src/navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar telas de autenticação
import SelectAccountTypeScreen from '../screens/auth/SelectAccountTypeScreen';
import RegisterJogadorScreen from '../screens/auth/RegisterJogadorScreen';
import RegisterProfessorScreen from '../screens/auth/RegisterProfessorScreen';
import RegisterArenaScreen from '../screens/auth/RegisterArenaScreen';
// import LoginScreen from '../screens/auth/LoginScreen';

// Importar cores
import { colors } from '../styles/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SelectAccountType"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.jogador.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitle: 'Voltar',
          animation: 'slide_from_right',
        }}
      >
        {/* Tela de Seleção de Tipo de Conta */}
        <Stack.Screen
          name="SelectAccountType"
          component={SelectAccountTypeScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Tela de Registro - Jogador */}
        <Stack.Screen
          name="RegisterJogador"
          component={RegisterJogadorScreen}
          options={{
            title: 'Cadastro de Jogador',
            headerStyle: {
              backgroundColor: colors.jogador.primary,
            },
            headerTintColor: colors.white,
          }}
        />

        {/* Tela de Registro - Professor */}
        <Stack.Screen
          name="RegisterProfessor"
          component={RegisterProfessorScreen}
          options={{
            title: 'Cadastro de Professor',
            headerStyle: {
              backgroundColor: colors.professor.primary,
            },
            headerTintColor: colors.white,
          }}
        />

        {/* Tela de Registro - Arena */}
        <Stack.Screen
          name="RegisterArena"
          component={RegisterArenaScreen}
          options={{
            title: 'Cadastro de Arena',
            headerStyle: {
              backgroundColor: colors.arena.primary,
            },
            headerTintColor: colors.white,
          }}
        />

        {/* Tela de Login (descomente quando criar) */}
        {/*
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Login',
            headerStyle: {
              backgroundColor: colors.jogador.primary,
            },
            headerTintColor: colors.white,
          }}
        />
        */}

        {/* 
        ================================================
        Adicione aqui as telas principais do app
        (Home, Profile, etc.)
        ================================================
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
