import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { PostService } from '../../../services/postService';
import { StorageService } from '../../../services/storage';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function ComunidadeScreen() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Modal de criar post
    const [modalVisible, setModalVisible] = useState(false);
    const [novoPostTexto, setNovoPostTexto] = useState('');
    const [criandoPost, setCriandoPost] = useState(false);

    // Modal de comentários
    const [comentariosModalVisible, setComentariosModalVisible] = useState(false);
    const [postSelecionado, setPostSelecionado] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [criandoComentario, setCriandoComentario] = useState(false);

    useEffect(() => {
        loadUser();
        loadPosts();
    }, []);

    const loadUser = async () => {
        const user = await StorageService.getUser();
        if (user) {
            setCurrentUser(user);
        }
    };

    const loadPosts = async (page = 1) => {
        try {
            setLoading(page === 1);

            const result = await PostService.listPosts({ page, perPage: 10 });

            if (result.success) {
                const newPosts = result.data.data || [];

                if (page === 1) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }

                setCurrentPage(result.data.current_page || page);
                setHasMore((result.data.current_page || page) < (result.data.last_page || 1));
            } else {
                Alert.alert('Erro', result.message || 'Erro ao carregar posts');
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            Alert.alert('Erro', 'Erro ao carregar posts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadPosts(1);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadPosts(currentPage + 1);
        }
    };

    const handleCreatePost = async () => {
        if (!novoPostTexto.trim()) {
            Alert.alert('Atenção', 'Digite algo para publicar');
            return;
        }

        if (!currentUser) {
            Alert.alert('Erro', 'Você precisa estar logado para publicar');
            return;
        }

        try {
            setCriandoPost(true);
            const result = await PostService.createPost({
                conteudo: novoPostTexto.trim(),
            });

            if (result.success) {
                setNovoPostTexto('');
                setModalVisible(false);
                Alert.alert('Sucesso', 'Post publicado com sucesso!');
                handleRefresh();
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Alert.alert('Erro', 'Erro ao publicar post');
        } finally {
            setCriandoPost(false);
        }
    };

    const handleDeletePost = async (postId) => {
        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja excluir este post?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await PostService.deletePost(postId);
                        if (result.success) {
                            Alert.alert('Sucesso', 'Post excluído com sucesso!');
                            handleRefresh();
                        } else {
                            Alert.alert('Erro', result.message);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleLike = async (postId) => {
        if (!currentUser) {
            Alert.alert('Atenção', 'Você precisa estar logado para curtir');
            return;
        }

        const result = await PostService.toggleLike(postId);
        if (result.success) {
            // Atualizar a lista localmente
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            likes_count: result.data.likes_count,
                            user_liked: result.data.user_liked,
                        }
                        : post
                )
            );
        }
    };

    const handleOpenComentarios = async (post) => {
        setPostSelecionado(post);
        setComentariosModalVisible(true);
        await loadComentarios(post.id);
    };

    const loadComentarios = async (postId) => {
        try {
            setLoadingComentarios(true);
            const result = await PostService.listComentarios(postId);

            if (result.success) {
                setComentarios(result.data.data || []);
            }
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
        } finally {
            setLoadingComentarios(false);
        }
    };

    const handleCreateComentario = async () => {
        if (!novoComentario.trim()) {
            Alert.alert('Atenção', 'Digite algo para comentar');
            return;
        }

        if (!currentUser) {
            Alert.alert('Erro', 'Você precisa estar logado para comentar');
            return;
        }

        try {
            setCriandoComentario(true);
            const result = await PostService.createComentario(postSelecionado.id, {
                conteudo: novoComentario.trim(),
            });

            if (result.success) {
                setNovoComentario('');
                await loadComentarios(postSelecionado.id);

                // Atualizar contador de comentários
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postSelecionado.id
                            ? { ...post, comentarios_count: (post.comentarios_count || 0) + 1 }
                            : post
                    )
                );
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Erro ao criar comentário:', error);
            Alert.alert('Erro', 'Erro ao publicar comentário');
        } finally {
            setCriandoComentario(false);
        }
    };

    const handleDeleteComentario = async (comentarioId) => {
        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja excluir este comentário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await PostService.deleteComentario(postSelecionado.id, comentarioId);
                        if (result.success) {
                            await loadComentarios(postSelecionado.id);

                            // Atualizar contador
                            setPosts(prevPosts =>
                                prevPosts.map(post =>
                                    post.id === postSelecionado.id
                                        ? { ...post, comentarios_count: Math.max(0, (post.comentarios_count || 1) - 1) }
                                        : post
                                )
                            );
                        } else {
                            Alert.alert('Erro', result.message);
                        }
                    }
                }
            ]
        );
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // diferença em segundos

        if (diff < 60) return 'agora';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    const renderPost = ({ item }) => {
        const isAuthor = currentUser && currentUser.id === item.usuario_id;

        return (
            <View style={styles.postCard}>
                {/* Header do Post */}
                <View style={styles.postHeader}>
                    <View style={styles.authorInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={20} color="#FFD300" />
                        </View>
                        <View style={styles.authorDetails}>
                            <Text style={styles.authorName}>
                                {item.usuario?.name || 'Usuário'}
                            </Text>
                            <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
                        </View>
                    </View>
                    {isAuthor && (
                        <TouchableOpacity
                            onPress={() => handleDeletePost(item.id)}
                            style={styles.deleteButton}
                        >
                            <Ionicons name="trash-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Conteúdo do Post */}
                <Text style={styles.postContent}>{item.conteudo}</Text>

                {/* Ações do Post */}
                <View style={styles.postActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleToggleLike(item.id)}
                    >
                        <Ionicons
                            name={item.user_liked ? "heart" : "heart-outline"}
                            size={20}
                            color={item.user_liked ? "#F44336" : "#999999"}
                        />
                        <Text style={[
                            styles.actionText,
                            item.user_liked && { color: '#F44336' }
                        ]}>
                            {item.likes_count || 0}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOpenComentarios(item)}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color="#999999" />
                        <Text style={styles.actionText}>
                            {item.comentarios_count || 0}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderComentario = ({ item }) => {
        const isAuthor = currentUser && currentUser.id === item.usuario_id;

        return (
            <View style={styles.comentarioItem}>
                <View style={styles.comentarioHeader}>
                    <View style={styles.comentarioAuthor}>
                        <View style={styles.comentarioAvatar}>
                            <Ionicons name="person" size={16} color="#FFD300" />
                        </View>
                        <View>
                            <Text style={styles.comentarioAuthorName}>
                                {item.usuario?.name || 'Usuário'}
                            </Text>
                            <Text style={styles.comentarioTime}>{formatTimeAgo(item.created_at)}</Text>
                        </View>
                    </View>
                    {isAuthor && (
                        <TouchableOpacity onPress={() => handleDeleteComentario(item.id)}>
                            <Ionicons name="trash-outline" size={16} color="#F44336" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.comentarioContent}>{item.conteudo}</Text>
            </View>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#2a2a2a" />
            <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
            <Text style={styles.emptyText}>
                Seja o primeiro a publicar na comunidade!
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loading || currentPage === 1) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FFD300" />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comunidade</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle" size={28} color="#FFD300" />
                </TouchableOpacity>
            </View>

            {/* Posts List */}
            {loading && currentPage === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando posts...</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyList}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#FFD300']}
                            tintColor="#FFD300"
                        />
                    }
                />
            )}

            {/* Modal de Criar Post */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Post</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.postInput}
                            placeholder="O que você está pensando?"
                            placeholderTextColor="#666666"
                            value={novoPostTexto}
                            onChangeText={setNovoPostTexto}
                            multiline
                            numberOfLines={6}
                            maxLength={500}
                            textAlignVertical="top"
                        />

                        <Text style={styles.charCount}>
                            {novoPostTexto.length}/500
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.publishButton,
                                (!novoPostTexto.trim() || criandoPost) && styles.publishButtonDisabled
                            ]}
                            onPress={handleCreatePost}
                            disabled={!novoPostTexto.trim() || criandoPost}
                        >
                            {criandoPost ? (
                                <ActivityIndicator size="small" color="#000000" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={20} color="#000000" />
                                    <Text style={styles.publishButtonText}>Publicar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal de Comentários */}
            <Modal
                visible={comentariosModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setComentariosModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.comentariosModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Comentários</Text>
                            <TouchableOpacity onPress={() => setComentariosModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {loadingComentarios ? (
                            <View style={styles.comentariosLoading}>
                                <ActivityIndicator size="large" color="#FFD300" />
                            </View>
                        ) : (
                            <FlatList
                                data={comentarios}
                                renderItem={renderComentario}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.comentariosList}
                                ListEmptyComponent={
                                    <View style={styles.emptyComentarios}>
                                        <Text style={styles.emptyComentariosText}>
                                            Nenhum comentário ainda
                                        </Text>
                                    </View>
                                }
                            />
                        )}

                        <View style={styles.comentarioInput}>
                            <TextInput
                                style={styles.comentarioTextInput}
                                placeholder="Escreva um comentário..."
                                placeholderTextColor="#666666"
                                value={novoComentario}
                                onChangeText={setNovoComentario}
                                multiline
                                maxLength={300}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!novoComentario.trim() || criandoComentario) && styles.sendButtonDisabled
                                ]}
                                onPress={handleCreateComentario}
                                disabled={!novoComentario.trim() || criandoComentario}
                            >
                                {criandoComentario ? (
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <Ionicons name="send" size={20} color="#000000" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    addButton: {
        padding: Spacing.xs,
    },
    listContent: {
        padding: Spacing.md,
        flexGrow: 1,
    },
    postCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    authorDetails: {
        flex: 1,
    },
    authorName: {
        fontSize: Typography.sizes.body,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    postTime: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    deleteButton: {
        padding: Spacing.xs,
    },
    postContent: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    postActions: {
        flexDirection: 'row',
        gap: Spacing.lg,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginTop: Spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
    },
    emptyTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptyText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    postInput: {
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    charCount: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    publishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
        gap: 8,
    },
    publishButtonDisabled: {
        backgroundColor: '#666666',
        opacity: 0.5,
    },
    publishButtonText: {
        fontSize: Typography.sizes.body,
        fontWeight: '700',
        color: '#000000',
    },
    comentariosModal: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    comentariosLoading: {
        paddingVertical: Spacing.xl * 2,
        alignItems: 'center',
    },
    comentariosList: {
        paddingVertical: Spacing.sm,
    },
    comentarioItem: {
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    comentarioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    comentarioAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    comentarioAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    comentarioAuthorName: {
        fontSize: Typography.sizes.caption,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    comentarioTime: {
        fontSize: 10,
        color: '#666666',
    },
    comentarioContent: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    emptyComentarios: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    emptyComentariosText: {
        fontSize: Typography.sizes.body,
        color: '#666666',
    },
    comentarioInput: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    comentarioTextInput: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFD300',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#666666',
        opacity: 0.5,
    },
});
