// ============================================================
// Hall of Fame: the ten visible, configured tables a Profile has spent the
// most time on, ranked from the most played (ties broken by play count,
// then title). Pure: takes the table list and the Profile's play record
// lookup, returns the ranked tables.
// ============================================================

const HALL_OF_FAME_SIZE = 10;

export function getHallOfFame(tables, getPlay) {
    return tables
        .filter(game => !game.isHidden && game.isConfigured)
        .map(game => ({ game, play: getPlay(game.configId) }))
        .filter(({ play }) => play.seconds > 0)
        .sort((a, b) => b.play.seconds - a.play.seconds
            || b.play.count - a.play.count
            || a.game.title.localeCompare(b.game.title))
        .slice(0, HALL_OF_FAME_SIZE)
        .map(({ game }) => game);
}
