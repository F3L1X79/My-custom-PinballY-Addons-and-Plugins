// ============================================================
// The Achievement List, started through main.js on the fake PinballY
// globals: its main menu entry sits right after "Play", above the other
// custom entries, and the real Achievements land in the right Achievement
// Family, Unlocked ones first, each part in natural order.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);
const SECONDS_PER_HOUR = 3600;

function table(id, title, manufacturer, year, categories, playCount) {
    return {
        id, configId: `${title} (${manufacturer} ${year})`, title, manufacturer, year, categories,
        playCount, playTime: playCount * SECONDS_PER_HOUR, lastPlayed: playCount > 0 ? new Date(2026, 8, id) : null,
        rating: -1, isHidden: false,
    };
}

// Listed out of order on purpose. Played: Williams, Gottlieb, Stern, so
// 3 of 5 tables and 9 hours of play.
const TABLES = [
    table(1, "Medieval Madness", "Williams", 1997, ["Fantasy"], 5),
    table(2, "Attack from Mars", "Bally", 1995, ["SciFi"], 0),
    table(3, "Close Encounters", "Gottlieb", 1978, ["SciFi"], 1),
    table(4, "Godzilla", "Stern", 2021, ["Monsters"], 3),
    table(5, "Space Shuttle", "Zaccaria", 1987, ["SciFi"], 0),
];

const ADD_ONS_UNDER_TEST = ["customMenuCommands", "achievements"];

// Lets the wheel dialog module show the startup Achievements (setTimeout 0).
const settle = () => new Promise(resolve => setTimeout(resolve, 10));

test("the Achievement List entry follows Play and lists the real Achievements by family", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ADD_ONS_UNDER_TEST.includes(key);
    }
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    const TEXT = lang.achievementList;
    const ACHIEVEMENT = lang.achievements;
    const MENU_LABELS = lang.customMenuLabels;
    await import("../main.js");
    await settle();
    for (let guard = 0; fake.currentMenu() && guard < 100; guard++) {
        fake.closeMenu();
        await settle();
    }

    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }, { title: "Exit", cmd: 99 }]);
    assert.deepEqual(fake.currentMenu().items.map(item => item.title), [
        "Play",
        TEXT.menuEntry,
        MENU_LABELS.tableSetup,
        MENU_LABELS.randomGame,
        MENU_LABELS.tableOfTheDay,
        MENU_LABELS.tableOfTheWeek,
        "Exit",
    ]);

    fake.selectMenuItem(TEXT.menuEntry);
    const familiesMenu = fake.currentMenu();
    const familyLines = familiesMenu.items.filter(item => item.cmd > 0 && item.title !== TEXT.back);
    const familyNames = familyLines.map(item => item.title.replace(/ \(\d+\/\d+\)$/, ""));
    // No Random Game Achievement exists yet, so that family stays hidden.
    assert.deepEqual(familyNames, [
        "collection", "playTime", "periodTables", "sessions", "manufacturers", "decades", "categories",
    ].map(family => TEXT.families[family]));

    function openFamily(family) {
        const line = familyLines.find(item => item.title.startsWith(TEXT.families[family]));
        fake.selectMenuItem(line.title);
        const items = fake.currentMenu().items.filter(item => typeof item.checked === "boolean");
        // A threshold without its title in lang/en.js would show as undefined.
        assert.ok(items.every(item => typeof item.title === "string" && item.title !== ""), `${family}: every Achievement has a title`);
        const shown = items.map(item => (item.checked ? "✓ " : "  ") + item.title);
        fake.selectMenuItem(TEXT.back);
        return shown;
    }

    assert.deepEqual(openFamily("collection"), [
        `✓ ${ACHIEVEMENT.firstTableTitle()}`,
        ...[10, 25, 50].map(percent => `✓ ${ACHIEVEMENT.collectionPercentTitles[percent]}`),
        ...[75, 100].map(percent => `  ${ACHIEVEMENT.collectionPercentTitles[percent]}`),
    ]);
    assert.deepEqual(openFamily("playTime"), [
        ...[1, 5].map(hours => `✓ ${ACHIEVEMENT.playTimeMilestoneTitles[hours]}`),
        ...[10, 50, 100].map(hours => `  ${ACHIEVEMENT.playTimeMilestoneTitles[hours]}`),
    ]);
    assert.deepEqual(openFamily("periodTables"), [
        `  ${ACHIEVEMENT.dailyFirstPlayTitle()}`,
        `  ${ACHIEVEMENT.weeklyFirstPlayTitle()}`,
        ...[10, 50, 100].map(days => `  ${ACHIEVEMENT.dailyPeriodsPlayedTitles[days]}`),
        ...[10, 26, 52].map(weeks => `  ${ACHIEVEMENT.weeklyPeriodsPlayedTitles[weeks]}`),
        ...[3, 7, 30].map(days => `  ${ACHIEVEMENT.dailyStreakTitles[days]}`),
        ...[4, 12].map(weeks => `  ${ACHIEVEMENT.weeklyStreakTitles[weeks]}`),
    ]);
    assert.deepEqual(openFamily("sessions"), [
        ...[30, 60].map(minutes => `  ${ACHIEVEMENT.marathonTitles[minutes]}`),
        `  ${ACHIEVEMENT.rageQuitTitle()}`,
        `  ${ACHIEVEMENT.grandReturnTitle()}`,
    ]);
    assert.deepEqual(openFamily("manufacturers"), [
        ...["Gottlieb", "Stern", "Williams"].map(name => `✓ ${ACHIEVEMENT.manufacturerCompletionTitle(name)}`),
        ...["Bally", "Zaccaria"].map(name => `  ${ACHIEVEMENT.manufacturerCompletionTitle(name)}`),
    ]);
    assert.deepEqual(openFamily("decades"), [
        ...[1970, 2020].map(year => `✓ ${ACHIEVEMENT.decadeCompletionTitle(year)}`),
        ...[1980, 1990].map(year => `  ${ACHIEVEMENT.decadeCompletionTitle(year)}`),
    ]);
    assert.deepEqual(openFamily("categories"), [
        ...["Fantasy", "Monsters"].map(name => `✓ ${ACHIEVEMENT.categoryCompletionTitle(name)}`),
        `  ${ACHIEVEMENT.categoryCompletionTitle("SciFi")}`,
    ]);

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
