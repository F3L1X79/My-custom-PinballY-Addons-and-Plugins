// ============================================================
// Entry point loaded by PinballY: loads the Profile store, then initializes
// every project script listed in SCRIPTS, in order, skipping those disabled
// in config.addOns.
// A script whose init() throws is logged to logfile.log and skipped so the
// others still load; LOG_STARTUP_TIMING logs each init time.
// ============================================================

import config from "./common/config.js";
import { getProfileStore } from "./common/profile_store.js";

// Logs each script's init duration (ms), to help find a slow-starting script.
const LOG_STARTUP_TIMING = true;

import * as uiTranslation from "./ui_translation.js";
import * as statusLineInfo from "./status_line_info.js";
import * as customMenuCommands from "./custom_menu_commands.js";
import * as customFilter from "./custom_filter.js";
import * as hallOfFame from "./hall_of_fame.js";
import * as seamlessLaunchOverlay from "./seamless_launch_overlay.js";
import * as forceBackglass from "./force_backglass.js";
import * as playLaunchSound from "./play_launch_sound.js";
import * as sessionStatsTracker from "./session_stats_tracker.js";
import * as achievementsEngine from "./achievements_engine.js";
import * as ratingPrompt from "./rating_prompt.js";
import * as startupChoicePrompt from "./startup_choice_prompt.js";

// Scripts are initialized in this order, which is also the order their event
// listeners are registered in, and listeners for the same event run in that
// order too:
// - uiTranslation must come first, so its "menuopen" hook is in place before
//   any menu opens.
// - sessionStatsTracker is kept before achievements as a safety margin; the
//   achievement checks after a game are deferred by one tick, so the stats
//   are recorded first either way (the startup check needs no stats from
//   this session).
// The other scripts don't depend on each other's order. In particular, the
// startup prompt and rating dialogs go through the wheel dialog module,
// which shows them in a fixed priority order, and Achievements are announced
// by non-blocking toasts.
const SCRIPTS = [
    // Interface: translations, status line, menus, filters, launch overlay.
    { key: "uiTranslation", module: uiTranslation },
    { key: "statusLineInfo", module: statusLineInfo },
    { key: "customMenuCommands", module: customMenuCommands },
    { key: "customFilter", module: customFilter },
    { key: "hallOfFame", module: hallOfFame },
    { key: "seamlessLaunchOverlay", module: seamlessLaunchOverlay },

    // Game session: windows, sound, stats, achievements, rating.
    { key: "forceBackglass", module: forceBackglass },
    { key: "playLaunchSound", module: playLaunchSound },
    { key: "sessionStatsTracker", module: sessionStatsTracker },
    { key: "achievements", module: achievementsEngine },
    { key: "ratingPrompt", module: ratingPrompt },

    // Startup dialog.
    { key: "startupChoicePrompt", module: startupChoicePrompt },
];

const ENABLED_SCRIPTS = config.addOns;

// Before any Add-on, and whatever Add-ons are on: the store records every
// play, and its "gameover" listener must run before the Add-ons' own.
try {
    getProfileStore();
} catch (error) {
    logfile.log(`[Startup] ERROR loading the Profiles: ${error.message}`);
}

for (const { key, module } of SCRIPTS) {
    if (ENABLED_SCRIPTS[key] === false) {
        if (LOG_STARTUP_TIMING) logfile.log(`[Startup] "${key}" skipped (disabled in config).`);
        continue;
    }

    const startTime = Date.now();
    try {
        module.default();
    } catch (error) {
        logfile.log(`[Startup] ERROR initializing "${key}": ${error.message}`);
        continue;
    }

    if (LOG_STARTUP_TIMING) {
        logfile.log(`[Startup] "${key}" initialized in ${Date.now() - startTime} ms.`);
    }
}