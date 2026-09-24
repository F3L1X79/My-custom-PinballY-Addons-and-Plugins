// ============================================================
// Builds one achievement per release decade (from game.year): unlocked once
// every visible table released in that decade has been played at least once.
// Sorted chronologically; tables without a year are ignored. Called by
// achievements_engine.js at each check; no side effects.
// ============================================================

import { buildGroupedCompletionAchievements } from "../common/grouped_completion.js";
import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";

function getDecadeLabel(year) {
    if (!year) return null;
    return `${Math.floor(year / 10) * 10}s`;
}

export function buildDecadeCompletionAchievements() {
    const { achievements: TEXT } = lang;
    return buildGroupedCompletionAchievements({
        getGroupKeys: (game) => {
            const decade = getDecadeLabel(game.year);
            return decade ? [decade] : [];
        },
        idPrefix: "decadeCompletion",
        family: ACHIEVEMENT_FAMILY.DECADES,
        // The "1980s" group key stays in the achievement ID for backward compatibility;
        // the language files receive the bare start year and format it themselves.
        getTitle: (decade) => TEXT.decadeCompletionTitle(parseInt(decade, 10)),
        getDescription: (decade, count) => TEXT.decadeCompletionDescription(parseInt(decade, 10), count),
    });
}