// ============================================================
// Achievement List module: the screen the player opens from the main menu
// to browse every Achievement by Achievement Family. It owns two levels of
// native PinballY menus (the families with their counts, then a family's
// Achievements, Unlocked ones first) and the Back navigation between them.
// Created from the PinballY host and a function that returns the current
// Achievements; Unlocked is computed again each time a level opens.
// Listens to "command". Opens its menus directly, not through the wheel
// dialog module: the player asked for them.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "./achievements.js";
import lang from "./i18n.js";
import { safeHandler } from "./safe_handler.js";

const SCRIPT_NAME = "AchievementList";
const FAMILIES_MENU_ID = "achievementListFamilies";
const FAMILY_MENU_ID = "achievementListFamily";

const FAMILY_ORDER = Object.values(ACHIEVEMENT_FAMILY);

export function createAchievementList(host, getAchievements) {
    const { achievementList: TEXT } = lang;

    const familyByCommand = new Map(FAMILY_ORDER.map(family =>
        [host.allocateCommand(`achievementListFamily.${family}`), family]));
    const commandByFamily = new Map([...familyByCommand].map(([cmd, family]) => [family, cmd]));
    // Selecting an Achievement does nothing yet; its item stays open.
    const achievementCommand = host.allocateCommand("achievementListAchievement");
    const backToFamiliesCommand = host.allocateCommand("achievementListBackToFamilies");
    // The family on screen, so Back puts the cursor on it again.
    let shownFamily = null;

    // The current Achievements with their live status, keyed by family, each
    // family in the natural order of the Achievement definitions.
    function readFamilies() {
        const families = new Map(FAMILY_ORDER.map(family => [family, []]));
        for (const achievement of getAchievements()) {
            if (!families.has(achievement.family)) {
                throw new Error(`Achievement "${achievement.id}" has no known Achievement Family.`);
            }
            families.get(achievement.family).push({ achievement, unlocked: achievement.checkUnlocked() });
        }
        return families;
    }

    const countUnlocked = entries => entries.filter(entry => entry.unlocked).length;

    function showFamilies(selectedFamily = null) {
        const families = readFamilies();
        const allEntries = [...families.values()].flat();

        const familyItems = [...families]
            .filter(([, entries]) => entries.length > 0)
            .map(([family, entries]) => ({
                title: TEXT.familyLine(TEXT.families[family], countUnlocked(entries), entries.length),
                cmd: commandByFamily.get(family),
                ...(family === selectedFamily ? { selected: true } : {}),
            }));

        host.showMenu(FAMILIES_MENU_ID, [
            { title: TEXT.totalLine(countUnlocked(allEntries), allEntries.length), cmd: -1 },
            { cmd: -1 },
            ...familyItems,
            { cmd: -1 },
            { title: TEXT.back, cmd: host.getBuiltInCommand("MenuReturn") },
        ]);
    }

    function showFamily(family) {
        const entries = readFamilies().get(family);
        const ordered = [...entries.filter(entry => entry.unlocked), ...entries.filter(entry => !entry.unlocked)];

        host.showMenu(FAMILY_MENU_ID, [
            { cmd: host.getBuiltInCommand("MenuPageUp") },
            ...ordered.map(({ achievement, unlocked }) => ({
                title: achievement.getTitle(),
                cmd: achievementCommand,
                checked: unlocked,
                stayOpen: true,
            })),
            { cmd: host.getBuiltInCommand("MenuPageDown") },
            { cmd: -1 },
            { title: TEXT.back, cmd: backToFamiliesCommand },
        ]);
        shownFamily = family;
    }

    // Fires on every command: a family opens its Achievements, Back in a
    // family reopens the families. Showing a menu from the command replaces
    // the current one.
    host.on("command", safeHandler(SCRIPT_NAME, ev => {
        if (familyByCommand.has(ev.id)) showFamily(familyByCommand.get(ev.id));
        else if (ev.id === backToFamiliesCommand) showFamilies(shownFamily);
    }));

    return { open: () => showFamilies() };
}
