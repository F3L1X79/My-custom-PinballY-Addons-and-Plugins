import lang from "./common/i18n.js";
import config from "./common/config.js";
import { safeHandler } from "./common/safe_handler.js";

// ============================================================
// After a play session, if the table's CUMULATIVE play time has just
// crossed a configured threshold and the table hasn't been rated yet,
// shows a custom prompt offering to open PinballY's native rating dialog.
// ============================================================

const SCRIPT_NAME = "RatingPrompt";

/**
 * Registers the listeners (protected by safeHandler) that track play time per
 * session and offer to rate a table once it crosses the configured threshold.
 * @returns {void}
 */
export default function init() {
    const { ratingPrompt: RATING_PROMPT_TEXT } = lang;
    const { thresholdMinutes: THRESHOLD_MINUTES } = config.ratingPrompt;
    const THRESHOLD_SECONDS = THRESHOLD_MINUTES * 60;

    const playTimeAtSessionStart = new Map();

    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        playTimeAtSessionStart.set(ev.game.id, ev.game.playTime);
    }));

    const CONFIRM_RATING_PROMPT_COMMAND = command.allocate("confirmRatingPrompt");
    const DISMISS_RATING_PROMPT_COMMAND = command.allocate("dismissRatingPrompt");

    // Fires on table exit: shows the prompt if the threshold was just crossed.
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, ev => {
        const game = ev.game;
        const startPlayTime = playTimeAtSessionStart.get(game.id);
        playTimeAtSessionStart.delete(game.id);

        if (startPlayTime === undefined) return;
        if (game.rating >= 0) return;

        const justCrossedThreshold = startPlayTime < THRESHOLD_SECONDS && game.playTime >= THRESHOLD_SECONDS;
        if (!justCrossedThreshold) return;

        mainWindow.showMenu(
            "ratingPrompt",
            [
                { title: RATING_PROMPT_TEXT.message(game.title, THRESHOLD_MINUTES), cmd: -1 },
                { title: "-" },
                { title: RATING_PROMPT_TEXT.rateNow, cmd: CONFIRM_RATING_PROMPT_COMMAND },
                { title: RATING_PROMPT_TEXT.notNow, cmd: DISMISS_RATING_PROMPT_COMMAND },
            ],
            { dialogStyle: true }
        );
    }));

    mainWindow.on("command", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id === CONFIRM_RATING_PROMPT_COMMAND) {
            mainWindow.doCommand(command.RateGame);
        }
    }));
}