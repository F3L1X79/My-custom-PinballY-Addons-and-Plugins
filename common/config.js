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
        logStartupTiming: true,
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

    // random_table_at_startup.js
    startupWheelSpin: {
        // Delay (ms) between each wheel step during the startup spin.
        stepDelayMs: 40,
    },

    // custom_menu_commands.js
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
        // ABSOLUTE path to the mp3 file played when a table launches.
        absoluteFilePath: "C:\\vPinball\\PinballY\\Media\\Sounds\\super-mario-64-voice-clip-here-we-go.mp3",
        // Playback volume, 0-100.
        volumePercent: 100,
    },
};
