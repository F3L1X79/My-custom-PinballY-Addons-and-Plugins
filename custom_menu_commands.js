// ============================================================
// Adds the custom entries (table setup, random table, table of the day,
// table of the week) to PinballY's main menu, right after "Play", and runs
// the matching action when one is selected. Every entry is described once
// in MENU_COMMANDS, which drives both the menu and the command dispatch.
// Listens to "menuopen" and "command" on the main window.
// ============================================================

import { launchRandomGame } from "./common/random_game.js";
import { launchTableOfTheDay, launchTableOfTheWeek } from "./common/table_of_period_launch.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "CustomMenuCommands";

/**
 * One custom main-menu entry.
 * @typedef {object} MenuCommand
 * @property {string} name - Name passed to command.allocate(); must stay stable.
 * @property {string} label - Menu title, already translated.
 * @property {() => (void | Promise<void>)} action - Runs when the entry is selected.
 */

/**
 * One custom main-menu entry once its command ID has been allocated.
 * @typedef {MenuCommand & { cmd: number }} AllocatedMenuCommand
 */

/**
 * Allocates the custom commands, adds them to PinballY's main menu and
 * handles them, with both listeners protected by safeHandler.
 * @returns {void}
 */
export default function init() {
    const { customMenuLabels: MENU_LABELS } = lang;

    // Listed in the order they appear in the menu, top to bottom.
    /** @type {MenuCommand[]} */
    const MENU_COMMANDS = [
        {
            name: "showTableSetup",
            label: MENU_LABELS.tableSetup,
            action: () => { mainWindow.doCommand(command.ShowGameSetupMenu); },
        },
        { name: "RandomGameStart", label: MENU_LABELS.randomGame, action: launchRandomGame },
        { name: "tableOfTheDay", label: MENU_LABELS.tableOfTheDay, action: launchTableOfTheDay },
        { name: "tableOfTheWeek", label: MENU_LABELS.tableOfTheWeek, action: launchTableOfTheWeek },
    ];

    /** @type {AllocatedMenuCommand[]} */
    const COMMANDS = MENU_COMMANDS.map(entry => ({ ...entry, cmd: command.allocate(entry.name) }));

    // Fires when any menu opens: adds the custom entries to the main menu once.
    mainWindow.on("menuopen", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id !== "main") return;

        /**
         * Tells whether the menu being opened already contains a command.
         * @param {number} cmd - Command ID to look for.
         * @returns {boolean} True if an item of the menu uses this command.
         */
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
