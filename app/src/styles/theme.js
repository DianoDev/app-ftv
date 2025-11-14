/**
 * Sistema de Tema - Aplicativo de Futevôlei
 * Baseado na identidade visual "BeachUp do futevôlei"
 * Amarelo Mikasa como cor âncora + energia da praia brasileira
 */

import { Platform, StyleSheet } from 'react-native';

// ==================== SISTEMA DE CORES ====================

export const Colors = {
    // Cores Primárias - Amarelo Mikasa (cor de marca principal)

    text: {
        primary:'#FFEB3B',
        secondary: '#42A5F5'
    },


    primary: {
        mikasaBright: '#FFEB3B',    // Amarelo brilhante - CTAs e elementos de máxima visibilidade
        mikasaWarm: '#FFC107',       // Amarelo mais quente - fondos e elementos de ambiente
        mikasa: '#FFD700',           // Amarelo dourado - tom intermediário
    },

    // Cor Secundária - Azul Oceano
    secondary: {
        ocean: '#1976D2',            // Azul oceano principal - contraste perfeito com amarelo
        oceanLight: '#42A5F5',       // Azul oceano claro
        oceanDark: '#0D47A1',        // Azul oceano escuro
    },

    // Cores de Suporte e Acentos
    accent: {
        coral: '#FF6B35',            // Coral vibrante - notificações e badges
        coralLight: '#F3A282',       // Coral claro - elementos secundários
        lime: '#64DBAC',             // Verde lima - crescimento e conquistas
        limeAlt: '#8BC34A',          // Verde lima alternativo
        cyan: '#00BCD4',             // Azul ciano - alternativa jovem e tech
    },

    // Cores de Status e Feedback
    status: {
        success: '#64DBAC',          // Verde - estados de sucesso
        warning: '#FF6B35',          // Coral - avisos
        error: '#F44336',            // Vermelho - erros
        info: '#00BCD4',             // Ciano - informações
    },

    // Cores Neutras e Fundacionais
    neutral: {
        navyDeep: '#001930',         // Navy profundo - texto principal (contraste 18.6:1)
        navyMedium: '#00295B',       // Navy médio
        charcoal: '#333538',         // Cinza carvão - texto secundário
        sandBeige: '#F5DEB3',        // Bege areia - fundos quentes
        sandLight: '#E8D4A2',        // Areia clara
        greyLight: '#E8E6EA',        // Cinza claro - espaçamento
        white: '#FFFFFF',            // Branco puro
        black: '#000000',            // Preto puro
    },

    // Modo Escuro
    dark: {
        background: '#001930',       // Navy profundo como fundo principal
        surface: '#00295B',          // Navy médio para superfícies
        accent: '#FFEB3B',           // Amarelo estratégico para elementos críticos
        secondary: '#1976D2',        // Azul oceano para componentes secundários
        text: '#FFFFFF',             // Texto principal
        textSecondary: '#E8E6EA',    // Texto secundário
    },

    // Gradientes
    gradients: {
        sunset: ['#FFEB3B', '#FF6B35'],           // Amarelo para coral
        ocean: ['#1976D2', '#00BCD4'],            // Azul oceano para ciano
        beach: ['#F5DEB3', '#FFEB3B'],            // Areia para amarelo
        skyToSand: ['#1976D2', '#F5DEB3'],        // Céu para areia
    },
};

// ==================== TIPOGRAFIA ====================

