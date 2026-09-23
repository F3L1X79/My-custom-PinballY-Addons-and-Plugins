import config from "../common/config.js";
import lang from "../common/i18n.js";
import { LONGEST_SESSION_KEY, SHORTEST_SESSION_KEY, GRAND_RETURN_FLAG_KEY } from "../common/session_stats_tracker.js";

/**
 * Builds the marathon, rage-quit and grand-return achievements from the
 * session stats recorded by common/session_stats_tracker.js.
 * @returns {object[]} Achievement objects ({ id, getTitle, getDescription, checkUnlocked }).
 */
export function buildSessionMilestoneAchievements() {
    const { achievements: TEXT } = lang;
    const { marathonThresholdsMinutes, rageQuitThresholdSeconds, grandReturnThresholdDays } = config.achievements;

    const achievements = marathonThresholdsMinutes.map(minutes => ({
        id: `marathon:${minutes}`,
        getTitle: () => TEXT.marathonTitle(minutes),
        getDescription: () => TEXT.marathonDescription(minutes),
        checkUnlocked: () => optionSettings.get(LONGEST_SESSION_KEY, 0) >= minutes * 60,
    }));

    achievements.push({
        id: "rageQuit",
        getTitle: () => TEXT.rageQuitTitle(),
        getDescription: () => TEXT.rageQuitDescription(rageQuitThresholdSeconds),
        checkUnlocked: () => {
            const shortest = optionSettings.get(SHORTEST_SESSION_KEY, -1);
            return shortest >= 0 && shortest <= rageQuitThresholdSeconds;
        },
    });

    achievements.push({
        id: "grandReturn",
        getTitle: () => TEXT.grandReturnTitle(),
        getDescription: () => TEXT.grandReturnDescription(grandReturnThresholdDays),
        checkUnlocked: () => optionSettings.get(GRAND_RETURN_FLAG_KEY, false),
    });

    return achievements;
}