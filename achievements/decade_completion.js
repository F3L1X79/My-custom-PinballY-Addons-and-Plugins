import { buildGroupedCompletionAchievements } from "../common/grouped_completion.js";
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
        // The "1980s" group key stays in the achievement ID for backward compatibility;
        // the language files receive the bare start year and format it themselves.
        getTitle: (decade) => TEXT.decadeCompletionTitle(parseInt(decade, 10)),
        getDescription: (decade, count) => TEXT.decadeCompletionDescription(parseInt(decade, 10), count),
    });
}