// ============================================================
// Picks a "table of the week": a PURELY random table (no never-played
// bias, unlike the table of the day), locked for the current calendar
// week (Monday to Sunday).
// ============================================================

import { createLockedPicker, pickPurelyRandom } from "./common/locked_random_pick.js";
import { getWeekKey } from "./common/period_keys.js";

export const pickTableOfTheWeek = createLockedPicker({
    settingsKeyPrefix: "custom.tableOfTheWeek",
    getPeriodKey: getWeekKey,
    pickNew: pickPurelyRandom,
});