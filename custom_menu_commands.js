// ============================================================
// Adds the custom entries (table setup, random table, table of the day,
// table of the week) to PinballY's main menu through the main menu module,
// which places them after "Play" and runs the matching action when one is
// selected.
// ============================================================

import { getRandomGame } from "./common/random_game.js";
import { getTableOfTheDay, getTableOfTheWeek } from "./common/period_table.js";
import { getMainMenu, MAIN_MENU_POSITION } from "./common/main_menu.js";
import lang from "./common/i18n.js";

export default function init() {
    const { customMenuLabels: MENU_LABELS } = lang;
    const tableOfTheDay = getTableOfTheDay();
    const tableOfTheWeek = getTableOfTheWeek();
    const randomGame = getRandomGame();

    const MENU_COMMANDS = [
        {
            name: "showTableSetup",
            label: MENU_LABELS.tableSetup,
            position: MAIN_MENU_POSITION.TABLE_SETUP,
            action: () => { mainWindow.doCommand(command.ShowGameSetupMenu); },
        },
        { name: "RandomGameStart", label: MENU_LABELS.randomGame, position: MAIN_MENU_POSITION.RANDOM_GAME, action: randomGame.launch },
        { name: "tableOfTheDay", label: MENU_LABELS.tableOfTheDay, position: MAIN_MENU_POSITION.TABLE_OF_THE_DAY, action: tableOfTheDay.launch },
        { name: "tableOfTheWeek", label: MENU_LABELS.tableOfTheWeek, position: MAIN_MENU_POSITION.TABLE_OF_THE_WEEK, action: tableOfTheWeek.launch },
    ];

    const mainMenu = getMainMenu();
    for (const entry of MENU_COMMANDS) mainMenu.add(entry);
}
