// ============================================================
// Generic "played every table in this group at least once" achievement
// builder, used by the category and decade achievements. A game can belong
// to multiple groups (e.g. multiple categories), in which case it counts
// toward each of them. The Achievements come sorted by group key. No side
// effects.
// ============================================================

import { getVisibleTables } from "./visible_tables.js";

export function buildGroupedCompletionAchievements({ getGroupKeys, idPrefix, family, getTitle, getDescription }) {
    const allGames = getVisibleTables();
    const groups = new Map();

    for (const game of allGames) {
        for (const key of getGroupKeys(game)) {
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(game);
        }
    }

    // Decade keys ("1980s") sort chronologically as text too.
    const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));

    const achievements = [];
    for (const key of sortedKeys) {
        const games = groups.get(key);
        achievements.push({
            id: `${idPrefix}:${key}`,
            family,
            getTitle: () => getTitle(key),
            getDescription: () => getDescription(key, games.length),
            checkUnlocked: () => games.every(game => game.playCount > 0),
        });
    }
    return achievements;
}