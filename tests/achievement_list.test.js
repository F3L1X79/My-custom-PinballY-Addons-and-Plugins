// ============================================================
// Achievement List module tests: over the fake PinballY host with fake
// Achievements, checks what the player sees at each level (total line,
// Achievement Families with their counts, a family's Achievements, Unlocked
// ones first and checked) and the Back navigation. Unlocked is computed
// live each time a level opens.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createAchievementList } from "../common/achievement_list.js";
import { ACHIEVEMENT_FAMILY } from "../common/achievements.js";
import lang from "../common/i18n.js";

const TEXT = lang.achievementList;

// The families level: total line, separator, families, separator, Back.
const FAMILY_ITEMS_START = 2;

function fakeAchievement(id, family, unlocked = false) {
    const achievement = {
        id,
        family,
        unlocked,
        getTitle: () => `${id} title`,
        getDescription: () => `${id} description`,
        checkUnlocked: () => achievement.unlocked,
    };
    return achievement;
}

// Given in the reverse of the family order, to show the list sorts them itself.
function sampleAchievements() {
    return [
        fakeAchievement("bally", ACHIEVEMENT_FAMILY.MANUFACTURERS, false),
        fakeAchievement("stern", ACHIEVEMENT_FAMILY.MANUFACTURERS, true),
        fakeAchievement("williams", ACHIEVEMENT_FAMILY.MANUFACTURERS, true),
        fakeAchievement("rageQuit", ACHIEVEMENT_FAMILY.SESSIONS, true),
        fakeAchievement("streak3", ACHIEVEMENT_FAMILY.STREAKS, false),
        fakeAchievement("oneHour", ACHIEVEMENT_FAMILY.PLAY_TIME, true),
        fakeAchievement("firstTable", ACHIEVEMENT_FAMILY.COLLECTION, true),
        fakeAchievement("tenPercent", ACHIEVEMENT_FAMILY.COLLECTION, false),
    ];
}

function setUp(achievements = sampleAchievements()) {
    const fake = createFakePinballYHost();
    const list = createAchievementList(fake, () => achievements);
    // The Achievement List opens from the main menu.
    fake.openMenu("main", [{ title: "Play", cmd: fake.getBuiltInCommand("PlayGame") }]);
    list.open();
    return { fake, list, achievements };
}

const titles = menu => menu.items.map(item => item.title);
const familyTitle = (family, unlocked, total) => TEXT.familyLine(TEXT.families[family], unlocked, total);

function familyItems(menu) {
    return menu.items.slice(FAMILY_ITEMS_START, -2);
}

test("the families level shows the total line, then the non-empty families in the fixed order with their counts", () => {
    const { fake } = setUp();
    const menu = fake.currentMenu();

    assert.deepEqual(menu.items[0], { title: TEXT.totalLine(5, 8), cmd: -1 });
    assert.deepEqual(menu.items[1], { cmd: -1 });
    assert.deepEqual(familyItems(menu).map(item => item.title), [
        familyTitle(ACHIEVEMENT_FAMILY.COLLECTION, 1, 2),
        familyTitle(ACHIEVEMENT_FAMILY.PLAY_TIME, 1, 1),
        familyTitle(ACHIEVEMENT_FAMILY.STREAKS, 0, 1),
        familyTitle(ACHIEVEMENT_FAMILY.SESSIONS, 1, 1),
        familyTitle(ACHIEVEMENT_FAMILY.MANUFACTURERS, 2, 3),
    ]);
    assert.ok(familyItems(menu).every(item => item.cmd > 0), "every family can be selected");
    assert.deepEqual(menu.items.slice(-2), [{ cmd: -1 }, { title: TEXT.back, cmd: fake.getBuiltInCommand("MenuReturn") }]);
});

test("every family has a label in every language", async () => {
    for (const code of ["en", "fr", "de", "es", "it", "pt"]) {
        const { default: texts } = await import(`../lang/${code}.js`);
        for (const family of Object.values(ACHIEVEMENT_FAMILY)) {
            assert.equal(typeof texts.achievementList.families[family], "string", `${code}: ${family}`);
        }
    }
});

