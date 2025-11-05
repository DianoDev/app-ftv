import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure o URL da sua API Laravel
const API_URL = 'http://localhost:8000/api'; // Altere para o IP do seu servidor

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout
      await AsyncStorage.removeItem('auth_token');
      // Você pode adicionar navegação para tela de login aqui
    }
    return Promise.reject(error);
  }
);

export default api;
