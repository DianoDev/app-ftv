import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Image,
    Dimensions,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

const { width } = Dimensions.get('window');
const STORY_WIDTH = 100;

// Componente separado para o item do Post/Story
const PostStoryItem = ({ item, onDelete, calcularTempoRestante }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [user, setUser] = useState(null);

    // Obter usuário logado
    React.useEffect(() => {
        const getUserData = async () => {
            const userData = await StorageService.getUser();
            setUser(userData);
        };
        getUserData();
    }, []);

    const isMyPost = item.usuario_id === user?.id;

    // Calcular progresso do tempo
    const agora = new Date();
    const criacao = new Date(item.created_at);
    const expiracao = new Date(item.expira_em);
    const tempoTotal = expiracao - criacao;
    const tempoDecorrido = agora - criacao;
    const progresso = Math.min(Math.max(tempoDecorrido / tempoTotal, 0), 1);

    React.useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progresso,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [progresso]);

    return (
        <TouchableOpacity
            style={styles.storyContainer}
            activeOpacity={0.7}
        >
            <View style={styles.storyBorder}>
                <View style={styles.storyImageContainer}>
                    {item.imagem ? (
                        <Image
                            source={{ uri: `${API_CONFIG.BASE_URL}/storage/${item.imagem}` }}
                            style={styles.storyImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.storyPlaceholder}>
                            <Ionicons name="image-outline" size={40} color="#666666" />
                        </View>
                    )}
                    {/* Progress bar circular */}
                    <View style={styles.progressContainer}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                </View>
                <View style={styles.storyInfo}>
                    <Text style={styles.storyUsername} numberOfLines={1}>
                        {item.usuario?.nome || 'Usuário'}
                    </Text>
                    <Text style={styles.storyTime}>
                        {calcularTempoRestante(item.expira_em)}
                    </Text>
                </View>
                {isMyPost && (
                    <TouchableOpacity
                        style={styles.deleteStoryButton}
                        onPress={() => onDelete(item.id)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#FF5252" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function ListPostsScreen() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (page = 1, showLoading = true) => {
        try {
            if (showLoading && page === 1) {
                setLoading(true);
            }

            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/posts/amigos?page=${page}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );



            const data = await response.json();
            console.log(data,'porerereerer')
            if (response.ok) {
                const newPosts = data.data || [];

                if (page === 1) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }

                setHasMore(data.current_page < data.last_page);
                setCurrentPage(data.current_page);
            } else {
                throw new Error(data.message || 'Erro ao buscar posts');
            }
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
            Alert.alert('Erro', 'Não foi possível carregar os posts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchPosts(1, false);
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchPosts(currentPage + 1, false);
        }
    };

    const handleDeletePost = async (postId) => {
        Alert.alert(
            'Excluir Post',
            'Tem certeza que deseja excluir este post?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await StorageService.getToken();

                            const response = await fetch(
                                `${API_CONFIG.BASE_URL}/api/posts/${postId}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`,
                                    },
                                }
                            );

                            const data = await response.json();

                            if (response.ok) {
                                Alert.alert('Sucesso', 'Post excluído!');
                                fetchPosts(1);
                            } else {
                                throw new Error(data.message || 'Erro ao excluir post');
                            }
                        } catch (error) {
                            console.error('Erro ao excluir post:', error);
                            Alert.alert('Erro', error.message || 'Não foi possível excluir o post');
                        }
                    },
                },
            ]
        );
    };

    const handleCreatePost = () => {
        router.push('/src/screens/user_jogador/posts/CreatePostScreen');
    };

    const calcularTempoRestante = (expiraEm) => {
        const agora = new Date();
        const expiracao = new Date(expiraEm);
        const diff = expiracao - agora;

        if (diff <= 0) return 'Expirado';

        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (horas > 0) {
            return `${horas}h restante${horas > 1 ? 's' : ''}`;
        }
        return `${minutos}min restante${minutos > 1 ? 's' : ''}`;
    };

    const renderPostStory = ({ item, index }) => (
        <PostStoryItem
            item={item}
            onDelete={handleDeletePost}
            calcularTempoRestante={calcularTempoRestante}
        />
    );

    const renderHeader = () => (
        <View style={styles.storiesSection}>
            {/* Add Story Button */}
            <TouchableOpacity
                style={styles.addStoryContainer}
                onPress={handleCreatePost}
                activeOpacity={0.7}
            >
                <View style={styles.addStoryBorder}>
                    <View style={styles.addStoryImageContainer}>
                        <Ionicons name="add-circle" size={40} color="#FFD300" />
                    </View>
                </View>
                <Text style={styles.addStoryText}>Criar Post</Text>
            </TouchableOpacity>

            {/* Stories List */}
            {posts.length > 0 && (
                <FlatList
                    horizontal
                    data={posts}
                    renderItem={renderPostStory}
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.storiesListContent}
                />
            )}
        </View>
    );

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="notifications-outline" size={64} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
                <Text style={styles.emptyDescription}>
                    Seja o primeiro a criar um post ou adicione amigos para ver os posts deles!
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreatePost}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color="#000000" />
                    <Text style={styles.emptyButtonText}>Criar Post</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loading || currentPage === 1) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FFD300" />
            </View>
        );
    };

    if (loading && currentPage === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando posts...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Posts</Text>
                    <Text style={styles.headerSubtitle}>
                        {posts.length} {posts.length === 1 ? 'post ativo' : 'posts ativos'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreatePost}
                >
                    <Ionicons name="add-circle" size={28} color="#FFD300" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <FlatList
                data={[]} // Apenas para ter o header
                renderItem={null}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={posts.length === 0 ? renderEmpty : null}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FFD300']}
                        tintColor="#FFD300"
                    />
                }
                contentContainerStyle={styles.contentContainer}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#999999',
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
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginTop: 2,
    },
    addButton: {
        padding: Spacing.xs,
    },
    contentContainer: {
        flexGrow: 1,
    },
    storiesSection: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    addStoryContainer: {
        alignItems: 'center',
        marginLeft: Spacing.md,
        width: STORY_WIDTH,
    },
    addStoryBorder: {
        width: STORY_WIDTH,
        height: STORY_WIDTH,
        borderRadius: STORY_WIDTH / 2,
        borderWidth: 2,
        borderColor: '#FFD300',
        borderStyle: 'dashed',
        padding: 3,
    },
    addStoryImageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: STORY_WIDTH / 2,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addStoryText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        marginTop: Spacing.xs,
        fontWeight: Typography.fonts.headingWeight,
    },
    storiesListContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    storyContainer: {
        alignItems: 'center',
        width: STORY_WIDTH,
    },
    storyBorder: {
        width: STORY_WIDTH,
        height: STORY_WIDTH,
        borderRadius: STORY_WIDTH / 2,
        borderWidth: 3,
        borderColor: '#FFD300',
        padding: 3,
        position: 'relative',
    },
    storyImageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: STORY_WIDTH / 2,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    storyImage: {
        width: '100%',
        height: '100%',
    },
    storyPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#2a2a2a',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFD300',
    },
    storyInfo: {
        position: 'absolute',
        bottom: -30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    storyUsername: {
        fontSize: Typography.sizes.caption,
        color: '#FFFFFF',
        fontWeight: Typography.fonts.headingWeight,
        marginBottom: 2,
    },
    storyTime: {
        fontSize: 10,
        color: '#999999',
    },
    deleteStoryButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF5252',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.huge,
        paddingHorizontal: Spacing.xxxl,
    },
    emptyTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
        marginTop: Spacing.base,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    emptyButton: {
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.body,
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
});
