// ============================================================
// Checks all registered achievements at startup and after every
// "gamestarted" and "gameover" event, and shows a congratulations dialog
// for each newly unlocked one. Simultaneous unlocks are queued and shown
// one at a time; listens to "command" for the acknowledge button.
// ============================================================

import { evaluateAchievements } from "./common/achievements.js";
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

    const pendingQueue = [];

    function showNextInQueue() {
        if (pendingQueue.length === 0) return;
        const achievement = pendingQueue[0];

        mainWindow.showMenu(
            "achievementUnlocked",
            [
                { title: TEXT.unlockedIntro(achievement.getTitle(), achievement.getDescription()), cmd: -1 },
                { title: "-" },
                { title: TEXT.acknowledge, cmd: ACKNOWLEDGE_COMMAND },
            ],
            { dialogStyle: true }
        );
    }

    // Fires on every command; the acknowledge button shows the next queued unlock.
    mainWindow.on("command", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id === ACKNOWLEDGE_COMMAND) {
            pendingQueue.shift();
            showNextInQueue();
        }
    }));

    function checkForNewAchievements() {
        evaluateAchievements(getAllAchievements(), (achievement) => {
            const queueWasEmpty = pendingQueue.length === 0;
            pendingQueue.push(achievement);
            if (queueWasEmpty) showNextInQueue();
        });
    }

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

    checkForNewAchievements();
}