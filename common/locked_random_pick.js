// ============================================================
// Generic "pick and lock for a period" helper. Given a way to compute the
// current period's key (e.g. today's date, or the current week's Monday
// date) and a selection function, returns a game choice that stays locked
// in optionSettings for the whole period, and only changes when the
// period key itself changes.
// ============================================================

import { getVisibleTables } from "./visible_tables.js";

export function createLockedPicker({ settingsKeyPrefix, getPeriodKey, pickNew }) {
    const lockedPeriodKey = `${settingsKeyPrefix}.period`;
    const lockedConfigIdKey = `${settingsKeyPrefix}.configId`;
    const previousConfigIdKey = `${settingsKeyPrefix}.previousConfigId`;

    return function pick() {
        const currentPeriodKey = getPeriodKey();
        const lockedPeriod = optionSettings.get(lockedPeriodKey, "");
        const lockedConfigId = optionSettings.get(lockedConfigIdKey, "");

        if (lockedPeriod === currentPeriodKey && lockedConfigId) {
            const lockedGame = gameList.getGameInfo(lockedConfigId);
            if (lockedGame) return lockedGame;
        }

        const excludeConfigId = (lockedPeriod !== currentPeriodKey && lockedConfigId) ? lockedConfigId : "";
        const newPick = pickNew(excludeConfigId);
        if (!newPick) return null;

        optionSettings.set(lockedPeriodKey, currentPeriodKey);
        optionSettings.set(lockedConfigIdKey, newPick.configId);
        if (excludeConfigId) optionSettings.set(previousConfigIdKey, excludeConfigId);
        optionSettings.save();

        return newPick;
    };
}

/**
 * Picks a random never-played visible table, or else the one played least
 * recently, skipping the given table so the pick changes between periods.
 * @param {string} excludeConfigId - Config id to skip ("" to skip none).
 * @returns {object|null} The chosen game, or null when no candidate is left.
 */
export function pickNeverPlayedOrOldest(excludeConfigId) {
    const allGames = getVisibleTables().filter(game => game.configId !== excludeConfigId);
    if (allGames.length === 0) return null;

    const neverPlayed = allGames.filter(game => !game.lastPlayed);
    if (neverPlayed.length > 0) {
        return neverPlayed[Math.floor(Math.random() * neverPlayed.length)];
    }

    return allGames.reduce((oldest, game) =>
        game.lastPlayed < oldest.lastPlayed ? game : oldest
    );
}

/**
 * Picks a uniformly random visible table, skipping the given table so the
 * pick changes between periods.
 * @param {string} excludeConfigId - Config id to skip ("" to skip none).
 * @returns {object|null} The chosen game, or null when no candidate is left.
 */
export function pickPurelyRandom(excludeConfigId) {
    const allGames = getVisibleTables().filter(game => game.configId !== excludeConfigId);
    if (allGames.length === 0) return null;
    return allGames[Math.floor(Math.random() * allGames.length)];
}