export const Typography = {
    // Fontes do Sistema (compatível com React Native Expo)
    fonts: {
        // Display/Headers - Bold geométrico
        display: Platform.select({
            ios: 'System',
            android: 'Roboto',
            default: 'System',
        }),
        displayWeight: '700', // Bold

        // Headers secundários - Bold
        heading: Platform.select({
            ios: 'System',
            android: 'Roboto',
            default: 'System',
        }),
        headingWeight: '600', // SemiBold

        // Corpo de texto - Regular
        body: Platform.select({
            ios: 'System',
            android: 'Roboto',
            default: 'System',
        }),
        bodyWeight: '400', // Regular

        // Números e estatísticas - Bold
        numbers: Platform.select({
            ios: 'System',
            android: 'Roboto-Medium',
            default: 'System',
        }),
        numbersWeight: '700', // Bold
    },

    // Tamanhos de Fonte
    sizes: {
        // Display (Títulos principais, logo)
        displayLarge: 48,
        displayMedium: 40,
        display: 32,

        // Headers
        h1: 32,
        h2: 28,
        h3: 24,
        h4: 20,
        h5: 18,
        h6: 16,

        // Corpo de texto
        body: 16,
        bodySmall: 14,

        // Labels e captions
        label: 14,
        caption: 12,
        tiny: 10,

        // Estatísticas e placares
        statLarge: 72,
        statMedium: 48,
        stat: 32,
        statSmall: 24,
    },

    // Alturas de linha
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Espaçamento de letras
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
    },
};

// ==================== ESPAÇAMENTOS ====================

export const Spacing = {
    // Espaçamentos base (múltiplos de 4)
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    huge: 48,

    // Margens específicas para cards e componentes
    cardPadding: 16,
    screenPadding: 16,
    sectionSpacing: 24,

    // Área de segurança (para bordas de tela)
    safeArea: {
        horizontal: 16,
        vertical: 16,
    },
};

// ==================== BORDAS E CANTOS ====================

export const BorderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999, // Circular

    // Específico para componentes
    card: 12,
    button: 8,
    input: 8,
    modal: 16,
    avatar: 9999,
};

export const BorderWidth = {
    thin: 1,
    base: 2,
    thick: 3,
    heavy: 4,
};

// ==================== SOMBRAS ====================

export const Shadows = {
    // Sombras para iOS
    ios: {
        sm: {
            shadowColor: Colors.neutral.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
        },
        md: {
            shadowColor: Colors.neutral.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
        },
        lg: {
            shadowColor: Colors.neutral.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
        },
    },

    // Elevação para Android
    android: {
        sm: { elevation: 3 },
        md: { elevation: 6 },
        lg: { elevation: 12 },
    },

    // Sombra universal (funciona em ambas plataformas)
    card: Platform.select({
        ios: {
            shadowColor: Colors.neutral.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
        },
        android: { elevation: 6 },
    }),

    button: Platform.select({
        ios: {
            shadowColor: Colors.neutral.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
        },
        android: { elevation: 3 },
    }),
};

// ==================== ÍCONES ====================

