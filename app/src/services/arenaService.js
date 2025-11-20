// services/arenaService.js
import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const ArenaService = {
    /**
     * Listar arenas ativas
     */
    async listArenas(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                per_page: params.perPage || 20,
                page: params.page || 1,
                ...(params.cidade && { cidade: params.cidade }),
                ...(params.estado && { estado: params.estado }),
            }).toString();

            const response = await apiRequest(`/api/arenas?${queryParams}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao buscar arenas');
        } catch (error) {
            console.error('Erro ao listar arenas:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar arenas',
            };
        }
    },

    /**
     * Buscar arena por ID
     */
    async getArena(id) {
        try {
            const response = await apiRequest(`/api/arenas/${id}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Arena não encontrada');
        } catch (error) {
            console.error('Erro ao buscar arena:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar arena',
            };
        }
    },

    /**
     * Buscar arenas por nome ou cidade
     */
    async searchArenas(searchTerm, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                q: searchTerm,
                per_page: params.perPage || 20,
                page: params.page || 1,
            }).toString();

            const response = await apiRequest(`/api/arenas/buscar?${queryParams}`);

            // A resposta já vem com a estrutura paginada diretamente
            if (response && response.data) {
                return {
                    success: true,
                    data: response, // response já contém current_page, data, last_page, etc.
                };
            }

            throw new Error('Erro ao buscar arenas');
        } catch (error) {
            console.error('Erro ao buscar arenas:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar arenas',
            };
        }
    },

    /**
     * Buscar arenas por localização (cidade/estado)
     */
    async searchByLocation(cidade, estado, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                ...(cidade && { cidade }),
                ...(estado && { estado }),
                per_page: params.perPage || 20,
                page: params.page || 1,
            }).toString();

            const response = await apiRequest(`/api/arenas/buscar-por-localizacao?${queryParams}`);

            // A resposta já vem com a estrutura paginada diretamente
            if (response && response.data) {
                return {
                    success: true,
                    data: response, // response já contém current_page, data, last_page, etc.
                };
            }

            throw new Error('Erro ao buscar arenas');
        } catch (error) {
            console.error('Erro ao buscar arenas por localização:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar arenas',
            };
        }
    },

    /**
     * Buscar arenas próximas (por coordenadas)
     */
    async searchNearby(latitude, longitude, raioKm = 10, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                raio_km: raioKm.toString(),
                per_page: params.perPage || 20,
                page: params.page || 1,
            }).toString();

            const response = await apiRequest(`/api/arenas/proximas?${queryParams}`);

            // A resposta já vem com a estrutura paginada diretamente
            if (response && response.data) {
                return {
                    success: true,
                    data: response, // response já contém current_page, data, last_page, etc.
                };
            }

            throw new Error('Erro ao buscar arenas próximas');
        } catch (error) {
            console.error('Erro ao buscar arenas próximas:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar arenas próximas',
            };
        }
    },
};
