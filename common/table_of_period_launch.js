import { pickTableOfTheDay } from "../table_of_the_day.js";
import { pickTableOfTheWeek } from "../table_of_the_week.js";
import { recordPeriodCompleted } from "./streak_tracker.js";
import { getTodayKey, getPreviousDayKey, getWeekKey, getPreviousWeekKey } from "./period_keys.js";

export function launchTableOfTheDay() {
    const game = pickTableOfTheDay();
    if (!game) return;
    recordPeriodCompleted("custom.streaks.tableOfTheDay", getTodayKey(), getPreviousDayKey);
    mainWindow.playGame(game);
}

export function launchTableOfTheWeek() {
    const game = pickTableOfTheWeek();
    if (!game) return;
    recordPeriodCompleted("custom.streaks.tableOfTheWeek", getWeekKey(), getPreviousWeekKey);
    mainWindow.playGame(game);
}