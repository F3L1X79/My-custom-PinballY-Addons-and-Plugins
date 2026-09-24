// ============================================================
// The startup prompt and the custom main menu entry, started through
// main.js on the fake PinballY globals, show and launch the same Table of
// the Day, and a play launched from either counts once in the day Streak.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);

const TABLES = [
    { id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness", lastPlayed: new Date(2025, 0, 1) },
    { id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars", lastPlayed: new Date(2026, 5, 1) },
    { id: 3, configId: "Theatre of Magic (Bally 1995)", title: "Theatre of Magic", lastPlayed: new Date(2026, 7, 1) },
];

const ADD_ONS_UNDER_TEST = ["customMenuCommands", "startupChoicePrompt"];

// Lets the wheel dialog module show the startup prompt (setTimeout 0).
const settle = () => new Promise(resolve => setTimeout(resolve, 10));

test("the startup prompt and the main menu show and launch the same Table of the Day", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.scripts.enabled)) {
        config.scripts.enabled[key] = ADD_ONS_UNDER_TEST.includes(key);
    }
    config.translation.enabled = false;

    const { default: lang } = await import("../common/i18n.js");
    const { getTableOfTheDay } = await import("../common/period_table.js");
    await import("../main.js");
    await settle();

    const promptMessage = fake.currentMenu().items[0].title;
    assert.ok(promptMessage.includes("Medieval Madness"), promptMessage);

    fake.selectMenuItem(lang.startupPrompt.tableOfTheDay);
    const [promptLaunch] = fake.launches();
    fake.gameStarted(promptLaunch);
    fake.gameOver(promptLaunch);

    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(lang.customMenuLabels.tableOfTheDay);
    const menuLaunch = fake.launches()[1];
    fake.gameStarted(menuLaunch);
    fake.gameOver(menuLaunch);

    assert.equal(promptLaunch.configId, "Medieval Madness (Williams 1997)");
    assert.equal(menuLaunch.configId, promptLaunch.configId);
    assert.equal(getTableOfTheDay().getStreak(), 1);
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
