// ============================================================
// Keeps the backglass window hidden while a table is running (since VPX
// renders its own backglass), and shows it again once back at the wheel.
// ============================================================

export default function init() {
    setTimeout(() => {
        backglassWindow.showWindow(true);
    }, 0);
    mainWindow.on("gamestarted", () => backglassWindow.showWindow(false));
    mainWindow.on("gameover", () => backglassWindow.showWindow(true));
}
