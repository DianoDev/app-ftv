import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { InscricaoCampeonatoService } from '../../../services/inscricaoCampeonatoService';
import { CampeonatoService } from '../../../services/campeonatoService';
import { StorageService } from '../../../services/storage';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function InscricaoScreen() {
    const router = useRouter();
    const { campeonatoId, categoriaId } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [campeonato, setCampeonato] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const [usuario, setUsuario] = useState(null);

    // Dados do formulário
    const [nomeEquipe, setNomeEquipe] = useState('');
    const [parceiro, setParceiro] = useState(null);
    const [emailParceiro, setEmailParceiro] = useState('');
    const [buscandoParceiro, setBuscandoParceiro] = useState(false);

    useEffect(() => {
        loadData();
    }, [campeonatoId, categoriaId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Buscar dados do usuário
            const userData = await StorageService.getUser();
            setUsuario(userData);

            // Buscar campeonato
            const campeonatoResult = await CampeonatoService.getCampeonato(campeonatoId);
            if (campeonatoResult.success) {
                const campeonatoData = campeonatoResult.data.campeonato || campeonatoResult.data;
                setCampeonato(campeonatoData);

                // Encontrar categoria
                const categorias = campeonatoData.categorias || campeonatoData.categorias_campeonato || [];
                const cat = categorias.find(c => c.id == categoriaId);
                setCategoria(cat);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Erro ao carregar dados do campeonato');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const buscarParceiroPorEmail = async () => {
        if (!emailParceiro.trim()) {
            Alert.alert('Atenção', 'Digite o email do parceiro');
            return;
        }

        try {
            setBuscandoParceiro(true);
            // TODO: Implementar busca de usuário por email
            // Por enquanto, vamos simular
            Alert.alert('Atenção', 'Funcionalidade de busca de parceiro em desenvolvimento');
        } catch (error) {
            Alert.alert('Erro', 'Erro ao buscar parceiro');
        } finally {
            setBuscandoParceiro(false);
        }
    };

    const handleSubmit = async () => {
        const tipoInscricao = categoria?.tipo_inscricao || 'dupla';

        // Validações
        if (tipoInscricao === 'dupla' && !parceiro) {
            Alert.alert('Atenção', 'É necessário adicionar um parceiro para esta categoria');
            return;
        }

        if (tipoInscricao === 'solo' && parceiro) {
            Alert.alert('Atenção', 'Esta categoria é individual e não aceita parceiros');
            return;
        }

        try {
            setSubmitting(true);

            const data = {
                categoria_id: categoriaId,
                nome_equipe: nomeEquipe.trim() || null,
            };

            // Se for dupla obrigatória ou ambos (com parceiro selecionado)
            if ((tipoInscricao === 'dupla' || tipoInscricao === 'ambos') && parceiro) {
                data.jogador2_id = parceiro.id;
            }

            const result = await InscricaoCampeonatoService.criarInscricao(data);

            if (result.success) {
                Alert.alert(
                    'Sucesso!',
                    result.message || 'Inscrição realizada com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back()
                        }
                    ]
                );
            } else {
                Alert.alert('Erro', result.message || 'Erro ao realizar inscrição');
            }
        } catch (error) {
            console.error('Erro ao realizar inscrição:', error);
            Alert.alert('Erro', 'Erro ao realizar inscrição');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return 'Grátis';
        return `R$ ${parseFloat(value).toFixed(2)}`;
    };

    const getTipoInscricaoLabel = () => {
        const tipo = categoria?.tipo_inscricao || 'dupla';
        console.log(tipo,'topooo')
        if (tipo === 'solo') return 'Individual';
        if (tipo === 'dupla') return 'Dupla';
        if (tipo === 'ambos') return 'Individual ou Dupla';
        return 'Dupla';
    };

    const getTipoInscricaoDescricao = () => {
        const tipo = categoria?.tipo_inscricao || 'dupla';
        if (tipo === 'solo') return 'Esta categoria aceita apenas inscrições individuais';
        if (tipo === 'dupla') return 'Esta categoria requer que você forme uma dupla';
        if (tipo === 'ambos') return 'Você pode se inscrever sozinho ou em dupla';
        return 'Inscrição em dupla';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!campeonato || !categoria) {
        return null;
    }

    const tipoInscricao = categoria.tipo_inscricao || 'dupla';

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
                <Text style={styles.headerTitle}>Inscrição</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Informações do Campeonato */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="trophy" size={24} color="#FFD300" />
                        <Text style={styles.cardTitle}>Dados do Campeonato</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Campeonato:</Text>
                        <Text style={styles.infoValue}>{campeonato.nome}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Categoria:</Text>
                        <Text style={styles.infoValue}>{categoria.nome}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tipo:</Text>
                        <Text style={styles.infoValue}>{getTipoInscricaoLabel()}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Valor:</Text>
                        <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                            {formatCurrency(categoria.valor_inscricao)}
                        </Text>
                    </View>

                    <View style={styles.tipoInscricaoInfo}>
                        <Ionicons name="information-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipoInscricaoText}>
                            {getTipoInscricaoDescricao()}
                        </Text>
                    </View>
                </View>

                {/* Dados da Inscrição */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="people" size={24} color="#FFD300" />
                        <Text style={styles.cardTitle}>Dados da Inscrição</Text>
                    </View>

                    {/* Jogador Principal */}
                    <View style={styles.jogadorSection}>
                        <Text style={styles.sectionLabel}>
                            {tipoInscricao === 'solo' ? 'Jogador' : 'Jogador 1 (Você)'}
                        </Text>
                        <View style={styles.jogadorCard}>
                            <Ionicons name="person" size={20} color="#FFD300" />
                            <Text style={styles.jogadorNome}>{usuario?.nome || 'Você'}</Text>
                        </View>
                    </View>

                    {/* Nome da Equipe (opcional) */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Nome da Equipe (Opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o nome da equipe..."
                            placeholderTextColor="#666666"
                            value={nomeEquipe}
                            onChangeText={setNomeEquipe}
                            maxLength={100}
                        />
                    </View>

                    {/* Parceiro (se for dupla ou ambos) */}
                    {(tipoInscricao === 'dupla' || tipoInscricao === 'ambos') && (
                        <View style={styles.parceiroSection}>
                            <Text style={styles.sectionLabel}>
                                Jogador 2 (Parceiro) {tipoInscricao === 'dupla' ? '*' : '(Opcional)'}
                            </Text>

                            {!parceiro ? (
                                <View>
                                    <View style={styles.searchContainer}>
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Email do parceiro..."
                                            placeholderTextColor="#666666"
                                            value={emailParceiro}
                                            onChangeText={setEmailParceiro}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            style={styles.searchButton}
                                            onPress={buscarParceiroPorEmail}
                                            disabled={buscandoParceiro}
                                        >
                                            {buscandoParceiro ? (
                                                <ActivityIndicator size="small" color="#000000" />
                                            ) : (
                                                <Ionicons name="search" size={20} color="#000000" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.helperText}>
                                        Digite o email do seu parceiro para adicioná-lo
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.jogadorCard}>
                                    <Ionicons name="person" size={20} color="#FFD300" />
                                    <Text style={styles.jogadorNome}>{parceiro.nome}</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setParceiro(null);
                                            setEmailParceiro('');
                                        }}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Aviso de Pagamento */}
                {categoria.valor_inscricao > 0 && (
                    <View style={styles.avisoCard}>
                        <Ionicons name="information-circle" size={24} color="#FFD300" />
                        <View style={styles.avisoContent}>
                            <Text style={styles.avisoTitle}>Atenção!</Text>
                            <Text style={styles.avisoText}>
                                Após confirmar a inscrição, você receberá instruções de pagamento.
                                Sua inscrição ficará pendente até a confirmação do pagamento.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Botão de Confirmar */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.7}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#000000" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#000000" />
                            <Text style={styles.submitButtonText}>Confirmar Inscrição</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#999999',
        marginTop: Spacing.sm,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    infoLabel: {
        fontSize: 14,
        color: '#999999',
    },
    infoValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    jogadorSection: {
        marginBottom: Spacing.md,
    },
    parceiroSection: {
        marginTop: Spacing.sm,
    },
    sectionLabel: {
        fontSize: 13,
        color: '#FFD300',
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    jogadorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        gap: Spacing.xs,
    },
    jogadorNome: {
        fontSize: 14,
        color: '#FFFFFF',
        flex: 1,
    },
    inputSection: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: 13,
        color: '#999999',
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        fontSize: 14,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        fontSize: 14,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    searchButton: {
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
    },
    helperText: {
        fontSize: 11,
        color: '#666666',
        marginTop: Spacing.xs,
    },
    avisoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 211, 0, 0.1)',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#FFD300',
        gap: Spacing.sm,
    },
    avisoContent: {
        flex: 1,
    },
    avisoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFD300',
        marginBottom: Spacing.xs,
    },
    avisoText: {
        fontSize: 12,
        color: '#CCCCCC',
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    tipoInscricaoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    tipoInscricaoText: {
        flex: 1,
        fontSize: 12,
        color: '#4CAF50',
        lineHeight: 16,
    },
});
