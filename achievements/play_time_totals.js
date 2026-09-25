// ============================================================
// Achievements for the active Profile's CUMULATIVE play time across the
// entire collection (sum of its play seconds on every visible table), one
// per threshold in PLAY_TIME_THRESHOLDS_HOURS.
// Called by achievements_engine.js at each check; no side effects.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";
import { getProfileStore } from "../common/profile_store.js";

// Each value is part of an Achievement ID: changing one would announce the
// Achievement again to players who already earned it. Each one also needs
// its title in every lang/ file.
const PLAY_TIME_THRESHOLDS_HOURS = [1, 5, 10, 50, 100];

export function buildPlayTimeTotalAchievements() {
    const { achievements: TEXT } = lang;

    function getTotalPlayTimeSeconds() {
        return getVisibleTables()
            .reduce((total, game) => total + getProfileStore().getPlay(game.configId).seconds, 0);
    }

    return PLAY_TIME_THRESHOLDS_HOURS.map(hours => ({
        id: `playTimeMilestone:${hours}h`,
        family: ACHIEVEMENT_FAMILY.PLAY_TIME,
        getTitle: () => TEXT.playTimeMilestoneTitles[hours],
        getDescription: () => TEXT.playTimeMilestoneDescription(hours),
        checkUnlocked: () => getTotalPlayTimeSeconds() >= hours * 3600,
    }));
}