test("a family lists its Unlocked Achievements first, checked, then the missing ones, in a paged section", () => {
    const { fake } = setUp();

    fake.selectMenuItem(familyTitle(ACHIEVEMENT_FAMILY.MANUFACTURERS, 2, 3));
    const menu = fake.currentMenu();

    assert.deepEqual(menu.items[0], { cmd: fake.getBuiltInCommand("MenuPageUp") });
    const achievementItems = menu.items.slice(1, 4);
    assert.deepEqual(achievementItems.map(({ title, checked }) => ({ title, checked })), [
        { title: "stern title", checked: true },
        { title: "williams title", checked: true },
        { title: "bally title", checked: false },
    ]);
    assert.deepEqual(menu.items[4], { cmd: fake.getBuiltInCommand("MenuPageDown") });
    assert.deepEqual(menu.items[5], { cmd: -1 });
    assert.equal(menu.items[6].title, TEXT.back);
    assert.equal(menu.items.length, 7);
});

test("selecting an Achievement keeps its family on screen", () => {
    const { fake } = setUp();
    fake.selectMenuItem(familyTitle(ACHIEVEMENT_FAMILY.MANUFACTURERS, 2, 3));
    const familyMenu = fake.currentMenu();

    fake.selectMenuItem("bally title");

    assert.equal(fake.currentMenu(), familyMenu);
    assert.equal(fake.getUIMode(), "menu");
});

test("Back in a family goes up to the families, on that family", () => {
    const { fake } = setUp();
    fake.selectMenuItem(familyTitle(ACHIEVEMENT_FAMILY.SESSIONS, 1, 1));

    fake.selectMenuItem(TEXT.back);

    const menu = fake.currentMenu();
    assert.equal(menu.items[0].title, TEXT.totalLine(5, 8));
    const selected = menu.items.filter(item => item.selected);
    assert.deepEqual(selected.map(item => item.title), [familyTitle(ACHIEVEMENT_FAMILY.SESSIONS, 1, 1)]);
});

test("Back on the families returns to the wheel", () => {
    const { fake } = setUp();

    fake.selectMenuItem(TEXT.back);

    assert.equal(fake.currentMenu(), null);
    assert.equal(fake.getUIMode(), "wheel");
});

test("Unlocked is computed each time a level opens: an Achievement that lost its condition shows as missing", () => {
    const { fake, achievements } = setUp();
    const williams = achievements.find(achievement => achievement.id === "williams");
    williams.unlocked = false;

    fake.selectMenuItem(familyTitle(ACHIEVEMENT_FAMILY.MANUFACTURERS, 2, 3));
    assert.deepEqual(fake.currentMenu().items.slice(1, 4).map(({ title, checked }) => ({ title, checked })), [
        { title: "stern title", checked: true },
        { title: "bally title", checked: false },
        { title: "williams title", checked: false },
    ]);

    fake.selectMenuItem(TEXT.back);
    const menu = fake.currentMenu();
    assert.equal(menu.items[0].title, TEXT.totalLine(4, 8));
    assert.ok(titles(menu).includes(familyTitle(ACHIEVEMENT_FAMILY.MANUFACTURERS, 1, 3)));
});

test("the Achievements are read again at each open, so a family that became empty disappears", () => {
    const achievements = sampleAchievements();
    const { fake, list } = setUp(achievements);
    fake.selectMenuItem(TEXT.back);

    achievements.splice(0, achievements.length, fakeAchievement("oneHour", ACHIEVEMENT_FAMILY.PLAY_TIME, false));
    list.open();

    const menu = fake.currentMenu();
    assert.equal(menu.items[0].title, TEXT.totalLine(0, 1));
    assert.deepEqual(familyItems(menu).map(item => item.title), [familyTitle(ACHIEVEMENT_FAMILY.PLAY_TIME, 0, 1)]);
});
