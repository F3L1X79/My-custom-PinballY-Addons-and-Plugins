// ============================================================
// Adjustable settings for the PinballY scripts in this project.
// Edit values here rather than inside individual script files.
// ============================================================

export default {
    // main.js — toggle scripts on/off without touching main.js's imports,
    // and optionally log how long each script's init() takes at startup.
    scripts: {
        // Set any key to false to disable that script entirely.
        enabled: {
            uiTranslation: true,
            statusLineInfo: true,
            startupChoicePrompt: true,
            forceBackglass: true,
            customMenuCommands: true,
            customFilter: true,
            sessionStatsTracker: true,
            achievements: true,
            seamlessLaunchOverlay: true,
            playLaunchSound: true,
            ratingPrompt: true,
        },
        // Temporarily set to true to log each script's init duration (ms)
        // to the PinballY log file, to help find a slow-starting script.
        logStartupTiming: false,
    },

    // achievements/collection_completion.js et achievements/play_time_totals.js
    achievements: {
        // Percentages of the collection played at least once (in addition to
        // a separate "first table ever played" achievement).
        collectionPercentThresholds: [10, 25, 50, 75, 100],
        // Cumulative total play time thresholds, in hours.
        playTimeThresholdsHours: [1, 5, 10, 50, 100],
        marathonThresholdsMinutes: [30, 60],
        rageQuitThresholdSeconds: 30,
        grandReturnThresholdDays: 365,
    },
    
    // Shared language selection.
    // enabled=false forces English while keeping the same code paths.
    translation: {
        enabled: true,
        language: "fr",
    },

    // ui_translation.js
    menuTranslation: {
        // Logs any menu title encountered without a known translation.
        // Useful while discovering new strings; set back to false once stable.
        logUnknownTitles: false,
        // Menu scroll indicators to ignore silently (never logged as missing).
        ignoredScrollIndicators: ["\u2191", "\u2193"], // ↑ ↓
    },

    // status_line_info.js
    tableMetadata: {
        // Manufacturer name used in your game metadata to identify
        // fictional/community VPX tables (shows a different status message).
        communityManufacturerName: "VPX Community",
    },

    // common/random_game.js (used by the "Random Game" menu command in
    // custom_menu_commands.js and by the startup choice prompt)
    randomGameCommand: {
        // Base speed (ms) of the "wheel of fortune" animation.
        animationBaseSpeedMs: 200,
        // true = jump instantly to the chosen table, skipping the animation.
        skipAnimation: false,
        // Probability (0-1) of intentionally stopping one table before the target.
        skipFinalStepProbability: 0.5,
        // Use NextPage-based jumps for long distances.
        usePageJumpOptimization: true,
        // Delay after the wheel animation before launching the selected game.
        postAnimationDelayMs: 1000,
    },

    // rating_prompt.js
    ratingPrompt: {
        // Cumulative play time (in minutes) after which the game prompts to rate
        // a table, if it hasn't been rated yet.
        thresholdMinutes: 60,
    },

    // play_launch_sound.js
    launchSound: {
        // SET THIS FOR YOUR MACHINE: the one setting that depends on where
        // your files live. ABSOLUTE path to the sound file played when a table
        // launches, with doubled backslashes, e.g.
        // "C:\\PinballY\\Media\\Sounds\\launch.mp3". Left empty, no sound is
        // played (a single notice is written to the PinballY log at startup).
        absoluteFilePath: "",
        // Playback volume, 0-100.
        volumePercent: 100,
    },
};