export const Icons = {
    // Mapeamento de ícones do @expo/vector-icons (Ionicons por padrão)
    navigation: {
        home: 'home',
        homeOutline: 'home-outline',
        search: 'search',
        searchOutline: 'search-outline',
        calendar: 'calendar',
        calendarOutline: 'calendar-outline',
        trophy: 'trophy',
        trophyOutline: 'trophy-outline',
        person: 'person',
        personOutline: 'person-outline',
    },

    // Aluguel de quadras
    courts: {
        court: 'grid',                  // Quadra vista aérea
        location: 'location',           // Pin de localização
        locationOutline: 'location-outline',
        calendar: 'calendar',           // Calendário
        clock: 'time',                  // Relógio
        clockOutline: 'time-outline',
        card: 'card',                   // Cartão de crédito
        filter: 'funnel',               // Filtro
        filterOutline: 'funnel-outline',
    },

    // Matchmaking e rachas
    match: {
        people: 'people',               // Múltiplos jogadores
        peopleOutline: 'people-outline',
        handshake: 'hand-left',         // Acordo
        compass: 'compass',             // Bússola
        compassOutline: 'compass-outline',
        shuffle: 'shuffle',             // Aleatório
        scale: 'scale',                 // Balança (emparelhamento)
    },

    // Apostas (discreto)
    betting: {
        dice: 'dice',                   // Dado
        cash: 'cash',                   // Dinheiro
        cashOutline: 'cash-outline',
    },

    // Torneios
    tournament: {
        trophy: 'trophy',               // Troféu
        trophyOutline: 'trophy-outline',
        medal: 'medal',                 // Medalha
        medalOutline: 'medal-outline',
        podium: 'stats-chart',          // Pódio
        bracket: 'git-branch',          // Bracket em árvore
        crown: 'star',                  // Coroa/estrela
        shield: 'shield',               // Escudo
        shieldOutline: 'shield-outline',
    },

    // Rankings
    ranking: {
        podium: 'stats-chart',          // Pódio
        bars: 'bar-chart',              // Barras
        barsOutline: 'bar-chart-outline',
        star: 'star',                   // Estrela
        starOutline: 'star-outline',
        arrowUp: 'arrow-up',            // Subiu
        arrowDown: 'arrow-down',        // Desceu
        flash: 'flash',                 // Raio (streaks)
        flashOutline: 'flash-outline',
    },

    // Perfil e social
    profile: {
        avatar: 'person-circle',        // Avatar
        avatarOutline: 'person-circle-outline',
        settings: 'settings',           // Configurações
        settingsOutline: 'settings-outline',
        edit: 'pencil',                 // Editar
        editOutline: 'pencil-outline',
        stats: 'stats-chart',           // Estatísticas
        heart: 'heart',                 // Favorito
        heartOutline: 'heart-outline',
        notifications: 'notifications',  // Notificações
        notificationsOutline: 'notifications-outline',
    },

    // Ações gerais
    actions: {
        add: 'add',
        addCircle: 'add-circle',
        addCircleOutline: 'add-circle-outline',
        close: 'close',
        closeCircle: 'close-circle',
        checkmark: 'checkmark',
        checkmarkCircle: 'checkmark-circle',
        chevronRight: 'chevron-forward',
        chevronLeft: 'chevron-back',
        chevronUp: 'chevron-up',
        chevronDown: 'chevron-down',
        menu: 'menu',
        more: 'ellipsis-horizontal',
        moreVertical: 'ellipsis-vertical',
        share: 'share-social',
        shareOutline: 'share-social-outline',
    },

    // Status
    status: {
        success: 'checkmark-circle',
        warning: 'warning',
        error: 'close-circle',
        info: 'information-circle',
    },
};

// ==================== ANIMAÇÕES ====================

export const Animations = {
    // Durações (em milissegundos)
    durations: {
        fast: 150,
        normal: 250,
        slow: 350,
    },

    // Timings
    timings: {
        easeOut: 'ease-out',
        easeIn: 'ease-in',
        easeInOut: 'ease-in-out',
        spring: 'spring',
    },
};

// ==================== COMPONENTES REUTILIZÁVEIS ====================

