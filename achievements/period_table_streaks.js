// ============================================================
// Achievements for consecutive days / weeks in which the Table of the Day /
// the Table of the Week was played (3, 7 and 30 days; 4 and 12 weeks).
// Reads the Streaks kept by common/period_table.js; writes nothing.
// ============================================================

import lang from "../common/i18n.js";
import { getTableOfTheDay, getTableOfTheWeek } from "../common/period_table.js";

export function buildPeriodTableStreakAchievements() {
    const { achievements: TEXT } = lang;
    const tableOfTheDay = getTableOfTheDay();
    const tableOfTheWeek = getTableOfTheWeek();

    const dailyThresholds = [3, 7, 30];
    const weeklyThresholds = [4, 12];

    const achievements = [];

    for (const days of dailyThresholds) {
        achievements.push({
            id: `tableOfTheDayStreak:${days}`,
            getTitle: () => TEXT.dailyStreakTitle(days),
            getDescription: () => TEXT.dailyStreakDescription(days),
            checkUnlocked: () => tableOfTheDay.getStreak() >= days,
        });
    }

    for (const weeks of weeklyThresholds) {
        achievements.push({
            id: `tableOfTheWeekStreak:${weeks}`,
            getTitle: () => TEXT.weeklyStreakTitle(weeks),
            getDescription: () => TEXT.weeklyStreakDescription(weeks),
            checkUnlocked: () => tableOfTheWeek.getStreak() >= weeks,
        });
    }

    return achievements;
}