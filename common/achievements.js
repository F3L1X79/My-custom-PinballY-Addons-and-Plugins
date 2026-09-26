// ============================================================
// Generic achievement evaluation. An achievement is a plain object:
//   { id, family, getTitle(), getDescription(), checkUnlocked(), getProgress() }
// where family is one of ACHIEVEMENT_FAMILY and the optional getProgress()
// returns its Achievement Progress, { current, target, unit } with unit one
// of PROGRESS_UNIT, or null. countedAchievement() builds both from one value.
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

// What an Achievement Progress counts; each one has its texts in the
// Achievement List's progressUnits of every lang/ file.
export const PROGRESS_UNIT = Object.freeze({
    TABLES: "tables",
    HOURS: "hours",
    DAYS_IN_A_ROW: "daysInARow",
    WEEKS_IN_A_ROW: "weeksInARow",
    DAYS_PLAYED: "daysPlayed",
    WEEKS_PLAYED: "weeksPlayed",
});

// Below this target, an Achievement Progress would only ever read "0/1".
const MIN_PROGRESS_TARGET = 2;

// An Achievement unlocked once getCurrent() reaches target, with that same
// value as its Achievement Progress: the two can never disagree.
export function countedAchievement({ id, family, getTitle, getDescription, target, unit, getCurrent }) {
    return {
        id,
        family,
        getTitle,
        getDescription,
        checkUnlocked: () => getCurrent() >= target,
        getProgress: () => (target >= MIN_PROGRESS_TARGET ? { current: getCurrent(), target, unit } : null),
    };
}

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