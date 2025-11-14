/**
 * Exemplos de Uso do Tema
 * Componentes práticos demonstrando como usar o sistema de tema
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, {
    Colors,
    Typography,
    Spacing,
    BorderRadius,
    ComponentStyles,
    Icons
} from './theme';

// ==================== EXEMPLOS DE BOTÕES ====================

export const PrimaryButton = ({ title, onPress, icon, disabled }) => (
    <TouchableOpacity
        style={[
            ComponentStyles.buttonPrimary,
            disabled && { opacity: 0.5 }
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
    >
        {icon && (
            <Ionicons
                name={icon}
                size={20}
                color={Colors.neutral.navyDeep}
                style={{ marginRight: Spacing.xs }}
            />
        )}
        <Text style={ComponentStyles.buttonPrimaryText}>{title}</Text>
    </TouchableOpacity>
);

export const SecondaryButton = ({ title, onPress, icon }) => (
    <TouchableOpacity
        style={ComponentStyles.buttonSecondary}
        onPress={onPress}
        activeOpacity={0.8}
    >
        {icon && (
            <Ionicons
                name={icon}
                size={20}
                color={Colors.neutral.white}
                style={{ marginRight: Spacing.xs }}
            />
        )}
        <Text style={ComponentStyles.buttonSecondaryText}>{title}</Text>
    </TouchableOpacity>
);

export const OutlineButton = ({ title, onPress }) => (
    <TouchableOpacity
        style={ComponentStyles.buttonOutline}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Text style={ComponentStyles.buttonOutlineText}>{title}</Text>
    </TouchableOpacity>
);

// ==================== CARD DE QUADRA ====================

export const CourtCard = ({ court, onPress }) => (
    <TouchableOpacity
        style={ComponentStyles.courtCard}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <Image
            source={{ uri: court.image || 'https://via.placeholder.com/400x225' }}
            style={ComponentStyles.courtImage}
            resizeMode="cover"
        />
        <View style={ComponentStyles.courtInfo}>
            <View style={styles.courtHeader}>
                <Text style={styles.courtName}>{court.name}</Text>
                <View style={styles.availableBadge}>
                    <View style={ComponentStyles.statusIndicatorSuccess} />
                    <Text style={styles.availableText}>Disponível</Text>
                </View>
            </View>

            <View style={styles.courtLocation}>
                <Ionicons
                    name={Icons.courts.locationOutline}
                    size={16}
                    color={Colors.neutral.charcoal}
                />
                <Text style={styles.locationText}>{court.location}</Text>
                <Text style={styles.distanceText}>• {court.distance}</Text>
            </View>

            <View style={styles.courtFooter}>
                <View style={styles.ratingContainer}>
                    <Ionicons
                        name={Icons.ranking.star}
                        size={16}
                        color={Colors.primary.mikasaBright}
                    />
                    <Text style={styles.ratingText}>{court.rating}</Text>
                    <Text style={styles.reviewsText}>({court.reviews} avaliações)</Text>
                </View>
                <Text style={styles.priceText}>R$ {court.pricePerHour}/hora</Text>
            </View>
        </View>
    </TouchableOpacity>
);

// ==================== CARD DE PARTIDA ====================

export const MatchCard = ({ match, onPress }) => (
    <TouchableOpacity
        style={ComponentStyles.matchCard}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <View style={styles.matchHeader}>
            <View style={styles.liveIndicator}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>AO VIVO</Text>
            </View>
            <Text style={styles.matchTime}>{match.time}</Text>
        </View>

        <View style={styles.teamsContainer}>
            <View style={styles.teamRow}>
                <Text style={styles.teamName}>{match.team1.name}</Text>
                <Text style={styles.teamScore}>{match.team1.score}</Text>
            </View>

            <View style={styles.vsContainer}>
                <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamRow}>
                <Text style={styles.teamName}>{match.team2.name}</Text>
                <Text style={styles.teamScore}>{match.team2.score}</Text>
            </View>
        </View>

        <View style={styles.matchProgress}>
            <View style={[styles.progressBar, { width: `${match.progress}%` }]} />
        </View>
    </TouchableOpacity>
);

// ==================== LEADERBOARD ENTRY ====================

export const LeaderboardEntry = ({ player, position, isCurrentUser }) => {
    const getRankBadgeColor = (pos) => {
        if (pos === 1) return Colors.primary.mikasaBright;
        if (pos === 2) return '#C0C0C0';
        if (pos === 3) return '#CD7F32';
        return Colors.neutral.greyLight;
    };

    return (
        <View style={[
            ComponentStyles.leaderboardEntry,
            isCurrentUser && styles.currentUserEntry
        ]}>
            <View style={[styles.rankBadge, { backgroundColor: getRankBadgeColor(position) }]}>
                <Text style={styles.rankNumber}>{position}</Text>
            </View>

            <Image
                source={{ uri: player.avatar || 'https://via.placeholder.com/48' }}
                style={ComponentStyles.avatar}
            />

            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPoints}>{player.points} pontos</Text>
            </View>

            <View style={styles.rankChange}>
                {player.rankChange > 0 ? (
                    <Ionicons
                        name={Icons.ranking.arrowUp}
                        size={16}
                        color={Colors.status.success}
                    />
                ) : player.rankChange < 0 ? (
                    <Ionicons
                        name={Icons.ranking.arrowDown}
                        size={16}
                        color={Colors.status.error}
                    />
                ) : null}
                <Text style={styles.rankChangeText}>
                    {player.rankChange > 0 ? '+' : ''}{player.rankChange}
                </Text>
            </View>
        </View>
    );
};

// ==================== PERFIL DE JOGADOR ====================

export const PlayerProfile = ({ player }) => (
    <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
            <Image
                source={{ uri: player.coverImage || 'https://via.placeholder.com/400x200' }}
                style={styles.coverImage}
            />
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: player.avatar || 'https://via.placeholder.com/80' }}
                    style={[ComponentStyles.avatarLarge, styles.profileAvatar]}
                />
            </View>
        </View>

        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{player.name}</Text>
            <Text style={styles.profileTitle}>{player.title}</Text>

            <View style={styles.statsGrid}>
                <View style={ComponentStyles.statContainer}>
                    <Text style={ComponentStyles.statValue}>{player.wins}</Text>
                    <Text style={ComponentStyles.statLabel}>Vitórias</Text>
                </View>

                <View style={ComponentStyles.statContainer}>
                    <Text style={ComponentStyles.statValue}>{player.losses}</Text>
                    <Text style={ComponentStyles.statLabel}>Derrotas</Text>
                </View>

                <View style={ComponentStyles.statContainer}>
                    <Text style={[ComponentStyles.statValue, { color: Colors.status.success }]}>
                        {player.winRate}%
                    </Text>
                    <Text style={ComponentStyles.statLabel}>Win Rate</Text>
                </View>

                <View style={ComponentStyles.statContainer}>
                    <Text style={ComponentStyles.statValue}>{player.points}</Text>
                    <Text style={ComponentStyles.statLabel}>Pontos</Text>
                </View>
            </View>
        </View>
    </View>
);

// ==================== BADGE DE CONQUISTA ====================

export const AchievementBadge = ({ achievement }) => (
    <View style={styles.achievementContainer}>
        <View style={styles.achievementIcon}>
            <Ionicons
                name={achievement.icon || Icons.tournament.trophy}
                size={32}
                color={Colors.primary.mikasaBright}
            />
        </View>
        <Text style={styles.achievementName}>{achievement.name}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
    </View>
);

// ==================== FAB (FLOATING ACTION BUTTON) ====================

export const FloatingActionButton = ({ onPress, icon }) => (
    <TouchableOpacity
        style={ComponentStyles.fab}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Ionicons
            name={icon || Icons.actions.add}
            size={28}
            color={Colors.neutral.navyDeep}
        />
    </TouchableOpacity>
);

// ==================== ESTILOS ESPECÍFICOS DOS EXEMPLOS ====================

const styles = StyleSheet.create({
    // Court Card
    courtHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    courtName: {
        fontSize: Typography.sizes.h4,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        flex: 1,
    },
    availableBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.Utils.addOpacity(Colors.status.success, 0.1),
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    availableText: {
        fontSize: Typography.sizes.caption,
        color: Colors.status.success,
        fontWeight: Typography.fonts.headingWeight,
        marginLeft: Spacing.xs,
    },
    courtLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    locationText: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginLeft: Spacing.xs,
    },
    distanceText: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
        marginLeft: Spacing.xs,
    },
    courtFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        marginLeft: Spacing.xs,
    },
    reviewsText: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        marginLeft: Spacing.xs,
    },
    priceText: {
        fontSize: Typography.sizes.h4,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.primary.mikasaBright,
    },

    // Match Card
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.Utils.addOpacity(Colors.status.error, 0.1),
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    livePulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.status.error,
        marginRight: Spacing.xs,
    },
    liveText: {
        fontSize: Typography.sizes.caption,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.status.error,
    },
    matchTime: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
    },
    teamsContainer: {
        marginBottom: Spacing.md,
    },
    teamRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: Spacing.xs,
    },
    teamName: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
    },
    teamScore: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.primary.mikasaBright,
    },
    vsContainer: {
        alignItems: 'center',
        marginVertical: Spacing.xs,
    },
    vsText: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        fontWeight: Typography.fonts.headingWeight,
    },
    matchProgress: {
        height: 4,
        backgroundColor: Colors.neutral.greyLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary.mikasaBright,
    },

    // Leaderboard
    currentUserEntry: {
        backgroundColor: Theme.Utils.addOpacity(Colors.primary.mikasaBright, 0.1),
        borderWidth: 2,
        borderColor: Colors.primary.mikasaBright,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    rankNumber: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.numbersWeight,
        color: Colors.neutral.navyDeep,
    },
    playerInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    playerName: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
    },
    playerPoints: {
        fontSize: Typography.sizes.bodySmall,
        color: Colors.neutral.charcoal,
    },
    rankChange: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankChangeText: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.charcoal,
        marginLeft: Spacing.xs,
    },

    // Profile
    profileContainer: {
        backgroundColor: Colors.neutral.white,
    },
    profileHeader: {
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 200,
        backgroundColor: Colors.neutral.greyLight,
    },
    avatarContainer: {
        position: 'absolute',
        bottom: -40,
        alignSelf: 'center',
    },
    profileAvatar: {
        borderWidth: 4,
        borderColor: Colors.neutral.white,
    },
    profileInfo: {
        padding: Spacing.base,
        paddingTop: Spacing.huge,
        alignItems: 'center',
    },
    profileName: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: Colors.neutral.navyDeep,
    },
    profileTitle: {
        fontSize: Typography.sizes.body,
        color: Colors.neutral.charcoal,
        marginTop: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },

    // Achievement
    achievementContainer: {
        alignItems: 'center',
        padding: Spacing.base,
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.md,
        width: 120,
    },
    achievementIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.Utils.addOpacity(Colors.primary.mikasaBright, 0.1),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    achievementName: {
        fontSize: Typography.sizes.bodySmall,
        fontWeight: Typography.fonts.headingWeight,
        color: Colors.neutral.navyDeep,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    achievementDescription: {
        fontSize: Typography.sizes.caption,
        color: Colors.neutral.charcoal,
        textAlign: 'center',
    },
});

// ==================== EXEMPLO DE TELA COMPLETA ====================

export const ExampleScreen = () => (
    <ScrollView style={ComponentStyles.screenContainer}>
        <View style={ComponentStyles.paddedContainer}>
            <Text style={ComponentStyles.header}>Bem-vindo ao Futevôlei!</Text>

            <Text style={ComponentStyles.bodyText}>
                Encontre quadras, organize rachas e participe de torneios.
            </Text>

            <View style={{ marginTop: Spacing.xl }}>
                <PrimaryButton
                    title="Encontrar Quadras"
                    onPress={() => console.log('Buscar quadras')}
                    icon={Icons.courts.locationOutline}
                />
            </View>

            <View style={{ marginTop: Spacing.md }}>
                <SecondaryButton
                    title="Criar Racha"
                    onPress={() => console.log('Criar racha')}
                    icon={Icons.match.peopleOutline}
                />
            </View>

            <View style={{ marginTop: Spacing.md }}>
                <OutlineButton
                    title="Ver Torneios"
                    onPress={() => console.log('Ver torneios')}
                />
            </View>

            <View style={ComponentStyles.divider} />

            <Text style={ComponentStyles.subheader}>Quadras Próximas</Text>

            <CourtCard
                court={{
                    name: 'Arena Copacabana',
                    location: 'Copacabana, Rio de Janeiro',
                    distance: '2.5 km',
                    rating: 4.8,
                    reviews: 124,
                    pricePerHour: 60,
                    image: null,
                }}
                onPress={() => console.log('Quadra selecionada')}
            />
        </View>

        <FloatingActionButton
            onPress={() => console.log('FAB pressed')}
            icon={Icons.actions.add}
        />
    </ScrollView>
);

export default {
    PrimaryButton,
    SecondaryButton,
    OutlineButton,
    CourtCard,
    MatchCard,
    LeaderboardEntry,
    PlayerProfile,
    AchievementBadge,
    FloatingActionButton,
    ExampleScreen,
};