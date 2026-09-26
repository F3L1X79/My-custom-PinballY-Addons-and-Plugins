// ============================================================
// Single source for "the tables that count": every game in PinballY's
// list except the ones the player has hidden. Used by the achievement
// builders and the Profile Stats, with the one rule for collection
// completion. Read-only, no side effects.
// ============================================================

export function getVisibleTables() {
    return gameList.getAllGames().filter(game => !game.isHidden);
}

// Collection completion: how many of these visible tables the active
// Profile played at least once.
export function countPlayedTables(visibleTables, profileStore) {
    return visibleTables.filter(game => profileStore.hasPlayed(game.configId)).length;
}
