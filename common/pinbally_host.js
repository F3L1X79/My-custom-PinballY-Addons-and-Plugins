// ============================================================
// Production PinballY host: the single seam through which the deepened
// modules reach PinballY (settings, clock, timers, visible tables, wheel
// selection, main window menus / UI mode / events / drawing layers,
// StyledText, commands, table launch, program folder, sound playback).
// Every call passes straight through to PinballY's globals; tests use the
// in-memory fake host from tests/fake_pinbally_host.js instead. No side
// effects on import.
// ============================================================

export function createPinballYHost() {
    // Created on the first sound played: most sessions never play one.
    let mediaPlayer = null;

    return {
        settings: {
            getString: (key, defaultValue) => optionSettings.get(key, defaultValue),
            getInt: (key, defaultValue) => optionSettings.getInt(key, defaultValue),
            getFloat: (key, defaultValue) => optionSettings.getFloat(key, defaultValue),
            getBool: (key, defaultValue) => optionSettings.getBool(key, defaultValue),
            set: (key, value) => { optionSettings.set(key, value); },
        },

        now: () => new Date(),
        setTimeout: (callback, ms) => setTimeout(callback, ms),
        clearTimeout: (id) => { clearTimeout(id); },
        setInterval: (callback, ms) => setInterval(callback, ms),
        clearInterval: (id) => { clearInterval(id); },

        getVisibleTables: () => gameList.getAllGames().filter(game => !game.isHidden),
        // The current wheel selection in wheel order: index 0 is the current table.
        getWheelTables: () => gameList.getAllWheelGames(),
        getGameInfo: (configId) => gameList.getGameInfo(configId),

        // Only the mode name ("wheel", "menu", "popup", "running", "attract").
        getUIMode: () => mainWindow.getUIMode().mode,
        // The whole UI mode object; runMode is present only while a game
        // starts, runs or exits.
        getFullUIMode: () => mainWindow.getUIMode(),
        showMenu: (id, items, options) => { mainWindow.showMenu(id, items, options); },
        on: (eventName, handler) => { mainWindow.on(eventName, handler); },
        createDrawingLayer: (zIndex) => mainWindow.createDrawingLayer(zIndex),
        createStyledText: (options) => new StyledText(options),

        allocateCommand: (name) => command.allocate(name),
        // PinballY's own command IDs, such as "PlayGame" or "MenuReturn".
        getBuiltInCommand: (name) => command[name],
        playGame: (game) => { mainWindow.playGame(game); },

        // drawImage resolves relative paths from this folder, not from Scripts/.
        getProgramFolder: () => systemInfo.programDir,
        // Through the Windows Media Player COM component, like the launch
        // sound; throws when it is unavailable or the file is missing
        // (Windows Media Player itself fails silently on a missing file).
        playSound: (filePath) => {
            if (!createAutomationObject("Scripting.FileSystemObject").FileExists(filePath)) {
                throw new Error(`Sound file not found: ${filePath}`);
            }
            if (!mediaPlayer) {
                const player = createAutomationObject("WMPlayer.OCX.7");
                player.settings.autoStart = true;
                mediaPlayer = player;
            }
            mediaPlayer.URL = filePath;
        },
    };
}
