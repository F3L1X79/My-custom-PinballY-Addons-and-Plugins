// ============================================================
// Random Game module: draws a table from the current wheel selection,
// never the Last Played Table unless it is the only one, animates the
// wheel to it and launches it. Created from the PinballY host and an
// animator (skipped when the player turned the animation off); the "Start Random Game" menu command and the startup choice
// prompt share one instance through getRandomGame(). Calls made while an
// animation is already running are ignored.
// ============================================================

import { animateWheelTo, sleep } from "./wheel_navigator.js";
import { createPinballYHost } from "./pinbally_host.js";
import config from "./config.js";

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
                host.playGame(tables[drawnIndex]);
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
            host.playGame(tables[landingIndex]);
        } finally {
            launchInProgress = false;
        }
    }

    return { launch };
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
