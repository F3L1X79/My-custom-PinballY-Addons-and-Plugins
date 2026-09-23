// ============================================================
// Generic "pick and lock for a period" helper behind the table of the day /
// week. The returned picker keeps its choice for the whole period and picks
// again (never the previous period's table) only when the period key
// changes. The lock is stored in optionSettings under "<prefix>.period"
// and "<prefix>.configId".
// ============================================================

import { getVisibleTables } from "./visible_tables.js";

export function createLockedPicker({ settingsKeyPrefix, getPeriodKey, pickNew }) {
    const lockedPeriodKey = `${settingsKeyPrefix}.period`;
    const lockedConfigIdKey = `${settingsKeyPrefix}.configId`;

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

        return newPick;
    };
}

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

export function pickPurelyRandom(excludeConfigId) {
    const allGames = getVisibleTables().filter(game => game.configId !== excludeConfigId);
    if (allGames.length === 0) return null;
    return allGames[Math.floor(Math.random() * allGames.length)];
}