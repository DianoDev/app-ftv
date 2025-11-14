// src/styles/colors.js

/**
 * Paleta de cores do aplicativo Futevôlei
 */

export const colors = {
    // ========================================
    // Cores principais por tipo de usuário
    // ========================================
    jogador: {
        primary: '#2196F3',    // Azul principal
        light: '#64B5F6',      // Azul claro
        dark: '#1976D2',       // Azul escuro
        gradient: ['#2196F3', '#1976D2'],
    },
    tech: {
        black: "#000000",
        darkGray: "#0d0d0d",
        deepGray: "#111111",
        neonYellow: "#FFD300",
        neonYellowBright: "#ffea00",
        borderYellow: "#FFC400",
    },
    professor: {
        primary: '#4CAF50',    // Verde principal
        light: '#81C784',      // Verde claro
        dark: '#388E3C',       // Verde escuro
        gradient: ['#4CAF50', '#388E3C'],
    },

    arena: {
        primary: '#FF9800',    // Laranja principal
        light: '#FFB74D',      // Laranja claro
        dark: '#F57C00',       // Laranja escuro
        gradient: ['#FF9800', '#F57C00'],
    },

    // ========================================
    // Cores neutras
    // ========================================
    background: '#F5F5F5',   // Fundo geral do app
    surface: '#FFFFFF',      // Fundo de cards e superfícies

    text: {
        primary: '#333333',    // Texto principal
        secondary: '#666666',  // Texto secundário
        disabled: '#999999',   // Texto desabilitado
        light: '#FFFFFF',      // Texto claro (em fundos escuros)
    },

    // ========================================
    // Cores de feedback
    // ========================================
    success: '#4CAF50',      // Verde para sucesso
    error: '#F44336',        // Vermelho para erro
    warning: '#FF9800',      // Laranja para aviso
    info: '#2196F3',         // Azul para informação

    // ========================================
    // Tons de cinza
    // ========================================
    gray: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
    },

    // ========================================
    // Cores especiais
    // ========================================
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Overlay (para modals, etc)
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',

    // Bordas
    border: '#E0E0E0',
    borderLight: '#F5F5F5',

    // Sombras
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',

    // ========================================
    // Cores de status (para badges, etc)
    // ========================================
    status: {
        active: '#4CAF50',     // Verde - Ativo
        inactive: '#757575',   // Cinza - Inativo
        pending: '#FF9800',    // Laranja - Pendente
        completed: '#2196F3',  // Azul - Completo
        cancelled: '#F44336',  // Vermelho - Cancelado
    },

    // ========================================
    // Cores de nível de habilidade
    // ========================================
    skill: {
        iniciante: '#4CAF50',      // Verde
        intermediario: '#2196F3',  // Azul
        avancado: '#FF9800',       // Laranja
        profissional: '#9C27B0',   // Roxo
    },
};

/**
 * Retorna a cor principal baseada no tipo de usuário
 * @param {string} userType - Tipo de usuário (jogador, professor, arena)
 * @returns {string} - Cor hexadecimal
 */
export const getUserTypeColor = (userType) => {
    switch (userType?.toLowerCase()) {
        case 'jogador':
            return colors.jogador.primary;
        case 'professor':
            return colors.professor.primary;
        case 'arena':
            return colors.arena.primary;
        default:
            return colors.jogador.primary;
    }
};

/**
 * Retorna o gradiente baseado no tipo de usuário
 * @param {string} userType - Tipo de usuário
 * @returns {array} - Array com duas cores para gradiente
 */
export const getUserTypeGradient = (userType) => {
    switch (userType?.toLowerCase()) {
        case 'jogador':
            return colors.jogador.gradient;
        case 'professor':
            return colors.professor.gradient;
        case 'arena':
            return colors.arena.gradient;
        default:
            return colors.jogador.gradient;
    }
};

/**
 * Retorna a cor baseada no nível de habilidade
 * @param {string} level - Nível de habilidade
 * @returns {string} - Cor hexadecimal
 */
export const getSkillLevelColor = (level) => {
    return colors.skill[level] || colors.skill.iniciante;
};

/**
 * Retorna a cor baseada no status
 * @param {string} status - Status
 * @returns {string} - Cor hexadecimal
 */
export const getStatusColor = (status) => {
    return colors.status[status] || colors.status.pending;
};

/**
 * Adiciona opacidade a uma cor hexadecimal
 * @param {string} hex - Cor hexadecimal (#RRGGBB)
 * @param {number} opacity - Opacidade (0-1)
 * @returns {string} - Cor rgba
 */
export const addOpacity = (hex, opacity) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default colors;
