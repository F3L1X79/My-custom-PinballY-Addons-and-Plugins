// ============================================================
// Entry point loaded by PinballY: initializes every project script listed in
// SCRIPTS, in order, skipping those disabled in config.scripts.enabled.
// A script whose init() throws is logged to logfile.log and skipped so the
// others still load; config.scripts.logStartupTiming logs each init time.
// ============================================================

import config from "./common/config.js";

import * as uiTranslation from "./ui_translation.js";
import * as statusLineInfo from "./status_line_info.js";
import * as startupChoicePrompt from "./startup_choice_prompt.js";
import * as forceBackglass from "./force_backglass.js";
import * as customMenuCommands from "./custom_menu_commands.js";
import * as customFilter from "./custom_filter.js";
import * as sessionStatsTracker from "./common/session_stats_tracker.js";
import * as achievementsEngine from "./achievements_engine.js";
import * as seamlessLaunchOverlay from "./seamless_launch_overlay.js";
import * as playLaunchSound from "./play_launch_sound.js";
import * as ratingPrompt from "./rating_prompt.js";

// Scripts are initialized in this order, which is also the order their event
// listeners are registered in: keep a script ahead of the ones that rely on it
// (e.g. uiTranslation first so its "menuopen" hook sees every menu).
const SCRIPTS = [
    { key: "uiTranslation", module: uiTranslation },
    { key: "statusLineInfo", module: statusLineInfo },
    { key: "startupChoicePrompt", module: startupChoicePrompt },
    { key: "forceBackglass", module: forceBackglass },
    { key: "customMenuCommands", module: customMenuCommands },
    { key: "customFilter", module: customFilter },
    { key: "sessionStatsTracker", module: sessionStatsTracker },
    { key: "achievements", module: achievementsEngine },
    { key: "seamlessLaunchOverlay", module: seamlessLaunchOverlay },
    { key: "playLaunchSound", module: playLaunchSound },
    { key: "ratingPrompt", module: ratingPrompt },
];

const { enabled: ENABLED_SCRIPTS, logStartupTiming: LOG_STARTUP_TIMING } = config.scripts;

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