// ============================================================
// Checks all registered achievements at startup and after every
// "gamestarted" and "gameover" event, and hands each newly unlocked one to
// the Achievement Toast module, which announces it with a card in the
// bottom-right corner once no game is running; an Achievement becomes
// Notified when its toast starts.
// Also adds the Achievement List entry to the main menu, right after "Play".
// ============================================================

import { evaluateAchievements, markNotified } from "./common/achievements.js";
import { buildDayManufacturersAchievements } from "./achievements/day_manufacturers.js";
import { buildManufacturerCompletionAchievements } from "./achievements/manufacturer_completion.js";
import { buildCollectionCompletionAchievements } from "./achievements/collection_completion.js";
import { buildPlayTimeTotalAchievements } from "./achievements/play_time_totals.js";
import { buildPeriodTableAchievements } from "./achievements/period_tables.js";
import { buildDecadeCompletionAchievements } from "./achievements/decade_completion.js";
import { buildCategoryCompletionAchievements } from "./achievements/category_completion.js";
import { buildSessionMilestoneAchievements } from "./achievements/session_milestones.js";
import { buildRandomGameFanAchievements } from "./achievements/random_game_fans.js";
import { getAchievementToasts } from "./common/achievement_toast.js";
import { getMainMenu, MAIN_MENU_POSITION } from "./common/main_menu.js";
import { createAchievementList } from "./common/achievement_list.js";
import { createPinballYHost } from "./common/pinbally_host.js";
import lang from "./common/i18n.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "AchievementsEngine";

function getAllAchievements() {
    return [
        ...buildDayManufacturersAchievements(),
        ...buildManufacturerCompletionAchievements(),
        ...buildCollectionCompletionAchievements(),
        ...buildPlayTimeTotalAchievements(),
        ...buildPeriodTableAchievements(),
        ...buildDecadeCompletionAchievements(),
        ...buildCategoryCompletionAchievements(),
        ...buildSessionMilestoneAchievements(),
        ...buildRandomGameFanAchievements(),
    ];
}

export default function init() {
    const achievementToasts = getAchievementToasts();

    const achievementList = createAchievementList(createPinballYHost(), getAllAchievements);
    getMainMenu().add({
        name: "achievementList",
        label: lang.achievementList.menuEntry,
        position: MAIN_MENU_POSITION.ACHIEVEMENT_LIST,
        action: achievementList.open,
    });
    // Achievements handed to the Achievement Toast module. They are not
    // Notified until their toast starts, so later checks find the waiting
    // ones again.
    const submittedIds = new Set();

    function checkForNewAchievements() {
        evaluateAchievements(getAllAchievements(), (achievement) => {
            if (submittedIds.has(achievement.id)) return;
            submittedIds.add(achievement.id);
            achievementToasts.submit({
                title: achievement.getTitle(),
                description: achievement.getDescription(),
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

    // Startup check: its toasts show alongside the startup prompt.
    checkForNewAchievements();
}
