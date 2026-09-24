// ============================================================
// Shared scenario for the dialog priority tests: starts the startup
// prompt, Achievements and rating prompt add-ons on the fake PinballY
// globals in a given init order (as main.js would), then checks that the
// startup prompt comes before the startup Achievements, and that the
// Achievements of a session come before its rating prompt.
// ============================================================

import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const SECONDS_PER_HOUR = 3600;

// The first table unlocks Achievements at startup; the second, never
// played nor rated, crosses the rating threshold in a marathon session.
const TABLES = [
    {
        id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness (Williams 1997)",
        manufacturer: "Williams", year: 1997, categories: [],
        playCount: 5, playTime: 2 * SECONDS_PER_HOUR, lastPlayed: new Date(2026, 8, 1), rating: 4, isHidden: false,
    },
    {
        id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars (Bally 1995)",
        manufacturer: "Bally", year: 1995, categories: [],
        playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
    },
];

const MODULE_PATHS = {
    sessionStatsTracker: "../common/session_stats_tracker.js",
    achievements: "../achievements_engine.js",
    ratingPrompt: "../rating_prompt.js",
    startupChoicePrompt: "../startup_choice_prompt.js",
};

// Lets the deferred checks and dialogs (setTimeout 0) run.
const settle = () => new Promise(resolve => setTimeout(resolve, 10));

export async function runDialogPriorityScenario(initOrder) {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    config.translation.enabled = false;
    config.ratingPrompt.thresholdMinutes = 60;

    const { default: lang } = await import("../common/i18n.js");
    for (const key of initOrder) {
        const module = await import(MODULE_PATHS[key]);
        module.default();
    }
    await settle();

    const shownIds = () => fake.shownMenus().map(menu => menu.id);

    // Startup: the prompt first, then the Achievements unlocked at startup.
    assert.deepEqual(shownIds(), ["startupChoicePrompt"], "the startup prompt comes first");
    fake.selectMenuItem(lang.startupPrompt.stayOnLastPlayed);
    await settle();
    let startupAchievementCount = 0;
    while (fake.currentMenu()) {
        assert.equal(fake.currentMenu().id, "achievementUnlocked");
        fake.closeMenu();
        await settle();
        assert.ok(++startupAchievementCount < 100, "dialogs kept opening");
    }
    assert.ok(startupAchievementCount > 0, "an Achievement unlocked at startup waits for the prompt");

    // Session: the marathon Achievements first, then the rating prompt.
    const shownBeforeSession = shownIds().length;
    const game = fake.getGameInfo(2);
    fake.playGame(game);
    fake.gameStarted(game);
    fake.advanceTime(61 * 60 * 1000);
    game.playTime = 61 * 60;
    fake.gameOver(game);
    await settle();

    while (fake.currentMenu() && fake.currentMenu().id === "achievementUnlocked") {
        fake.closeMenu();
        await settle();
        assert.ok(shownIds().length < 200, "dialogs kept opening");
    }
    const sessionIds = shownIds().slice(shownBeforeSession);
    assert.ok(sessionIds.length >= 2, `expected Achievements then the rating prompt, got ${sessionIds}`);
    assert.ok(sessionIds.slice(0, -1).every(id => id === "achievementUnlocked"), `got ${sessionIds}`);
    assert.equal(sessionIds[sessionIds.length - 1], "ratingPrompt", "the rating prompt comes last");

    fake.selectMenuItem(lang.ratingPrompt.rateNow);
    await settle();
    assert.deepEqual(fake.executedCommands(), [globalThis.command.RateGame]);
    assert.equal(fake.currentMenu(), null);
    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
}
