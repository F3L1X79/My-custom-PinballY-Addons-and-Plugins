// ============================================================
// The Achievements add-on, started through main.js on the fake PinballY
// globals, shows its unlocks through the wheel dialog module: never while
// a game runs, one after the other, each one Notified when shown, and
// Escape moves on to the next without losing any.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const SECONDS_PER_HOUR = 3600;

// Two Williams tables, both played: unlocks at least the first-table,
// Williams and 1990s Achievements at startup.
const TABLES = [
    {
        id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness (Williams 1997)",
        manufacturer: "Williams", year: 1997, categories: [],
        playCount: 5, playTime: 2 * SECONDS_PER_HOUR, lastPlayed: new Date(2026, 8, 1), rating: 4, isHidden: false,
    },
    {
        id: 2, configId: "Attack from Mars (Williams 1995)", title: "Attack from Mars (Williams 1995)",
        manufacturer: "Williams", year: 1995, categories: [],
        playCount: 3, playTime: SECONDS_PER_HOUR, lastPlayed: new Date(2026, 8, 2), rating: 5, isHidden: false,
    },
];

const NOTIFIED_KEY_PREFIX = "custom.achievements.notified.";
const DIALOG_ID = "achievementUnlocked";

// Lets the deferred achievement checks (setTimeout 0) run.
const settle = () => new Promise(resolve => setTimeout(resolve, 10));

function notifiedCount(fake) {
    return [...fake.writtenSettingsKeys()].filter(key => key.startsWith(NOTIFIED_KEY_PREFIX)).length;
}

function achievementDialogs(fake) {
    return fake.shownMenus().filter(menu => menu.id === DIALOG_ID);
}

test("Achievement dialogs wait for the end of the game, follow each other and survive Escape", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = key === "achievements";
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    // A game is already running when the startup check runs.
    fake.playGame(TABLES[0]);
    await import("../main.js");
    await settle();

    assert.equal(fake.currentMenu(), null, "no dialog while a game runs");
    assert.equal(notifiedCount(fake), 0);

    fake.gameOver(TABLES[0]);
    await settle();
    assert.equal(achievementDialogs(fake).length, 1, "first dialog on the next free wheel");

    // Close them all, alternating acknowledge and Escape.
    for (let index = 0; fake.currentMenu(); index++) {
        assert.equal(fake.currentMenu().id, DIALOG_ID);
        assert.equal(notifiedCount(fake), achievementDialogs(fake).length, "Notified exactly when shown");
        if (index % 2 === 0) fake.selectMenuItem(lang.achievements.acknowledge);
        else fake.closeMenu();
        await settle();
        assert.ok(index < 100, "dialogs kept opening");
    }

    const shownCount = achievementDialogs(fake).length;
    assert.ok(shownCount >= 3, `expected several Achievements, got ${shownCount}`);
    assert.equal(notifiedCount(fake), shownCount);
    const messages = achievementDialogs(fake).map(menu => menu.items[0].title);
    assert.equal(new Set(messages).size, shownCount, "each Achievement shown once");
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
