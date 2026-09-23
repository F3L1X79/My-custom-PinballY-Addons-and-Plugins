// ============================================================
// Generic "played every table in this group at least once" achievement
// builder. A game can belong to multiple groups (e.g. multiple
// categories), in which case it counts toward each of them.
// ============================================================

import { getVisibleTables } from "./visible_tables.js";

/**
 * Groups the visible tables by the keys returned for each game and builds
 * one "played every table of the group" achievement per group.
 * @param {object} options - Builder options.
 * @param {(game: object) => Iterable<string>} options.getGroupKeys - Group keys a game belongs to.
 * @param {string} options.idPrefix - Prefix of the achievement ids ("<idPrefix>:<key>").
 * @param {(key: string) => string} options.getTitle - Builds the title for a group.
 * @param {(key: string, tableCount: number) => string} options.getDescription - Builds the description for a group.
 * @returns {object[]} Achievement objects ({ id, getTitle, getDescription, checkUnlocked }).
 */
export function buildGroupedCompletionAchievements({ getGroupKeys, idPrefix, getTitle, getDescription }) {
    const allGames = getVisibleTables();
    const groups = new Map();

    for (const game of allGames) {
        for (const key of getGroupKeys(game)) {
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(game);
        }
    }

    const achievements = [];
    for (const [key, games] of groups) {
        achievements.push({
            id: `${idPrefix}:${key}`,
            getTitle: () => getTitle(key),
            getDescription: () => getDescription(key, games.length),
            checkUnlocked: () => games.every(game => game.playCount > 0),
        });
    }
    return achievements;
}