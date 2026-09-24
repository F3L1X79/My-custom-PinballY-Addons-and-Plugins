// ============================================================
// Table of the Day behaviour, through the Period Table module's interface
// with the fake PinballY host: which table is picked and kept, what is
// launched, and how the day Streak counts.
// Run with "node --test" from the project folder.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createPeriodTable, TABLE_OF_THE_DAY } from "../common/period_table.js";

// Wednesday 23 September 2026, 10:00 local time.
const NOW = new Date(2026, 8, 23, 10, 0, 0);
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const PLAYED_TABLES = [
    { id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness", lastPlayed: new Date(2025, 0, 1) },
    { id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars", lastPlayed: new Date(2026, 5, 1) },
    { id: 3, configId: "Theatre of Magic (Bally 1995)", title: "Theatre of Magic", lastPlayed: new Date(2026, 7, 1) },
];

function createTableOfTheDay({ tables = PLAYED_TABLES, settings = {} } = {}) {
    const fake = createFakePinballYHost({ now: NOW, tables });
    fake.seedSettings(settings);
    return { fake, tableOfTheDay: createPeriodTable(fake, TABLE_OF_THE_DAY) };
}

test("keeps the same Table of the Day all day", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();

    const morningTable = tableOfTheDay.getTable();
    fake.setNow(new Date(2026, 8, 23, 23, 59, 59));

    assert.ok(morningTable);
    assert.equal(tableOfTheDay.getTable().configId, morningTable.configId);
});

test("picks a new Table of the Day after midnight, never the previous day's table", () => {
    const twoTables = PLAYED_TABLES.slice(0, 2);
    for (const yesterdayTable of twoTables) {
        const { fake, tableOfTheDay } = createTableOfTheDay({
            tables: twoTables,
            settings: {
                "custom.tableOfTheDay.period": "2026-09-22",
                "custom.tableOfTheDay.configId": yesterdayTable.configId,
            },
        });

        const todayTable = tableOfTheDay.getTable();
        assert.notEqual(todayTable.configId, yesterdayTable.configId);

        fake.setNow(new Date(2026, 8, 24, 0, 0, 1));
        assert.equal(tableOfTheDay.getTable().configId, yesterdayTable.configId);
    }
});

test("offers the previous day's table again when it is the only visible table, and counts it in the Streak", () => {
    const onlyTable = PLAYED_TABLES[0];
    const { fake, tableOfTheDay } = createTableOfTheDay({
        tables: [onlyTable],
        settings: {
            "custom.tableOfTheDay.period": "2026-09-22",
            "custom.tableOfTheDay.configId": onlyTable.configId,
            "custom.streaks.tableOfTheDay.lastPeriod": "2026-09-22",
            "custom.streaks.tableOfTheDay.currentStreak": 1,
        },
    });

    tableOfTheDay.launch();
    fake.gameStarted(fake.launches()[0]);

    assert.deepEqual(fake.launches().map(game => game.configId), [onlyTable.configId]);
    assert.equal(tableOfTheDay.getStreak(), 2);
});

test("never picks a hidden table", () => {
    const hiddenTable = { id: 9, configId: "Hidden Table (Gottlieb 1978)", title: "Hidden Table", lastPlayed: null, isHidden: true };
    const { tableOfTheDay } = createTableOfTheDay({ tables: [hiddenTable, PLAYED_TABLES[2]] });

    assert.equal(tableOfTheDay.getTable().configId, PLAYED_TABLES[2].configId);
});

test("prefers a never-played table, otherwise the one played longest ago", () => {
    const neverPlayed = { id: 4, configId: "Homebrew Table", title: "Homebrew Table", lastPlayed: null };
    assert.equal(createTableOfTheDay({ tables: [...PLAYED_TABLES, neverPlayed] }).tableOfTheDay.getTable().configId,
        neverPlayed.configId);

    assert.equal(createTableOfTheDay().tableOfTheDay.getTable().configId, "Medieval Madness (Williams 1997)");
});

test("gives no table when the collection has none to offer", () => {
    assert.equal(createTableOfTheDay({ tables: [] }).tableOfTheDay.getTable(), null);
});

test("keeps a Table of the Day already stored for today", () => {
    const { tableOfTheDay } = createTableOfTheDay({
        settings: {
            "custom.tableOfTheDay.period": "2026-09-23",
            "custom.tableOfTheDay.configId": "Theatre of Magic (Bally 1995)",
        },
    });

    assert.equal(tableOfTheDay.getTable().configId, "Theatre of Magic (Bally 1995)");
});

test("launches the Table of the Day", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();

    tableOfTheDay.launch();

    assert.deepEqual(fake.launches().map(game => game.configId), [tableOfTheDay.getTable().configId]);
});

