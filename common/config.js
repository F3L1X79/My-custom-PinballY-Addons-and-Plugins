// ============================================================
// Player settings for the PinballY scripts in this project.
// Edit values here rather than inside individual script files.
// ============================================================

export default {
    // --- Set these for your setup ---

    // Interface language: "en", "fr", "de", "es", "it" or "pt".
    language: "fr",
    // ABSOLUTE path to the sound played when a table launches, with doubled
    // backslashes, e.g. "C:\\PinballY\\Media\\Sounds\\launch.mp3".
    // Leave empty ("") for no sound.
    launchSoundFile: "C:\\vPinball\\PinballY\\Media\\Sounds\\super-mario-64-voice-clip-here-we-go.mp3",
    // Manufacturer name you gave fictional/community VPX tables in PinballY.
    // Used by the status line and the "Original Tables" filter.
    communityTablesManufacturer: "VPX Community",

    // --- Optional preferences ---

    // true = the random game jumps straight to the table, without the wheel animation.
    skipRandomGameAnimation: false,
    // Total play time (in minutes) on a table before you're asked to rate it.
    askToRateAfterMinutesPlayed: 60,

    // --- Add-ons ---

    // Set any Add-on to false to keep it from starting.
    addOns: {
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
};
