import config from "./common/config.js";

// ============================================================
// Plays a sound effect whenever a table is launched, using the Windows
// Media Player COM component (WMPlayer.OCX) via OLE automation.
// Requires the "Windows Media Player" optional Windows feature to be enabled.
// ============================================================

function clampVolume(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

function initializeMediaPlayer() {
    try {
        const player = createAutomationObject("WMPlayer.OCX.7");
        player.settings.autoStart = true;
        player.settings.volume = clampVolume(config.launchSound.volumePercent);
        return player;
    } catch (error) {
        logfile.log(
            "[LaunchSound] ERROR: could not initialize Windows Media Player ("
            + error.message
            + "). Is the 'Windows Media Player' optional feature enabled?"
        );
        return null;
    }
}

export default function init() {
    const mediaPlayer = initializeMediaPlayer();

    mainWindow.on("gamestarted", () => {
        if (!mediaPlayer) return;

        const filePath = config.launchSound.absoluteFilePath;
        if (typeof filePath !== "string" || filePath.length === 0) {
            logfile.log("[LaunchSound] ERROR: launchSound.absoluteFilePath is empty.");
            return;
        }

        try {
            mediaPlayer.URL = filePath;
        } catch (error) {
            logfile.log("[LaunchSound] ERROR: could not play launch sound (" + error.message + ").");
        }
    });

    mainWindow.on("gameover", () => {
        if (!mediaPlayer) return;

        try {
            mediaPlayer.controls.stop();
        } catch (error) {
            logfile.log("[LaunchSound] WARNING: could not stop launch sound (" + error.message + ").");
        }
    });
}