// ============================================================
// Table of the Week behaviour, through the Period Table module's interface
// with the fake PinballY host: the table is kept from Monday to Sunday,
// replaced after the Sunday-to-Monday rollover, and the week Streak counts
// once per week when the Table of the Week starts playing.
// Run with "node --test" from the project folder.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createPeriodTable, TABLE_OF_THE_WEEK } from "../common/period_table.js";

// Monday 21 September 2026, 00:00:01 local time.
const MONDAY = new Date(2026, 8, 21, 0, 0, 1);
const SUNDAY_NIGHT = new Date(2026, 8, 27, 23, 59, 59);
const NEXT_MONDAY = new Date(2026, 8, 28, 0, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const TABLES = [
    { id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness", lastPlayed: new Date(2025, 0, 1) },
    { id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars", lastPlayed: new Date(2026, 5, 1) },
    { id: 3, configId: "Theatre of Magic (Bally 1995)", title: "Theatre of Magic", lastPlayed: null },
];

function createTableOfTheWeek({ now = MONDAY, tables = TABLES, settings = {} } = {}) {
    const fake = createFakePinballYHost({ now, tables });
    fake.seedSettings(settings);
    return { fake, tableOfTheWeek: createPeriodTable(fake, TABLE_OF_THE_WEEK) };
}

function playLastLaunch(fake) {
    const launches = fake.launches();
    fake.gameStarted(launches[launches.length - 1]);
    fake.gameOver(launches[launches.length - 1]);
}

test("keeps the same Table of the Week from Monday to Sunday", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek();

    const mondayTable = tableOfTheWeek.getTable();
    fake.setNow(SUNDAY_NIGHT);

    assert.ok(mondayTable);
    assert.equal(tableOfTheWeek.getTable().configId, mondayTable.configId);
});

test("picks a new Table of the Week after the Sunday-to-Monday rollover, never the previous week's table", () => {
    const twoTables = TABLES.slice(0, 2);
    for (const lastWeekTable of twoTables) {
        const { fake, tableOfTheWeek } = createTableOfTheWeek({
            now: SUNDAY_NIGHT,
            tables: twoTables,
            settings: {
                "custom.tableOfTheWeek.period": "2026-09-14",
                "custom.tableOfTheWeek.configId": lastWeekTable.configId,
            },
        });

        const thisWeekTable = tableOfTheWeek.getTable();
        assert.notEqual(thisWeekTable.configId, lastWeekTable.configId);

        fake.setNow(NEXT_MONDAY);
        assert.equal(tableOfTheWeek.getTable().configId, lastWeekTable.configId);
    }
});

test("offers the previous week's table again when it is the only visible table, and counts it in the Streak", () => {
    const onlyTable = TABLES[0];
    const { fake, tableOfTheWeek } = createTableOfTheWeek({
        tables: [onlyTable],
        settings: {
            "custom.tableOfTheWeek.period": "2026-09-14",
            "custom.tableOfTheWeek.configId": onlyTable.configId,
            "custom.streaks.tableOfTheWeek.lastPeriod": "2026-09-14",
            "custom.streaks.tableOfTheWeek.currentStreak": 1,
        },
    });

    tableOfTheWeek.launch();
    playLastLaunch(fake);

    assert.deepEqual(fake.launches().map(game => game.configId), [onlyTable.configId]);
    assert.equal(tableOfTheWeek.getStreak(), 2);
});

test("keeps a Table of the Week stored earlier this week", () => {
    const { tableOfTheWeek } = createTableOfTheWeek({
        now: SUNDAY_NIGHT,
        settings: {
            "custom.tableOfTheWeek.period": "2026-09-21",
            "custom.tableOfTheWeek.configId": "Attack from Mars (Bally 1995)",
        },
    });

    assert.equal(tableOfTheWeek.getTable().configId, "Attack from Mars (Bally 1995)");
});

test("never picks a hidden table as the Table of the Week", () => {
    const hiddenTable = { id: 9, configId: "Hidden Table (Gottlieb 1978)", title: "Hidden Table", lastPlayed: null, isHidden: true };
    const { tableOfTheWeek } = createTableOfTheWeek({ tables: [hiddenTable, TABLES[1]] });

    assert.equal(tableOfTheWeek.getTable().configId, TABLES[1].configId);
});

test("launches the Table of the Week", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek();

    tableOfTheWeek.launch();

    assert.deepEqual(fake.launches().map(game => game.configId), [tableOfTheWeek.getTable().configId]);
});

test("counts the week in the Streak when the Table of the Week starts playing, however launched", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek();
    const weekTable = tableOfTheWeek.getTable();

    tableOfTheWeek.launch();
    fake.launchError(fake.launches()[0]);
    assert.equal(tableOfTheWeek.getStreak(), 0, "a failed launch does not count");

    fake.playGame(weekTable);
    fake.gameStarted(weekTable);
    assert.equal(tableOfTheWeek.getStreak(), 1);
});

