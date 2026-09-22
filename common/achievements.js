// ============================================================
// Generic achievement engine. An achievement is a plain object:
//   { id, getTitle(), getDescription(), checkUnlocked() }
// "Unlocked" is computed live from PinballY's own game stats (playCount,
// etc.) — we only persist whether the player has already been notified,
// to avoid re-showing the same congratulations popup every session.
// ============================================================

const NOTIFIED_KEY_PREFIX = "custom.achievements.notified.";

function wasNotified(id) {
    return optionSettings.get(NOTIFIED_KEY_PREFIX + id, false);
}

function markNotified(id) {
    optionSettings.set(NOTIFIED_KEY_PREFIX + id, true);
    optionSettings.save();
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

export function isAchievementNotified(id) {
    return wasNotified(id);
}