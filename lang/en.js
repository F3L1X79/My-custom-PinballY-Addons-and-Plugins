// ============================================================
// English labels for UI elements added or translated by this project.
// ============================================================

export default {
    // Already in English natively.
    nativeMenuLabels: {},
    mediaCaptureItemLabels: {},
    mediaCaptureActionLabels: {},

    // Status text shown in PinballY's launch overlay, keyed by the
    // language-independent event id (see the "launchoverlaymessage" event).
    launchOverlayMessages: {
        "after": "",
        "capturing": "Capturing...",
        "gameover": "Game Over",
        "init": "",
        "launching": "Loading...",
        "running": "Launching table...",
        "terminating": "Returning to game list...",
    },

    // Functions that build translated titles for PinballY's dynamically
    // generated menu text (category names, star ratings, etc.).
    dynamicLabelBuilders: {
        captureInstructions: (seconds) => {
            const plural = seconds === "1" ? "" : "s";
            return `Select the items you'd like to capture, then select Begin Capture. This will launch your game, capture screen images, and automatically exit the game when done. The process will take about ${seconds} second${plural}. (!) means that an existing item will be replaced.`;
        },
        captureInstructionsOneMinute: () =>
            "Select the items you'd like to capture, then select Begin Capture. This will launch your game, capture screen images, and automatically exit the game when done. The process will take about 1 minute. (!) means that an existing item will be replaced.",
        captureItemAction: (item, action) => `${item}: ${action}`,
        decadeTables: (decade) => `${decade}s Tables`,
        genericTables: (name) => `${name} Tables`,
        mediaGameMismatchWarning: (draggedGame, currentGame) =>
            `It looks like some of the media files you're adding might be intended for a different game, "${draggedGame}". Media files are always added to the game selected on the wheel, currently "${currentGame}". Do you want to add these media items to the current game?`,
        mediaGameMismatchWarningMultiple: (gameList, currentGame) =>
            `It looks like some of the media files you're adding might be intended for other games: ${gameList}. Media files are always added to the game selected on the wheel, currently "${currentGame}". Do you want to add these media items to the current game?`,
        mediaReadyToAdd: (gameName) =>
            `The following media items are ready to be added for ${gameName}. Choose the items you'd like to add or replace.`,
        starTables: (count) => `${count}-Star Tables`,
        startDelay: (seconds) => `Adjust Start Delay (${seconds} sec)`,
        unratedTables: () => "Unrated Tables",
    },

    ratingPrompt: {
        message: (tableTitle, minutes) =>
            `You've played "${tableTitle}" for over ${minutes} minutes! Would you like to rate it now?`,
        rateNow: "Rate Now",
        notNow: "Not Now",
    },

    startupPrompt: {
        introWithPicks: (dayTitle, weekTitle) => {
            const lines = ["How would you like to start?"];
            if (dayTitle) lines.push(`Table of the Day: ${dayTitle}`);
            if (weekTitle) lines.push(`Table of the Week: ${weekTitle}`);
            return lines.join("\n");
        },
        stayOnLastPlayed: "Stay on Last Played Table",
        tableOfTheDay: "Launch Table of the Day",
        tableOfTheWeek: "Launch Table of the Week",
        randomTable: "Launch a Random Table",
    },

    // Lower status line text for the currently selected table.
    // [Filter.Count], [Game.Year], etc. are PinballY placeholders — keep them as-is.
    tableInfoStatusLines: {
        manufacturer: (position) => `Table ${position}/[Filter.Count] - made by [Game.Manuf].`,
        manufacturerFictional: (position) => `Table ${position}/[Filter.Count] - fictional pinball table.`,
        playCount: (position) => `Table ${position}/[Filter.Count] - launched [Game.PlayCount] times.`,
        playTime: (position) => `Table ${position}/[Filter.Count] - played for [Game.PlayTime].`,
        year: (position) => `Table ${position}/[Filter.Count] - released in [Game.Year].`,
    },

    // Labels for menu items this project adds itself (see custom_menu_commands.js).
    customMenuLabels: {
        originalTablesFilter: "Original Tables",
        randomGame: "Start Random Game",
        tableOfTheDay: "Launch Table of the Day",
        tableOfTheWeek: "Launch Table of the Week",
        tableSetup: "Table Setup",
    },

    achievements: {
        dailyStreakTitle: (days) => `${days}-Day Streak!`,
        dailyStreakDescription: (days) => `You've launched the table of the day ${days} days in a row!`,
        weeklyStreakTitle: (weeks) => `${weeks}-Week Streak!`,
        weeklyStreakDescription: (weeks) => `You've launched the table of the week ${weeks} weeks in a row!`,
        manufacturerCompletionTitle: (manufacturer) => `Full Collection: ${manufacturer}`,
        manufacturerCompletionDescription: (manufacturer, count) =>
            `You've played all ${count} ${manufacturer} tables at least once!`,
        firstTableTitle: () => "First Steps",
        firstTableDescription: () => "You've played your very first table!",
        collectionPercentTitle: (percent) => `${percent}% of the Collection`,
        collectionPercentDescription: (percent, playedCount, totalCount) =>
            `You've played ${playedCount} out of ${totalCount} tables (${percent}% of your collection)!`,
        playTimeMilestoneTitle: (hours) => `${hours}h Total Play Time`,
        playTimeMilestoneDescription: (hours) =>
            `You've racked up over ${hours} hour${hours > 1 ? "s" : ""} of total play time!`,
        decadeCompletionTitle: (decadeStartYear) => `Full Decade: ${decadeStartYear}s`,
        decadeCompletionDescription: (decadeStartYear, count) =>
            `You've played all ${count} tables from the ${decadeStartYear}s at least once!`,
        categoryCompletionTitle: (category) => `Full Category: ${category}`,
        categoryCompletionDescription: (category, count) => `You've played all ${count} "${category}" tables at least once!`,
        marathonTitle: (minutes) => `${minutes}-Minute Marathon!`,
        marathonDescription: (minutes) => `You played a single session lasting over ${minutes} minutes!`,
        rageQuitTitle: () => "Rage Quit?",
        rageQuitDescription: (seconds) => `You quit a table in under ${seconds} seconds...`,
        grandReturnTitle: () => "The Grand Comeback",
        grandReturnDescription: (days) => `You replayed a table after more than ${days} days away!`,
        unlockedIntro: (title, description) => `[Achievement Unlocked]\n\n${title}\n${description}`,
        acknowledge: "Awesome!",
    },

    // The Achievement List screen (see common/achievement_list.js).
    achievementList: {
        menuEntry: "Achievement List",
        totalLine: (unlockedCount, totalCount) => `Total: ${unlockedCount}/${totalCount}`,
        familyLine: (family, unlockedCount, totalCount) => `${family} (${unlockedCount}/${totalCount})`,
        back: "Back",
        cardMessage: (title, description, status) => `${title}\n${description}\n\n${status}`,
        unlocked: "Unlocked",
        notUnlocked: "Not unlocked yet",
        families: {
            collection: "Collection",
            playTime: "Play Time",
            streaks: "Streaks",
            sessions: "Sessions",
            manufacturers: "Manufacturers",
            decades: "Decades",
            categories: "Categories",
        },
    },
};