import config from "../common/config.js";
import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";

// ============================================================
// Achievements for the number of DISTINCT tables played at least once:
// a special "first table ever" achievement, plus one per configured
// percentage of the full collection.
// ============================================================

/**
 * Builds the "first table" achievement and one achievement per configured
 * percentage of the visible collection played at least once.
 * @returns {object[]} Achievement objects ({ id, getTitle, getDescription, checkUnlocked }).
 */
export function buildCollectionCompletionAchievements() {
    const { achievements: TEXT } = lang;
    const { collectionPercentThresholds } = config.achievements;

    const totalCount = getVisibleTables().length;

    /**
     * Counts visible tables played at least once, re-read on every check so
     * that new plays are taken into account.
     * @returns {number} Number of visible tables with a non-zero play count.
     */
    function countPlayed() {
        return getVisibleTables().filter(game => game.playCount > 0).length;
    }

    const achievements = [
        {
            id: "collectionMilestone:firstTable",
            getTitle: () => TEXT.firstTableTitle(),
            getDescription: () => TEXT.firstTableDescription(),
            checkUnlocked: () => countPlayed() >= 1,
        },
    ];

    for (const percent of collectionPercentThresholds) {
        const requiredCount = Math.ceil((percent / 100) * totalCount);

        achievements.push({
            id: `collectionMilestone:${percent}percent`,
            getTitle: () => TEXT.collectionPercentTitle(percent),
            getDescription: () => TEXT.collectionPercentDescription(percent, requiredCount, totalCount),
            checkUnlocked: () => countPlayed() >= requiredCount,
        });
    }

    return achievements;
}