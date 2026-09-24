// ============================================================
// Manufacturers family: Achievements for tables of 3, 5 and 8 different
// manufacturers played on the same calendar day. Reads the one-day record
// kept by session_stats_tracker.js; writes nothing.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";
import { MOST_MANUFACTURERS_IN_A_DAY_KEY } from "../session_stats_tracker.js";

// Each value is part of an Achievement ID: changing one would announce the
// Achievement again to players who already earned it. Each one also needs
// its title in every lang/ file.
const DAY_MANUFACTURERS_THRESHOLDS = [3, 5, 8];

export function buildDayManufacturersAchievements() {
    const { achievements: TEXT } = lang;

    return DAY_MANUFACTURERS_THRESHOLDS.map(count => ({
        id: `dayManufacturers:${count}`,
        family: ACHIEVEMENT_FAMILY.MANUFACTURERS,
        getTitle: () => TEXT.dayManufacturersTitles[count],
        getDescription: () => TEXT.dayManufacturersDescription(count),
        checkUnlocked: () => optionSettings.getInt(MOST_MANUFACTURERS_IN_A_DAY_KEY, 0) >= count,
    }));
}
