import config from "./common/config.js";
import { safeHandler } from "./common/safe_handler.js";

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

const SCRIPT_NAME = "LaunchSound";

/**
 * Creates the media player and registers the listeners that start the launch
 * sound and stop it on exit. The inner try/catch blocks keep their specific
 * messages; safeHandler catches anything else the handlers may throw.
 * @returns {void}
 */
export default function init() {
    const mediaPlayer = initializeMediaPlayer();

    // Fires on table launch: starts playing the configured sound file.
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, () => {
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
    }));

    // Fires on table exit: stops the sound if it is still playing.
    mainWindow.on("gameover", safeHandler(SCRIPT_NAME, () => {
        if (!mediaPlayer) return;

        try {
            mediaPlayer.controls.stop();
        } catch (error) {
            logfile.log("[LaunchSound] WARNING: could not stop launch sound (" + error.message + ").");
        }
    }));
}