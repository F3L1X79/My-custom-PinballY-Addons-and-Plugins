// ============================================================
// Achievement List module: the screen the player opens from the main menu
// to browse every Achievement by Achievement Family. It owns three levels of
// native PinballY menus (the families with their counts, a family's
// Achievements, Unlocked ones first, then an Achievement's card) and the
// Back navigation between them.
// Created from the PinballY host and a function that returns the current
// Achievements; Unlocked is computed again each time a level opens, and so
// is the Achievement Progress a missing Achievement shows after its title
// and on its card.
// Listens to "command". Opens its menus directly, not through the wheel
// dialog module: the player asked for them.
// ============================================================

import { ACHIEVEMENT_FAMILY } from "./achievements.js";
import lang from "./i18n.js";
import { safeHandler } from "./safe_handler.js";

const SCRIPT_NAME = "AchievementList";
const FAMILIES_MENU_ID = "achievementListFamilies";
const FAMILY_MENU_ID = "achievementListFamily";
const CARD_MENU_ID = "achievementListCard";

const FAMILY_ORDER = Object.values(ACHIEVEMENT_FAMILY);

export function createAchievementList(host, getAchievements) {
    const { achievementList: TEXT } = lang;

    const familyByCommand = new Map(FAMILY_ORDER.map(family =>
        [host.allocateCommand(`achievementListFamily.${family}`), family]));
    const commandByFamily = new Map([...familyByCommand].map(([cmd, family]) => [family, cmd]));
    // One command per line of a family, by position. The largest family
    // depends on the collection, so the pool grows on demand instead of
    // being allocated all at startup.
    const achievementCommands = [];
    const backToFamiliesCommand = host.allocateCommand("achievementListBackToFamilies");
    const backToFamilyCommand = host.allocateCommand("achievementListBackToFamily");
    // The family on screen and its Achievements in shown order, so Back
    // puts the cursor on the family or Achievement the player left.
    let shownFamily = null;
    let shownAchievements = [];
    let shownCardAchievement = null;

    function getAchievementCommand(index) {
        while (achievementCommands.length <= index) {
            achievementCommands.push(host.allocateCommand(`achievementListAchievement.${achievementCommands.length}`));
        }
        return achievementCommands[index];
    }

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

    // The short and long texts of a missing Achievement's Achievement
    // Progress, or null when it has none.
    function describeProgress(achievement, unlocked) {
        if (unlocked || typeof achievement.getProgress !== "function") return null;
        const progress = achievement.getProgress();
        if (!progress) return null;
        const unitTexts = TEXT.progressUnits[progress.unit];
        if (!unitTexts) {
            throw new Error(`Achievement "${achievement.id}" has an unknown progress unit "${progress.unit}".`);
        }
        return {
            short: unitTexts.short(progress.current, progress.target),
            long: unitTexts.long(progress.current, progress.target),
        };
    }

    function titleWithProgress(achievement, unlocked) {
        const progress = describeProgress(achievement, unlocked);
        return progress ? TEXT.titleWithProgress(achievement.getTitle(), progress.short) : achievement.getTitle();
    }

    const countUnlocked = entries => entries.filter(entry => entry.unlocked).length;

    // The total line's counts, also shown by the Profile Stats so the two
    // screens never disagree.
    function countAll(families = readFamilies()) {
        const allEntries = [...families.values()].flat();
        return { unlocked: countUnlocked(allEntries), total: allEntries.length };
    }

    function showFamilies(selectedFamily = null) {
        const families = readFamilies();
        const totals = countAll(families);

        const familyItems = [...families]
            .filter(([, entries]) => entries.length > 0)
            .map(([family, entries]) => ({
                title: TEXT.familyLine(TEXT.families[family], countUnlocked(entries), entries.length),
                cmd: commandByFamily.get(family),
                ...(family === selectedFamily ? { selected: true } : {}),
            }));

        host.showMenu(FAMILIES_MENU_ID, [
            { title: TEXT.totalLine(totals.unlocked, totals.total), cmd: -1 },
            { cmd: -1 },
            ...familyItems,
            { cmd: -1 },
            { title: TEXT.back, cmd: host.getBuiltInCommand("MenuReturn") },
        ]);
    }

    // The page size depends on the screen, so the module can't name the
    // page to reopen: it relies on PinballY opening the paged section on the
    // page that holds the selected Achievement. The help doesn't document
    // this; to be checked in PinballY.
    function showFamily(family, selectedAchievementId = null) {
        const entries = readFamilies().get(family);
        const ordered = [...entries.filter(entry => entry.unlocked), ...entries.filter(entry => !entry.unlocked)];

        host.showMenu(FAMILY_MENU_ID, [
            { cmd: host.getBuiltInCommand("MenuPageUp") },
            ...ordered.map(({ achievement, unlocked }, index) => ({
                title: titleWithProgress(achievement, unlocked),
                cmd: getAchievementCommand(index),
                checked: unlocked,
                ...(achievement.id === selectedAchievementId ? { selected: true } : {}),
            })),
            { cmd: host.getBuiltInCommand("MenuPageDown") },
            { cmd: -1 },
            { title: TEXT.back, cmd: backToFamiliesCommand },
        ]);
        shownFamily = family;
        shownAchievements = ordered.map(entry => entry.achievement);
    }

    function showCard(achievement) {
        const unlocked = achievement.checkUnlocked();
        const status = unlocked ? TEXT.unlocked : TEXT.notUnlocked;
        const progress = describeProgress(achievement, unlocked);
        const message = progress
            ? TEXT.cardMessage(achievement.getTitle(), achievement.getDescription(), status, TEXT.progressLine(progress.long))
            : TEXT.cardMessage(achievement.getTitle(), achievement.getDescription(), status);
        host.showMenu(CARD_MENU_ID, [
            { title: message, cmd: -1 },
            { cmd: -1 },
            { title: TEXT.back, cmd: backToFamilyCommand },
        ], { dialogStyle: true });
        shownCardAchievement = achievement;
    }

    // Fires on every command: a family opens its Achievements, an
    // Achievement opens its card, Back goes up one level. Showing a menu
    // from the command replaces the current one.
    host.on("command", safeHandler(SCRIPT_NAME, ev => {
        const achievementIndex = achievementCommands.indexOf(ev.id);
        if (familyByCommand.has(ev.id)) {
            showFamily(familyByCommand.get(ev.id));
        } else if (achievementIndex >= 0 && achievementIndex < shownAchievements.length) {
            showCard(shownAchievements[achievementIndex]);
        } else if (ev.id === backToFamilyCommand) {
            showFamily(shownFamily, shownCardAchievement.id);
        } else if (ev.id === backToFamiliesCommand) {
            showFamilies(shownFamily);
        }
    }));

    return { open: () => showFamilies(), countAll: () => countAll() };
}
