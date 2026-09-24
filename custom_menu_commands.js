// ============================================================
// Adds the custom entries (table setup, random table, table of the day,
// table of the week) to PinballY's main menu, right after "Play", and runs
// the matching action when one is selected. Every entry is described once
// in MENU_COMMANDS, which drives both the menu and the command dispatch.
// Listens to "menuopen" and "command" on the main window.
// ============================================================

import { getRandomGame } from "./common/random_game.js";
import { getTableOfTheDay, getTableOfTheWeek } from "./common/period_table.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "CustomMenuCommands";

export default function init() {
    const { customMenuLabels: MENU_LABELS } = lang;
    const tableOfTheDay = getTableOfTheDay();
    const tableOfTheWeek = getTableOfTheWeek();
    const randomGame = getRandomGame();

    // Listed in the order they appear in the menu, top to bottom.
    const MENU_COMMANDS = [
        {
            name: "showTableSetup",
            label: MENU_LABELS.tableSetup,
            action: () => { mainWindow.doCommand(command.ShowGameSetupMenu); },
        },
        { name: "RandomGameStart", label: MENU_LABELS.randomGame, action: randomGame.launch },
        { name: "tableOfTheDay", label: MENU_LABELS.tableOfTheDay, action: tableOfTheDay.launch },
        { name: "tableOfTheWeek", label: MENU_LABELS.tableOfTheWeek, action: tableOfTheWeek.launch },
    ];

    const COMMANDS = MENU_COMMANDS.map(entry => ({ ...entry, cmd: command.allocate(entry.name) }));

    // Fires when any menu opens: adds the custom entries to the main menu once.
    mainWindow.on("menuopen", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id !== "main") return;

        const hasCommand = (cmd) => ev.items.some(item => item.cmd === cmd);

        // Each entry is inserted right after "Play", which pushes the previous
        // ones down: walk the table backwards so the menu ends up in table order.
        for (let i = COMMANDS.length - 1; i >= 0; i--) {
            const { label, cmd } = COMMANDS[i];
            if (!hasCommand(cmd)) {
                ev.addMenuItem({ after: command.PlayGame }, { title: label, cmd });
            }
        }
    }));

    // Fires on every command; async because the random launch animates the
    // wheel, so its rejections are logged by safeHandler too.
    mainWindow.on("command", safeHandler(SCRIPT_NAME, async ev => {
        const entry = COMMANDS.find(item => item.cmd === ev.id);
        if (entry) await entry.action();
    }));
}
