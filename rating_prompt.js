// ============================================================
// After a play session, if the table's CUMULATIVE play time has just
// crossed config.ratingPrompt.thresholdMinutes and the table isn't rated
// yet, shows a dialog offering to open PinballY's native rating dialog once
// back at the free wheel. Listens to "gamestarted", "gameover", "wheelmode"
// and "command".
// ============================================================

import lang from "./common/i18n.js";
import config from "./common/config.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "RatingPrompt";

export default function init() {
    const { ratingPrompt: RATING_PROMPT_TEXT } = lang;
    const { thresholdMinutes: THRESHOLD_MINUTES } = config.ratingPrompt;
    const THRESHOLD_SECONDS = THRESHOLD_MINUTES * 60;

    const playTimeAtSessionStart = new Map();

    // Fires on table launch: remembers the play time before this session.
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        playTimeAtSessionStart.set(ev.game.id, ev.game.playTime);
    }));

    const CONFIRM_RATING_PROMPT_COMMAND = command.allocate("confirmRatingPrompt");
    // Intentionally never handled: the "Not now" item needs a real command ID
    // to be selectable (cmd -1 makes a plain label, like the message line
    // below), and PinballY closing the menu on selection is all it must do.
    const DISMISS_RATING_PROMPT_COMMAND = command.allocate("dismissRatingPrompt");

    // Game waiting for its prompt until the wheel is free again.
    let pendingGame = null;

    // Fires on table exit: queues the prompt if the threshold was just crossed.
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, ev => {
        const game = ev.game;
        const startPlayTime = playTimeAtSessionStart.get(game.id);
        playTimeAtSessionStart.delete(game.id);

        if (startPlayTime === undefined) return;
        if (game.rating >= 0) return;

        const justCrossedThreshold = startPlayTime < THRESHOLD_SECONDS && game.playTime >= THRESHOLD_SECONDS;
        if (justCrossedThreshold) pendingGame = game;
    }));

    // Fires on every return to the wheel. The prompt waits until no other
    // dialog (e.g. an achievement) is open, since a new menu would replace it,
    // and until the game has fully exited, so it isn't hidden by the launch overlay.
    mainWindow.on("wheelmode", safeHandler(SCRIPT_NAME, () => {
        if (!pendingGame || mainWindow.getUIMode().mode !== "wheel") return;
        const game = pendingGame;
        pendingGame = null;

        mainWindow.showMenu(
            "ratingPrompt",
            [
                { title: RATING_PROMPT_TEXT.message(game.title, THRESHOLD_MINUTES), cmd: -1 },
                { cmd: -1 },
                { title: RATING_PROMPT_TEXT.rateNow, cmd: CONFIRM_RATING_PROMPT_COMMAND },
                { title: RATING_PROMPT_TEXT.notNow, cmd: DISMISS_RATING_PROMPT_COMMAND },
            ],
            { dialogStyle: true }
        );
    }));

    // Fires on every command; only "Rate now" needs handling.
    mainWindow.on("command", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id === CONFIRM_RATING_PROMPT_COMMAND) {
            mainWindow.doCommand(command.RateGame);
        }
    }));
}