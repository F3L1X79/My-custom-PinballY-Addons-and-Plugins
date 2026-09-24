// ============================================================
// With both Add-ons that offer a Random Game (main menu commands, startup
// prompt) disabled, no Random Game can be launched: the Achievement List,
// started through main.js on the fake PinballY globals, shows no Random
// Game family.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const TABLE = {
    id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness", manufacturer: "Williams",
    year: 1997, categories: [], playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
};

test("no Random Game family when neither the main menu commands nor the startup prompt are enabled", async () => {
    const fake = createFakePinballYHost({ now: new Date(2026, 8, 23, 10, 0, 0), tables: [TABLE] });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = key === "achievements";
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    const TEXT = lang.achievementList;
    await import("../main.js");
    await settle();

    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(TEXT.menuEntry);
    const familyNames = fake.currentMenu().items
        .filter(item => item.cmd > 0 && item.title !== TEXT.back)
        .map(item => item.title.replace(/ \(\d+\/\d+\)$/, ""));

    assert.ok(familyNames.length > 0, "the families are shown");
    assert.ok(!familyNames.includes(TEXT.families.randomGame), familyNames.join(", "));
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
