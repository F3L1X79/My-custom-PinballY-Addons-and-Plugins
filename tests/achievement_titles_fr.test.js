// ============================================================
// The French Achievement titles, started through main.js on the fake
// PinballY globals in French: each Achievement Family of the Achievement
// List, in the fixed order, shows the reference title of each Achievement,
// one per threshold, completion titles keeping their group name.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const NOW = new Date(2026, 8, 23, 10, 0, 0);

// Never played, so every Achievement is missing and shown in natural order.
function table(id, title, manufacturer, year, categories) {
    return {
        id, configId: `${title} (${manufacturer} ${year})`, title, manufacturer, year, categories,
        playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
    };
}

const TABLES = [
    table(1, "Medieval Madness", "Williams", 1997, ["Fantasy"]),
    table(2, "Attack from Mars", "Bally", 1995, ["SciFi"]),
];

const ADD_ONS_UNDER_TEST = ["achievements"];

// Lets the wheel dialog module show the startup Achievements (setTimeout 0).
const settle = () => new Promise(resolve => setTimeout(resolve, 10));

test("the Achievement List shows the French reference titles, family by family", async () => {
    const fake = createFakePinballYHost({ now: NOW, tables: TABLES });
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ADD_ONS_UNDER_TEST.includes(key);
    }
    config.language = "fr";

    const { default: lang } = await import("../common/i18n.js");
    const TEXT = lang.achievementList;
    await import("../main.js");
    await settle();

    fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
    fake.selectMenuItem(TEXT.menuEntry);
    const familyLines = fake.currentMenu().items.filter(item => item.cmd > 0 && item.title !== TEXT.back);
    assert.deepEqual(familyLines.map(item => item.title.replace(/ \(\d+\/\d+\)$/, "")), [
        "Collection",
        "Temps de jeu",
        "Tables du jour et de la semaine",
        "Sessions",
        "Fabricants",
        "Décennies",
        "Catégories",
    ]);

    function openFamily(index) {
        fake.selectMenuItem(familyLines[index].title);
        const titles = fake.currentMenu().items.filter(item => typeof item.checked === "boolean").map(item => item.title);
        fake.selectMenuItem(TEXT.back);
        return titles;
    }

    assert.deepEqual(openFamily(0), [
        "Premiers pas",
        "Le goût du métal",
        "Collectionneur en herbe",
        "Mi-temps",
        "Presque tout vu",
        "Rien ne m'échappe",
    ]);
    assert.deepEqual(openFamily(1), [
        "Mise en jambes",
        "Ça devient sérieux",
        "Accro aux flippers",
        "Flipper dans le sang",
        "Légende du tilt",
    ]);
    assert.deepEqual(openFamily(2), [
        "Jamais deux sans trois",
        "Semaine parfaite",
        "Moine du flipper",
        "Un mois sans faute",
        "Abonné fidèle",
    ]);
    assert.deepEqual(openFamily(3), [
        "Petit marathon",
        "Marathonien",
        "Rage quit ?!",
        "Le grand retour",
    ]);
    assert.deepEqual(openFamily(4), ["Fan absolu de Bally", "Fan absolu de Williams"]);
    assert.deepEqual(openFamily(5), ["Voyage dans les années 1990"]);
    assert.deepEqual(openFamily(6), ["Maître Fantasy", "Maître SciFi"]);

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
