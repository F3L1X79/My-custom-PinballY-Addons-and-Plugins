import config from "../common/config.js";
import lang from "../common/i18n.js";

// ============================================================
// Achievements for the number of DISTINCT tables played at least once:
// a special "first table ever" achievement, plus one per configured
// percentage of the full collection.
// ============================================================

export function buildCollectionCompletionAchievements() {
    const { achievements: TEXT } = lang;
    const { collectionPercentThresholds } = config.achievements;

    const allGames = gameList.getAllGames().filter(game => !game.isHidden);
    const totalCount = allGames.length;

    function countPlayed() {
        return gameList.getAllGames().filter(game => !game.isHidden && game.playCount > 0).length;
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