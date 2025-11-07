// Configuração da API para o app-ftv

import { Platform } from 'react-native';

// Configuração da URL base conforme o ambiente
const getBaseUrl = () => {
    if (__DEV__) {
        // Em desenvolvimento
        if (Platform.OS === 'android') {
            // Android Emulator
            return 'http://10.0.2.2:8000';
        } else {
            // iOS Simulator
            return 'http://localhost:8000';
        }
    }

    // Em produção, use a URL do seu servidor
    return 'https://api.seuapp.com';
};

export const API_CONFIG = {
    BASE_URL: getBaseUrl(),
    TIMEOUT: 10000, // 10 segundos
    HEADERS: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
};

// Função auxiliar para fazer requisições
export const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            ...API_CONFIG.HEADERS,
            ...options.headers,
        },
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Timeout: A requisição demorou muito tempo');
        }
        throw error;
    }
};

// Exemplo de uso:
// import { apiRequest } from './api.config';
// const data = await apiRequest('/api/teste');