import config from "./config.js";
import { safeHandler } from "./safe_handler.js";

// ============================================================
// Tracks per-session wall-clock duration (for marathon/rage-quit
// achievements) and per-table previous-play dates (for the "grand
// comeback" achievement), persisted across restarts via optionSettings.
// Must run so its gameover handler completes BEFORE achievements_engine's
// deferred check reads these values — since achievements_engine defers
// its check with setTimeout(fn, 0), any synchronous handler registered
// here for the same event is guaranteed to finish first regardless of
// script load order.
// ============================================================

// Exported so the achievement readers (achievements/session_milestones.js)
// use the exact keys this tracker writes. The strings must never change,
// or previously saved stats would be lost.
/** Settings key of the longest session duration ever recorded, in seconds. */
export const LONGEST_SESSION_KEY = "custom.sessionStats.longestSeconds";
/** Settings key of the shortest session duration ever recorded, in seconds (-1 when none). */
export const SHORTEST_SESSION_KEY = "custom.sessionStats.shortestSeconds";
/** Settings key of the flag set once a table is relaunched after a long absence. */
export const GRAND_RETURN_FLAG_KEY = "custom.sessionStats.grandReturnUnlocked";
const PREVIOUS_PLAY_KEY_PREFIX = "custom.sessionStats.previousPlay.";
const SCRIPT_NAME = "SessionStatsTracker";

/**
 * Registers the gamestarted/gameover listeners (protected by safeHandler)
 * that record session durations and previous-play dates.
 * @returns {void}
 */
export default function init() {
    const { grandReturnThresholdDays } = config.achievements;
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
            if (daysSincePreviousPlay >= grandReturnThresholdDays) {
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

            const longest = optionSettings.get(LONGEST_SESSION_KEY, 0);
            if (durationSeconds > longest) optionSettings.set(LONGEST_SESSION_KEY, durationSeconds);

            const shortest = optionSettings.get(SHORTEST_SESSION_KEY, -1);
            if (shortest < 0 || durationSeconds < shortest) optionSettings.set(SHORTEST_SESSION_KEY, durationSeconds);
        }

        optionSettings.save();
    }));
}