// ============================================================
// Achievements based on session stats: "marathon" (longest single session),
// "rage quit" (a short session given up) and "grand return" (a table
// replayed after a long break). Reads the active Profile's session stats,
// recorded by session_stats_tracker.js; writes nothing.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { getProfileStore } from "../common/profile_store.js";
import {
    RAGE_QUIT_MIN_SECONDS,
    RAGE_QUIT_MAX_SECONDS,
    GRAND_RETURN_THRESHOLD_DAYS,
} from "../addons/session_stats_tracker.js";

// Each marathon value is part of an Achievement ID: changing one would
// announce the Achievement again to players who already earned it. Each
// one also needs its title in every lang/ file.
const MARATHON_THRESHOLDS_MINUTES = [30, 60];

const activeSessions = () => getProfileStore().getProfileData().sessions;

export function buildSessionMilestoneAchievements() {
    const { achievements: TEXT } = lang;

    const achievements = MARATHON_THRESHOLDS_MINUTES.map(minutes => ({
        id: `marathon:${minutes}`,
        family: ACHIEVEMENT_FAMILY.SESSIONS,
        getTitle: () => TEXT.marathonTitles[minutes],
        getDescription: () => TEXT.marathonDescription(minutes),
        checkUnlocked: () => activeSessions().longestSeconds >= minutes * 60,
    }));

    achievements.push({
        id: "rageQuit",
        family: ACHIEVEMENT_FAMILY.SESSIONS,
        getTitle: () => TEXT.rageQuitTitle(),
        getDescription: () => TEXT.rageQuitDescription(RAGE_QUIT_MIN_SECONDS, RAGE_QUIT_MAX_SECONDS),
        checkUnlocked: () => activeSessions().rageQuit,
    });

    achievements.push({
        id: "grandReturn",
        family: ACHIEVEMENT_FAMILY.SESSIONS,
        getTitle: () => TEXT.grandReturnTitle(),
        getDescription: () => TEXT.grandReturnDescription(GRAND_RETURN_THRESHOLD_DAYS),
        checkUnlocked: () => activeSessions().grandReturn,
    });

    return achievements;
}