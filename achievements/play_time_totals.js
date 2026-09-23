import config from "../common/config.js";
import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";

// ============================================================
// Achievements for CUMULATIVE total play time across the entire
// collection (sum of every table's playTime, in seconds).
// ============================================================

/**
 * Builds one achievement per configured cumulative play time threshold.
 * @returns {object[]} Achievement objects ({ id, getTitle, getDescription, checkUnlocked }).
 */
export function buildPlayTimeTotalAchievements() {
    const { achievements: TEXT } = lang;
    const { playTimeThresholdsHours } = config.achievements;

    /**
     * Sums the play time of every visible table, re-read on every check.
     * @returns {number} Total play time in seconds.
     */
    function getTotalPlayTimeSeconds() {
        return getVisibleTables()
            .reduce((total, game) => total + (game.playTime || 0), 0);
    }

    return playTimeThresholdsHours.map(hours => ({
        id: `playTimeMilestone:${hours}h`,
        getTitle: () => TEXT.playTimeMilestoneTitle(hours),
        getDescription: () => TEXT.playTimeMilestoneDescription(hours),
        checkUnlocked: () => getTotalPlayTimeSeconds() >= hours * 3600,
    }));
}