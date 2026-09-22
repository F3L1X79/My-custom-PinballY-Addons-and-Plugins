import { launchRandomGame } from "./common/random_game.js";
import { pickTableOfTheDay } from "./table_of_the_day.js";
import { pickTableOfTheWeek } from "./table_of_the_week.js";
import lang from "./common/i18n.js";

function stripParentheticals(title) {
    return title.replace(/\s*\([^)]*\)/g, "").trim();
}

export default function init() {
    const { startupPrompt: STARTUP_PROMPT_TEXT } = lang;

    const STAY_COMMAND = command.allocate("startupStay");
    const TABLE_OF_DAY_COMMAND = command.allocate("startupTableOfDay");
    const TABLE_OF_WEEK_COMMAND = command.allocate("startupTableOfWeek");
    const RANDOM_COMMAND = command.allocate("startupRandom");

    mainWindow.on("command", async ev => {
        if (ev.id === TABLE_OF_DAY_COMMAND) {
            const game = pickTableOfTheDay();
            if (game) mainWindow.playGame(game);
            return;
        }
        if (ev.id === TABLE_OF_WEEK_COMMAND) {
            const game = pickTableOfTheWeek();
            if (game) mainWindow.playGame(game);
            return;
        }
        if (ev.id === RANDOM_COMMAND) {
            await launchRandomGame();
            return;
        }
    });

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
            { title: STARTUP_PROMPT_TEXT.stayOnLastPlayed, cmd: STAY_COMMAND },
            { title: STARTUP_PROMPT_TEXT.tableOfTheDay, cmd: TABLE_OF_DAY_COMMAND },
            { title: STARTUP_PROMPT_TEXT.tableOfTheWeek, cmd: TABLE_OF_WEEK_COMMAND },
            { title: STARTUP_PROMPT_TEXT.randomTable, cmd: RANDOM_COMMAND },
        ],
        { dialogStyle: true }
    );
}