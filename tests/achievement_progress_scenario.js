// ============================================================
// Shared scenario for the Achievement Progress tests: starts main.js on the
// fake PinballY globals with the given tables and Profile files, plays
// tables for real and reads what the Achievement List shows (a family's
// titles, an Achievement's card). Each test file runs in its own process,
// so each starts one scenario.
// ============================================================

import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

export const PROFILES_FOLDER = "C:\\PinballY\\Scripts\\profiles";
// Longer than a toast's whole life (rise, hold, fade).
const ONE_TOAST_MS = 6000;
const ADD_ONS_UNDER_TEST = ["customMenuCommands", "achievements", "sessionStatsTracker"];

// PinballY's own play stats count for nothing: only the Profiles' plays do.
export function table(id, title, manufacturer, year, categories = []) {
    return {
        id, configId: `${title} (${manufacturer} ${year})`, title, manufacturer, year, categories,
        playCount: 0, playTime: 0, lastPlayed: null, rating: -1, isHidden: false,
    };
}

export async function startScenario({ now, tables, files = {}, folders = [] }) {
    const fake = createFakePinballYHost({ now, tables });
    for (const folder of folders) fake.addFolder(folder);
    for (const [path, content] of Object.entries(files)) fake.addFile(path, JSON.stringify(content));
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) {
        config.addOns[key] = ADD_ONS_UNDER_TEST.includes(key);
    }
    config.language = "en";
    const { default: lang } = await import("../common/i18n.js");
    const { getProfileStore } = await import("../common/profile_store.js");
    await import("../main.js");
    await settle();
    const TEXT = lang.achievementList;

    // Lets every waiting toast show, so the wheel is free again.
    async function showEveryToast() {
        for (let guard = 0; guard < 100; guard++) {
            const shownCount = fake.drawings().length;
            fake.advanceTime(ONE_TOAST_MS);
            await settle();
            if (fake.drawings().length === shownCount) break;
        }
    }

    async function play(game, seconds = 60) {
        fake.playGame(game);
        fake.gameStarted(game);
        await settle();
        fake.advanceTime(seconds * 1000);
        fake.gameOver(game);
        await settle();
        await showEveryToast();
    }

    function closeMenus() {
        for (let guard = 0; guard < 5 && fake.currentMenu(); guard++) {
            fake.selectMenuItem(TEXT.back);
        }
    }

    function openFamily(family) {
        fake.openMenu("main", [{ title: "Play", cmd: globalThis.command.PlayGame }]);
        fake.selectMenuItem(TEXT.menuEntry);
        const line = fake.currentMenu().items.find(item => item.title && item.title.startsWith(TEXT.families[family]));
        fake.selectMenuItem(line.title);
    }

    // The titles a family shows, in order.
    function familyTitles(family) {
        openFamily(family);
        const titles = fake.currentMenu().items.filter(item => typeof item.checked === "boolean").map(item => item.title);
        closeMenus();
        return titles;
    }

    // The card of the Achievement shown under that title in its family.
    function cardText(family, shownTitle) {
        openFamily(family);
        fake.selectMenuItem(shownTitle);
        const text = fake.currentMenu().items[0].title;
        closeMenus();
        return text;
    }

    const withProgress = (title, unit, current, target) =>
        TEXT.titleWithProgress(title, TEXT.progressUnits[unit].short(current, target));

    // The card of a missing Achievement, with its Achievement Progress.
    const progressCard = (title, description, unit, current, target) =>
        TEXT.cardMessage(title, description, TEXT.notUnlocked, TEXT.progressLine(TEXT.progressUnits[unit].long(current, target)));

    return { fake, lang, getProfileStore, play, showEveryToast, familyTitles, cardText, withProgress, progressCard };
}
