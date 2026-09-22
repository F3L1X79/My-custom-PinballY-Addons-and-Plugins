import { getCurrentStreak } from "../common/streak_tracker.js";
import { getTodayKey, getPreviousDayKey, getWeekKey, getPreviousWeekKey } from "../common/period_keys.js";
import lang from "../common/i18n.js";

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
            checkUnlocked: () => getCurrentStreak("custom.streaks.tableOfTheDay", getTodayKey(), getPreviousDayKey) >= days,
        });
    }

    for (const weeks of weeklyThresholds) {
        achievements.push({
            id: `tableOfTheWeekStreak:${weeks}`,
            getTitle: () => TEXT.weeklyStreakTitle(weeks),
            getDescription: () => TEXT.weeklyStreakDescription(weeks),
            checkUnlocked: () => getCurrentStreak("custom.streaks.tableOfTheWeek", getWeekKey(), getPreviousWeekKey) >= weeks,
        });
    }

    return achievements;
}