// ============================================================
// Generic achievement evaluation. An achievement is a plain object:
//   { id, family, getTitle(), getDescription(), checkUnlocked() }
// where family is one of ACHIEVEMENT_FAMILY.
// "Unlocked" is computed live from the active Profile's progress; only the
// fact that a Profile was Notified is persisted (its profile.json
// "notified" list), so each Achievement is announced once per Profile.
// The caller marks an achievement Notified when its toast starts.
// ============================================================

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

// Records in the named Profile, which may no longer be the active one, that
// it was Notified of the achievement.
export function markNotified(profileStore, profileName, id) {
    profileStore.updateProfileData(data => {
        if (!data.notified.includes(id)) data.notified.push(id);
    }, profileName);
}

// Calls onNewlyUnlocked(achievement) for each achievement the active
// Profile unlocked and was not yet Notified of.
export function evaluateAchievements(achievements, profileStore, onNewlyUnlocked) {
    const notified = new Set(profileStore.getProfileData().notified);
    for (const achievement of achievements) {
        if (achievement.checkUnlocked() && !notified.has(achievement.id)) {
            onNewlyUnlocked(achievement);
        }
    }
}