// ============================================================
// The status line's play count and play time, through main.js on the fake
// PinballY globals: they are the active Profile's figures for the selected
// table, never PinballY's own, and follow a switch and a finished game.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 9, 1, 20, 0, 0);
const PROFILES_FOLDER = "C:\\PinballY\\Scripts\\profiles";

// PinballY's own figures are wrong on purpose.
const MEDIEVAL = { id: 1, configId: "Medieval Madness", title: "Medieval Madness", manufacturer: "Williams", playCount: 99, playTime: 999999 };
const MARS = { id: 2, configId: "Attack from Mars", title: "Attack from Mars", manufacturer: "Bally", playCount: 99, playTime: 999999 };

function seedProfile(fake, name, plays) {
    fake.addFile(`${PROFILES_FOLDER}\\${name}\\profile.json`, JSON.stringify({ version: 1, plays }));
}

test("the status line shows the active Profile's play count and play time of the selected table", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: [MEDIEVAL, MARS] });
    seedProfile(fake, "guest", { [MEDIEVAL.configId]: { count: 3, seconds: 5 * 60 + 20, lastPlayed: "2026-09-20T20:00:00" } });
    seedProfile(fake, "Alice", { [MEDIEVAL.configId]: { count: 7, seconds: 2 * 3600 + 5 * 60, lastPlayed: "2026-09-21T20:00:00" } });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = key === "statusLineInfo";
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    const { getProfileStore } = await import("../common/profile_store.js");
    await import("../main.js");
    await settle();

    // Medieval Madness is selected: second alphabetically, after Attack from Mars.
    const TEXT = lang.tableInfoStatusLines;
    const figures = () => fake.lowerStatusLine().slice(2);
    assert.deepEqual(figures(), [TEXT.playCount(2, 3), TEXT.playTime(2, 0, 5)], "Guest's figures");

    getProfileStore().switchTo("Alice");
    await settle();
    assert.deepEqual(figures(), [TEXT.playCount(2, 7), TEXT.playTime(2, 2, 5)], "Alice's figures, at once");

    fake.gameStarted(MEDIEVAL);
    fake.advanceTime(60 * 60 * 1000);
    fake.gameOver(MEDIEVAL);
    await settle();
    assert.deepEqual(figures(), [TEXT.playCount(2, 8), TEXT.playTime(2, 3, 5)], "Alice's game counted on the return to the wheel");

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
