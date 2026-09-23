// ============================================================
// Single source for "the tables that count": every game in PinballY's
// list except the ones the player has hidden. Used by the achievement
// builders and the table of the day/week pickers. Read-only, no side
// effects.
// ============================================================

/**
 * Returns every non-hidden game, so that all features agree on which
 * tables make up the collection. Callers add their own extra conditions
 * (played, excluded id, etc.) on top of this list.
 * @returns {object[]} PinballY game info objects whose isHidden is falsy.
 */
export function getVisibleTables() {
    return gameList.getAllGames().filter(game => !game.isHidden);
}
