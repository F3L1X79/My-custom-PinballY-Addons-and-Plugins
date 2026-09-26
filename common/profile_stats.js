// ============================================================
// Profile Stats module: the screen the player opens from the main menu to
// sum up the active Profile's own plays (games played, total time,
// collection completion, Achievements Unlocked, Period Table Streaks) in a
// native PinballY menu named after the Profile.
// Created from the PinballY host, the Profile store, the Achievement List
// (its counts, and opening it from the Achievements line) and the Table of
// the Day and Table of the Week. Every number is read again each time the
// screen opens. Listens to "command". Opens its menu directly, not through
// the wheel dialog module: the player asked for it.
// ============================================================

import lang from "./i18n.js";
import { displayNameOf } from "./profile_name.js";
import { safeHandler } from "./safe_handler.js";
import { countPlayedTables } from "./visible_tables.js";

const SCRIPT_NAME = "ProfileStats";
const MENU_ID = "profileStats";
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

export function createProfileStats(host, { profileStore, achievementList, tableOfTheDay, tableOfTheWeek }) {
    const { profileStats: TEXT } = lang;
    const achievementsCommand = host.allocateCommand("profileStatsAchievements");

    // Over every table the Profile played, hidden or no longer listed ones
    // included: hiding a table never erases a player's history.
    function sumPlays() {
        const plays = Object.values(profileStore.getProfileData().plays);
        return {
            count: plays.reduce((sum, play) => sum + play.count, 0),
            seconds: plays.reduce((sum, play) => sum + play.seconds, 0),
        };
    }

    // The Collection Achievements' rule, so the two never disagree.
    function readCompletion() {
        const visibleTables = host.getVisibleTables();
        const played = countPlayedTables(visibleTables, profileStore);
        const percent = visibleTables.length === 0 ? 0 : Math.round(played / visibleTables.length * 100);
        return { played, total: visibleTables.length, percent };
    }

    function show() {
        const plays = sumPlays();
        const totalMinutes = Math.floor(plays.seconds / SECONDS_PER_MINUTE);
        const completion = readCompletion();
        const achievements = achievementList.countAll();
        const info = title => ({ title, cmd: -1 });

        host.showMenu(MENU_ID, [
            info(TEXT.title(displayNameOf(profileStore.getActiveProfile()))),
            { cmd: -1 },
            info(TEXT.gamesPlayed(plays.count)),
            info(TEXT.totalTime(Math.floor(totalMinutes / MINUTES_PER_HOUR), totalMinutes % MINUTES_PER_HOUR)),
            info(TEXT.collection(completion.played, completion.total, completion.percent)),
            { title: TEXT.achievements(achievements.unlocked, achievements.total), cmd: achievementsCommand },
            info(TEXT.tableOfTheDayStreak(tableOfTheDay.getStreak(), tableOfTheDay.getLongestStreak())),
            info(TEXT.tableOfTheWeekStreak(tableOfTheWeek.getStreak(), tableOfTheWeek.getLongestStreak())),
            { cmd: -1 },
            { title: TEXT.back, cmd: host.getBuiltInCommand("MenuReturn") },
        ]);
    }

    // Fires on every command: the Achievements line opens the Achievement
    // List in place of this screen.
    host.on("command", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id === achievementsCommand) achievementList.open();
    }));

    return { open: show };
}
