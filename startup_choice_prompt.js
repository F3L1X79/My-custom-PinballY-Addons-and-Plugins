// ============================================================
// At startup, shows a dialog offering to stay on the last played table or
// to launch today's table, this week's table or a random one (picking the
// day / week tables here locks them in optionSettings). PROMPT_CHOICES drives
// both the dialog items and the command dispatch. Listens to "command".
// ============================================================

import { launchRandomGame } from "./common/random_game.js";
import { launchTableOfTheDay, launchTableOfTheWeek } from "./common/table_of_period_launch.js";
import { pickTableOfTheDay } from "./table_of_the_day.js";
import { pickTableOfTheWeek } from "./table_of_the_week.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "StartupChoicePrompt";

// Drops parenthetical suffixes from table titles to keep the intro message short.
function stripParentheticals(title) {
    return title.replace(/\s*\([^)]*\)/g, "").trim();
}

export default function init() {
    const { startupPrompt: STARTUP_PROMPT_TEXT } = lang;

    // Listed in the order they appear in the dialog, top to bottom.
    const PROMPT_CHOICES = [
        // "Stay" needs a real command ID to be selectable (cmd -1 makes a
        // plain label), but PinballY closing the dialog is all it must do.
        { name: "startupStay", label: STARTUP_PROMPT_TEXT.stayOnLastPlayed, action: null },
        { name: "startupTableOfDay", label: STARTUP_PROMPT_TEXT.tableOfTheDay, action: launchTableOfTheDay },
        { name: "startupTableOfWeek", label: STARTUP_PROMPT_TEXT.tableOfTheWeek, action: launchTableOfTheWeek },
        { name: "startupRandom", label: STARTUP_PROMPT_TEXT.randomTable, action: launchRandomGame },
    ];

    const CHOICES = PROMPT_CHOICES.map(choice => ({ ...choice, cmd: command.allocate(choice.name) }));

    // Fires on every command; async because the random launch animates the
    // wheel, so its rejections are logged by safeHandler too.
    mainWindow.on("command", safeHandler(SCRIPT_NAME, async ev => {
        const choice = CHOICES.find(item => item.cmd === ev.id);
        if (choice && choice.action) await choice.action();
    }));

    const dayGame = pickTableOfTheDay();
    const weekGame = pickTableOfTheWeek();

    const introMessage = STARTUP_PROMPT_TEXT.introWithPicks(
        dayGame ? stripParentheticals(dayGame.title) : null,
        weekGame ? stripParentheticals(weekGame.title) : null
    );

    mainWindow.showMenu(
        "startupChoicePrompt",
        [
            { title: introMessage, cmd: -1 },
            { title: "---" },
            ...CHOICES.map(({ label, cmd }) => ({ title: label, cmd })),
        ],
        { dialogStyle: true }
    );
}
