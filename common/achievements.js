// ============================================================
// Generic achievement evaluation. An achievement is a plain object:
//   { id, getTitle(), getDescription(), checkUnlocked() }
// "Unlocked" is computed live from game stats; only the fact that the player
// was already notified is persisted (optionSettings key
// "custom.achievements.notified.<id>"), so each popup is shown only once.
// ============================================================

const NOTIFIED_KEY_PREFIX = "custom.achievements.notified.";

function wasNotified(id) {
    return optionSettings.getBool(NOTIFIED_KEY_PREFIX + id, false);
}

function markNotified(id) {
    optionSettings.set(NOTIFIED_KEY_PREFIX + id, true);
}

/** Checks every achievement and calls onNewlyUnlocked(achievement) for each one that just became unlocked. */
export function evaluateAchievements(achievements, onNewlyUnlocked) {
    for (const achievement of achievements) {
        if (achievement.checkUnlocked() && !wasNotified(achievement.id)) {
            markNotified(achievement.id);
            onNewlyUnlocked(achievement);
        }
    }
}