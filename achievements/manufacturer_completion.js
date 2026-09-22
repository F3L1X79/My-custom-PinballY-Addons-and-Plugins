import lang from "../common/i18n.js";

// ============================================================
// One achievement per manufacturer found in the collection (including
// the fictional "VPX Community" manufacturer, treated like any other):
// unlocked once every non-hidden table from that manufacturer has been
// played at least once.
// ============================================================

export function buildManufacturerCompletionAchievements() {
    const { achievements: TEXT } = lang;

    const allGames = gameList.getAllGames().filter(game => !game.isHidden);

    const manufacturers = new Set();
    for (const game of allGames) {
        if (game.manufacturer) manufacturers.add(game.manufacturer);
    }

    const achievements = [];
    for (const manufacturer of manufacturers) {
        const gamesForManufacturer = allGames.filter(game => game.manufacturer === manufacturer);

        achievements.push({
            id: `manufacturerCompletion:${manufacturer}`,
            getTitle: () => TEXT.manufacturerCompletionTitle(manufacturer),
            getDescription: () => TEXT.manufacturerCompletionDescription(manufacturer, gamesForManufacturer.length),
            checkUnlocked: () => gamesForManufacturer.every(game => game.playCount > 0),
        });
    }

    return achievements;
}