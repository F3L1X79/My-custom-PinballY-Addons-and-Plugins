// ============================================================
// Pinning test: starts the add-ons through main.js on the fake PinballY
// globals, plays a scripted session on a fixture collection, and locks the
// exact settings keys written (Period Table locks, Streaks, Periods Played,
// Random Games played, Day's Manufacturers, Notified flags, session stats)
// and every Achievement ID produced. These strings are players' saved
// progress: this test must keep passing unchanged.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

// Wednesday 23 September 2026, 10:00 local time: its week starts Monday 21.
const NOW = new Date(2026, 8, 23, 10, 0, 0);
const SECONDS_PER_HOUR = 3600;

const TABLES = [
    {
        id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness (Williams 1997)",
        manufacturer: "Williams", year: 1997, categories: ["Fantasy"],
        playCount: 5, playTime: 60 * SECONDS_PER_HOUR, lastPlayed: new Date(2025, 0, 1), rating: 4, isHidden: false,
    },
    {
        id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars (Bally 1995)",
        manufacturer: "Bally", year: 1995, categories: ["SciFi", "Classic"],
        playCount: 3, playTime: 50 * SECONDS_PER_HOUR, lastPlayed: new Date(2026, 5, 1), rating: 5, isHidden: false,
    },
    {
        id: 3, configId: "Space Trip (VPX Community 2021)", title: "Space Trip (VPX Community 2021)",
        manufacturer: "VPX Community", year: 2021, categories: [],
        playCount: 1, playTime: 100, lastPlayed: new Date(2026, 7, 1), rating: 3, isHidden: false,
    },
    {
        id: 4, configId: "Homebrew Table", title: "Homebrew Table",
        manufacturer: "", year: 0, categories: [],
        playCount: 2, playTime: 200, lastPlayed: new Date(2026, 8, 1), rating: 2, isHidden: false,
    },
    // Hidden: must produce no Gottlieb, 1970s or "Retro" achievement.
    {
        id: 5, configId: "Hidden Table (Gottlieb 1978)", title: "Hidden Table (Gottlieb 1978)",
        manufacturer: "Gottlieb", year: 1978, categories: ["Retro"],
        playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: true,
    },
];

const EXPECTED_ACHIEVEMENT_IDS = [
    "categoryCompletion:Classic",
    "categoryCompletion:Fantasy",
    "categoryCompletion:SciFi",
    "collectionMilestone:100percent",
    "collectionMilestone:10percent",
    "collectionMilestone:25percent",
    "collectionMilestone:50percent",
    "collectionMilestone:75percent",
    "collectionMilestone:firstTable",
    "dayManufacturers:3",
    "dayManufacturers:5",
    "dayManufacturers:8",
    "decadeCompletion:1990s",
    "decadeCompletion:2020s",
    "grandReturn",
    "manufacturerCompletion:Bally",
    "manufacturerCompletion:VPX Community",
    "manufacturerCompletion:Williams",
    "marathon:30",
    "marathon:60",
    "playTimeMilestone:100h",
    "playTimeMilestone:10h",
    "playTimeMilestone:1h",
    "playTimeMilestone:50h",
    "playTimeMilestone:5h",
    "rageQuit",
    "randomGames:10",
    "randomGames:100",
    "randomGames:50",
    "tableOfTheDayFirstPlay",
    "tableOfTheDayPeriodsPlayed:10",
    "tableOfTheDayPeriodsPlayed:100",
    "tableOfTheDayPeriodsPlayed:50",
    "tableOfTheDayStreak:3",
    "tableOfTheDayStreak:30",
    "tableOfTheDayStreak:7",
    "tableOfTheWeekFirstPlay",
    "tableOfTheWeekPeriodsPlayed:10",
    "tableOfTheWeekPeriodsPlayed:26",
    "tableOfTheWeekPeriodsPlayed:52",
    "tableOfTheWeekStreak:12",
    "tableOfTheWeekStreak:4",
];

const EXPECTED_FIXED_KEYS = [
    "custom.randomGame.launchCount",
    "custom.sessionStats.dayManufacturers.day",
    "custom.sessionStats.dayManufacturers.list",
    "custom.sessionStats.grandReturnUnlocked",
    "custom.sessionStats.longestSeconds",
    "custom.sessionStats.mostManufacturersInADay",
    "custom.sessionStats.rageQuitUnlocked",
    "custom.sessionStats.shortestSeconds",
    "custom.streaks.tableOfTheDay.currentStreak",
    "custom.streaks.tableOfTheDay.lastPeriod",
    "custom.streaks.tableOfTheDay.longestStreak",
    "custom.streaks.tableOfTheDay.periodsPlayed",
    "custom.streaks.tableOfTheWeek.currentStreak",
    "custom.streaks.tableOfTheWeek.lastPeriod",
    "custom.streaks.tableOfTheWeek.longestStreak",
    "custom.streaks.tableOfTheWeek.periodsPlayed",
    "custom.tableOfTheDay.configId",
    "custom.tableOfTheDay.period",
    "custom.tableOfTheWeek.configId",
    "custom.tableOfTheWeek.period",
];

