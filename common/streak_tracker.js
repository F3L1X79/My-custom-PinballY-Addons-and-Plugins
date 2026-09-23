// ============================================================
// Generic consecutive-period streak tracker. Records that a given period
// key (e.g. "2025-08-22" for a day, or a week's Monday date) was
// "completed", and computes the current consecutive streak length by
// walking backwards from the most recent completed period.
// ============================================================

export function recordPeriodCompleted(settingsKeyPrefix, periodKey, getPreviousPeriodKey) {
    const lastRecordedKey = `${settingsKeyPrefix}.lastPeriod`;
    const currentStreakKey = `${settingsKeyPrefix}.currentStreak`;
    const longestStreakKey = `${settingsKeyPrefix}.longestStreak`;

    const lastRecorded = optionSettings.get(lastRecordedKey, "");
    if (lastRecorded === periodKey) return; // already recorded for this period, avoid double-counting

    const previousPeriodKey = getPreviousPeriodKey(periodKey);
    const currentStreak = optionSettings.get(currentStreakKey, 0);
    const newStreak = (lastRecorded === previousPeriodKey) ? currentStreak + 1 : 1;

    const longestStreak = optionSettings.get(longestStreakKey, 0);

    optionSettings.set(lastRecordedKey, periodKey);
    optionSettings.set(currentStreakKey, newStreak);
    optionSettings.set(longestStreakKey, Math.max(longestStreak, newStreak));
    optionSettings.save();
}

export function getCurrentStreak(settingsKeyPrefix, periodKey, getPreviousPeriodKey) {
    const lastRecordedKey = `${settingsKeyPrefix}.lastPeriod`;
    const currentStreakKey = `${settingsKeyPrefix}.currentStreak`;

    const lastRecorded = optionSettings.get(lastRecordedKey, "");
    const currentStreak = optionSettings.get(currentStreakKey, 0);

    // If the last recorded period isn't today/this week nor the period right
    // before it, the streak has already been broken by inactivity, even
    // though nothing has explicitly reset the stored counter yet.
    if (lastRecorded !== periodKey && lastRecorded !== getPreviousPeriodKey(periodKey)) {
        return 0;
    }

    return currentStreak;
}