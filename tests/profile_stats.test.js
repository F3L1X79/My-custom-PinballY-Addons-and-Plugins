// ============================================================
// Profile Stats module tests: over the fake PinballY host with a real
// Profile store, real Period Tables and a real Achievement List, checks
// what the player sees (title naming the active Profile, games played,
// total time, collection completion, Achievements, both Streaks), that
// the Achievements line opens the Achievement List, and that every number
// is read again each time the screen opens.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createProfileStats } from "../common/profile_stats.js";
import { createProfileStore } from "../common/profile_store.js";
import { createPeriodTable, TABLE_OF_THE_DAY, TABLE_OF_THE_WEEK } from "../common/period_table.js";
import { createAchievementList } from "../common/achievement_list.js";
import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";

const TEXT = lang.profileStats;
const LIST_TEXT = lang.achievementList;

// Wednesday: its week started on Monday 21 September.
const NOW = new Date(2026, 8, 23, 10, 0, 0);
const PROFILES = "C:\\PinballY\\Scripts\\profiles";
const profileFile = name => `${PROFILES}\\${name}\\profile.json`;

function table(id, title, { isHidden = false } = {}) {
    return { id, configId: `${title} (Williams 1990)`, title, manufacturer: "Williams", year: 1990, isHidden };
}

const MEDIEVAL = table(1, "Medieval Madness");
const ATTACK = table(2, "Attack from Mars");
const GODZILLA = table(3, "Godzilla");
const SHUTTLE = table(4, "Space Shuttle", { isHidden: true });
const TABLES = [MEDIEVAL, ATTACK, GODZILLA, SHUTTLE];

const play = (count, seconds) => ({ count, seconds, lastPlayed: "2026-09-20T20:00:00" });

// Guest played two visible tables, a hidden one and a table no longer in
// PinballY's list: 3 of 3 visible tables would need Godzilla too.
const GUEST_PLAYS = {
    [MEDIEVAL.configId]: play(4, 2 * 3600),
    [ATTACK.configId]: play(1, 900),
    [SHUTTLE.configId]: play(2, 1800),
    "Removed Table (Bally 1980)": play(3, 600),
};

function fakeAchievement(id, unlocked) {
    return {
        id, family: ACHIEVEMENT_FAMILY.COLLECTION, unlocked,
        getTitle: () => id, getDescription: () => id, checkUnlocked() { return this.unlocked; },
    };
}

function setUp({ guest = { plays: GUEST_PLAYS }, others = {} } = {}) {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    fake.addFile(profileFile("guest"), JSON.stringify({ version: 1, ...guest }));
    for (const [name, data] of Object.entries(others)) {
        fake.addFile(profileFile(name), JSON.stringify({ version: 1, ...data }));
    }
    const profileStore = createProfileStore(fake);
    const achievements = [fakeAchievement("a", true), fakeAchievement("b", false), fakeAchievement("c", true)];
    const achievementList = createAchievementList(fake, () => achievements);
    const profileStats = createProfileStats(fake, {
        profileStore,
        achievementList,
        tableOfTheDay: createPeriodTable(fake, TABLE_OF_THE_DAY, profileStore),
        tableOfTheWeek: createPeriodTable(fake, TABLE_OF_THE_WEEK, profileStore),
    });
    fake.openMenu("main", [{ title: "Play", cmd: fake.getBuiltInCommand("PlayGame") }]);
    profileStats.open();
    return { fake, profileStore, profileStats, achievements };
}

const titles = menu => menu.items.map(item => item.title);

test("the screen names the active Profile and shows its numbers, then Back", () => {
    const { fake } = setUp();

    // 10 games and 2 h 55 over every table played, hidden and removed ones
    // included; completion counts the visible tables only.
    assert.deepEqual(fake.currentMenu().items, [
        { title: TEXT.title(lang.profiles.guestName), cmd: -1 },
        { cmd: -1 },
        { title: TEXT.gamesPlayed(10), cmd: -1 },
        { title: TEXT.totalTime(2, 55), cmd: -1 },
        { title: TEXT.collection(2, 3, 67), cmd: -1 },
        { title: TEXT.achievements(2, 3), cmd: fake.currentMenu().items[5].cmd },
        { title: TEXT.tableOfTheDayStreak(0, 0), cmd: -1 },
        { title: TEXT.tableOfTheWeekStreak(0, 0), cmd: -1 },
        { cmd: -1 },
        { title: TEXT.back, cmd: fake.getBuiltInCommand("MenuReturn") },
    ]);
    assert.ok(fake.currentMenu().items[5].cmd > 0, "the Achievements line can be selected");
});

test("a new Profile shows 0 games, 0 time and nothing completed", () => {
    const { fake } = setUp({ guest: {} });

    const shown = titles(fake.currentMenu());
    assert.equal(shown[2], TEXT.gamesPlayed(0));
    assert.equal(shown[3], TEXT.totalTime(0, 0));
    assert.equal(shown[4], TEXT.collection(0, 3, 0));
});

test("the Achievements line matches the Achievement List and opens it", () => {
    const { fake, profileStats, achievements } = setUp();
    fake.selectMenuItem(TEXT.back);
    achievements[1].unlocked = true;

    profileStats.open();
    fake.selectMenuItem(TEXT.achievements(3, 3));

    assert.deepEqual(fake.currentMenu().items[0], { title: LIST_TEXT.totalLine(3, 3), cmd: -1 });
});

test("both Streaks show the current Streak, 0 once broken, and the longest one", () => {
    const { fake } = setUp({
        guest: {
            plays: {},
            streaks: {
                // Broken: last played on the 20th, two days ago.
                tableOfTheDay: { current: 5, longest: 12, lastPeriod: "2026-09-20", periodsPlayed: 40 },
                // Still running: played last week.
                tableOfTheWeek: { current: 2, longest: 3, lastPeriod: "2026-09-14", periodsPlayed: 9 },
            },
        },
    });

    const shown = titles(fake.currentMenu());
    assert.equal(shown[6], TEXT.tableOfTheDayStreak(0, 12));
    assert.equal(shown[7], TEXT.tableOfTheWeekStreak(2, 3));
});

test("the numbers follow a Profile switch and a finished game the next time the screen opens", () => {
    const { fake, profileStore, profileStats } = setUp({
        others: { Alice: { plays: { [GODZILLA.configId]: play(1, 60) } } },
    });
    fake.selectMenuItem(TEXT.back);

    profileStore.switchTo("Alice");
    profileStats.open();
    let shown = titles(fake.currentMenu());
    assert.equal(shown[0], TEXT.title("Alice"));
    assert.equal(shown[2], TEXT.gamesPlayed(1));
    assert.equal(shown[4], TEXT.collection(1, 3, 33));
    fake.selectMenuItem(TEXT.back);

    fake.gameStarted(MEDIEVAL);
    fake.advanceTime(30 * 60 * 1000);
    fake.gameOver(MEDIEVAL);
    profileStats.open();
    shown = titles(fake.currentMenu());
    assert.equal(shown[2], TEXT.gamesPlayed(2));
    assert.equal(shown[3], TEXT.totalTime(0, 31));
    assert.equal(shown[4], TEXT.collection(2, 3, 67));
});
