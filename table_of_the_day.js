// ============================================================
// Picks a "table of the day", locked for the current calendar day (see
// createLockedPicker for the locking mechanism).
// ============================================================

import { createLockedPicker, pickNeverPlayedOrOldest } from "./common/locked_random_pick.js";
import { getTodayKey } from "./common/period_keys.js";

export const pickTableOfTheDay = createLockedPicker({
    settingsKeyPrefix: "custom.tableOfTheDay",
    getPeriodKey: getTodayKey,
    pickNew: pickNeverPlayedOrOldest,
});

