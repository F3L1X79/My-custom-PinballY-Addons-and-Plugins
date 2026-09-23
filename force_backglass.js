// ============================================================
// Forces the backglass window visible at startup, hides it while a table is
// running (VPX renders its own backglass), and shows it again once back at
// the wheel. Listens to "gamestarted" and "gameover".
// ============================================================

import { safeHandler } from "./common/safe_handler.js";

const SCRIPT_NAME = "ForceBackglass";

export default function init() {
    // Hiding the backglass during play can end up saved as
    // "BackglassWindow.Visible = 0" if the settings are written while a game
    // runs, and PinballY then hides it again at startup. Deferred until
    // main.js has finished so the show wins over that startup setting.
    setTimeout(safeHandler(SCRIPT_NAME, () => {
        backglassWindow.showWindow(true);
    }), 0);
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, () => backglassWindow.showWindow(false)));
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, () => backglassWindow.showWindow(true)));
}
