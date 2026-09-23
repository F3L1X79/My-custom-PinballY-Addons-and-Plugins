// ============================================================
// Launches the table of the day / week and records the matching streak in
// optionSettings ("custom.streaks.tableOfTheDay/Week.*"), which the streak
// achievements read. Shared by the custom main menu entries and the
// startup choice prompt.
// ============================================================

import { pickTableOfTheDay } from "../table_of_the_day.js";
import { pickTableOfTheWeek } from "../table_of_the_week.js";
import { recordPeriodCompleted } from "./streak_tracker.js";
import { getTodayKey, getPreviousDayKey, getWeekKey, getPreviousWeekKey } from "./period_keys.js";

// This module records the table of the day/week streaks, so it owns their
// settings key prefixes; achievements/period_table_streaks.js imports them
// to read the same streaks. The strings must never change, or previously
// saved streaks would be lost.
export const TABLE_OF_THE_DAY_STREAK_KEY_PREFIX = "custom.streaks.tableOfTheDay";
export const TABLE_OF_THE_WEEK_STREAK_KEY_PREFIX = "custom.streaks.tableOfTheWeek";

export function launchTableOfTheDay() {
    const game = pickTableOfTheDay();
    if (!game) return;
    recordPeriodCompleted(TABLE_OF_THE_DAY_STREAK_KEY_PREFIX, getTodayKey(), getPreviousDayKey);
    mainWindow.playGame(game);
}

export function launchTableOfTheWeek() {
    const game = pickTableOfTheWeek();
    if (!game) return;
    recordPeriodCompleted(TABLE_OF_THE_WEEK_STREAK_KEY_PREFIX, getWeekKey(), getPreviousWeekKey);
    mainWindow.playGame(game);
}