export const ComponentStyles = StyleSheet.create({
    // Container principal da tela
    screenContainer: {
        flex: 1,
        backgroundColor: Colors.neutral.white,
    },

    screenContainerDark: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },

    // Container com padding
    paddedContainer: {
        padding: Spacing.screenPadding,
    },

    // Cards
    card: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.cardPadding,
        marginBottom: Spacing.md,
        ...Shadows.card,
    },

    cardDark: {
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.card,
        padding: Spacing.cardPadding,
        marginBottom: Spacing.md,
        ...Shadows.card,
    },

    // Botão primário (Amarelo Mikasa)
    buttonPrimary: {
        backgroundColor: Colors.primary.mikasaBright,
        borderRadius: BorderRadius.button,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.button,
    },

    buttonPrimaryText: {
        color: Colors.neutral.navyDeep,
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },

    // Botão secundário (Azul Oceano)
    buttonSecondary: {
        backgroundColor: Colors.secondary.ocean,
        borderRadius: BorderRadius.button,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.button,
    },

    buttonSecondaryText: {
        color: Colors.neutral.white,
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },

    // Botão outline
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: BorderWidth.base,
        borderColor: Colors.primary.mikasaBright,
        borderRadius: BorderRadius.button,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonOutlineText: {
        color: Colors.primary.mikasaBright,
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },

    // Headers
    header: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.md,
    },

    headerDark: {
        fontSize: Typography.sizes.h1,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.dark.text,
        marginBottom: Spacing.md,
    },

    subheader: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginBottom: Spacing.sm,
    },

    // Texto corpo
    bodyText: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.bodyWeight,
        color: Colors.neutral.navyDeep,
        lineHeight: Typography.sizes.body * Typography.lineHeights.normal,
    },

    bodyTextDark: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.bodyWeight,
        color: Colors.dark.text,
        lineHeight: Typography.sizes.body * Typography.lineHeights.normal,
    },

    // Texto secundário
    secondaryText: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.bodyWeight,
        color: Colors.neutral.charcoal,
        lineHeight: Typography.sizes.bodySmall * Typography.lineHeights.normal,
    },

    // Labels
    label: {
        fontSize: Typography.sizes.label,
        fontWeight: Typography.fonts.bodyWeight,
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.xs,
    },

    // Badge
    badge: {
        backgroundColor: Colors.accent.coral,
        borderRadius: BorderRadius.full,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        alignSelf: 'flex-start',
    },

    badgeText: {
        color: Colors.neutral.white,
        fontSize: Typography.sizes.caption,
        fontWeight: Typography.fonts.headingWeight,
    },

    // Avatar
    avatar: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.avatar,
        backgroundColor: Colors.neutral.greyLight,
    },

    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.avatar,
        backgroundColor: Colors.neutral.greyLight,
    },

    // Input
    input: {
        backgroundColor: Colors.neutral.white,
        borderWidth: BorderWidth.thin,
        borderColor: Colors.neutral.greyLight,
        borderRadius: BorderRadius.input,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.base,
        fontSize: Typography.sizes.body,
        color: Colors.neutral.navyDeep,
    },

    inputFocused: {
        borderColor: Colors.primary.mikasaBright,
        borderWidth: BorderWidth.base,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: Colors.neutral.greyLight,
        marginVertical: Spacing.md,
    },

    // Card de Quadra
    courtCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        overflow: 'hidden',
        marginBottom: Spacing.base,
        ...Shadows.card,
    },

    courtImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: Colors.neutral.greyLight,
    },

    courtInfo: {
        padding: Spacing.base,
    },

    // Card de Partida/Jogo
    matchCard: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.base,
        marginBottom: Spacing.md,
        ...Shadows.card,
    },

    // Leaderboard Entry
    leaderboardEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },

    leaderboardRank: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.neutral.navyDeep,
        marginRight: Spacing.md,
        minWidth: 40,
    },

    // Status indicators
    statusIndicatorSuccess: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.status.success,
    },

    statusIndicatorWarning: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.status.warning,
    },

    statusIndicatorError: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.status.error,
    },

    // Estatísticas
    statContainer: {
        alignItems: 'center',
        padding: Spacing.md,
    },

    statValue: {
        fontSize: Typography.sizes.stat,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.primary.mikasaBright,
    },

    statLabel: {
        fontSize: Typography.sizes.caption,
        fontWeight: Typography.fonts.bodyWeight,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
    },

    // FAB (Floating Action Button)
    fab: {
        position: 'absolute',
        right: Spacing.base,
        bottom: Spacing.base,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary.mikasaBright,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.lg,
    },

    // Bottom Tab Bar
    tabBar: {
        backgroundColor: Colors.neutral.white,
        borderTopWidth: BorderWidth.thin,
        borderTopColor: Colors.neutral.greyLight,
        paddingBottom: Spacing.sm,
        height: 60,
    },

    tabBarDark: {
        backgroundColor: Colors.dark.surface,
        borderTopWidth: BorderWidth.thin,
        borderTopColor: Colors.neutral.charcoal,
        paddingBottom: Spacing.sm,
        height: 60,
    },
});

// ==================== UTILIDADES ====================

export const Utils = {
    // Função para adicionar opacidade a uma cor hex
    addOpacity: (hex, opacity) => {
        const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${hex}${alphaHex}`;
    },

    // Tamanhos de toque mínimos (acessibilidade)
    minTouchSize: {
        width: 44,
        height: 44,
    },
};

// ==================== EXPORTAÇÃO PADRÃO ====================

export default {
    Colors,
    Typography,
    Spacing,
    BorderRadius,
    BorderWidth,
    Shadows,
    Icons,
    Animations,
    ComponentStyles,
    Utils,
};