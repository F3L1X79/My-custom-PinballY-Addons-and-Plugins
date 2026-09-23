// ============================================================
// Keeps the backglass window hidden while a table is running (since VPX
// renders its own backglass), and shows it again once back at the wheel.
// ============================================================

import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "ForceBackglass";

/**
 * Shows the backglass once startup completes and toggles it around each
 * play session; every callback is protected by safeHandler.
 * @returns {void}
 */
export default function init() {
    setTimeout(safeHandler(SCRIPT_NAME, () => {
        backglassWindow.showWindow(true);
    }), 0);
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, () => backglassWindow.showWindow(false)));
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, () => backglassWindow.showWindow(true)));
}
