// ============================================================
// The grand return, started through main.js on the fake PinballY globals:
// replaying a table after a 30-day break announces nothing, replaying one
// after a 31-day break announces the grand return, whose description
// gives the 31 days.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SESSION_MS = 5 * 60 * 1000;

// Without manufacturer or year, so with the collection milestones already
// Notified, the grand return is the only Achievement these plays can unlock.
function table(id, title) {
    return {
        id, configId: title, title, manufacturer: "", year: 0, categories: [],
        playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
    };
}

const THIRTY_DAYS_AGO = table(1, "Thirty Days Ago");
const THIRTY_ONE_DAYS_AGO = table(2, "Thirty-One Days Ago");
// Kept as the Table of the Day and of the Week, so the plays above never
// count as a Period Table play.
const PERIOD_TABLE = table(3, "Period Table");

const PREVIOUS_PLAY_KEY_PREFIX = "custom.sessionStats.previousPlay.";
const GUEST_PROFILE_FILE = "C:\\PinballY\\Scripts\\profiles\\guest\\profile.json";
const COLLECTION_MILESTONE_IDS = ["firstTable", "10percent", "25percent", "50percent", "75percent", "100percent"]
    .map(milestone => `collectionMilestone:${milestone}`);

test("the grand return needs a 31-day break and says so", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: [THIRTY_DAYS_AGO, THIRTY_ONE_DAYS_AGO, PERIOD_TABLE] });
    fake.seedSettings({
        [PREVIOUS_PLAY_KEY_PREFIX + THIRTY_DAYS_AGO.configId]: new Date(NOW.getTime() - 30 * MS_PER_DAY).toISOString(),
        [PREVIOUS_PLAY_KEY_PREFIX + THIRTY_ONE_DAYS_AGO.configId]: new Date(NOW.getTime() - 31 * MS_PER_DAY).toISOString(),
        "custom.tableOfTheDay.period": "2026-09-23",
        "custom.tableOfTheDay.configId": PERIOD_TABLE.configId,
        "custom.tableOfTheWeek.period": "2026-09-21",
        "custom.tableOfTheWeek.configId": PERIOD_TABLE.configId,
    });
    fake.addFile(GUEST_PROFILE_FILE, JSON.stringify({ version: 1, plays: {}, notified: COLLECTION_MILESTONE_IDS }));
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ["sessionStatsTracker", "achievements"].includes(key);
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    const TEXT = lang.achievements;
    await import("../main.js");
    await settle();

    async function play(game) {
        fake.gameStarted(game);
        await settle();
        fake.advanceTime(SESSION_MS);
        fake.gameOver(game);
        await settle();
        // The texts of every Achievement Toast so far.
        return fake.drawings().map(drawing => drawing.texts);
    }

    assert.deepEqual(await play(THIRTY_DAYS_AGO), [], "no Achievement after a 30-day break");

    const [toast, ...others] = await play(THIRTY_ONE_DAYS_AGO);
    assert.deepEqual(others, []);
    assert.ok(toast.includes(TEXT.grandReturnTitle()), toast.join(" | "));
    assert.ok(toast.includes(TEXT.grandReturnDescription(31)), toast.join(" | "));
    assert.match(TEXT.grandReturnDescription(31), /31/);
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
