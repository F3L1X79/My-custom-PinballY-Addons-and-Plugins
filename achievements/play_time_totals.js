import config from "../common/config.js";
import lang from "../common/i18n.js";

// ============================================================
// Achievements for CUMULATIVE total play time across the entire
// collection (sum of every table's playTime, in seconds).
// ============================================================

export function buildPlayTimeTotalAchievements() {
    const { achievements: TEXT } = lang;
    const { playTimeThresholdsHours } = config.achievements;

    function getTotalPlayTimeSeconds() {
        return gameList.getAllGames()
            .filter(game => !game.isHidden)
            .reduce((total, game) => total + (game.playTime || 0), 0);
    }

    return playTimeThresholdsHours.map(hours => ({
        id: `playTimeMilestone:${hours}h`,
        getTitle: () => TEXT.playTimeMilestoneTitle(hours),
        getDescription: () => TEXT.playTimeMilestoneDescription(hours),
        checkUnlocked: () => getTotalPlayTimeSeconds() >= hours * 3600,
    }));
}