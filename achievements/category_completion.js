// ============================================================
// Builds one achievement per table category (PinballY's game.categories):
// unlocked once every visible table in that category has been played at
// least once. Sorted by category. Called by achievements_engine.js at each
// check; no side effects.
// ============================================================

import { buildGroupedCompletionAchievements } from "../common/grouped_completion.js";
import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";

export function buildCategoryCompletionAchievements() {
    const { achievements: TEXT } = lang;
    return buildGroupedCompletionAchievements({
        getGroupKeys: (game) => Array.isArray(game.categories) ? game.categories : [],
        idPrefix: "categoryCompletion",
        family: ACHIEVEMENT_FAMILY.CATEGORIES,
        getTitle: (category) => TEXT.categoryCompletionTitle(category),
        getDescription: (category, count) => TEXT.categoryCompletionDescription(category, count),
    });
}