// ============================================================
// Pinning test: starts the add-ons through main.js on the fake PinballY
// globals, plays a scripted session on a fixture collection, and locks the
// exact settings keys written (Random Games played), every Achievement ID
// produced, and the Guest profile.json (play record, Streaks and Periods
// Played, session stats and Notified list) and cabinet.json (active
// Profile, Period Table locks) written by the Profile store. These
// strings are players' saved progress: this test must keep passing
// unchanged.
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
];

// Enough for every waiting Achievement Toast to show, one after the other.
const TOASTS_MS = 60 * 60 * 1000;
const PROFILES_FOLDER = "C:\\PinballY\\Scripts\\profiles";
const GUEST_PROFILE_FILE = `${PROFILES_FOLDER}\\guest\\profile.json`;
// Guest's play record before the session matches PinballY's play counts and
// play times of the visible tables, so every completion and play-time
// Achievement is in reach, but every table was last played two years ago,
// for the grand return (in the Profile store's local time format).
const SEEDED_PLAYS = Object.fromEntries(TABLES.filter(table => !table.isHidden).map(table =>
    [table.configId, { count: table.playCount, seconds: table.playTime, lastPlayed: "2024-09-01T20:00:00" }]));
// Seven manufacturers outside the collection already played today: any
// manufacturer played next unlocks the last multi-manufacturer Achievement.
const SEEDED_DAY_MANUFACTURERS = ["A", "B", "C", "D", "E", "F", "G"];
const SEEDED_SESSIONS = {
    longestSeconds: 0, shortestSeconds: 0, rageQuit: false, grandReturn: false,
    dayManufacturers: { day: "2026-09-23", list: SEEDED_DAY_MANUFACTURERS }, mostManufacturersInADay: 7,
};

// One Period short of the longest Streak and Periods Played Achievements.
const SEEDED_STREAKS = {
    tableOfTheDay: { current: 29, longest: 29, lastPeriod: "2026-09-22", periodsPlayed: 99 },
    tableOfTheWeek: { current: 11, longest: 11, lastPeriod: "2026-09-14", periodsPlayed: 51 },
};

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
        // One Random Game short of the last Random Game fan Achievement.
        "custom.randomGame.launchCount": 99,
    });
    fake.addFile(GUEST_PROFILE_FILE, JSON.stringify({
        version: 1, plays: SEEDED_PLAYS, streaks: SEEDED_STREAKS, sessions: SEEDED_SESSIONS, notified: [],
    }));
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

    // No Notified flag nor session stat among the settings keys any more.
    assert.deepEqual([...fake.writtenSettingsKeys()].sort(), EXPECTED_FIXED_KEYS);

    // Every game played for Guest, the only Profile of a fresh install, and
    // every Achievement Notified for Guest (in the order the toasts showed).
    const expectedPlays = structuredClone(SEEDED_PLAYS);
    for (const [game, seconds, lastPlayed] of [
        [dayTable, 61 * 60, "2026-09-23T11:01:00"],
        [weekTable, 45, "2026-09-23T11:01:45"],
        [randomTable, 3, "2026-09-23T11:01:48"],
    ]) {
        const play = expectedPlays[game.configId];
        expectedPlays[game.configId] = { count: play.count + 1, seconds: play.seconds + seconds, lastPlayed };
    }
    const guestProfile = JSON.parse(fake.readFile(GUEST_PROFILE_FILE));
    assert.deepEqual(Object.keys(guestProfile), ["version", "plays", "streaks", "sessions", "notified"]);
    assert.equal(guestProfile.version, 1);
    assert.deepEqual(guestProfile.plays, expectedPlays);
    // Both Period Tables played in the Period right after their last one.
    assert.deepEqual(guestProfile.streaks, {
        tableOfTheDay: { current: 30, longest: 30, lastPeriod: "2026-09-23", periodsPlayed: 100 },
        tableOfTheWeek: { current: 12, longest: 12, lastPeriod: "2026-09-21", periodsPlayed: 52 },
    });
    // The manufacturers of the tables played, in play order, once each.
    const dayManufacturers = [...new Set([...SEEDED_DAY_MANUFACTURERS,
        ...[dayTable, weekTable, randomTable].map(game => game.manufacturer).filter(Boolean)])];
    assert.deepEqual(guestProfile.sessions, {
        longestSeconds: 61 * 60,
        shortestSeconds: 3,
        rageQuit: true,
        grandReturn: true,
        dayManufacturers: { day: "2026-09-23", list: dayManufacturers },
        mostManufacturersInADay: dayManufacturers.length,
    });
    assert.deepEqual([...guestProfile.notified].sort(), EXPECTED_ACHIEVEMENT_IDS);
    assert.deepEqual(JSON.parse(fake.readFile(`${PROFILES_FOLDER}\\cabinet.json`)), {
        version: 1,
        activeProfile: "guest",
        tableOfTheDay: { configId: dayTable.configId, period: "2026-09-23" },
        tableOfTheWeek: { configId: weekTable.configId, period: "2026-09-21" },
    });

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
