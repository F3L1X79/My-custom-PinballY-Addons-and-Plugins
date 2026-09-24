// ============================================================
// Records session stats in optionSettings ("custom.sessionStats.*") for the
// session achievements: longest / shortest session and a "grand return" flag
// for a table replayed after a long break. Listens to "gamestarted" and
// "gameover"; these handlers are synchronous, so they always finish before
// achievements_engine's check, which is deferred with setTimeout(fn, 0).
// ============================================================

import { safeHandler } from "./common/safe_handler.js";

// Exported so the achievement readers (achievements/session_milestones.js)
// use the exact keys this tracker writes. The strings must never change,
// or previously saved stats would be lost.
export const LONGEST_SESSION_KEY = "custom.sessionStats.longestSeconds";
export const SHORTEST_SESSION_KEY = "custom.sessionStats.shortestSeconds";
export const GRAND_RETURN_FLAG_KEY = "custom.sessionStats.grandReturnUnlocked";
// Break (in days) after which replaying a table sets the "grand return" flag.
// Exported so the Achievement description shows the same value.
export const GRAND_RETURN_THRESHOLD_DAYS = 31;
const PREVIOUS_PLAY_KEY_PREFIX = "custom.sessionStats.previousPlay.";
const SCRIPT_NAME = "SessionStatsTracker";

export default function init() {
    const sessionStartTimes = new Map();

    // Fires on table launch: records the start time and flags a "grand return".
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
    }));

    // Fires on table exit: stores the session duration and previous-play date.
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
        }
    }));
}