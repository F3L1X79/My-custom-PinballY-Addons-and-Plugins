// ============================================================
// Single source for "the tables that count": every game in PinballY's
// list except the ones the player has hidden. Used by the achievement
// builders. Read-only, no side effects.
// ============================================================

export function getVisibleTables() {
    return gameList.getAllGames().filter(game => !game.isHidden);
}
