// ============================================================
// Period Table module: picks a table once per Period and keeps it for the
// whole Period, launches it, and keeps its Streak. Created from the PinballY
// host and a Period definition (TABLE_OF_THE_DAY, TABLE_OF_THE_WEEK); the
// add-ons share one instance of each through getTableOfTheDay() and
// getTableOfTheWeek(). A Period counts in the Streak when its table starts
// playing ("gamestarted"), however it was launched. Writes
// "<tableKeyPrefix>.period" / ".configId" and
// "<streakKeyPrefix>.lastPeriod" / ".currentStreak" / ".longestStreak".
// ============================================================

import { safeHandler } from "./safe_handler.js";
import { createPinballYHost } from "./pinbally_host.js";

const SCRIPT_NAME = "PeriodTable";

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return formatDateKey(new Date(year, month - 1, day + days));
}

// A week runs Monday to Sunday and is keyed by its Monday's date.
function getWeekKey(date) {
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return formatDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday));
}

function pickPurelyRandom(tables) {
    return tables[Math.floor(Math.random() * tables.length)];
}

function pickNeverPlayedOrOldest(tables) {
    const neverPlayed = tables.filter(game => !game.lastPlayed);
    if (neverPlayed.length > 0) {
        return pickPurelyRandom(neverPlayed);
    }

    return tables.reduce((oldest, game) =>
        game.lastPlayed < oldest.lastPlayed ? game : oldest
    );
}

// The key strings are players' saved progress: they must never change.
export const TABLE_OF_THE_DAY = {
    tableKeyPrefix: "custom.tableOfTheDay",
    streakKeyPrefix: "custom.streaks.tableOfTheDay",
    getPeriodKey: formatDateKey,
    getPreviousPeriodKey: dayKey => shiftDateKey(dayKey, -1),
    pickTable: pickNeverPlayedOrOldest,
};

export const TABLE_OF_THE_WEEK = {
    tableKeyPrefix: "custom.tableOfTheWeek",
    streakKeyPrefix: "custom.streaks.tableOfTheWeek",
    getPeriodKey: getWeekKey,
    getPreviousPeriodKey: weekKey => shiftDateKey(weekKey, -7),
    pickTable: pickPurelyRandom,
};

export function createPeriodTable(host, definition) {
    const { tableKeyPrefix, streakKeyPrefix, getPeriodKey, getPreviousPeriodKey, pickTable } = definition;
    const lockedPeriodKey = `${tableKeyPrefix}.period`;
    const lockedConfigIdKey = `${tableKeyPrefix}.configId`;
    const lastPeriodKey = `${streakKeyPrefix}.lastPeriod`;
    const currentStreakKey = `${streakKeyPrefix}.currentStreak`;
    const longestStreakKey = `${streakKeyPrefix}.longestStreak`;

    function getTable() {
        const currentPeriod = getPeriodKey(host.now());
        const lockedPeriod = host.settings.getString(lockedPeriodKey, "");
        const lockedConfigId = host.settings.getString(lockedConfigIdKey, "");

        if (lockedPeriod === currentPeriod && lockedConfigId) {
            const lockedGame = host.getGameInfo(lockedConfigId);
            if (lockedGame && !lockedGame.isHidden) return lockedGame;
        }

        // A new Period never repeats the previous Period's table, unless it
        // is the only visible one.
        const excludeConfigId = lockedPeriod !== currentPeriod ? lockedConfigId : "";
        const visibleTables = host.getVisibleTables();
        if (visibleTables.length === 0) return null;
        const otherTables = visibleTables.filter(game => game.configId !== excludeConfigId);
        const newPick = pickTable(otherTables.length > 0 ? otherTables : visibleTables);

        host.settings.set(lockedPeriodKey, currentPeriod);
        host.settings.set(lockedConfigIdKey, newPick.configId);
        return newPick;
    }

    function launch() {
        const game = getTable();
        if (game) host.playGame(game);
    }

    function recordPeriodPlayed(currentPeriod) {
        const lastPeriod = host.settings.getString(lastPeriodKey, "");
        if (lastPeriod === currentPeriod) return;

        const currentStreak = host.settings.getInt(currentStreakKey, 0);
        const newStreak = lastPeriod === getPreviousPeriodKey(currentPeriod) ? currentStreak + 1 : 1;
        const longestStreak = host.settings.getInt(longestStreakKey, 0);

        host.settings.set(lastPeriodKey, currentPeriod);
        host.settings.set(currentStreakKey, newStreak);
        host.settings.set(longestStreakKey, Math.max(longestStreak, newStreak));
    }

    function getStreak() {
        const currentPeriod = getPeriodKey(host.now());
        const lastPeriod = host.settings.getString(lastPeriodKey, "");

        // The stored counter is only reset on the next play, so a Streak whose
        // last Period is older than the previous one is already broken.
        if (lastPeriod !== currentPeriod && lastPeriod !== getPreviousPeriodKey(currentPeriod)) return 0;
        return host.settings.getInt(currentStreakKey, 0);
    }

    // Fires when a launched table's first window opens (never after a failed
    // launch). Picks this Period's table if nobody asked for it yet (e.g.
    // PinballY left open past midnight), so a table picked by hand on the
    // wheel is compared with this Period's table, never a stale pick.
    host.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        const periodTable = getTable();
        if (!ev.game || !periodTable || ev.game.configId !== periodTable.configId) return;
        recordPeriodPlayed(getPeriodKey(host.now()));
    }));

    return { getTable, launch, getStreak };
}

let sharedTableOfTheDay = null;
let sharedTableOfTheWeek = null;

// One instance of each for every add-on, so the Streak is recorded once per
// play and the startup prompt, the main menu and the achievements agree.
// The first call starts listening for plays, so the Streak is only recorded
// while at least one of those add-ons is enabled.
export function getTableOfTheDay() {
    if (!sharedTableOfTheDay) sharedTableOfTheDay = createPeriodTable(createPinballYHost(), TABLE_OF_THE_DAY);
    return sharedTableOfTheDay;
}

export function getTableOfTheWeek() {
    if (!sharedTableOfTheWeek) sharedTableOfTheWeek = createPeriodTable(createPinballYHost(), TABLE_OF_THE_WEEK);
    return sharedTableOfTheWeek;
}
