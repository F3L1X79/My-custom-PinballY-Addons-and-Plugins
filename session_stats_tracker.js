// ============================================================
// Records session stats in optionSettings ("custom.sessionStats.*") for the
// session achievements: longest / shortest session, a "rage quit" flag for
// a short session given up, a "grand return" flag for a table replayed
// after a long break, and the Day's Manufacturers with their one-day
// record. Listens to "gamestarted" and "gameover"; these handlers are synchronous, so they always finish before
// achievements_engine's check, which is deferred with setTimeout(fn, 0).
// ============================================================

import { safeHandler } from "./common/safe_handler.js";
import { TABLE_OF_THE_DAY } from "./common/period_table.js";

// Exported so the achievement readers (achievements/session_milestones.js)
// use the exact keys this tracker writes. The strings must never change,
// or previously saved stats would be lost.
export const LONGEST_SESSION_KEY = "custom.sessionStats.longestSeconds";
// No Achievement reads it any more, but it stays a recorded stat.
const SHORTEST_SESSION_KEY = "custom.sessionStats.shortestSeconds";
export const GRAND_RETURN_FLAG_KEY = "custom.sessionStats.grandReturnUnlocked";
export const RAGE_QUIT_FLAG_KEY = "custom.sessionStats.rageQuitUnlocked";
// A session from RAGE_QUIT_MIN_SECONDS to under RAGE_QUIT_MAX_SECONDS sets
// the "rage quit" flag: long enough to have really played, short enough to
// have given up. Exported so the Achievement description shows the same values.
export const RAGE_QUIT_MIN_SECONDS = 30;
export const RAGE_QUIT_MAX_SECONDS = 60;
// Break (in days) after which replaying a table sets the "grand return" flag.
// Exported so the Achievement description shows the same value.
export const GRAND_RETURN_THRESHOLD_DAYS = 31;
// Most distinct manufacturers played in one calendar day: the multi-
// manufacturer Achievements read this record, not the current day's count,
// so they stay Unlocked after midnight.
export const MOST_MANUFACTURERS_IN_A_DAY_KEY = "custom.sessionStats.mostManufacturersInADay";
const DAY_MANUFACTURERS_DAY_KEY = "custom.sessionStats.dayManufacturers.day";
// A JSON array: manufacturer names may contain any separator.
const DAY_MANUFACTURERS_LIST_KEY = "custom.sessionStats.dayManufacturers.list";
const PREVIOUS_PLAY_KEY_PREFIX = "custom.sessionStats.previousPlay.";
const SCRIPT_NAME = "SessionStatsTracker";

// Adds the manufacturer to today's Day's Manufacturers, starting a new set
// on a new calendar day, and keeps the one-day record up to date.
function recordDayManufacturer(manufacturer) {
    if (!manufacturer) return;

    // The same calendar day as the Table of the Day's.
    const today = TABLE_OF_THE_DAY.getPeriodKey(new Date());
    const manufacturers = optionSettings.get(DAY_MANUFACTURERS_DAY_KEY, "") === today
        ? JSON.parse(optionSettings.get(DAY_MANUFACTURERS_LIST_KEY, "[]"))
        : [];
    if (manufacturers.includes(manufacturer)) return;

    manufacturers.push(manufacturer);
    optionSettings.set(DAY_MANUFACTURERS_DAY_KEY, today);
    optionSettings.set(DAY_MANUFACTURERS_LIST_KEY, JSON.stringify(manufacturers));
    if (manufacturers.length > optionSettings.getInt(MOST_MANUFACTURERS_IN_A_DAY_KEY, 0)) {
        optionSettings.set(MOST_MANUFACTURERS_IN_A_DAY_KEY, manufacturers.length);
    }
}

export default function init() {
    const sessionStartTimes = new Map();

    // Fires on table launch: records the start time and the Day's
    // Manufacturers, and flags a "grand return".
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        const configId = ev.game.configId;
        sessionStartTimes.set(configId, Date.now());

        // Compare against OUR OWN recorded previous play date for this table
        // (rather than game.lastPlayed) to sidestep any ambiguity about
        // whether PinballY updates lastPlayed before or after this event fires.
        const previousPlayIso = optionSettings.get(PREVIOUS_PLAY_KEY_PREFIX + configId, "");
        if (previousPlayIso) {
            const daysSincePreviousPlay = (Date.now() - new Date(previousPlayIso).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSincePreviousPlay >= GRAND_RETURN_THRESHOLD_DAYS) {
                optionSettings.set(GRAND_RETURN_FLAG_KEY, true);
            }
        }

        // Last, so a corrupt saved list can't stop the grand return above.
        recordDayManufacturer(ev.game.manufacturer);
    }));

    // Fires on table exit: stores the session duration and previous-play
    // date, and flags a "rage quit".
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, ev => {
        const configId = ev.game.configId;
        const startTime = sessionStartTimes.get(configId);
        sessionStartTimes.delete(configId);

        optionSettings.set(PREVIOUS_PLAY_KEY_PREFIX + configId, new Date().toISOString());

        if (startTime !== undefined) {
            const durationSeconds = (Date.now() - startTime) / 1000;

            const longest = optionSettings.getFloat(LONGEST_SESSION_KEY, 0);
            if (durationSeconds > longest) optionSettings.set(LONGEST_SESSION_KEY, durationSeconds);

            const shortest = optionSettings.getFloat(SHORTEST_SESSION_KEY, -1);
            if (shortest < 0 || durationSeconds < shortest) optionSettings.set(SHORTEST_SESSION_KEY, durationSeconds);

            if (durationSeconds >= RAGE_QUIT_MIN_SECONDS && durationSeconds < RAGE_QUIT_MAX_SECONDS) {
                optionSettings.set(RAGE_QUIT_FLAG_KEY, true);
            }
        }
    }));
}