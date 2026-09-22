import { launchRandomGame } from "./common/random_game.js";
import { launchTableOfTheDay, launchTableOfTheWeek } from "./common/table_of_period_launch.js";
import lang from "./common/i18n.js";

export default function init() {
    const { customMenuLabels: MENU_LABELS } = lang;

    const RANDOM_GAME_COMMAND = command.allocate("RandomGameStart");
    const TABLE_OF_DAY_COMMAND = command.allocate("tableOfTheDay");
    const TABLE_OF_WEEK_COMMAND = command.allocate("tableOfTheWeek");
    const SHOW_TABLE_SETUP_COMMAND = command.allocate("showTableSetup");

    mainWindow.on("menuopen", ev => {
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
    });

    mainWindow.on("command", async ev => {
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
    });
}