const NOTIFIED_KEY_PREFIX = "custom.achievements.notified.";
const PREVIOUS_PLAY_KEY_PREFIX = "custom.sessionStats.previousPlay.";
// Enough for every waiting Achievement Toast to show, one after the other.
const TOASTS_MS = 60 * 60 * 1000;

// The add-ons involved in persisted data; the others would need more
// PinballY globals and write nothing that is pinned here.
const ADD_ONS_UNDER_TEST = ["customMenuCommands", "sessionStatsTracker", "achievements", "ratingPrompt", "startupChoicePrompt"];

// Fixed here so the pinned IDs don't depend on the player's configuration;
// changing the shared config object is safe since each test file runs in
// its own process.
function useFixtureConfig() {
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ADD_ONS_UNDER_TEST.includes(key);
    }
    config.language = "en";
    // The fake has no wheel buttons to animate.
    config.skipRandomGameAnimation = true;
}

async function playLastLaunch(fake, durationSeconds) {
    const launches = fake.launches();
    const game = launches[launches.length - 1];
    fake.gameStarted(game);
    await settle();
    fake.advanceTime(durationSeconds * 1000);
    fake.gameOver(game);
    await settle();
    return game;
}

async function closeEveryDialog(fake) {
    for (let guard = 0; fake.currentMenu() && guard < 100; guard++) {
        fake.closeMenu();
        await settle();
    }
    assert.equal(fake.currentMenu(), null, "dialogs kept opening");
}

test("persisted settings keys and Achievement IDs stay byte-identical", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    fake.seedSettings({
        // One Period short of the longest Streak and Periods Played Achievements.
        "custom.streaks.tableOfTheDay.lastPeriod": "2026-09-22",
        "custom.streaks.tableOfTheDay.currentStreak": 29,
        "custom.streaks.tableOfTheDay.longestStreak": 29,
        "custom.streaks.tableOfTheDay.periodsPlayed": 99,
        "custom.streaks.tableOfTheWeek.lastPeriod": "2026-09-14",
        "custom.streaks.tableOfTheWeek.currentStreak": 11,
        "custom.streaks.tableOfTheWeek.longestStreak": 11,
        "custom.streaks.tableOfTheWeek.periodsPlayed": 51,
        // One Random Game short of the last Random Game fan Achievement.
        "custom.randomGame.launchCount": 99,
        // Seven manufacturers outside the collection already played today:
        // any manufacturer played next unlocks the last multi-manufacturer
        // Achievement.
        "custom.sessionStats.dayManufacturers.day": "2026-09-23",
        "custom.sessionStats.dayManufacturers.list": JSON.stringify(["A", "B", "C", "D", "E", "F", "G"]),
        "custom.sessionStats.mostManufacturersInADay": 7,
        // Every table last played two years ago, for the grand return.
        ...Object.fromEntries(TABLES.map(table =>
            [PREVIOUS_PLAY_KEY_PREFIX + table.configId, new Date(2024, 8, 1).toISOString()])),
    });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();

    useFixtureConfig();
    const { default: lang } = await import("../common/i18n.js");
    await import("../main.js");
    await settle();

    // Startup prompt: launch the Table of the Day, play a long session, and
    // close every dialog (the rating prompt).
    fake.selectMenuItem(lang.startupPrompt.tableOfTheDay);
    await settle();
    const dayTable = await playLastLaunch(fake, 61 * 60);
    await closeEveryDialog(fake);

    // Main menu: launch the Table of the Week and give up after 45 seconds.
    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(lang.customMenuLabels.tableOfTheWeek);
    await settle();
    const weekTable = await playLastLaunch(fake, 45);
    await closeEveryDialog(fake);

    // Main menu again: a Random Game.
    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(lang.customMenuLabels.randomGame);
    await settle();
    const randomTable = await playLastLaunch(fake, 3);
    await closeEveryDialog(fake);

    // Achievements are Notified when their toast starts, one toast after the other.
    fake.advanceTime(TOASTS_MS);

    const writtenKeys = [...fake.writtenSettingsKeys()];

    const notifiedIds = writtenKeys
        .filter(key => key.startsWith(NOTIFIED_KEY_PREFIX))
        .map(key => key.slice(NOTIFIED_KEY_PREFIX.length))
        .sort();
    assert.deepEqual(notifiedIds, EXPECTED_ACHIEVEMENT_IDS);

    const expectedPreviousPlayKeys = [...new Set([dayTable.configId, weekTable.configId, randomTable.configId])]
        .map(configId => PREVIOUS_PLAY_KEY_PREFIX + configId);
    const otherKeys = writtenKeys.filter(key => !key.startsWith(NOTIFIED_KEY_PREFIX)).sort();
    assert.deepEqual(otherKeys, [...EXPECTED_FIXED_KEYS, ...expectedPreviousPlayKeys].sort());

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
