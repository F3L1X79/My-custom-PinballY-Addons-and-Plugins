// ============================================================
// Forces the backglass window visible at startup, hides it while a table is
// running (VPX renders its own backglass), and shows it again once back at
// the wheel. Listens to "gamestarted" and "gameover".
// ============================================================

import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "ForceBackglass";

export default function init() {
    setTimeout(safeHandler(SCRIPT_NAME, () => {
        backglassWindow.showWindow(true);
    }), 0);
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, () => backglassWindow.showWindow(false)));
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, () => backglassWindow.showWindow(true)));
}
