// ============================================================
// Generic achievement evaluation. An achievement is a plain object:
//   { id, family, getTitle(), getDescription(), checkUnlocked() }
// where family is one of ACHIEVEMENT_FAMILY.
// "Unlocked" is computed live from game stats; only the fact that the player
// was Notified is persisted (optionSettings key
// "custom.achievements.notified.<id>"), so each popup is shown only once.
// The caller marks an achievement Notified when its dialog is shown.
// ============================================================

const NOTIFIED_KEY_PREFIX = "custom.achievements.notified.";

// Listed in the order the Achievement List shows them.
export const ACHIEVEMENT_FAMILY = Object.freeze({
    COLLECTION: "collection",
    PLAY_TIME: "playTime",
    PERIOD_TABLES: "periodTables",
    SESSIONS: "sessions",
    RANDOM_GAME: "randomGame",
    MANUFACTURERS: "manufacturers",
    DECADES: "decades",
    CATEGORIES: "categories",
});

function wasNotified(id) {
    return optionSettings.getBool(NOTIFIED_KEY_PREFIX + id, false);
}

export function markNotified(id) {
    optionSettings.set(NOTIFIED_KEY_PREFIX + id, true);
}

// Calls onNewlyUnlocked(achievement) for each unlocked achievement not yet Notified.
export function evaluateAchievements(achievements, onNewlyUnlocked) {
    for (const achievement of achievements) {
        if (achievement.checkUnlocked() && !wasNotified(achievement.id)) {
            onNewlyUnlocked(achievement);
        }
    }
}