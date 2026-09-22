// ============================================================
// Hides the wheel and clears the underlay while a table is launching, to
// avoid a jarring black screen flash between the wheel view and the table's
// own loading screen.
// ============================================================

export default function init() {
    mainWindow.on("launchoverlayshow", ev => {
        mainWindow.showWheel(false);
        mainWindow.setUnderlay("");
        mainWindow.launchOverlay.bg.clear(0x20FF00FF);
        ev.preventDefault();
    });

    mainWindow.on("launchoverlayhide", () => {
        mainWindow.showWheel(true);
    });
}