test("counts several plays in one week once", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek();

    for (let day = 0; day < 7; day++) {
        tableOfTheWeek.launch();
        playLastLaunch(fake);
        fake.advanceTime(DAY_MS);
    }

    fake.setNow(SUNDAY_NIGHT);
    assert.equal(tableOfTheWeek.getStreak(), 1);
});

test("grows the week Streak across the rollover and resets it after a skipped week", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek({ now: SUNDAY_NIGHT });

    tableOfTheWeek.launch();
    playLastLaunch(fake);
    fake.setNow(NEXT_MONDAY);
    tableOfTheWeek.launch();
    playLastLaunch(fake);
    assert.equal(tableOfTheWeek.getStreak(), 2);

    fake.advanceTime(WEEK_MS);
    assert.equal(tableOfTheWeek.getStreak(), 2, "this week can still extend the Streak");

    fake.advanceTime(WEEK_MS);
    assert.equal(tableOfTheWeek.getStreak(), 0, "a whole week was skipped");

    tableOfTheWeek.launch();
    playLastLaunch(fake);
    assert.equal(tableOfTheWeek.getStreak(), 1);
});

test("reads and extends a week Streak stored before", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek({
        settings: {
            "custom.streaks.tableOfTheWeek.lastPeriod": "2026-09-14",
            "custom.streaks.tableOfTheWeek.currentStreak": 11,
            "custom.streaks.tableOfTheWeek.longestStreak": 11,
        },
    });
    assert.equal(tableOfTheWeek.getStreak(), 11);

    tableOfTheWeek.launch();
    playLastLaunch(fake);

    assert.equal(tableOfTheWeek.getStreak(), 12);
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheWeek.currentStreak"], "12");
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheWeek.longestStreak"], "12");
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheWeek.lastPeriod"], "2026-09-21");
});

test("counts non-consecutive weeks once each in Periods Played", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek();

    tableOfTheWeek.launch();
    playLastLaunch(fake);
    tableOfTheWeek.launch();
    playLastLaunch(fake);
    fake.advanceTime(2 * WEEK_MS);
    tableOfTheWeek.launch();
    playLastLaunch(fake);

    assert.equal(tableOfTheWeek.getPeriodsPlayed(), 2);
    assert.equal(tableOfTheWeek.getLongestStreak(), 1);
});

test("starts week Periods Played at the longest Streak stored before, and adds the next week to it", () => {
    const { fake, tableOfTheWeek } = createTableOfTheWeek({
        settings: {
            "custom.streaks.tableOfTheWeek.lastPeriod": "2026-08-03",
            "custom.streaks.tableOfTheWeek.currentStreak": 5,
            "custom.streaks.tableOfTheWeek.longestStreak": 5,
            "custom.streaks.tableOfTheWeek.periodsPlayed": 3,
        },
    });
    assert.equal(tableOfTheWeek.getPeriodsPlayed(), 5, "never lower than the longest Streak");

    tableOfTheWeek.launch();
    playLastLaunch(fake);

    assert.equal(tableOfTheWeek.getPeriodsPlayed(), 6);
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheWeek.periodsPlayed"], "6");
});
