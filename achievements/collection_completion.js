// ============================================================
// Achievements for the number of DISTINCT tables the active Profile played
// at least once:
// a special "first table ever" achievement, plus one per percentage of the
// full collection in COLLECTION_PERCENT_THRESHOLDS, with the tables played
// against the count the percentage needs as Achievement Progress.
// Called by achievements_engine.js at each check; no side effects.
// ============================================================

import { ACHIEVEMENT_FAMILY, countedAchievement, PROGRESS_UNIT } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { countPlayedTables, getVisibleTables } from "../common/visible_tables.js";
import { getProfileStore } from "../common/profile_store.js";

// Each value is part of an Achievement ID: changing one would announce the
// Achievement again to players who already earned it. Each one also needs
// its title in every lang/ file.
const COLLECTION_PERCENT_THRESHOLDS = [10, 25, 50, 75, 100];

export function buildCollectionCompletionAchievements() {
    const { achievements: TEXT } = lang;

    const totalCount = getVisibleTables().length;

    function countPlayed() {
        return countPlayedTables(getVisibleTables(), getProfileStore());
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

        achievements.push(countedAchievement({
            id: `collectionMilestone:${percent}percent`,
            family: ACHIEVEMENT_FAMILY.COLLECTION,
            getTitle: () => TEXT.collectionPercentTitles[percent],
            getDescription: () => TEXT.collectionPercentDescription(percent, requiredCount, totalCount),
            target: requiredCount,
            unit: PROGRESS_UNIT.TABLES,
            getCurrent: countPlayed,
        }));
    }

    return achievements;
}