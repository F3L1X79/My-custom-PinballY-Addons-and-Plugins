import { launchRandomGame } from "./common/random_game.js";
import { launchTableOfTheDay, launchTableOfTheWeek } from "./common/table_of_period_launch.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "CustomMenuCommands";

/**
 * Allocates the custom commands, adds them to PinballY's main menu and
 * handles them, with both listeners protected by safeHandler.
 * @returns {void}
 */
export default function init() {
    const { customMenuLabels: MENU_LABELS } = lang;

    const RANDOM_GAME_COMMAND = command.allocate("RandomGameStart");
    const TABLE_OF_DAY_COMMAND = command.allocate("tableOfTheDay");
    const TABLE_OF_WEEK_COMMAND = command.allocate("tableOfTheWeek");
    const SHOW_TABLE_SETUP_COMMAND = command.allocate("showTableSetup");

    // Fires when any menu opens: adds the custom entries to the main menu once.
    mainWindow.on("menuopen", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id !== "main") return;

        const hasCommand = (cmd) => ev.items.some(item => item.cmd === cmd);

        if (!hasCommand(TABLE_OF_WEEK_COMMAND)) {
            ev.addMenuItem({ after: command.PlayGame }, {
                title: MENU_LABELS.tableOfTheWeek,
                cmd: TABLE_OF_WEEK_COMMAND,
            });
        }

        if (!hasCommand(TABLE_OF_DAY_COMMAND)) {
            ev.addMenuItem({ after: command.PlayGame }, {
                title: MENU_LABELS.tableOfTheDay,
                cmd: TABLE_OF_DAY_COMMAND,
            });
        }

        if (!hasCommand(RANDOM_GAME_COMMAND)) {
            ev.addMenuItem({ after: command.PlayGame }, {
                title: MENU_LABELS.randomGame,
                cmd: RANDOM_GAME_COMMAND,
            });
        }

        if (!hasCommand(SHOW_TABLE_SETUP_COMMAND)) {
            ev.addMenuItem({ after: command.PlayGame }, {
                title: MENU_LABELS.tableSetup,
                cmd: SHOW_TABLE_SETUP_COMMAND,
            });
        }
    }));

    // Fires on every command; async because the random launch animates the
    // wheel, so its rejections are logged by safeHandler too.
    mainWindow.on("command", safeHandler(SCRIPT_NAME, async ev => {
        if (ev.id === RANDOM_GAME_COMMAND) {
            await launchRandomGame();
            return;
        }
        if (ev.id === TABLE_OF_DAY_COMMAND) {
            launchTableOfTheDay();
            return;
        }
        if (ev.id === TABLE_OF_WEEK_COMMAND) {
            launchTableOfTheWeek();
            return;
        }
        if (ev.id === SHOW_TABLE_SETUP_COMMAND) {
            mainWindow.doCommand(command.ShowGameSetupMenu);
            return;
        }
    }));
}