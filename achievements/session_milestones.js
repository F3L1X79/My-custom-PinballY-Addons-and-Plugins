// ============================================================
// Achievements based on session stats: "marathon" (longest single session),
// "rage quit" (shortest session) and "grand return" (a table replayed after
// a long break). Reads the optionSettings values written by
// session_stats_tracker.js; writes nothing.
// ============================================================

import config from "../common/config.js";
import lang from "../common/i18n.js";
import { LONGEST_SESSION_KEY, SHORTEST_SESSION_KEY, GRAND_RETURN_FLAG_KEY } from "../session_stats_tracker.js";

export function buildSessionMilestoneAchievements() {
    const { achievements: TEXT } = lang;
    const { marathonThresholdsMinutes, rageQuitThresholdSeconds, grandReturnThresholdDays } = config.achievements;

    const achievements = marathonThresholdsMinutes.map(minutes => ({
        id: `marathon:${minutes}`,
        getTitle: () => TEXT.marathonTitle(minutes),
        getDescription: () => TEXT.marathonDescription(minutes),
        checkUnlocked: () => optionSettings.getFloat(LONGEST_SESSION_KEY, 0) >= minutes * 60,
    }));

    achievements.push({
        id: "rageQuit",
        getTitle: () => TEXT.rageQuitTitle(),
        getDescription: () => TEXT.rageQuitDescription(rageQuitThresholdSeconds),
        checkUnlocked: () => {
            const shortest = optionSettings.getFloat(SHORTEST_SESSION_KEY, -1);
            return shortest >= 0 && shortest <= rageQuitThresholdSeconds;
        },
    });

    achievements.push({
        id: "grandReturn",
        getTitle: () => TEXT.grandReturnTitle(),
        getDescription: () => TEXT.grandReturnDescription(grandReturnThresholdDays),
        checkUnlocked: () => optionSettings.getBool(GRAND_RETURN_FLAG_KEY, false),
    });

    return achievements;
}