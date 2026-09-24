// ============================================================
// First play Achievements, started through main.js on the fake PinballY
// globals: a player whose Table of the Day Streak was already recorded
// before the update gets "first play" announced at startup, and never again
// on later checks.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const SESSION_MS = 5 * 60 * 1000;

// Without manufacturer and never counted as played, so only the seeded
// Streak can unlock an Achievement.
const TABLE = {
    id: 1, configId: "Homebrew Table", title: "Homebrew Table", manufacturer: "", year: 0, categories: [],
    playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
};

const DIALOG_ID = "achievementUnlocked";

const settle = () => new Promise(resolve => setTimeout(resolve, 10));

test("a Streak recorded before the update announces the first play once", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: [TABLE] });
    fake.seedSettings({
        "custom.streaks.tableOfTheDay.lastPeriod": "2026-08-01",
        "custom.streaks.tableOfTheDay.currentStreak": 1,
        "custom.streaks.tableOfTheDay.longestStreak": 1,
    });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = key === "achievements";
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    const TEXT = lang.achievements;
    await import("../main.js");
    await settle();

    const dailyFirstPlay = TEXT.unlockedIntro(TEXT.dailyFirstPlayTitle(), TEXT.dailyFirstPlayDescription());
    const announcements = () => fake.shownMenus().filter(menu => menu.id === DIALOG_ID).map(menu => menu.items[0].title);
    assert.deepEqual(announcements(), [dailyFirstPlay]);
    fake.selectMenuItem(TEXT.acknowledge);
    await settle();

    // A play triggers the next checks, with the first play still Unlocked.
    // The only table is also the Table of the Week: that one is announced now.
    fake.gameStarted(TABLE);
    await settle();
    fake.advanceTime(SESSION_MS);
    fake.gameOver(TABLE);
    await settle();

    assert.equal(announcements().filter(title => title === dailyFirstPlay).length, 1, "announced only once");
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
