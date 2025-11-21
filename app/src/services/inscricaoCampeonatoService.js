// services/inscricaoCampeonatoService.js
import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const InscricaoCampeonatoService = {
    /**
     * Criar nova inscrição
     */
    async criarInscricao(data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/inscricoes-campeonato', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Inscrição realizada com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao realizar inscrição');
        } catch (error) {
            console.error('Erro ao criar inscrição:', error);
            return {
                success: false,
                message: error.message || 'Erro ao realizar inscrição',
            };
        }
    },

    /**
     * Buscar minhas inscrições
     */
    async getMinhasInscricoes(params = {}) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const queryParams = new URLSearchParams({
                per_page: params.perPage || 20,
                page: params.page || 1,
                ...(params.status && { status: params.status }),
            }).toString();

            const response = await apiRequest(`/api/inscricoes-campeonato/minhas?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // A resposta já vem com a estrutura paginada diretamente
            if (response && response.data) {
                return {
                    success: true,
                    data: response, // response já contém current_page, data, last_page, etc.
                };
            }

            throw new Error('Erro ao buscar inscrições');
        } catch (error) {
            console.error('Erro ao buscar minhas inscrições:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar inscrições',
            };
        }
    },

    /**
     * Buscar detalhes de uma inscrição
     */
    async getInscricao(id) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/inscricoes-campeonato/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Inscrição não encontrada');
        } catch (error) {
            console.error('Erro ao buscar inscrição:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar inscrição',
            };
        }
    },

    /**
     * Cancelar inscrição
     */
    async cancelarInscricao(id) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/inscricoes-campeonato/${id}/cancelar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Inscrição cancelada com sucesso',
                };
            }

            throw new Error(response.message || 'Erro ao cancelar inscrição');
        } catch (error) {
            console.error('Erro ao cancelar inscrição:', error);
            return {
                success: false,
                message: error.message || 'Erro ao cancelar inscrição',
            };
        }
    },

    /**
     * Verificar se o usuário tem inscrição em uma categoria
     */
    async verificarInscricao(categoriaId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/inscricoes-campeonato/verificar/${categoriaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return {
                success: true,
                data: response.data || response,
            };
        } catch (error) {
            console.error('Erro ao verificar inscrição:', error);
            return {
                success: false,
                data: { inscrito: false },
            };
        }
    },

    /**
     * Verificar inscrições do usuário em um campeonato
     */
    async verificarInscricoesCampeonato(campeonatoId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/inscricoes-campeonato/verificar-campeonato/${campeonatoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return {
                success: true,
                data: response.data || response,
            };
        } catch (error) {
            console.error('Erro ao verificar inscrições do campeonato:', error);
            return {
                success: false,
                data: { inscrito: false, categorias: [] },
            };
        }
    },
};
