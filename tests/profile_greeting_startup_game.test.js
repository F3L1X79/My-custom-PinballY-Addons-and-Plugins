// ============================================================
// Startup Profile Greeting, through main.js on the fake PinballY globals:
// when the player launches a table from the startup prompt, the greeting
// never shows during the game nor after it (the prompt already greeted the
// Profile by name).
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const PROFILES_FOLDER = "C:\\PinballY\\Scripts\\profiles";
const PICKER_Z = 6500;
const GAME = { id: 1, configId: "mm", title: "Medieval Madness" };

const pickerTexts = fake => fake.drawingLayers()
    .filter(layer => layer.zIndex === PICKER_Z && layer.alpha > 0)
    .flatMap(layer => layer.texts());

test("a table launched from the startup prompt skips the startup greeting", async () => {
    const fake = createFakePinballYHost({ tables: [GAME] });
    fake.addFolder(`${PROFILES_FOLDER}\\Alice`);
    fake.addFile(`${PROFILES_FOLDER}\\cabinet.json`, JSON.stringify({ version: 1, activeProfile: "Alice" }));
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = key === "profilePicker" || key === "startupChoicePrompt";
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    await import("../main.js");
    await settle();
    fake.advanceTime(0);

    fake.selectMenuItem(lang.startupPrompt.tableOfTheDay);
    await settle();
    fake.advanceTime(0);
    assert.equal(fake.launches().length, 1);
    fake.gameStarted(GAME);
    fake.advanceTime(0);
    assert.deepEqual(pickerTexts(fake), [], "never during the game");
    fake.gameOver(GAME);
    await settle();
    fake.advanceTime(0);
    assert.deepEqual(pickerTexts(fake), [], "nor after it");
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
