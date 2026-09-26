// ============================================================
// Achievement Progress of the real Achievements, started through main.js
// on the fake PinballY globals and read in the Achievement List after real
// plays: a completion Achievement shows its tables played, drops its
// Achievement Progress once Unlocked, shows none for a target of 1, and
// follows a Profile switch.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const PROFILES_FOLDER = "C:\\PinballY\\Scripts\\profiles";
// Longer than a toast's whole life (rise, hold, fade).
const ONE_TOAST_MS = 6000;

// PinballY's own play stats count for nothing: only the Profiles' plays do.
function table(id, title, manufacturer, year, categories) {
    return {
        id, configId: `${title} (${manufacturer} ${year})`, title, manufacturer, year, categories,
        playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
    };
}

const MEDIEVAL = table(1, "Medieval Madness", "Williams", 1997, ["Fantasy"]);
const TWILIGHT = table(2, "Twilight Zone", "Williams", 1993, ["Fantasy"]);
const ADDAMS = table(3, "Addams Family", "Williams", 1992, ["Horror"]);
const MARS = table(4, "Attack from Mars", "Bally", 1995, ["SciFi"]);
const TABLES = [MEDIEVAL, TWILIGHT, ADDAMS, MARS];

let fake;
let lang;
let getProfileStore;

async function start() {
    fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    fake.addFolder(`${PROFILES_FOLDER}\\Alice`);
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ["customMenuCommands", "achievements", "sessionStatsTracker"].includes(key);
    }
    config.language = "en";
    ({ default: lang } = await import("../common/i18n.js"));
    ({ getProfileStore } = await import("../common/profile_store.js"));
    await import("../main.js");
    await settle();
}

async function play(game, seconds = 60) {
    fake.playGame(game);
    fake.gameStarted(game);
    await settle();
    fake.advanceTime(seconds * 1000);
    fake.gameOver(game);
    await settle();
    // Lets every toast of this play show, so the wheel is free again.
    for (let guard = 0; guard < 100; guard++) {
        const shownCount = fake.drawings().length;
        fake.advanceTime(ONE_TOAST_MS);
        await settle();
        if (fake.drawings().length === shownCount) break;
    }
}

// The titles a family shows, in order, then back to the wheel.
function familyTitles(family) {
    const TEXT = lang.achievementList;
    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(TEXT.menuEntry);
    const line = fake.currentMenu().items.find(item => item.title && item.title.startsWith(TEXT.families[family]));
    fake.selectMenuItem(line.title);
    const titles = fake.currentMenu().items.filter(item => typeof item.checked === "boolean").map(item => item.title);
    closeMenus();
    return titles;
}

// The card of the Achievement shown under that title in its family.
function cardText(family, shownTitle) {
    const TEXT = lang.achievementList;
    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(TEXT.menuEntry);
    const line = fake.currentMenu().items.find(item => item.title && item.title.startsWith(TEXT.families[family]));
    fake.selectMenuItem(line.title);
    fake.selectMenuItem(shownTitle);
    const text = fake.currentMenu().items[0].title;
    closeMenus();
    return text;
}

function closeMenus() {
    for (let guard = 0; guard < 5 && fake.currentMenu(); guard++) {
        fake.selectMenuItem(lang.achievementList.back);
    }
}

function withProgress(title, unit, current, target) {
    const TEXT = lang.achievementList;
    return TEXT.titleWithProgress(title, TEXT.progressUnits[unit].short(current, target));
}

test("a completion Achievement shows its tables played until it unlocks, and follows the active Profile", async () => {
    await start();
    const TEXT = lang.achievementList;
    const ACHIEVEMENT = lang.achievements;
    const williams = ACHIEVEMENT.manufacturerCompletionTitle("Williams");
    const bally = ACHIEVEMENT.manufacturerCompletionTitle("Bally");
    const fantasy = ACHIEVEMENT.categoryCompletionTitle("Fantasy");
    const nineties = ACHIEVEMENT.decadeCompletionTitle(1990);

    assert.ok(familyTitles("manufacturers").includes(withProgress(williams, "tables", 0, 3)));

    await play(MEDIEVAL);
    const manufacturers = familyTitles("manufacturers");
    assert.ok(manufacturers.includes(withProgress(williams, "tables", 1, 3)));
    assert.ok(manufacturers.includes(bally), "a target of 1 shows no Achievement Progress");
    assert.ok(familyTitles("categories").includes(withProgress(fantasy, "tables", 1, 2)));
    assert.ok(familyTitles("decades").includes(withProgress(nineties, "tables", 1, 4)));
    assert.equal(cardText("manufacturers", withProgress(williams, "tables", 1, 3)),
        TEXT.cardMessage(williams, ACHIEVEMENT.manufacturerCompletionDescription("Williams", 3), TEXT.notUnlocked,
            TEXT.progressLine(TEXT.progressUnits.tables.long(1, 3))));

    getProfileStore().switchTo("Alice");
    await settle();
    assert.ok(familyTitles("manufacturers").includes(withProgress(williams, "tables", 0, 3)), "Alice's own progress");

    getProfileStore().switchTo("guest");
    await settle();
    await play(TWILIGHT);
    await play(ADDAMS);
    assert.ok(familyTitles("manufacturers").includes(williams), "Unlocked: the bare title");
    assert.equal(cardText("manufacturers", williams),
        TEXT.cardMessage(williams, ACHIEVEMENT.manufacturerCompletionDescription("Williams", 3), TEXT.unlocked));

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
