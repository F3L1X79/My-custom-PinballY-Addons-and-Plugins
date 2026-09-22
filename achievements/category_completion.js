import { buildGroupedCompletionAchievements } from "../common/grouped_completion.js";
import lang from "../common/i18n.js";

export function buildCategoryCompletionAchievements() {
    const { achievements: TEXT } = lang;
    return buildGroupedCompletionAchievements({
        getGroupKeys: (game) => Array.isArray(game.categories) ? game.categories : [],
        idPrefix: "categoryCompletion",
        getTitle: (category) => TEXT.categoryCompletionTitle(category),
        getDescription: (category, count) => TEXT.categoryCompletionDescription(category, count),
    });
}