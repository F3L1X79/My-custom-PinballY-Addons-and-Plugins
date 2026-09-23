// ============================================================
// Plays a sound effect when a table is launched ("gamestarted") and stops it
// on "gameover", using the Windows Media Player COM component (WMPlayer.OCX)
// via OLE automation, which requires the "Windows Media Player" optional
// Windows feature. Does nothing (one log line at startup) when
// config.launchSound.absoluteFilePath is empty.
// ============================================================

import config from "./common/config.js";
import { safeHandler } from "./common/safe_handler.js";

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

export default function init() {
    const filePath = config.launchSound.absoluteFilePath;
    if (typeof filePath !== "string" || filePath.length === 0) {
        logfile.log("[LaunchSound] launchSound.absoluteFilePath is not set in common/config.js; launch sound disabled.");
        return;
    }

    const mediaPlayer = initializeMediaPlayer();

    // Fires on table launch: starts playing the configured sound file.
    mainWindow.on("gamestarted", safeHandler(SCRIPT_NAME, () => {
        if (!mediaPlayer) return;

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