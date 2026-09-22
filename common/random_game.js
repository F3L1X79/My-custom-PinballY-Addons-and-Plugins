import { animateWheelTo, sleep } from "./wheel_navigator.js";
import config from "./config.js";

// ============================================================
// Shared logic for picking a random table from the current wheel
// selection, animating the wheel to it, and launching it. Used by both
// the "Random Game" menu command and the startup choice prompt.
// ============================================================

const {
    animationBaseSpeedMs: ANIMATION_BASE_SPEED_MS,
    skipAnimation: SKIP_ANIMATION,
    skipFinalStepProbability: SKIP_FINAL_STEP_PROBABILITY,
    usePageJumpOptimization: USE_PAGE_JUMP_OPTIMIZATION,
    postAnimationDelayMs: POST_ANIMATION_DELAY_MS,
} = config.randomGameCommand;

let randomLaunchInProgress = false;

export async function launchRandomGame() {
    if (randomLaunchInProgress) return;

    const games = gameList.getAllWheelGames();
    if (!Array.isArray(games) || games.length === 0) return;

    randomLaunchInProgress = true;

    try {
        const chosenGameIndex = Math.floor(Math.random() * games.length);

        if (SKIP_ANIMATION) {
            mainWindow.playGame(games[chosenGameIndex]);
            return;
        }

        const finalIndex = await animateWheelTo(games, chosenGameIndex, {
            baseSpeedMs: ANIMATION_BASE_SPEED_MS,
            skipFinalStepProbability: SKIP_FINAL_STEP_PROBABILITY,
            usePageJumpOptimization: USE_PAGE_JUMP_OPTIMIZATION,
        });

        await sleep(POST_ANIMATION_DELAY_MS);

        const gameToLaunch = games[finalIndex] || games[chosenGameIndex];
        if (gameToLaunch) mainWindow.playGame(gameToLaunch);
    } finally {
        randomLaunchInProgress = false;
    }
}