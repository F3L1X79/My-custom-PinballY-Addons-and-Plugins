import config from "./config.js";

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

const LONGEST_SESSION_KEY = "custom.sessionStats.longestSeconds";
const SHORTEST_SESSION_KEY = "custom.sessionStats.shortestSeconds";
const GRAND_RETURN_FLAG_KEY = "custom.sessionStats.grandReturnUnlocked";
const PREVIOUS_PLAY_KEY_PREFIX = "custom.sessionStats.previousPlay.";

export default function init() {
    const { grandReturnThresholdDays } = config.achievements;
    const sessionStartTimes = new Map();

    mainWindow.on("gamestarted", ev => {
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
    });

    mainWindow.on("gameover", ev => {
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
    });
}