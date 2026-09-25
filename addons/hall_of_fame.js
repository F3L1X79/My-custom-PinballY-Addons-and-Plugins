// ============================================================
// Adds a "Hall of Fame" filter to PinballY's main menu, right after
// "Favorites": the wheel then shows the Hall of Fame tables in rank order,
// each table its own Next/Previous Page stop. Registered once at init; the
// ranking is recomputed each time the filter is activated.
// ============================================================

import lang from "../common/i18n.js";
import { getHallOfFame } from "../common/hall_of_fame.js";
import { safeHandler } from "../common/safe_handler.js";

const SCRIPT_NAME = "HallOfFame";

// PinballY's "Favorites" filter has sort key "7000" in the [Top] group.
const AFTER_FAVORITES_SORT_KEY = "7500";

export default function init() {
    const { hallOfFameFilter: FILTER_TITLE } = lang.customMenuLabels;

    // Rank (from 1) of each Hall of Fame table, by game id. Kept after the
    // scan: PinballY sorts and pages the wheel with it once select() is done.
    let ranks = new Map();

    gameList.createFilter({
        id: "project.HallOfFame",
        title: FILTER_TITLE,
        group: "[Top]",
        sortKey: AFTER_FAVORITES_SORT_KEY,
        // Fires each time the filter is activated, before PinballY scans the tables.
        before: safeHandler(SCRIPT_NAME, () => {
            ranks = new Map(getHallOfFame(gameList.getAllGames()).map((game, index) => [game.id, index + 1]));
        }),
        select: game => ranks.has(game.id),
        compareForSort: (a, b) => ranks.get(a.id) - ranks.get(b.id),
        // Group 0 would make the wheel skip the table, so ranks start at 1.
        pageGroup: game => ranks.get(game.id),
    });
}