test("counts the day in the Streak when the Table of the Day starts playing", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();
    assert.equal(tableOfTheDay.getStreak(), 0);

    tableOfTheDay.launch();
    assert.equal(tableOfTheDay.getStreak(), 0, "a launch alone does not count");

    fake.gameStarted(fake.launches()[0]);
    assert.equal(tableOfTheDay.getStreak(), 1);
});

test("counts the Table of the Day picked by hand on the wheel, but not another table", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();
    const todayTable = tableOfTheDay.getTable();
    const otherTable = PLAYED_TABLES.find(game => game.configId !== todayTable.configId);

    fake.playGame(otherTable);
    fake.gameStarted(otherTable);
    fake.gameOver(otherTable);
    assert.equal(tableOfTheDay.getStreak(), 0);

    fake.playGame(todayTable);
    fake.gameStarted(todayTable);
    assert.equal(tableOfTheDay.getStreak(), 1);
});

test("counts several plays in one day once", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();
    const todayTable = tableOfTheDay.getTable();

    for (let play = 0; play < 3; play++) {
        tableOfTheDay.launch();
        fake.gameStarted(todayTable);
        fake.gameOver(todayTable);
        fake.advanceTime(HOUR_MS);
    }

    assert.equal(tableOfTheDay.getStreak(), 1);
});

test("does not count a failed launch", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();

    tableOfTheDay.launch();
    fake.launchError(fake.launches()[0]);

    assert.equal(tableOfTheDay.getStreak(), 0);
});

test("grows the Streak on consecutive days and resets it after a skipped day", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay();
    const playToday = () => {
        tableOfTheDay.launch();
        const launches = fake.launches();
        fake.gameStarted(launches[launches.length - 1]);
        fake.gameOver(launches[launches.length - 1]);
    };

    playToday();
    fake.advanceTime(DAY_MS);
    playToday();
    assert.equal(tableOfTheDay.getStreak(), 2);

    fake.advanceTime(DAY_MS);
    assert.equal(tableOfTheDay.getStreak(), 2, "today can still extend the Streak");

    fake.advanceTime(DAY_MS);
    assert.equal(tableOfTheDay.getStreak(), 0, "a whole day was skipped");

    playToday();
    assert.equal(tableOfTheDay.getStreak(), 1);
});

test("does not count yesterday's table played today before today's is picked", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay({
        settings: {
            "custom.tableOfTheDay.period": "2026-09-22",
            "custom.tableOfTheDay.configId": "Theatre of Magic (Bally 1995)",
        },
    });
    const yesterdayTable = fake.getGameInfo("Theatre of Magic (Bally 1995)");

    fake.playGame(yesterdayTable);
    fake.gameStarted(yesterdayTable);

    assert.equal(tableOfTheDay.getStreak(), 0);
});

test("reads and extends a Streak stored before", () => {
    const storedStreak = {
        "custom.streaks.tableOfTheDay.lastPeriod": "2026-09-22",
        "custom.streaks.tableOfTheDay.currentStreak": 29,
        "custom.streaks.tableOfTheDay.longestStreak": 40,
    };
    const { fake, tableOfTheDay } = createTableOfTheDay({ settings: storedStreak });
    assert.equal(tableOfTheDay.getStreak(), 29);

    tableOfTheDay.launch();
    fake.gameStarted(fake.launches()[0]);

    assert.equal(tableOfTheDay.getStreak(), 30);
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheDay.currentStreak"], "30");
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheDay.longestStreak"], "40");
    assert.equal(fake.storedSettings()["custom.streaks.tableOfTheDay.lastPeriod"], "2026-09-23");
});

test("counts the Table of the Day played by hand before anyone asked for it today", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay({ tables: [PLAYED_TABLES[0]] });

    fake.playGame(PLAYED_TABLES[0]);
    fake.gameStarted(PLAYED_TABLES[0]);

    assert.equal(tableOfTheDay.getStreak(), 1);
});

test("replaces a Table of the Day hidden since it was picked", () => {
    const { fake, tableOfTheDay } = createTableOfTheDay({
        settings: {
            "custom.tableOfTheDay.period": "2026-09-23",
            "custom.tableOfTheDay.configId": "Theatre of Magic (Bally 1995)",
        },
    });
    fake.setTables(PLAYED_TABLES.map(game =>
        game.configId === "Theatre of Magic (Bally 1995)" ? { ...game, isHidden: true } : game));

    assert.notEqual(tableOfTheDay.getTable().configId, "Theatre of Magic (Bally 1995)");
});
