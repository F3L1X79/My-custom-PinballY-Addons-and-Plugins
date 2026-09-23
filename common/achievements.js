// ============================================================
// Generic achievement evaluation. An achievement is a plain object:
//   { id, getTitle(), getDescription(), checkUnlocked() }
// "Unlocked" is computed live from game stats; only the fact that the player
// was Notified is persisted (optionSettings key
// "custom.achievements.notified.<id>"), so each popup is shown only once.
// The caller marks an achievement Notified when its dialog is shown.
// ============================================================

const NOTIFIED_KEY_PREFIX = "custom.achievements.notified.";

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