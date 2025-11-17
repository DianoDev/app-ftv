// services/postService.js
import { apiRequest } from '../config/api.config';
import { StorageService } from './storage';

export const PostService = {
    /**
     * Listar posts da comunidade (público)
     */
    async listPosts(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                per_page: params.perPage || 20,
                page: params.page || 1,
                ...(params.search && { search: params.search }),
            }).toString();

            const response = await apiRequest(`/api/posts-public?${queryParams}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao buscar posts');
        } catch (error) {
            console.error('Erro ao listar posts:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar posts',
            };
        }
    },

    /**
     * Buscar post por ID
     */
    async getPost(id) {
        try {
            const response = await apiRequest(`/api/posts-public/${id}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Post não encontrado');
        } catch (error) {
            console.error('Erro ao buscar post:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar post',
            };
        }
    },

    /**
     * Criar novo post (autenticado)
     */
    async createPost(data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Post criado com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao criar post');
        } catch (error) {
            console.error('Erro ao criar post:', error);
            return {
                success: false,
                message: error.message || 'Erro ao criar post',
            };
        }
    },

    /**
     * Atualizar post (autenticado)
     */
    async updatePost(id, data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Post atualizado com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao atualizar post');
        } catch (error) {
            console.error('Erro ao atualizar post:', error);
            return {
                success: false,
                message: error.message || 'Erro ao atualizar post',
            };
        }
    },

    /**
     * Excluir post (autenticado)
     */
    async deletePost(id) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Post excluído com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao excluir post');
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            return {
                success: false,
                message: error.message || 'Erro ao excluir post',
            };
        }
    },

    /**
     * Curtir/Descurtir post (autenticado)
     */
    async toggleLike(postId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao curtir post');
        } catch (error) {
            console.error('Erro ao curtir post:', error);
            return {
                success: false,
                message: error.message || 'Erro ao curtir post',
            };
        }
    },

    /**
     * Listar comentários de um post
     */
    async listComentarios(postId, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                per_page: params.perPage || 20,
                page: params.page || 1,
            }).toString();

            const response = await apiRequest(`/api/posts/${postId}/comentarios?${queryParams}`);

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao buscar comentários');
        } catch (error) {
            console.error('Erro ao listar comentários:', error);
            return {
                success: false,
                message: error.message || 'Erro ao buscar comentários',
            };
        }
    },

    /**
     * Criar comentário em um post (autenticado)
     */
    async createComentario(postId, data) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/posts/${postId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Comentário criado com sucesso!',
                    data: response.data,
                };
            }

            throw new Error(response.message || 'Erro ao criar comentário');
        } catch (error) {
            console.error('Erro ao criar comentário:', error);
            return {
                success: false,
                message: error.message || 'Erro ao criar comentário',
            };
        }
    },

    /**
     * Excluir comentário (autenticado)
     */
    async deleteComentario(postId, comentarioId) {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            const response = await apiRequest(`/api/posts/${postId}/comentarios/${comentarioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Comentário excluído com sucesso!',
                };
            }

            throw new Error(response.message || 'Erro ao excluir comentário');
        } catch (error) {
            console.error('Erro ao excluir comentário:', error);
            return {
                success: false,
                message: error.message || 'Erro ao excluir comentário',
            };
        }
    },
};
