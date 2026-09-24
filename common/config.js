// ============================================================
// Adjustable settings for the PinballY scripts in this project.
// Edit values here rather than inside individual script files.
// ============================================================

export default {
    // main.js — toggle scripts on/off without touching main.js's imports.
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
    },

    // Shared language selection.
    // enabled=false forces English while keeping the same code paths.
    translation: {
        enabled: true,
        language: "fr",
    },

    // status_line_info.js and custom_filter.js
    tableMetadata: {
        // Manufacturer name used in your game metadata to identify
        // fictional/community VPX tables (shows a different status message).
        communityManufacturerName: "VPX Community",
    },

    // common/random_game.js (used by the "Random Game" menu command in
    // custom_menu_commands.js and by the startup choice prompt)
    randomGameCommand: {
        // true = jump instantly to the chosen table, skipping the animation.
        skipAnimation: false,
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
        absoluteFilePath: "C:\\vPinball\\PinballY\\Media\\Sounds\\super-mario-64-voice-clip-here-we-go.mp3",
    },
};
