// ============================================================
// The startup prompt's random choice and the "Start Random Game" main menu
// entry, started through main.js on the fake PinballY globals, never launch
// the Last Played Table when the wheel selection holds another table, and
// every started one counts in the Random Games played. Runs
// with the Random Game animation turned off (the fake has no wheel buttons).
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";
import { getRandomGame } from "../common/random_game.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const MENU_LAUNCH_COUNT = 50;

// Theatre of Magic has the most recent play: it is the Last Played Table.
const TABLES = [
    { id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness", lastPlayed: new Date(2025, 0, 1) },
    { id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars", lastPlayed: new Date(2026, 5, 1) },
    { id: 3, configId: "Theatre of Magic (Bally 1995)", title: "Theatre of Magic", lastPlayed: new Date(2026, 7, 1) },
];
const LAST_PLAYED_CONFIG_ID = "Theatre of Magic (Bally 1995)";

const ADD_ONS_UNDER_TEST = ["customMenuCommands", "startupChoicePrompt"];

function playAndReturnToWheel(fake, game) {
    fake.gameStarted(game);
    fake.gameOver(game);
}

test("the startup prompt and the main menu never launch the Last Played Table, and each Random Game counts", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    fake.setWheelTables([LAST_PLAYED_CONFIG_ID, "Medieval Madness (Williams 1997)", "Attack from Mars (Bally 1995)"]);
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ADD_ONS_UNDER_TEST.includes(key);
    }
    config.language = "en";
    config.skipRandomGameAnimation = true;

    const { default: lang } = await import("../common/i18n.js");
    await import("../main.js");
    await settle();

    fake.selectMenuItem(lang.startupPrompt.randomTable);
    await settle();
    const [promptLaunch] = fake.launches();
    playAndReturnToWheel(fake, promptLaunch);

    for (let i = 0; i < MENU_LAUNCH_COUNT; i++) {
        fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
        fake.selectMenuItem(lang.customMenuLabels.randomGame);
        await settle();
        const launches = fake.launches();
        playAndReturnToWheel(fake, launches[launches.length - 1]);
    }

    const launchedConfigIds = fake.launches().map(game => game.configId);
    assert.equal(launchedConfigIds.length, 1 + MENU_LAUNCH_COUNT);
    assert.ok(!launchedConfigIds.includes(LAST_PLAYED_CONFIG_ID), launchedConfigIds.join(", "));
    assert.equal(getRandomGame().getRandomGamesPlayed(), 1 + MENU_LAUNCH_COUNT);
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
