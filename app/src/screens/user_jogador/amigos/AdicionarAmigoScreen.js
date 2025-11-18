import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function AdicionarAmigoScreen() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [sending, setSending] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            Alert.alert('Atenção', 'Digite um nome ou email para buscar');
            return;
        }

        try {
            setSearching(true);
            setHasSearched(true);
            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/usuarios/buscar?termo=${encodeURIComponent(searchTerm)}`,
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

            if (response.ok) {
                setUsuarios(data.data || []);
                if ((data.data || []).length === 0) {
                    Alert.alert('Resultado', 'Nenhum usuário encontrado');
                }
            } else {
                throw new Error(data.message || 'Erro ao buscar usuários');
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            Alert.alert('Erro', error.message || 'Não foi possível buscar usuários');
        } finally {
            setSearching(false);
        }
    };

    const handleEnviarSolicitacao = async (usuarioId) => {
        try {
            setSending(true);
            const token = await StorageService.getToken();

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/amizades/enviar-solicitacao`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ amigo_id: usuarioId }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Sucesso',
                    data.message || 'Solicitação de amizade enviada!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Atualizar a lista removendo o usuário que recebeu a solicitação
                                setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
                            },
                        },
                    ]
                );
            } else {
                throw new Error(data.message || 'Erro ao enviar solicitação');
            }
        } catch (error) {
            console.error('Erro ao enviar solicitação:', error);
            Alert.alert('Erro', error.message || 'Não foi possível enviar a solicitação');
        } finally {
            setSending(false);
        }
    };

    const renderUsuarioItem = ({ item }) => (
        <View style={styles.usuarioCard}>
            <View style={styles.usuarioHeader}>
                <View style={styles.usuarioIconContainer}>
                    <Ionicons name="person" size={24} color="#FFD300" />
                </View>
                <View style={styles.usuarioInfo}>
                    <Text style={styles.usuarioNome}>{item.nome}</Text>
                    <Text style={styles.usuarioEmail}>{item.email}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.addButton, sending && styles.addButtonDisabled]}
                onPress={() => handleEnviarSolicitacao(item.id)}
                disabled={sending}
                activeOpacity={0.8}
            >
                <Ionicons name="person-add" size={18} color="#000000" />
                <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => {
        if (searching) return null;

        if (!hasSearched) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color="#2a2a2a" />
                    <Text style={styles.emptyTitle}>Buscar Amigos</Text>
                    <Text style={styles.emptyDescription}>
                        Digite o nome ou email de um usuário para encontrar e adicionar como amigo
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={64} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
                <Text style={styles.emptyDescription}>
                    Tente buscar com outro nome ou email
                </Text>
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
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Adicionar Amigo</Text>
                    <Text style={styles.headerSubtitle}>Busque por nome ou email</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#FFD300" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Nome ou email do usuário..."
                        placeholderTextColor="#666666"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchTerm('');
                            setUsuarios([]);
                            setHasSearched(false);
                        }}>
                            <Ionicons name="close-circle" size={20} color="#999999" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.searchButton, searching && styles.searchButtonDisabled]}
                    onPress={handleSearch}
                    disabled={searching}
                >
                    {searching ? (
                        <ActivityIndicator color="#000000" size="small" />
                    ) : (
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Results Info */}
            {hasSearched && usuarios.length > 0 && !searching && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                        {usuarios.length} {usuarios.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
                    </Text>
                </View>
            )}

            {/* Lista de Usuários */}
            {searching ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Buscando usuários...</Text>
                </View>
            ) : (
                <FlatList
                    data={usuarios}
                    renderItem={renderUsuarioItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                />
            )}
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
    headerRight: {
        width: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: '#0a0a0a',
        gap: Spacing.sm,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    searchButton: {
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        minWidth: 80,
    },
    searchButtonDisabled: {
        opacity: 0.6,
    },
    searchButtonText: {
        fontSize: Typography.sizes.body,
        color: '#000000',
        fontWeight: '600',
        textAlign: 'center',
    },
    resultsInfo: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: '#0a0a0a',
    },
    resultsText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
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
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxxl,
        flexGrow: 1,
    },
    usuarioCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    usuarioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    usuarioIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    usuarioInfo: {
        flex: 1,
    },
    usuarioNome: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    usuarioEmail: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    addButton: {
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: '#000000',
        fontWeight: Typography.fonts.headingWeight,
        fontSize: Typography.sizes.body,
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
        lineHeight: 22,
    },
});
