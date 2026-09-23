import { getCurrentStreak } from "../common/streak_tracker.js";
import { getTodayKey, getPreviousDayKey, getWeekKey, getPreviousWeekKey } from "../common/period_keys.js";
import lang from "../common/i18n.js";
import { TABLE_OF_THE_DAY_STREAK_KEY_PREFIX, TABLE_OF_THE_WEEK_STREAK_KEY_PREFIX } from "../common/table_of_period_launch.js";

/**
 * Builds the daily and weekly "table of the period" streak achievements
 * from the streaks recorded by common/table_of_period_launch.js.
 * @returns {object[]} Achievement objects ({ id, getTitle, getDescription, checkUnlocked }).
 */
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