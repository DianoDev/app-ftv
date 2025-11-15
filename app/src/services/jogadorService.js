import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const JogadorService = {
    /**
     * Get current jogador profile
     */
    async getMe() {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/jogadores/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Error getting jogador profile:', error);
            return {
                success: false,
                message: error.message || 'Erro ao carregar perfil',
            };
        }
    },

    /**
     * Create jogador profile
     */
    async create(jogadorData) {
        try {
            const token = await StorageService.getToken();
            const user = await StorageService.getUser();

            if (!token || !user) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/jogadores', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...jogadorData,
                    user_id: user.id,
                }),
            });

            return {
                success: true,
                data: response.data,
                message: 'Perfil criado com sucesso!',
            };
        } catch (error) {
            console.error('Error creating jogador:', error);

            // Parse validation errors
            if (error.errors) {
                const errorMessages = Object.values(error.errors).flat().join('\n');
                return {
                    success: false,
                    message: errorMessages,
                    errors: error.errors,
                };
            }

            return {
                success: false,
                message: error.message || 'Erro ao criar perfil',
            };
        }
    },

    /**
     * Update jogador profile
     */
    async update(jogadorId, jogadorData) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/jogadores/${jogadorId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(jogadorData),
            });

            return {
                success: true,
                data: response.data,
                message: 'Perfil atualizado com sucesso!',
            };
        } catch (error) {
            console.error('Error updating jogador:', error);

            // Parse validation errors
            if (error.errors) {
                const errorMessages = Object.values(error.errors).flat().join('\n');
                return {
                    success: false,
                    message: errorMessages,
                    errors: error.errors,
                };
            }

            return {
                success: false,
                message: error.message || 'Erro ao atualizar perfil',
            };
        }
    },

    /**
     * Get jogador ranking
     */
    async getRanking(params = {}) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const queryParams = new URLSearchParams(params).toString();
            const url = `/api/jogadores/ranking${queryParams ? `?${queryParams}` : ''}`;

            const response = await apiRequest(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return {
                success: true,
                data: response.data || response,
            };
        } catch (error) {
            console.error('Error getting ranking:', error);
            return {
                success: false,
                message: error.message || 'Erro ao carregar ranking',
            };
        }
    },

    /**
     * List all jogadores with pagination
     */
    async list(params = {}) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const queryParams = new URLSearchParams(params).toString();
            const url = `/api/jogadores${queryParams ? `?${queryParams}` : ''}`;

            const response = await apiRequest(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return {
                success: true,
                data: response.data || response,
            };
        } catch (error) {
            console.error('Error listing jogadores:', error);
            return {
                success: false,
                message: error.message || 'Erro ao carregar jogadores',
            };
        }
    },
};
