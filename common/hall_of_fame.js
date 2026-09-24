// ============================================================
// Hall of Fame: the ten visible, configured tables the player has spent the
// most time on, ranked from the most played (ties broken by play count,
// then title). Pure: takes the table list, returns the ranked tables.
// ============================================================

const HALL_OF_FAME_SIZE = 10;

const compareMostPlayedFirst = (a, b) =>
    b.playTime - a.playTime || b.playCount - a.playCount || a.title.localeCompare(b.title);

export function getHallOfFame(tables) {
    return tables
        .filter(game => !game.isHidden && game.isConfigured && game.playTime > 0)
        .sort(compareMostPlayedFirst)
        .slice(0, HALL_OF_FAME_SIZE);
}
