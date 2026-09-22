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
        getTitle: (decade) => TEXT.decadeCompletionTitle(decade),
        getDescription: (decade, count) => TEXT.decadeCompletionDescription(decade, count),
    });
}