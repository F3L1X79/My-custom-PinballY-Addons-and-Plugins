// ============================================================
// Checks all registered achievements after every play session (and once
// at startup, in case stats changed while the script wasn't running),
// and shows a congratulations popup for each newly unlocked one.
// Multiple simultaneous unlocks are queued and shown one at a time.
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

    mainWindow.on("command", ev => {
        if (ev.id === ACKNOWLEDGE_COMMAND) {
            pendingQueue.shift();
            showNextInQueue();
        }
    });

    function checkForNewAchievements() {
        evaluateAchievements(getAllAchievements(), (achievement) => {
            const queueWasEmpty = pendingQueue.length === 0;
            pendingQueue.push(achievement);
            if (queueWasEmpty) showNextInQueue();
        });
    }

    mainWindow.on("gamestarted", () => {
        setTimeout(checkForNewAchievements, 0);
    });

    mainWindow.on("gameover", () => {
        setTimeout(checkForNewAchievements, 0);
    });

    checkForNewAchievements();
}