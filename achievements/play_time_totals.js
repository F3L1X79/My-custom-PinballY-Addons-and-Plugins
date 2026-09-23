// ============================================================
// Achievements for CUMULATIVE total play time across the entire
// collection (sum of every table's playTime, in seconds), one per
// threshold in config.achievements.playTimeThresholdsHours.
// Called by achievements_engine.js at each check; no side effects.
// ============================================================

import config from "../common/config.js";
import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";

export function buildPlayTimeTotalAchievements() {
    const { achievements: TEXT } = lang;
    const { playTimeThresholdsHours } = config.achievements;

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