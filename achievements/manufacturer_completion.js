// ============================================================
// One achievement per manufacturer found in the collection (including
// the fictional "VPX Community" manufacturer, treated like any other):
// unlocked once every visible table from that manufacturer has been
// played at least once. Sorted by manufacturer. Called by
// achievements_engine.js; no side effects.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { getVisibleTables } from "../common/visible_tables.js";

export function buildManufacturerCompletionAchievements() {
    const { achievements: TEXT } = lang;

    const allGames = getVisibleTables();

    const manufacturers = new Set();
    for (const game of allGames) {
        if (game.manufacturer) manufacturers.add(game.manufacturer);
    }

    const achievements = [];
    for (const manufacturer of [...manufacturers].sort((a, b) => a.localeCompare(b))) {
        const gamesForManufacturer = allGames.filter(game => game.manufacturer === manufacturer);

        achievements.push({
            id: `manufacturerCompletion:${manufacturer}`,
            family: ACHIEVEMENT_FAMILY.MANUFACTURERS,
            getTitle: () => TEXT.manufacturerCompletionTitle(manufacturer),
            getDescription: () => TEXT.manufacturerCompletionDescription(manufacturer, gamesForManufacturer.length),
            checkUnlocked: () => gamesForManufacturer.every(game => game.playCount > 0),
        });
    }

    return achievements;
}