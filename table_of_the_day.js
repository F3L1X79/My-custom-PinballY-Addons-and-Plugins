// ============================================================
// Picks the "table of the day": a random never-played table, or else the one
// played longest ago, locked for the current calendar day in optionSettings
// ("custom.tableOfTheDay.*", see createLockedPicker).
// ============================================================

import { createLockedPicker, pickNeverPlayedOrOldest } from "./common/locked_random_pick.js";
import { getTodayKey } from "./common/period_keys.js";

export const pickTableOfTheDay = createLockedPicker({
    settingsKeyPrefix: "custom.tableOfTheDay",
    getPeriodKey: getTodayKey,
    pickNew: pickNeverPlayedOrOldest,
});

