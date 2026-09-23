// ============================================================
// Checks all registered achievements at startup and after every
// "gamestarted" and "gameover" event, and shows a congratulations dialog
// for each newly unlocked one, once back at the free wheel ("wheelmode").
// Simultaneous unlocks are queued and shown one at a time; the queue
// advances on "menuclose", whether the dialog was acknowledged or dismissed.
// ============================================================

import { evaluateAchievements, markNotified } from "./common/achievements.js";
import { buildManufacturerCompletionAchievements } from "./achievements/manufacturer_completion.js";
import { buildCollectionCompletionAchievements } from "./achievements/collection_completion.js";
import { buildPlayTimeTotalAchievements } from "./achievements/play_time_totals.js";
import { buildPeriodTableStreakAchievements } from "./achievements/period_table_streaks.js";
import { buildDecadeCompletionAchievements } from "./achievements/decade_completion.js";
import { buildCategoryCompletionAchievements } from "./achievements/category_completion.js";
import { buildSessionMilestoneAchievements } from "./achievements/session_milestones.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "AchievementsEngine";

function getAllAchievements() {
    return [
        ...buildManufacturerCompletionAchievements(),
        ...buildCollectionCompletionAchievements(),
        ...buildPlayTimeTotalAchievements(),
        ...buildPeriodTableStreakAchievements(),
        ...buildDecadeCompletionAchievements(),
        ...buildCategoryCompletionAchievements(),
        ...buildSessionMilestoneAchievements(),
    ];
}

export default function init() {
    const { achievements: TEXT } = lang;
    const ACKNOWLEDGE_COMMAND = command.allocate("acknowledgeAchievement");
    const DIALOG_ID = "achievementUnlocked";

    // Unlocked achievements not shown yet; the head is the one on screen
    // while dialogIsOpen is true.
    const pendingQueue = [];
    let dialogIsOpen = false;
    // True when an unlock is waiting for the wheel to be free (game running,
    // or another dialog such as the startup prompt still open).
    let displayPending = false;

    function showNextInQueue() {
        if (pendingQueue.length === 0 || dialogIsOpen) return;
        const achievement = pendingQueue[0];

        mainWindow.showMenu(
            DIALOG_ID,
            [
                { title: TEXT.unlockedIntro(achievement.getTitle(), achievement.getDescription()), cmd: -1 },
                { cmd: -1 },
                { title: TEXT.acknowledge, cmd: ACKNOWLEDGE_COMMAND },
            ],
            { dialogStyle: true }
        );
        dialogIsOpen = true;
        markNotified(achievement.id);
    }

    // A dialog opened while a game is exiting would sit under the launch
    // overlay, and one opened over another menu would replace it.
    function showWhenWheelIsFree() {
        if (mainWindow.getUIMode().mode === "wheel") {
            displayPending = false;
            showNextInQueue();
        } else {
            displayPending = true;
        }
    }

    // Fires after any menu closes. The acknowledge button and Escape both
    // close the dialog, so the queue advances here rather than on the command.
    mainWindow.on("menuclose", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id !== DIALOG_ID || !dialogIsOpen) return;
        dialogIsOpen = false;
        pendingQueue.shift();
        showWhenWheelIsFree();
    }));

    function checkForNewAchievements() {
        evaluateAchievements(getAllAchievements(), (achievement) => {
            // Not Notified until shown, so later checks find it again.
            if (pendingQueue.some(queued => queued.id === achievement.id)) return;
            pendingQueue.push(achievement);
            if (!dialogIsOpen) showWhenWheelIsFree();
        });
    }

    // Fires on every return to the wheel (from a game, a menu or a popup):
    // shows the unlocks that were waiting.
    mainWindow.on("wheelmode", safeHandler(SCRIPT_NAME, () => {
        if (displayPending) showWhenWheelIsFree();
    }));

    // The timer callback runs outside the event handler's call stack, so it
    // needs its own guard.
    const safeCheckForNewAchievements = safeHandler(SCRIPT_NAME, checkForNewAchievements);

    // Fire on table launch and exit (the launch check catches the "grand
    // return" flag set at launch). Deferred by one tick so the stats trackers'
    // handlers for the same event run first.
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, () => {
        setTimeout(safeCheckForNewAchievements, 0);
    }));

    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, () => {
        setTimeout(safeCheckForNewAchievements, 0);
    }));

    // Deferred until every script has initialized, so a dialog opened at
    // startup (e.g. the startup prompt) is already showing and the unlock
    // waits for it instead of being replaced by it, whatever the order in main.js.
    setTimeout(safeCheckForNewAchievements, 0);
}
