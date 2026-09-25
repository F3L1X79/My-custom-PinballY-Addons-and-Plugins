// ============================================================
// At startup, hands the wheel dialog module a dialog that greets the active
// Profile and offers to stay on the last played table or to launch today's
// table, this week's table or a random one (picking the day / week tables
// here locks them in cabinet.json). Its priority puts it before any other
// dialog submitted at startup, whatever the add-on order in main.js.
// ============================================================

import { getRandomGame } from "../common/random_game.js";
import { getTableOfTheDay, getTableOfTheWeek } from "../common/period_table.js";
import { getWheelDialogs, DIALOG_PRIORITY } from "../common/wheel_dialog.js";
import lang from "../common/i18n.js";
import { getProfileStore } from "../common/profile_store.js";
import { displayNameOf } from "../common/profile_name.js";

// Drops parenthetical suffixes from table titles to keep the intro message short.
function stripParentheticals(title) {
    return title.replace(/\s*\([^)]*\)/g, "").trim();
}

export default function init() {
    const { startupPrompt: STARTUP_PROMPT_TEXT } = lang;
    const tableOfTheDay = getTableOfTheDay();
    const tableOfTheWeek = getTableOfTheWeek();
    const randomGame = getRandomGame();

    const dayGame = tableOfTheDay.getTable();
    const weekGame = tableOfTheWeek.getTable();

    getWheelDialogs().submit({
        id: "startupChoicePrompt",
        message: STARTUP_PROMPT_TEXT.introWithPicks(
            displayNameOf(getProfileStore().getActiveProfile()),
            dayGame ? stripParentheticals(dayGame.title) : null,
            weekGame ? stripParentheticals(weekGame.title) : null
        ),
        // Top to bottom. "Stay" has no action: the dialog closing is all it must do.
        buttons: [
            { label: STARTUP_PROMPT_TEXT.stayOnLastPlayed },
            { label: STARTUP_PROMPT_TEXT.tableOfTheDay, action: tableOfTheDay.launch },
            { label: STARTUP_PROMPT_TEXT.tableOfTheWeek, action: tableOfTheWeek.launch },
            { label: STARTUP_PROMPT_TEXT.randomTable, action: randomGame.launch },
        ],
        priority: DIALOG_PRIORITY.STARTUP_PROMPT,
    });
}
