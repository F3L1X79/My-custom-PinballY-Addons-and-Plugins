// ============================================================
// Fills PinballY's lower status line with rotating info about the selected
// table: its alphabetical position within the active filter, release year,
// manufacturer, play count and total play time. Refreshes on "gameselect"
// and "filterselect".
// ============================================================

import lang from "./common/i18n.js";
import config from "./common/config.js";
import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "StatusLineInfo";

export default function init() {
    const STATUS_LINE_TEXT = lang.tableInfoStatusLines;
    const COMMUNITY_MANUFACTURER_NAME = config.communityTablesManufacturer;

    const STATUS_LINE_BUILDERS = [
        position => STATUS_LINE_TEXT.year(position),
        (position, manufacturer) => manufacturer === COMMUNITY_MANUFACTURER_NAME
            ? STATUS_LINE_TEXT.manufacturerFictional(position)
            : STATUS_LINE_TEXT.manufacturer(position),
        position => STATUS_LINE_TEXT.playCount(position),
        position => STATUS_LINE_TEXT.playTime(position),
    ];

    // Cache of the CURRENTLY FILTERED wheel titles, sorted alphabetically once
    // and reused to compute the current table's rank without re-sorting on
    // every selection. Invalidated whenever the active filter changes (see the
    // "filterselect" listener below), since a filter change swaps out which
    // games gameList.getWheelGame()/getWheelCount() return entirely.
    let cachedSortedTitles = null;

    function buildSortedTitles() {
        const wheelCount = gameList.getWheelCount();
        const titles = [];

        for (let i = 0; i < wheelCount; i++) {
            const game = gameList.getWheelGame(i);
            if (game) titles.push(String(game.title ?? ""));
        }

        titles.sort((a, b) => a.localeCompare(b));
        cachedSortedTitles = titles;
        return cachedSortedTitles;
    }

    function findTitleIndex(sortedTitles, title) {
        let low = 0;
        let high = sortedTitles.length - 1;

        while (low <= high) {
            const mid = (low + high) >> 1;
            const comparison = sortedTitles[mid].localeCompare(title);
            if (comparison === 0) return mid;
            if (comparison < 0) low = mid + 1;
            else high = mid - 1;
        }

        return -1;
    }

    /** Returns the 1-based alphabetical rank of the currently selected table within the active filter. */
    function getCurrentTablePosition(currentTitle) {
        if (gameList.getWheelCount() === 0 || !currentTitle) return 0;

        let sortedTitles = cachedSortedTitles || buildSortedTitles();
        let titleIndex = findTitleIndex(sortedTitles, currentTitle);

        // Extra self-healing safety net: if a title is somehow missing (e.g. the
        // game list itself changed, not just the filter), rebuild once.
        if (titleIndex < 0) {
            sortedTitles = buildSortedTitles();
            titleIndex = findTitleIndex(sortedTitles, currentTitle);
        }

        return titleIndex >= 0 ? titleIndex + 1 : 0;
    }

    /** Ensures the status line has at least `count` message slots allocated. */
    function ensureStatusLineSlotCount(statusLine, count) {
        const currentSlotCount = statusLine.getText().length;
        for (let i = currentSlotCount; i < count; i++) {
            statusLine.add("");
        }
    }

    function refreshStatusLine() {
        const currentGame = gameList.getWheelGame(0);
        const currentTitle = currentGame ? currentGame.title : null;
        const position = getCurrentTablePosition(currentTitle);
        const manufacturer = currentGame ? currentGame.manufacturer ?? null : null;

        ensureStatusLineSlotCount(mainWindow.statusLines.lower, STATUS_LINE_BUILDERS.length);

        STATUS_LINE_BUILDERS.forEach((buildText, i) => {
            mainWindow.statusLines.lower.setText(i, buildText(position, manufacturer));
        });
    }

    // A filter change (category, manufacturer, era, etc.) swaps out the entire
    // set of games the wheel shows. The filterselect event fires slightly
    // BEFORE PinballY's internal wheel data actually reflects the new filter,
    // so querying gameList synchronously here would still see the old list —
    // deferring by one tick lets the switch complete first.
    // The deferred callback runs outside the listener's call stack, so it is
    // guarded separately from the listener itself.
    gameList.on("filterselect", safeHandler(SCRIPT_NAME, () => {
        setTimeout(safeHandler(SCRIPT_NAME, () => {
            buildSortedTitles();
            refreshStatusLine();
        }), 0);
    }));

    gameList.on("gameselect", safeHandler(SCRIPT_NAME, refreshStatusLine));

    refreshStatusLine();
}