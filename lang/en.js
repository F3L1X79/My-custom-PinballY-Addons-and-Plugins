// ============================================================
// English labels for UI elements added or translated by this project.
// ============================================================

// The active Profile's play time of a table, as PinballY writes its own.
const formatPlayTime = (hours, minutes) => (hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")} hours`
    : `${minutes} minute${minutes === 1 ? "" : "s"}`);

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
        playCount: (position, count) => `Table ${position}/[Filter.Count] - launched ${count} times.`,
        playTime: (position, hours, minutes) => `Table ${position}/[Filter.Count] - played for ${formatPlayTime(hours, minutes)}.`,
        year: (position) => `Table ${position}/[Filter.Count] - released in [Game.Year].`,
    },

    // Labels for menu items this project adds itself (see custom_menu_commands.js, custom_filter.js and hall_of_fame.js).
    customMenuLabels: {
        hallOfFameFilter: "Hall of Fame",
        originalTablesFilter: "Original Tables",
        randomGame: "Start Random Game",
        tableOfTheDay: "Launch Table of the Day",
        tableOfTheWeek: "Launch Table of the Week",
        tableSetup: "Table Setup",
    },

    // Thresholded titles are keyed by their threshold, which is part of the
    // Achievement ID (see achievements/).
    achievements: {
        dailyFirstPlayTitle: () => "Hello, Table of the Day!",
        dailyFirstPlayDescription: () => "You've launched the table of the day for the first time!",
        weeklyFirstPlayTitle: () => "Weekly Date",
        weeklyFirstPlayDescription: () => "You've launched the table of the week for the first time!",
        dailyPeriodsPlayedTitles: {
            10: "Sunday Explorer",
            50: "Seasoned Explorer",
            100: "Indiana Flippers",
        },
        dailyPeriodsPlayedDescription: (days) => `You've launched the table of the day on ${days} days in total!`,
        weeklyPeriodsPlayedTitles: {
            10: "Weekly Regular",
            26: "Six Months of Loyalty",
            52: "A Year Without a Wrinkle",
        },
        weeklyPeriodsPlayedDescription: (weeks) => `You've launched the table of the week in ${weeks} weeks in total!`,
        dailyStreakTitles: {
            3: "Third Time's the Charm",
            7: "Perfect Week",
            30: "Pinball Monk",
        },
        dailyStreakDescription: (days) => `You've launched the table of the day ${days} days in a row!`,
        weeklyStreakTitles: {
            4: "A Flawless Month",
            12: "Loyal Subscriber",
        },
        weeklyStreakDescription: (weeks) => `You've launched the table of the week ${weeks} weeks in a row!`,
        manufacturerCompletionTitle: (manufacturer) => `Die-Hard ${manufacturer} Fan`,
        manufacturerCompletionDescription: (manufacturer, count) =>
            `You've played all ${count} ${manufacturer} tables at least once!`,
        firstTableTitle: () => "First Steps",
        firstTableDescription: () => "You've played your very first table!",
        collectionPercentTitles: {
            10: "A Taste of Metal",
            25: "Budding Collector",
            50: "Halftime",
            75: "Seen Almost Everything",
            100: "Nothing Escapes Me",
        },
        collectionPercentDescription: (percent, playedCount, totalCount) =>
            `You've played ${playedCount} out of ${totalCount} tables (${percent}% of your collection)!`,
        playTimeMilestoneTitles: {
            1: "Warming Up",
            5: "Getting Serious",
            10: "Hooked on Pinball",
            50: "Pinball in the Blood",
            100: "Tilt Legend",
        },
        playTimeMilestoneDescription: (hours) =>
            `You've racked up over ${hours} hour${hours > 1 ? "s" : ""} of total play time!`,
        decadeCompletionTitle: (decadeStartYear) => `A Trip Back to the ${decadeStartYear}s`,
        decadeCompletionDescription: (decadeStartYear, count) =>
            `You've played all ${count} tables from the ${decadeStartYear}s at least once!`,
        categoryCompletionTitle: (category) => `${category} Master`,
        categoryCompletionDescription: (category, count) => `You've played all ${count} "${category}" tables at least once!`,
        marathonTitles: {
            30: "Mini Marathon",
            60: "Marathoner",
        },
        marathonDescription: (minutes) => `You played a single session lasting over ${minutes} minutes!`,
        rageQuitTitle: () => "Rage Quit?!",
        rageQuitDescription: (minSeconds, maxSeconds) => `You quit a table after only ${minSeconds} to ${maxSeconds} seconds...`,
        grandReturnTitle: () => "The Grand Comeback",
        grandReturnDescription: (days) => `You replayed a table after ${days} or more days away!`,
        randomGamesTitles: {
            10: "Why Not?",
            50: "Dice Roller",
            100: "I Looooove Chance",
        },
        randomGamesDescription: (count) => `You've played ${count} Random Games!`,
        dayManufacturersTitles: {
            3: "Express World Tour",
            5: "Pinball Butterfly",
            8: "Serial Unfaithful",
        },
        dayManufacturersDescription: (count) => `You've played tables from ${count} different manufacturers on the same day!`,
        // Header of the Achievement Toast card.
        toastHeader: "Achievement unlocked",
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
            periodTables: "Tables of the Day and Week",
            sessions: "Sessions",
            randomGame: "Random Game",
            manufacturers: "Manufacturers",
            decades: "Decades",
            categories: "Categories",
        },
    },
};