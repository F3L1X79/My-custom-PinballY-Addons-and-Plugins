// ============================================================
// Achievements for consecutive days / weeks in which the table of the day /
// week was launched (3, 7 and 30 days; 4 and 12 weeks). Reads the streaks
// that common/table_of_period_launch.js records in optionSettings; writes
// nothing.
// ============================================================

import { getCurrentStreak } from "../common/streak_tracker.js";
import { getTodayKey, getPreviousDayKey, getWeekKey, getPreviousWeekKey } from "../common/period_keys.js";
import lang from "../common/i18n.js";
import { TABLE_OF_THE_DAY_STREAK_KEY_PREFIX, TABLE_OF_THE_WEEK_STREAK_KEY_PREFIX } from "../common/table_of_period_launch.js";

export function buildPeriodTableStreakAchievements() {
    const { achievements: TEXT } = lang;

    const dailyThresholds = [3, 7, 30];
    const weeklyThresholds = [4, 12];

    const achievements = [];

    for (const days of dailyThresholds) {
        achievements.push({
            id: `tableOfTheDayStreak:${days}`,
            getTitle: () => TEXT.dailyStreakTitle(days),
            getDescription: () => TEXT.dailyStreakDescription(days),
            checkUnlocked: () => getCurrentStreak(TABLE_OF_THE_DAY_STREAK_KEY_PREFIX, getTodayKey(), getPreviousDayKey) >= days,
        });
    }

    for (const weeks of weeklyThresholds) {
        achievements.push({
            id: `tableOfTheWeekStreak:${weeks}`,
            getTitle: () => TEXT.weeklyStreakTitle(weeks),
            getDescription: () => TEXT.weeklyStreakDescription(weeks),
            checkUnlocked: () => getCurrentStreak(TABLE_OF_THE_WEEK_STREAK_KEY_PREFIX, getWeekKey(), getPreviousWeekKey) >= weeks,
        });
    }

    return achievements;
}