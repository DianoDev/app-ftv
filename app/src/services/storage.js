// services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../Config/api.config';

const TOKEN_KEY = '@ftv:token';
const USER_KEY = '@ftv:user';

export const StorageService = {
    // Salvar token
    async saveToken(token) {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
            console.log('💾 Token salvo com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar token:', error);
            return false;
        }
    },

    // Recuperar token
    async getToken() {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                console.log('✅ Token recuperado');
            }
            return token;
        } catch (error) {
            console.error('❌ Erro ao recuperar token:', error);
            return null;
        }
    },

    // Remover token
    async removeToken() {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            console.log('🗑️ Token removido');
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover token:', error);
            return false;
        }
    },

    // Salvar dados do usuário
    async saveUser(user) {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
            console.log('💾 Dados do usuário salvos');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar usuário:', error);
            return false;
        }
    },

    // Recuperar dados do usuário
    async getUser() {
        try {
            const user = await AsyncStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('❌ Erro ao recuperar usuário:', error);
            return null;
        }
    },

    // Remover dados do usuário
    async removeUser() {
        try {
            await AsyncStorage.removeItem(USER_KEY);
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover usuário:', error);
            return false;
        }
    },

    // Limpar todos os dados
    async clearAll() {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            console.log('🧹 Storage limpo');
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar storage:', error);
            return false;
        }
    },

    // NOVO: Logout com chamada ao backend
    async logout() {
        try {
            console.log('🔐 Iniciando logout...');

            // Recupera o token para enviar na requisição
            const token = await this.getToken();

            if (token) {
                // Chama o backend para invalidar o token
                try {
                    await apiRequest('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    console.log('✅ Token invalidado no servidor');
                } catch (apiError) {
                    console.warn('⚠️ Erro ao invalidar token no servidor:', apiError);
                    // Continua mesmo com erro, para limpar dados locais
                }
            }

            // Limpa os dados locais
            await this.clearAll();
            console.log('✅ Logout concluído');

            return true;
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            // Tenta limpar dados locais mesmo com erro
            await this.clearAll();
            return false;
        }
    }
};