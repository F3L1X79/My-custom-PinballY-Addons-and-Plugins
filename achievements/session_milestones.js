// ============================================================
// Achievements based on session stats: "marathon" (longest single session),
// "rage quit" (a short session given up) and "grand return" (a table
// replayed after a long break). Reads the optionSettings values written by
// session_stats_tracker.js; writes nothing.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import {
    LONGEST_SESSION_KEY,
    RAGE_QUIT_FLAG_KEY,
    RAGE_QUIT_MIN_SECONDS,
    RAGE_QUIT_MAX_SECONDS,
    GRAND_RETURN_FLAG_KEY,
    GRAND_RETURN_THRESHOLD_DAYS,
} from "../session_stats_tracker.js";

// Each marathon value is part of an Achievement ID: changing one would
// announce the Achievement again to players who already earned it. Each
// one also needs its title in every lang/ file.
const MARATHON_THRESHOLDS_MINUTES = [30, 60];

export function buildSessionMilestoneAchievements() {
    const { achievements: TEXT } = lang;

    const achievements = MARATHON_THRESHOLDS_MINUTES.map(minutes => ({
        id: `marathon:${minutes}`,
        family: ACHIEVEMENT_FAMILY.SESSIONS,
        getTitle: () => TEXT.marathonTitles[minutes],
        getDescription: () => TEXT.marathonDescription(minutes),
        checkUnlocked: () => optionSettings.getFloat(LONGEST_SESSION_KEY, 0) >= minutes * 60,
    }));

    achievements.push({
        id: "rageQuit",
        family: ACHIEVEMENT_FAMILY.SESSIONS,
        getTitle: () => TEXT.rageQuitTitle(),
        getDescription: () => TEXT.rageQuitDescription(RAGE_QUIT_MIN_SECONDS, RAGE_QUIT_MAX_SECONDS),
        checkUnlocked: () => optionSettings.getBool(RAGE_QUIT_FLAG_KEY, false),
    });

    achievements.push({
        id: "grandReturn",
        family: ACHIEVEMENT_FAMILY.SESSIONS,
        getTitle: () => TEXT.grandReturnTitle(),
        getDescription: () => TEXT.grandReturnDescription(GRAND_RETURN_THRESHOLD_DAYS),
        checkUnlocked: () => optionSettings.getBool(GRAND_RETURN_FLAG_KEY, false),
    });

    return achievements;
}