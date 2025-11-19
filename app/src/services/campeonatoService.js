// services/campeonatoService.js
import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const CampeonatoService = {
    /**
     * Listar campeonatos/torneios públicos
     */
    async listCampeonatos(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                per_page: params.perPage || 20,
                page: params.page || 1,
                ...(params.status && { status: params.status }),
                ...(params.search && { search: params.search }),
            }).toString();

            const response = await apiRequest(`/api/campeonatos-public?${queryParams}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao buscar campeonatos');
        } catch (error) {
            console.error('Erro ao listar campeonatos:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar campeonatos',
            };
        }
    },

    /**
     * Buscar campeonato por ID (com categorias)
     */
    async getCampeonato(id) {
        try {
            const response = await apiRequest(`/api/campeonatos-public/${id}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Campeonato não encontrado');
        } catch (error) {
            console.error('Erro ao buscar campeonato:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar campeonato',
            };
        }
    },

    /**
     * Buscar categoria específica do campeonato
     */
    async getCategoria(campeonatoId, categoriaId) {
        try {
            const response = await apiRequest(
                `/api/campeonatos-public/${campeonatoId}/categorias/${categoriaId}`
            );

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Categoria não encontrada');
        } catch (error) {
            console.error('Erro ao buscar categoria:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar categoria',
            };
        }
    },

    /**
     * Inscrever time em uma categoria (autenticado)
     */
    async inscreverTime(campeonatoId, categoriaId, data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(
                `/api/campeonatos/${campeonatoId}/categorias/${categoriaId}/inscricoes`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Inscrição realizada com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao realizar inscrição');
        } catch (error) {
            console.error('Erro ao inscrever time:', error);
            return {
                success: false,
                message: error.message || 'Erro ao realizar inscrição',
            };
        }
    },

    /**
     * Buscar inscrições do usuário
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
            }).toString();

            const response = await apiRequest(`/api/minhas-inscricoes-campeonato?${queryParams}`, {
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

            throw new Error(response.message || 'Erro ao buscar inscrições');
        } catch (error) {
            console.error('Erro ao buscar inscrições:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar inscrições',
            };
        }
    },

    /**
     * Buscar chaveamento de uma categoria
     */
    async getChaveamento(categoriaId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/chaveamento/categoria/${categoriaId}`, {
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

            throw new Error(response.message || 'Chaveamento não encontrado');
        } catch (error) {
            console.error('Erro ao buscar chaveamento:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar chaveamento',
            };
        }
    },

    /**
     * Buscar todas as fases do chaveamento
     */
    async getTodasFases(categoriaId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/chaveamento/categoria/${categoriaId}/fases`, {
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

            throw new Error(response.message || 'Erro ao buscar fases');
        } catch (error) {
            console.error('Erro ao buscar fases:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar fases',
            };
        }
    },

    /**
     * Buscar partidas de uma categoria
     */
    async getPartidasCategoria(categoriaId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/partidas/categoria/${categoriaId}`, {
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

            throw new Error(response.message || 'Erro ao buscar partidas');
        } catch (error) {
            console.error('Erro ao buscar partidas:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar partidas',
            };
        }
    },

    /**
     * Buscar partida por ID
     */
    async getPartida(partidaId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/partidas/${partidaId}`, {
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

            throw new Error(response.message || 'Partida não encontrada');
        } catch (error) {
            console.error('Erro ao buscar partida:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar partida',
            };
        }
    },

    /**
     * Buscar minhas partidas (por inscrição)
     */
    async getMinhasPartidas(inscricaoId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/partidas/inscricao/${inscricaoId}`, {
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

            throw new Error(response.message || 'Erro ao buscar partidas');
        } catch (error) {
            console.error('Erro ao buscar partidas:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar partidas',
            };
        }
    },
};
