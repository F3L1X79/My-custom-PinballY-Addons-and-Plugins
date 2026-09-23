// ============================================================
// Single source for "the tables that count": every game in PinballY's
// list except the ones the player has hidden. Used by the achievement
// builders and the table of the day/week pickers. Read-only, no side
// effects.
// ============================================================

export function getVisibleTables() {
    return gameList.getAllGames().filter(game => !game.isHidden);
}
