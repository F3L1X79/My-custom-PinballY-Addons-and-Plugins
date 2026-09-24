// ============================================================
// Period Tables family: Achievements for playing the Table of the Day / the
// Table of the Week. First play (once during its Period), Periods Played
// (10, 50 and 100 days; 10, 26 and 52 weeks, consecutive or not) and
// Streaks (3, 7 and 30 consecutive days; 4 and 12 consecutive weeks).
// Reads the counters kept by common/period_table.js; writes nothing.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { getTableOfTheDay, getTableOfTheWeek } from "../common/period_table.js";

export function buildPeriodTableAchievements() {
    const { achievements: TEXT } = lang;
    const tableOfTheDay = getTableOfTheDay();
    const tableOfTheWeek = getTableOfTheWeek();

    // Each threshold also needs its title in every lang/ file.
    const dailyPeriodsPlayedThresholds = [10, 50, 100];
    const weeklyPeriodsPlayedThresholds = [10, 26, 52];
    const dailyStreakThresholds = [3, 7, 30];
    const weeklyStreakThresholds = [4, 12];

    const achievements = [
        {
            id: "tableOfTheDayFirstPlay",
            family: ACHIEVEMENT_FAMILY.PERIOD_TABLES,
            getTitle: () => TEXT.dailyFirstPlayTitle(),
            getDescription: () => TEXT.dailyFirstPlayDescription(),
            checkUnlocked: () => tableOfTheDay.getLongestStreak() >= 1,
        },
        {
            id: "tableOfTheWeekFirstPlay",
            family: ACHIEVEMENT_FAMILY.PERIOD_TABLES,
            getTitle: () => TEXT.weeklyFirstPlayTitle(),
            getDescription: () => TEXT.weeklyFirstPlayDescription(),
            checkUnlocked: () => tableOfTheWeek.getLongestStreak() >= 1,
        },
    ];

    for (const days of dailyPeriodsPlayedThresholds) {
        achievements.push({
            id: `tableOfTheDayPeriodsPlayed:${days}`,
            family: ACHIEVEMENT_FAMILY.PERIOD_TABLES,
            getTitle: () => TEXT.dailyPeriodsPlayedTitles[days],
            getDescription: () => TEXT.dailyPeriodsPlayedDescription(days),
            checkUnlocked: () => tableOfTheDay.getPeriodsPlayed() >= days,
        });
    }

    for (const weeks of weeklyPeriodsPlayedThresholds) {
        achievements.push({
            id: `tableOfTheWeekPeriodsPlayed:${weeks}`,
            family: ACHIEVEMENT_FAMILY.PERIOD_TABLES,
            getTitle: () => TEXT.weeklyPeriodsPlayedTitles[weeks],
            getDescription: () => TEXT.weeklyPeriodsPlayedDescription(weeks),
            checkUnlocked: () => tableOfTheWeek.getPeriodsPlayed() >= weeks,
        });
    }

    for (const days of dailyStreakThresholds) {
        achievements.push({
            id: `tableOfTheDayStreak:${days}`,
            family: ACHIEVEMENT_FAMILY.PERIOD_TABLES,
            getTitle: () => TEXT.dailyStreakTitles[days],
            getDescription: () => TEXT.dailyStreakDescription(days),
            checkUnlocked: () => tableOfTheDay.getStreak() >= days,
        });
    }

    for (const weeks of weeklyStreakThresholds) {
        achievements.push({
            id: `tableOfTheWeekStreak:${weeks}`,
            family: ACHIEVEMENT_FAMILY.PERIOD_TABLES,
            getTitle: () => TEXT.weeklyStreakTitles[weeks],
            getDescription: () => TEXT.weeklyStreakDescription(weeks),
            checkUnlocked: () => tableOfTheWeek.getStreak() >= weeks,
        });
    }

    return achievements;
}
