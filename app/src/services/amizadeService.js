import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const AmizadeService = {
    /**
     * Listar meus amigos (amizades confirmadas)
     */
    async listarAmigos() {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/amizades/meus-amigos', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success || response.data) {
                return {
                    success: true,
                    data: response.data || [],
                };
            }

            throw new Error(response.message || 'Erro ao listar amigos');
        } catch (error) {
            console.error('Error listing friends:', error);
            return {
                success: false,
                message: error.message || 'Erro ao listar amigos',
            };
        }
    },

    /**
     * Listar solicitações de amizade pendentes (recebidas)
     */
    async listarSolicitacoesPendentes() {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/amizades/solicitacoes-pendentes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success || response.data) {
                return {
                    success: true,
                    data: response.data || [],
                };
            }

            throw new Error(response.message || 'Erro ao listar solicitações');
        } catch (error) {
            console.error('Error listing pending requests:', error);
            return {
                success: false,
                message: error.message || 'Erro ao listar solicitações pendentes',
            };
        }
    },

    /**
     * Buscar usuários por nome ou email
     */
    async buscarUsuarios(termo) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            if (!termo || !termo.trim()) {
                throw new Error('Termo de busca é obrigatório');
            }

            const response = await apiRequest(`/api/usuarios/buscar?termo=${encodeURIComponent(termo)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success || response.data) {
                return {
                    success: true,
                    data: response.data || [],
                };
            }

            throw new Error(response.message || 'Erro ao buscar usuários');
        } catch (error) {
            console.error('Error searching users:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar usuários',
            };
        }
    },

    /**
     * Enviar solicitação de amizade
     */
    async enviarSolicitacao(amigoId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            if (!amigoId) {
                throw new Error('ID do amigo é obrigatório');
            }

            const response = await apiRequest('/api/amizades/enviar-solicitacao', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ amigo_id: amigoId }),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Solicitação de amizade enviada!',
                };
            }

            throw new Error(response.message || 'Erro ao enviar solicitação');
        } catch (error) {
            console.error('Error sending friend request:', error);
            return {
                success: false,
                message: error.message || 'Erro ao enviar solicitação de amizade',
            };
        }
    },

    /**
     * Aceitar solicitação de amizade
     */
    async aceitarSolicitacao(amizadeId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            if (!amizadeId) {
                throw new Error('ID da amizade é obrigatório');
            }

            const response = await apiRequest(`/api/amizades/${amizadeId}/aceitar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Solicitação aceita com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao aceitar solicitação');
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return {
                success: false,
                message: error.message || 'Erro ao aceitar solicitação de amizade',
            };
        }
    },

    /**
     * Recusar solicitação de amizade
     */
    async recusarSolicitacao(amizadeId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            if (!amizadeId) {
                throw new Error('ID da amizade é obrigatório');
            }

            const response = await apiRequest(`/api/amizades/${amizadeId}/recusar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Solicitação recusada!',
                };
            }

            throw new Error(response.message || 'Erro ao recusar solicitação');
        } catch (error) {
            console.error('Error declining friend request:', error);
            return {
                success: false,
                message: error.message || 'Erro ao recusar solicitação de amizade',
            };
        }
    },

    /**
     * Remover amigo (deletar amizade)
     */
    async removerAmigo(amizadeId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            if (!amizadeId) {
                throw new Error('ID da amizade é obrigatório');
            }

            const response = await apiRequest(`/api/amizades/${amizadeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Amigo removido com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao remover amigo');
        } catch (error) {
            console.error('Error removing friend:', error);
            return {
                success: false,
                message: error.message || 'Erro ao remover amigo',
            };
        }
    },
};
