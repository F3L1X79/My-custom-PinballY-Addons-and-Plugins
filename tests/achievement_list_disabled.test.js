// ============================================================
// With the achievements Add-on disabled, main.js adds no Achievement List
// entry: the other custom entries follow "Play" directly.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

test("no Achievement List entry when the achievements Add-on is disabled", async () => {
    const fake = createFakePinballYHost({ now: new Date(2026, 8, 23, 10, 0, 0) });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = key === "customMenuCommands";
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    const MENU_LABELS = lang.customMenuLabels;
    await import("../main.js");

    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    assert.deepEqual(fake.currentMenu().items.map(item => item.title), [
        "Play",
        MENU_LABELS.tableSetup,
        MENU_LABELS.randomGame,
        MENU_LABELS.tableOfTheDay,
        MENU_LABELS.tableOfTheWeek,
    ]);
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
