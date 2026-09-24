// ============================================================
// Achievements for the number of DISTINCT tables played at least once:
// a special "first table ever" achievement, plus one per percentage of the
// full collection in COLLECTION_PERCENT_THRESHOLDS.
// Called by achievements_engine.js at each check; no side effects.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";

// Each value is part of an Achievement ID: changing one would announce the
// Achievement again to players who already earned it.
const COLLECTION_PERCENT_THRESHOLDS = [10, 25, 50, 75, 100];

export function buildCollectionCompletionAchievements() {
    const { achievements: TEXT } = lang;

    const totalCount = getVisibleTables().length;

    function countPlayed() {
        return getVisibleTables().filter(game => game.playCount > 0).length;
    }

    const achievements = [
        {
            id: "collectionMilestone:firstTable",
            family: ACHIEVEMENT_FAMILY.COLLECTION,
            getTitle: () => TEXT.firstTableTitle(),
            getDescription: () => TEXT.firstTableDescription(),
            checkUnlocked: () => countPlayed() >= 1,
        },
    ];

    for (const percent of COLLECTION_PERCENT_THRESHOLDS) {
        const requiredCount = Math.ceil((percent / 100) * totalCount);

        achievements.push({
            id: `collectionMilestone:${percent}percent`,
            family: ACHIEVEMENT_FAMILY.COLLECTION,
            getTitle: () => TEXT.collectionPercentTitle(percent),
            getDescription: () => TEXT.collectionPercentDescription(percent, requiredCount, totalCount),
            checkUnlocked: () => countPlayed() >= requiredCount,
        });
    }

    return achievements;
}