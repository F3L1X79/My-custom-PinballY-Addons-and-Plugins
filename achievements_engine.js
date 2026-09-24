// ============================================================
// Checks all registered achievements at startup and after every
// "gamestarted" and "gameover" event, and hands each newly unlocked one to
// the wheel dialog module as a congratulations dialog. That module shows
// them one at a time once the wheel is free; an Achievement becomes
// Notified when its dialog is shown, acknowledged or dismissed.
// ============================================================

import { evaluateAchievements, markNotified } from "./common/achievements.js";
import { buildManufacturerCompletionAchievements } from "./achievements/manufacturer_completion.js";
import { buildCollectionCompletionAchievements } from "./achievements/collection_completion.js";
import { buildPlayTimeTotalAchievements } from "./achievements/play_time_totals.js";
import { buildPeriodTableStreakAchievements } from "./achievements/period_table_streaks.js";
import { buildDecadeCompletionAchievements } from "./achievements/decade_completion.js";
import { buildCategoryCompletionAchievements } from "./achievements/category_completion.js";
import { buildSessionMilestoneAchievements } from "./achievements/session_milestones.js";
import { getWheelDialogs, DIALOG_PRIORITY } from "./common/wheel_dialog.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "AchievementsEngine";
const DIALOG_ID = "achievementUnlocked";

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
    const wheelDialogs = getWheelDialogs();
    // Achievements handed to the wheel dialog module. They are not Notified
    // until shown, so later checks find the waiting ones again.
    const submittedIds = new Set();

    function checkForNewAchievements() {
        evaluateAchievements(getAllAchievements(), (achievement) => {
            if (submittedIds.has(achievement.id)) return;
            submittedIds.add(achievement.id);
            wheelDialogs.submit({
                id: DIALOG_ID,
                message: TEXT.unlockedIntro(achievement.getTitle(), achievement.getDescription()),
                buttons: [{ label: TEXT.acknowledge }],
                priority: DIALOG_PRIORITY.ACHIEVEMENT,
                onShown: () => markNotified(achievement.id),
            });
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

    // Startup check. The wheel dialog module puts the startup prompt first,
    // whatever the order in main.js.
    checkForNewAchievements();
}
