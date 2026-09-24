// ============================================================
// Achievements for CUMULATIVE total play time across the entire
// collection (sum of every table's playTime, in seconds), one per
// threshold in PLAY_TIME_THRESHOLDS_HOURS.
// Called by achievements_engine.js at each check; no side effects.
// ============================================================

import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";

// Each value is part of an Achievement ID: changing one would announce the
// Achievement again to players who already earned it.
const PLAY_TIME_THRESHOLDS_HOURS = [1, 5, 10, 50, 100];

export function buildPlayTimeTotalAchievements() {
    const { achievements: TEXT } = lang;

    function getTotalPlayTimeSeconds() {
        return getVisibleTables()
            .reduce((total, game) => total + (game.playTime || 0), 0);
    }

    return PLAY_TIME_THRESHOLDS_HOURS.map(hours => ({
        id: `playTimeMilestone:${hours}h`,
        getTitle: () => TEXT.playTimeMilestoneTitle(hours),
        getDescription: () => TEXT.playTimeMilestoneDescription(hours),
        checkUnlocked: () => getTotalPlayTimeSeconds() >= hours * 3600,
    }));
}