// ============================================================
// Random Game module: draws a table from the current wheel selection,
// never the Last Played Table unless it is the only one, animates the
// wheel to it and launches it. Created from the PinballY host and an
// animator (skipped when the player turned the animation off); the "Start Random Game" menu command and the startup choice
// prompt share one instance through getRandomGame(). Calls made while an
// animation is already running are ignored. Counts the Random Games
// played in "custom.randomGame.launchCount" (on "gamestarted", never after
// "launcherror").
// ============================================================

import { animateWheelTo, sleep } from "./wheel_navigator.js";
import { createPinballYHost } from "./pinbally_host.js";
import { safeHandler } from "./safe_handler.js";
import config from "./config.js";

const SCRIPT_NAME = "RandomGame";
// Players' saved progress: must never change.
const LAUNCH_COUNT_KEY = "custom.randomGame.launchCount";

// Base speed (ms) of the "wheel of fortune" animation.
const ANIMATION_BASE_SPEED_MS = 200;
// Probability (0-1) of intentionally stopping one table before the drawn one.
const STOP_EARLY_PROBABILITY = 0.5;
// Use NextPage-based jumps for long distances.
const USE_PAGE_JUMP_OPTIMIZATION = true;
// Delay after the wheel animation before launching the selected game.
const POST_ANIMATION_DELAY_MS = 1000;

const randomIndex = length => Math.floor(Math.random() * length);

// The most recently played visible table of the whole collection, or null
// when no table was ever played.
function findLastPlayedTable(tables) {
    return tables
        .filter(game => game.lastPlayed)
        .reduce((latest, game) =>
            (!latest || game.lastPlayed.getTime() > latest.lastPlayed.getTime() ? game : latest), null);
}

export function createRandomGame(host, { animateTo, skipAnimation = config.skipRandomGameAnimation }) {
    let launchInProgress = false;
    // The table this module just launched, until it starts or fails to launch.
    let pendingConfigId = null;

    function playGame(game) {
        pendingConfigId = game.configId;
        host.playGame(game);
    }

    async function launch() {
        if (launchInProgress) return;

        const tables = host.getWheelTables();
        if (!Array.isArray(tables) || tables.length === 0) return;

        launchInProgress = true;
        try {
            const lastPlayedTable = findLastPlayedTable(host.getVisibleTables());
            const isLastPlayed = index =>
                lastPlayedTable !== null && tables[index].configId === lastPlayedTable.configId;

            const allIndexes = tables.map((_, index) => index);
            const candidates = allIndexes.filter(index => !isLastPlayed(index));
            const pool = candidates.length > 0 ? candidates : allIndexes;
            const drawnIndex = pool[randomIndex(pool.length)];

            if (skipAnimation) {
                playGame(tables[drawnIndex]);
                return;
            }

            // The suspense "one table early" stop may land on neither the
            // current table (index 0, never animated away from) nor the Last
            // Played Table: then the wheel goes on to the drawn table.
            const canStopEarly = drawnIndex > 0 && !isLastPlayed(drawnIndex - 1);
            const landingIndex = canStopEarly && Math.random() < STOP_EARLY_PROBABILITY
                ? drawnIndex - 1
                : drawnIndex;

            await animateTo(tables, landingIndex);
            playGame(tables[landingIndex]);
        } finally {
            launchInProgress = false;
        }
    }

    function getRandomGamesPlayed() {
        return host.settings.getInt(LAUNCH_COUNT_KEY, 0);
    }

    // Fires when a launched table's first window opens. Only one table runs
    // at a time, so any start settles the pending Random Game: counted if it
    // is that table, forgotten otherwise.
    host.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        const isRandomGame = pendingConfigId !== null && ev.game && ev.game.configId === pendingConfigId;
        pendingConfigId = null;
        if (isRandomGame) host.settings.set(LAUNCH_COUNT_KEY, getRandomGamesPlayed() + 1);
    }));

    // Fires instead of "gamestarted" when the launch fails.
    host.on("launcherror", safeHandler(SCRIPT_NAME, () => {
        pendingConfigId = null;
    }));

    return { launch, getRandomGamesPlayed };
}

async function animateWheelThenPause(tables, index) {
    await animateWheelTo(tables, index, {
        baseSpeedMs: ANIMATION_BASE_SPEED_MS,
        usePageJumpOptimization: USE_PAGE_JUMP_OPTIMIZATION,
    });
    await sleep(POST_ANIMATION_DELAY_MS);
}

let sharedRandomGame = null;

// One instance for every add-on, so a Random Game requested from the menu
// while the startup prompt's one is animating is ignored.
export function getRandomGame() {
    if (!sharedRandomGame) {
        sharedRandomGame = createRandomGame(createPinballYHost(), { animateTo: animateWheelThenPause });
    }
    return sharedRandomGame;
}
