// services/solicitacaoRachaService.js
import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const SolicitacaoRachaService = {
    /**
     * Listar todas as solicitações abertas (público)
     */
    async listSolicitacoes(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                per_page: params.perPage || 20,
                page: params.page || 1,
                ...(params.arenaId && { arena_id: params.arenaId }),
                ...(params.status && { status: params.status }),
                ...(params.dataJogo && { data_jogo: params.dataJogo }),
                ...(params.abertas && { abertas: 'true' }),
            }).toString();

            const response = await apiRequest(`/api/solicitacoes-racha-public?${queryParams}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao buscar solicitações');
        } catch (error) {
            console.error('Erro ao listar solicitações:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar solicitações',
            };
        }
    },

    /**
     * Buscar solicitação por ID (autenticado - com participantes)
     */
    async getSolicitacao(id) {
        try {
            const token = await StorageService.getToken();

            const headers = token ? {
                'Authorization': `Bearer ${token}`,
            } : {};

            const response = await apiRequest(`/api/solicitacoes-racha/${parseInt(id)}`, {
                headers,
            });
            console.log(response,'oiiii')
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Solicitação não encontrada');
        } catch (error) {
            console.error('Erro ao buscar solicitação:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar solicitação',
            };
        }
    },

    /**
     * Listar minhas solicitações (autenticado)
     */
    async getMinhasSolicitacoes(params = {}) {
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

            const response = await apiRequest(`/api/minhas-solicitacoes-racha?${queryParams}`, {
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

            throw new Error(response.message || 'Erro ao buscar suas solicitações');
        } catch (error) {
            console.error('Erro ao listar minhas solicitações:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar suas solicitações',
            };
        }
    },

    /**
     * Criar nova solicitação de racha (autenticado)
     */
    async createSolicitacao(data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/minhas-solicitacoes-racha', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Solicitação criada com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao criar solicitação');
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);

            // Se for erro de validação, retornar os erros específicos
            if (error.response && error.response.errors) {
                return {
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.response.errors,
                };
            }

            return {
                success: false,
                message: error.message || 'Erro ao criar solicitação',
            };
        }
    },

    /**
     * Atualizar solicitação de racha (autenticado)
     */
    async updateSolicitacao(id, data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/minhas-solicitacoes-racha/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Solicitação atualizada com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao atualizar solicitação');
        } catch (error) {
            console.error('Erro ao atualizar solicitação:', error);
            return {
                success: false,
                message: error.message || 'Erro ao atualizar solicitação',
            };
        }
    },

    /**
     * Atualizar status da solicitação (autenticado)
     */
    async updateStatus(id, status) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/minhas-solicitacoes-racha/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Status atualizado com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao atualizar status');
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            return {
                success: false,
                message: error.message || 'Erro ao atualizar status',
            };
        }
    },

    /**
     * Cancelar/excluir solicitação (autenticado)
     */
    async deleteSolicitacao(id) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/minhas-solicitacoes-racha/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Solicitação excluída com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao excluir solicitação');
        } catch (error) {
            console.error('Erro ao excluir solicitação:', error);
            return {
                success: false,
                message: error.message || 'Erro ao excluir solicitação',
            };
        }
    },

    /**
     * Participar de uma solicitação de racha (autenticado)
     */
    async participar(solicitacaoId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/solicitacoes-racha/${solicitacaoId}/participar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Você entrou no racha com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao entrar no racha');
        } catch (error) {
            console.error('Error joining racha:', error);
            return {
                success: false,
                message: error.message || 'Erro ao entrar no racha',
            };
        }
    },

    /**
     * Sair de uma solicitação de racha (autenticado)
     */
    async sair(solicitacaoId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/solicitacoes-racha/${solicitacaoId}/sair`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Você saiu do racha com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao sair do racha');
        } catch (error) {
            console.error('Error leaving racha:', error);
            return {
                success: false,
                message: error.message || 'Erro ao sair do racha',
            };
        }
    },

    /**
     * Listar jogadores disponíveis para convidar (autenticado)
     */
    async getJogadoresDisponiveis(solicitacaoId, search = '') {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const queryParams = new URLSearchParams(search ? { search } : {}).toString();
            const url = `/api/solicitacoes-racha/${solicitacaoId}/jogadores-disponiveis${queryParams ? `?${queryParams}` : ''}`;

            const response = await apiRequest(url, {
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

            throw new Error(response.message || 'Erro ao buscar jogadores');
        } catch (error) {
            console.error('Error fetching available players:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar jogadores',
            };
        }
    },

    /**
     * Convidar um jogador para a solicitação (autenticado)
     */
    async convidar(solicitacaoId, usuarioId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/solicitacoes-racha/${solicitacaoId}/convidar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ usuario_id: usuarioId }),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Jogador convidado com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao convidar jogador');
        } catch (error) {
            console.error('Error inviting player:', error);
            return {
                success: false,
                message: error.message || 'Erro ao convidar jogador',
            };
        }
    },

    /**
     * Definir parceiro para formar dupla (autenticado)
     */
    async definirParceiro(solicitacaoId, parceiroId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/solicitacoes-racha/${solicitacaoId}/definir-parceiro`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ parceiro_id: parceiroId }),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Parceiro definido com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao definir parceiro');
        } catch (error) {
            console.error('Error setting partner:', error);
            return {
                success: false,
                message: error.message || 'Erro ao definir parceiro',
            };
        }
    },

    /**
     * Remover parceiro da dupla (autenticado)
     */
    async removerParceiro(solicitacaoId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/solicitacoes-racha/${solicitacaoId}/remover-parceiro`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Parceiro removido com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao remover parceiro');
        } catch (error) {
            console.error('Error removing partner:', error);
            return {
                success: false,
                message: error.message || 'Erro ao remover parceiro',
            };
        }
    },
};
