// ============================================================
// Production PinballY host: the single seam through which the deepened
// modules reach PinballY (settings, clock, visible tables, wheel
// selection, main window menus / UI mode / events, commands, table launch).
// Every call passes straight through to PinballY's globals; tests use the
// in-memory fake host from tests/fake_pinbally_host.js instead. No side
// effects on import.
// ============================================================

export function createPinballYHost() {
    return {
        settings: {
            getString: (key, defaultValue) => optionSettings.get(key, defaultValue),
            getInt: (key, defaultValue) => optionSettings.getInt(key, defaultValue),
            getFloat: (key, defaultValue) => optionSettings.getFloat(key, defaultValue),
            getBool: (key, defaultValue) => optionSettings.getBool(key, defaultValue),
            set: (key, value) => { optionSettings.set(key, value); },
        },

        now: () => new Date(),

        getVisibleTables: () => gameList.getAllGames().filter(game => !game.isHidden),
        // The current wheel selection in wheel order: index 0 is the current table.
        getWheelTables: () => gameList.getAllWheelGames(),
        getGameInfo: (configId) => gameList.getGameInfo(configId),

        // Only the mode name ("wheel", "menu", "popup", "running", "attract").
        getUIMode: () => mainWindow.getUIMode().mode,
        showMenu: (id, items, options) => { mainWindow.showMenu(id, items, options); },
        on: (eventName, handler) => { mainWindow.on(eventName, handler); },

        allocateCommand: (name) => command.allocate(name),
        playGame: (game) => { mainWindow.playGame(game); },
    };
}
