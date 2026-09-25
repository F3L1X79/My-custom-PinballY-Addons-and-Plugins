// ============================================================
// Records the session stats of the Profile active when a game started, in
// the "sessions" part of its profile.json: longest / shortest session, a
// "rage quit" flag for a short session given up, a "grand return" flag for
// a table the Profile replays after a long break, and the Day's
// Manufacturers with their one-day record. Listens to "gamestarted" and
// "gameover"; these handlers are synchronous, so they always finish before
// achievements_engine's check, which is deferred with setTimeout(fn, 0).
// ============================================================

import { safeHandler } from "../common/safe_handler.js";
import { TABLE_OF_THE_DAY } from "../common/period_table.js";
import { getProfileStore } from "../common/profile_store.js";

// A session from RAGE_QUIT_MIN_SECONDS to under RAGE_QUIT_MAX_SECONDS sets
// the "rage quit" flag: long enough to have really played, short enough to
// have given up. Exported so the Achievement description shows the same values.
export const RAGE_QUIT_MIN_SECONDS = 30;
export const RAGE_QUIT_MAX_SECONDS = 60;
// Break (in days) after which replaying a table sets the "grand return" flag.
// Exported so the Achievement description shows the same value.
export const GRAND_RETURN_THRESHOLD_DAYS = 31;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SCRIPT_NAME = "SessionStatsTracker";

// Whether the manufacturer is missing from the Day's Manufacturers of
// "today" (the same calendar day as the Table of the Day's).
function isNewDayManufacturer(sessions, manufacturer, today) {
    if (!manufacturer) return false;
    return sessions.dayManufacturers.day !== today || !sessions.dayManufacturers.list.includes(manufacturer);
}

// Adds the manufacturer to today's Day's Manufacturers, starting a new set
// on a new calendar day, and keeps the one-day record up to date.
function addDayManufacturer(sessions, manufacturer, today) {
    const list = sessions.dayManufacturers.day === today ? sessions.dayManufacturers.list : [];
    sessions.dayManufacturers = { day: today, list: [...list, manufacturer] };
    sessions.mostManufacturersInADay = Math.max(sessions.mostManufacturersInADay, list.length + 1);
}

// Whether the Profile's own previous play of the table is at least
// GRAND_RETURN_THRESHOLD_DAYS old. The Profile store records a play at
// "gameover", so at "gamestarted" its lastPlayed is still the previous one.
function isGrandReturn(profileStore, configId) {
    const { lastPlayed } = profileStore.getPlay(configId);
    if (!lastPlayed) return false;
    return (Date.now() - new Date(lastPlayed).getTime()) / MS_PER_DAY >= GRAND_RETURN_THRESHOLD_DAYS;
}

export default function init() {
    const profileStore = getProfileStore();
    // The Profile active at "gamestarted" and when the game started, by table.
    const runningGames = new Map();

    // Fires on table launch: records the start, the Day's Manufacturers,
    // and flags a "grand return".
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        const { configId, manufacturer } = ev.game;
        const profileName = profileStore.getActiveProfile().name;
        runningGames.set(configId, { profileName, startMs: Date.now() });

        const activeSessions = profileStore.getProfileData().sessions;
        const today = TABLE_OF_THE_DAY.getPeriodKey(new Date());
        const newManufacturer = isNewDayManufacturer(activeSessions, manufacturer, today);
        const newGrandReturn = !activeSessions.grandReturn && isGrandReturn(profileStore, configId);
        // Saves only on a change: most launches change nothing.
        if (!newManufacturer && !newGrandReturn) return;
        profileStore.updateProfileData(({ sessions }) => {
            if (newManufacturer) addDayManufacturer(sessions, manufacturer, today);
            if (newGrandReturn) sessions.grandReturn = true;
        }, profileName);
    }));

    // Fires on table exit: stores the session duration and flags a
    // "rage quit", for the Profile active when the game started.
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, ev => {
        const running = runningGames.get(ev.game.configId);
        runningGames.delete(ev.game.configId);
        if (!running) return;

        const durationSeconds = (Date.now() - running.startMs) / 1000;
        profileStore.updateProfileData(({ sessions }) => {
            sessions.longestSeconds = Math.max(sessions.longestSeconds, durationSeconds);
            if (sessions.shortestSeconds === 0 || durationSeconds < sessions.shortestSeconds) {
                sessions.shortestSeconds = durationSeconds;
            }
            if (durationSeconds >= RAGE_QUIT_MIN_SECONDS && durationSeconds < RAGE_QUIT_MAX_SECONDS) {
                sessions.rageQuit = true;
            }
        }, running.profileName);
    }));
}
