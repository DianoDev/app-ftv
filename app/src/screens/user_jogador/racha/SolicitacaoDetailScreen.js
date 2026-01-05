import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SolicitacaoRachaService } from '../../../services/solicitacaoRachaService';
import { ArenaService } from '../../../services/arenaService';
import { StorageService } from '../../../services/storage';
import { AmizadeService } from '../../../services/amizadeService';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function SolicitacaoDetailScreen() {
    const router = useRouter();
    const { solicitacaoId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [solicitacao, setSolicitacao] = useState(null);
    const [isParticipating, setIsParticipating] = useState(false);
    const [isCriador, setIsCriador] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [jogadoresDisponiveis, setJogadoresDisponiveis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingJogadores, setLoadingJogadores] = useState(false);
    const [parceiroModalVisible, setParceiroModalVisible] = useState(false);
    const [amigos, setAmigos] = useState([]);
    const [searchParceiro, setSearchParceiro] = useState('');
    const [isParceiro, setIsParceiro] = useState(false);

    useEffect(() => {
        loadUserAndSolicitacao();
    }, [solicitacaoId]);

    const loadUserAndSolicitacao = async () => {
        try {
            setLoading(true);

            // Carregar usuário do localStorage
            const user = await StorageService.getUser();
            if (user && user.id) {
                setCurrentUserId(user.id);
            }

            // Carregar solicitação
            await loadSolicitacao(user?.id);
        } catch (error) {
            console.error('Error loading user and solicitacao:', error);
            Alert.alert('Erro', 'Erro ao carregar informações');
            router.back();
        }
    };

    const loadSolicitacao = async (userId = null) => {
        try {
            const result = await SolicitacaoRachaService.getSolicitacao(solicitacaoId);
            console.log('Resultado completo:', JSON.stringify(result, null, 2));

            if (result.success) {
                const solicitacaoData = result.data.solicitacao || result.data;

                console.log('Solicitação:', solicitacaoData);
                console.log('Arena:', solicitacaoData.arena);
                console.log('Criador:', solicitacaoData.criador);
                console.log('Participantes:', solicitacaoData.participantes);
                console.log('User ID atual:', userId || currentUserId);
                console.log('Criador ID:', solicitacaoData.criador_id);

                if (!solicitacaoData.arena && solicitacaoData.arena_id) {
                    const arenaResult = await ArenaService.getArena(solicitacaoData.arena_id);
                    if (arenaResult.success) {
                        solicitacaoData.arena = arenaResult.data;
                    }
                }

                setSolicitacao(solicitacaoData);

                // Verificar se o usuário atual é o criador
                const userIdToCheck = userId || currentUserId;
                if (userIdToCheck) {
                    const isUserCriador = solicitacaoData.criador_id === userIdToCheck;
                    setIsCriador(isUserCriador);
                    console.log('É criador?', isUserCriador);

                    // Verificar se é o parceiro
                    const isUserParceiro = solicitacaoData.parceiro_id === userIdToCheck;
                    setIsParceiro(isUserParceiro);
                    console.log('É parceiro?', isUserParceiro);

                    // Verificar se está participando
                    const isUserParticipating = solicitacaoData.participantes?.some(
                        p => p.usuario_id === userIdToCheck
                    ) || false;
                    setIsParticipating(isUserParticipating);
                    console.log('Está participando?', isUserParticipating);
                }
            } else {
                Alert.alert('Erro', result.message);
                router.back();
            }
        } catch (error) {
            console.error('Error loading solicitacao:', error);
            Alert.alert('Erro', 'Erro ao carregar detalhes');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const loadJogadoresDisponiveis = async (search = '') => {
        try {
            setLoadingJogadores(true);
            const result = await SolicitacaoRachaService.getJogadoresDisponiveis(solicitacaoId, search);

            if (result.success) {
                setJogadoresDisponiveis(result.data.data || []);
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            console.error('Error loading jogadores:', error);
        } finally {
            setLoadingJogadores(false);
        }
    };

    const handleParticipar = async () => {
        if (actionLoading) return;

        setActionLoading(true);
        const result = await SolicitacaoRachaService.participar(solicitacaoId);
        setActionLoading(false);

        if (result.success) {
            Alert.alert('Sucesso', result.message);
            loadSolicitacao();
        } else {
            Alert.alert('Erro', result.message);
        }
    };

    const handleSair = async () => {
        if (actionLoading) return;

        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja sair deste racha?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        const result = await SolicitacaoRachaService.sair(solicitacaoId);
                        setActionLoading(false);

                        if (result.success) {
                            Alert.alert('Sucesso', result.message);
                            loadSolicitacao();
                        } else {
                            Alert.alert('Erro', result.message);
                        }
                    }
                }
            ]
        );
    };

    const handleConvidar = async (jogadorId) => {
        const result = await SolicitacaoRachaService.convidar(solicitacaoId, jogadorId);

        if (result.success) {
            Alert.alert('Sucesso', result.message);
            setModalVisible(false);
            loadSolicitacao();
        } else {
            Alert.alert('Erro', result.message);
        }
    };

    const openConvidarModal = () => {
        setModalVisible(true);
        loadJogadoresDisponiveis();
    };

    const handleSearch = () => {
        loadJogadoresDisponiveis(searchTerm);
    };

    const loadAmigos = async () => {
        try {
            const result = await AmizadeService.listarAmigos();
            if (result.success) {
                setAmigos(result.data || []);
            }
        } catch (error) {
            console.error('Erro ao carregar amigos:', error);
        }
    };

    const handleDefinirParceiro = async (amigoId) => {
        try {
            setActionLoading(true);
            const result = await SolicitacaoRachaService.definirParceiro(solicitacaoId, amigoId);

            if (result.success) {
                Alert.alert('Sucesso!', result.message);
                setParceiroModalVisible(false);
                loadSolicitacao();
            } else {
                Alert.alert('Erro', result.message);
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao definir parceiro');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoverParceiro = () => {
        Alert.alert(
            'Remover Parceiro',
            'Tem certeza que deseja remover o parceiro desta dupla?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            const result = await SolicitacaoRachaService.removerParceiro(solicitacaoId);

                            if (result.success) {
                                Alert.alert('Sucesso!', result.message);
                                loadSolicitacao();
                            } else {
                                Alert.alert('Erro', result.message);
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao remover parceiro');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openParceiroModal = () => {
        loadAmigos();
        setParceiroModalVisible(true);
    };

    const filteredAmigos = amigos.filter(amigo =>
        amigo.name?.toLowerCase().includes(searchParceiro.toLowerCase()) ||
        amigo.email?.toLowerCase().includes(searchParceiro.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[date.getDay()];
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'aberta':
                return '#4CAF50';
            case 'confirmada':
                return '#FFD300';
            case 'cancelada':
                return '#F44336';
            case 'concluida':
                return '#999999';
            default:
                return '#999999';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'aberta':
                return 'Aberta';
            case 'confirmada':
                return 'Confirmada';
            case 'cancelada':
                return 'Cancelada';
            case 'concluida':
                return 'Concluída';
            default:
                return status;
        }
    };

    const renderJogadorItem = ({ item }) => (
        <TouchableOpacity
            style={styles.jogadorItem}
            onPress={() => handleConvidar(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.jogadorAvatar}>
                <Ionicons name="person" size={24} color="#FFD300" />
            </View>
            <View style={styles.jogadorInfo}>
                <Text style={styles.jogadorNome}>{item.name}</Text>
                {item.cidade && item.estado && (
                    <Text style={styles.jogadorLocalidade}>
                        {item.cidade}, {item.estado}
                    </Text>
                )}
                {item.nivel_habilidade && (
                    <Text style={styles.jogadorNivel}>{item.nivel_habilidade}</Text>
                )}
            </View>
            <Ionicons name="add-circle" size={24} color="#FFD300" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD300" />
                    <Text style={styles.loadingText}>Carregando detalhes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!solicitacao) {
        return null;
    }

    const totalParticipantes = (solicitacao.participantes?.length || 0) + 1;
    const isFull = totalParticipantes >= solicitacao.limite_participantes;

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
                <Text style={styles.headerTitle}>Detalhes do Racha</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Card Principal */}
                <View style={styles.mainCard}>
                    {/* Data e Status */}
                    <View style={styles.dateStatusRow}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateDay}>{formatDate(solicitacao.data_jogo).split('/')[0]}</Text>
                            <Text style={styles.dateMonth}>{formatDate(solicitacao.data_jogo).split('/')[1]}</Text>
                        </View>
                        <View style={styles.dateInfo}>
                            <Text style={styles.dayOfWeek}>{formatDayOfWeek(solicitacao.data_jogo)}</Text>
                            <View style={styles.timeRow}>
                                <Ionicons name="time-outline" size={16} color="#FFD300" />
                                <Text style={styles.timeText}>
                                    {solicitacao.hora_inicio} - {solicitacao.hora_fim}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(solicitacao.status) + '20', borderColor: getStatusColor(solicitacao.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(solicitacao.status) }]}>
                                {getStatusLabel(solicitacao.status)}
                            </Text>
                        </View>
                    </View>

                    {/* Arena */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color="#FFD300" />
                            <Text style={styles.sectionTitle}>Local</Text>
                        </View>
                        {solicitacao.arena ? (
                            <>
                                <Text style={styles.arenaName}>{solicitacao.arena.nome || 'Arena'}</Text>
                                {solicitacao.arena.endereco && (
                                    <Text style={styles.arenaEndereco}>{solicitacao.arena.endereco}</Text>
                                )}
                                <Text style={styles.arenaLocalidade}>
                                    {solicitacao.arena.cidade || ''}, {solicitacao.arena.estado || ''}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.arenaName}>Arena ID: {solicitacao.arena_id}</Text>
                        )}
                    </View>

                    {/* Descrição */}
                    {solicitacao.descricao && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={20} color="#FFD300" />
                                <Text style={styles.sectionTitle}>Descrição</Text>
                            </View>
                            <Text style={styles.descricao}>{solicitacao.descricao}</Text>
                        </View>
                    )}

                    {/* Informações */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoCard}>
                            <Ionicons name="people" size={24} color="#FFD300" />
                            <Text style={styles.infoLabel}>Participantes</Text>
                            <Text style={styles.infoValue}>{totalParticipantes}/{solicitacao.limite_participantes}</Text>
                        </View>

                        {solicitacao.nivel_sugerido && (
                            <View style={styles.infoCard}>
                                <Ionicons name="trophy" size={24} color="#FFD300" />
                                <Text style={styles.infoLabel}>Nível</Text>
                                <Text style={styles.infoValue}>{solicitacao.nivel_sugerido}</Text>
                            </View>
                        )}

                        {solicitacao.valor_por_pessoa && (
                            <View style={styles.infoCard}>
                                <Ionicons name="cash" size={24} color="#4CAF50" />
                                <Text style={styles.infoLabel}>Valor</Text>
                                <Text style={styles.infoValue}>R$ {parseFloat(solicitacao.valor_por_pessoa).toFixed(2)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Tipo de Inscrição */}
                    {solicitacao.tipo_inscricao && (
                        <View style={styles.tipoInscricaoSection}>
                            <View style={styles.tipoInscricaoHeader}>
                                <Ionicons name="git-network" size={20} color="#FFD300" />
                                <Text style={styles.tipoInscricaoTitle}>Tipo de Inscrição</Text>
                            </View>
                            <View style={styles.tipoInscricaoBadge}>
                                <Text style={styles.tipoInscricaoValue}>
                                    {solicitacao.tipo_inscricao === 'individual' && 'Individual'}
                                    {solicitacao.tipo_inscricao === 'dupla' && 'Dupla'}
                                    {solicitacao.tipo_inscricao === 'ambos' && 'Individual ou Dupla'}
                                </Text>
                            </View>
                            <Text style={styles.tipoInscricaoDescricao}>
                                {solicitacao.tipo_inscricao === 'individual' && 'Apenas inscrições individuais são permitidas'}
                                {solicitacao.tipo_inscricao === 'dupla' && 'Todos devem se inscrever em dupla'}
                                {solicitacao.tipo_inscricao === 'ambos' && 'Permite inscrições individuais e em dupla'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Parceiro (Dupla) */}
                {(solicitacao.parceiro || isCriador) && (
                    <View style={styles.parceiroCard}>
                        <View style={styles.parceiroHeader}>
                            <View style={styles.parceiroTitleRow}>
                                <Ionicons name="people-circle" size={24} color="#FFD300" />
                                <Text style={styles.parceiroTitle}>Parceiro de Dupla</Text>
                            </View>
                            {isCriador && solicitacao.status === 'aberta' && !solicitacao.parceiro && (
                                <TouchableOpacity
                                    style={styles.addParceiroButton}
                                    onPress={openParceiroModal}
                                >
                                    <Ionicons name="add-circle" size={20} color="#000000" />
                                    <Text style={styles.addParceiroText}>Adicionar</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {solicitacao.parceiro ? (
                            <View style={styles.parceiroInfo}>
                                <View style={styles.parceiroAvatarContainer}>
                                    <Ionicons name="person-circle" size={48} color="#FFD300" />
                                </View>
                                <View style={styles.parceiroDetails}>
                                    <Text style={styles.parceiroName}>{solicitacao.parceiro.name}</Text>
                                    <Text style={styles.parceiroEmail}>{solicitacao.parceiro.email}</Text>
                                    {isParceiro && (
                                        <View style={styles.duplaIsBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                                            <Text style={styles.duplaBadgeText}>Você é o parceiro</Text>
                                        </View>
                                    )}
                                </View>
                                {isCriador && solicitacao.status === 'aberta' && (
                                    <TouchableOpacity
                                        style={styles.removeParceiroButton}
                                        onPress={handleRemoverParceiro}
                                        disabled={actionLoading}
                                    >
                                        <Ionicons name="close-circle" size={28} color="#F44336" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <View style={styles.noParceiroInfo}>
                                <Ionicons name="people-outline" size={32} color="#666666" />
                                <Text style={styles.noParceiroText}>
                                    {isCriador
                                        ? 'Você pode adicionar um parceiro para formar uma dupla fixa'
                                        : 'Sem parceiro definido'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Lista de Participantes */}
                <View style={styles.participantesCard}>
                    <View style={styles.participantesHeader}>
                        <Text style={styles.participantesTitle}>Participantes ({totalParticipantes})</Text>
                        {(isCriador || isParticipating) && solicitacao.status === 'aberta' && !isFull && (
                            <TouchableOpacity
                                style={styles.convidarButton}
                                onPress={openConvidarModal}
                            >
                                <Ionicons name="person-add" size={20} color="#000000" />
                                <Text style={styles.convidarButtonText}>Convidar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Criador */}
                    <View style={styles.participanteItem}>
                        <View style={styles.participanteAvatar}>
                            <Ionicons name="person" size={24} color="#FFD300" />
                        </View>
                        <View style={styles.participanteInfo}>
                            <Text style={styles.participanteNome}>
                                {solicitacao.criador?.name || `Criador (ID: ${solicitacao.criador_id})`}
                            </Text>
                            <View style={styles.criadorBadge}>
                                <Ionicons name="star" size={12} color="#FFD300" />
                                <Text style={styles.criadorText}>Criador</Text>
                            </View>
                        </View>
                    </View>

                    {/* Outros Participantes */}
                    {solicitacao.participantes && Array.isArray(solicitacao.participantes) && solicitacao.participantes.length > 0 ? (
                        solicitacao.participantes.map((participante, index) => (
                            <View key={index} style={styles.participanteItem}>
                                <View style={styles.participanteAvatar}>
                                    <Ionicons name="person" size={24} color="#FFD300" />
                                </View>
                                <View style={styles.participanteInfo}>
                                    <Text style={styles.participanteNome}>
                                        {participante.usuario?.name || `Jogador (ID: ${participante.usuario_id})`}
                                    </Text>
                                    {participante.status === 'convidado' && (
                                        <Text style={styles.participanteStatus}>Convidado</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : null}
                </View>

                {/* Avisos e Informações do Criador */}
                {isCriador && (
                    <View style={styles.adminInfoCard}>
                        <View style={styles.adminHeader}>
                            <Ionicons name="shield-checkmark" size={24} color="#FFD300" />
                            <Text style={styles.adminTitle}>Painel do Criador</Text>
                        </View>

                        <View style={styles.adminInfo}>
                            <Ionicons name="information-circle-outline" size={20} color="#4CAF50" />
                            <Text style={styles.adminInfoText}>
                                Você é o criador deste racha e tem controle total sobre ele
                            </Text>
                        </View>

                        <View style={styles.adminInfo}>
                            <Ionicons name="people-outline" size={20} color="#FFD300" />
                            <Text style={styles.adminInfoText}>
                                {totalParticipantes} de {solicitacao.limite_participantes} vagas preenchidas
                            </Text>
                        </View>

                        {!isFull && (
                            <View style={styles.adminInfo}>
                                <Ionicons name="alert-circle-outline" size={20} color="#FFD300" />
                                <Text style={styles.adminInfoText}>
                                    Ainda há {solicitacao.limite_participantes - totalParticipantes} {solicitacao.limite_participantes - totalParticipantes === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                                </Text>
                            </View>
                        )}

                        {isFull && (
                            <View style={styles.adminInfo}>
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                <Text style={[styles.adminInfoText, { color: '#4CAF50' }]}>
                                    Racha completo! Todas as vagas foram preenchidas
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Aviso de Participação */}
                {!isCriador && isParticipating && (
                    <View style={styles.participatingCard}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.participatingText}>
                            Você está participando deste racha
                        </Text>
                    </View>
                )}

                {/* Botão de Ação */}
                {solicitacao.status === 'aberta' && !isCriador && (
                    <View style={styles.actionSection}>
                        {isParticipating ? (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.leaveButton]}
                                onPress={handleSair}
                                disabled={actionLoading}
                                activeOpacity={0.7}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Sair do Racha</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <>
                                {isFull && (
                                    <View style={styles.fullWarning}>
                                        <Ionicons name="alert-circle" size={20} color="#F44336" />
                                        <Text style={styles.fullWarningText}>
                                            Este racha está lotado. Não é possível entrar no momento.
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.joinButton,
                                        isFull && styles.actionButtonDisabled
                                    ]}
                                    onPress={handleParticipar}
                                    disabled={isFull || actionLoading}
                                    activeOpacity={0.7}
                                >
                                    {actionLoading ? (
                                        <ActivityIndicator size="small" color="#000000" />
                                    ) : (
                                        <>
                                            <Ionicons name="add-circle-outline" size={24} color="#000000" />
                                            <Text style={styles.actionButtonText}>
                                                {isFull ? 'Racha Lotado' : 'Entrar no Racha'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modal de Convidar */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Convidar Jogador</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#999999" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputContainer}>
                                <Ionicons name="search" size={20} color="#999999" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar por nome..."
                                    placeholderTextColor="#666666"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    onSubmitEditing={handleSearch}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={handleSearch}
                            >
                                <Text style={styles.searchButtonText}>Buscar</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingJogadores ? (
                            <View style={styles.modalLoadingContainer}>
                                <ActivityIndicator size="large" color="#FFD300" />
                            </View>
                        ) : (
                            <FlatList
                                data={jogadoresDisponiveis}
                                renderItem={renderJogadorItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.jogadoresList}
                                ListEmptyComponent={
                                    <View style={styles.emptyJogadores}>
                                        <Text style={styles.emptyJogadoresText}>Nenhum jogador disponível</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Selecionar Parceiro */}
            <Modal
                visible={parceiroModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setParceiroModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Parceiro</Text>
                            <TouchableOpacity onPress={() => setParceiroModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#999999" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputContainer}>
                                <Ionicons name="search" size={20} color="#999999" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar amigo..."
                                    placeholderTextColor="#666666"
                                    value={searchParceiro}
                                    onChangeText={setSearchParceiro}
                                />
                            </View>
                        </View>

                        {filteredAmigos.length === 0 ? (
                            <View style={styles.emptyJogadores}>
                                <Ionicons name="people-outline" size={48} color="#666666" />
                                <Text style={styles.emptyJogadoresText}>
                                    {searchParceiro ? 'Nenhum amigo encontrado' : 'Você não tem amigos ainda'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredAmigos}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.jogadorItem}
                                        onPress={() => handleDefinirParceiro(item.id)}
                                        activeOpacity={0.7}
                                        disabled={actionLoading}
                                    >
                                        <View style={styles.jogadorAvatar}>
                                            <Ionicons name="person" size={24} color="#FFD300" />
                                        </View>
                                        <View style={styles.jogadorInfo}>
                                            <Text style={styles.jogadorNome}>{item.name}</Text>
                                            <Text style={styles.jogadorLocalidade}>{item.email}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color="#999999" />
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.jogadoresList}
                            />
                        )}
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
    headerRight: {
        width: 40,
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
    scrollContent: {
        padding: Spacing.md,
    },
    mainCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dateStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    dateBox: {
        width: 70,
        height: 70,
        backgroundColor: '#FFD300',
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    dateDay: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
    },
    dateMonth: {
        fontSize: 14,
        color: '#000000',
    },
    dateInfo: {
        flex: 1,
    },
    dayOfWeek: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: Typography.sizes.body,
        color: '#FFD300',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    arenaName: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFD300',
        marginBottom: 4,
    },
    arenaEndereco: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        marginBottom: 2,
    },
    arenaLocalidade: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    descricao: {
        fontSize: Typography.sizes.body,
        color: '#999999',
        lineHeight: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    infoCard: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    infoLabel: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginTop: 4,
    },
    infoValue: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginTop: 2,
    },
    participantesCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    participantesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    participantesTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    convidarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD300',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        gap: 4,
    },
    convidarButtonText: {
        fontSize: Typography.sizes.caption,
        color: '#000000',
        fontWeight: '600',
    },
    participanteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    participanteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    participanteInfo: {
        flex: 1,
    },
    participanteNome: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    participanteStatus: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        fontStyle: 'italic',
    },
    criadorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    criadorText: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '600',
    },
    adminInfoCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    adminHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    adminTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: '700',
        color: '#FFD300',
    },
    adminInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    adminInfoText: {
        flex: 1,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    participatingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: '#4CAF50',
        marginBottom: Spacing.md,
    },
    participatingText: {
        fontSize: Typography.sizes.body,
        color: '#4CAF50',
        fontWeight: '600',
    },
    fullWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: '#F44336',
        marginBottom: Spacing.sm,
    },
    fullWarningText: {
        flex: 1,
        fontSize: Typography.sizes.caption,
        color: '#F44336',
        fontWeight: '500',
    },
    actionSection: {
        marginBottom: Spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    joinButton: {
        backgroundColor: '#FFD300',
    },
    leaveButton: {
        backgroundColor: '#F44336',
    },
    actionButtonDisabled: {
        backgroundColor: '#666666',
        opacity: 0.5,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        maxHeight: '80%',
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
    searchContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        gap: 8,
        borderWidth: 1,
        borderColor: '#3a3a3a',
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
    },
    searchButtonText: {
        fontSize: Typography.sizes.body,
        color: '#000000',
        fontWeight: '600',
    },
    modalLoadingContainer: {
        paddingVertical: Spacing.xl * 2,
        alignItems: 'center',
    },
    jogadoresList: {
        paddingBottom: Spacing.xl,
    },
    jogadorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    jogadorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    jogadorInfo: {
        flex: 1,
    },
    jogadorNome: {
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 2,
    },
    jogadorLocalidade: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    jogadorNivel: {
        fontSize: Typography.sizes.caption,
        color: '#FFD300',
        fontWeight: '600',
    },
    emptyJogadores: {
        paddingVertical: Spacing.xl * 2,
        alignItems: 'center',
    },
    emptyJogadoresText: {
        fontSize: Typography.sizes.body,
        color: '#999999',
    },
    parceiroCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#FFD300',
    },
    parceiroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    parceiroTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    parceiroTitle: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    addParceiroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD300',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    addParceiroText: {
        fontSize: Typography.sizes.caption,
        color: '#000000',
        fontWeight: '600',
    },
    parceiroInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    parceiroAvatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD300',
    },
    parceiroDetails: {
        flex: 1,
    },
    parceiroName: {
        fontSize: Typography.sizes.body,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    parceiroEmail: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
    },
    duplaIsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    duplaBadgeText: {
        fontSize: Typography.sizes.caption,
        color: '#4CAF50',
        fontWeight: '500',
    },
    removeParceiroButton: {
        padding: Spacing.xs,
    },
    noParceiroInfo: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    noParceiroText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
        maxWidth: '80%',
    },
    tipoInscricaoSection: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    tipoInscricaoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    tipoInscricaoTitle: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
    },
    tipoInscricaoBadge: {
        backgroundColor: '#FFD30020',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#FFD300',
        alignSelf: 'flex-start',
        marginBottom: Spacing.xs,
    },
    tipoInscricaoValue: {
        fontSize: Typography.sizes.body,
        color: '#FFD300',
        fontWeight: '600',
    },
    tipoInscricaoDescricao: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginTop: Spacing.xs,
    },
});