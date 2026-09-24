// ============================================================
// In-memory fake PinballY host for the node tests. Offers the same
// interface as common/pinbally_host.js, plus controls for the tests: set
// the date and the table list, seed settings, fire PinballY events, pick
// menu items, play launched games, and inspect shown menus, launches and
// written settings keys. installGlobals() also exposes it as PinballY's
// globals (and the global Date), so code not yet on the host runs too.
// Never loaded by PinballY.
// ============================================================

const RealDate = Date;

// PinballY's own commands used by the add-ons; custom ones start above them.
const BUILT_IN_COMMANDS = { PlayGame: 1, ShowGameSetupMenu: 2, RateGame: 3 };
const FIRST_CUSTOM_COMMAND = 1000;

const TRUE_STRINGS = ["1", "true", "yes", "on"];

// PinballY stores every setting as a string and converts on read.
function toStoredString(value) {
    if (typeof value === "boolean") return value ? "1" : "0";
    return String(value);
}

export function createFakePinballYHost({ now = new RealDate(), tables = [] } = {}) {
    let nowMs = now.getTime();
    let allTables = tables.map(table => ({ ...table }));
    const storedSettings = new Map();
    const writtenKeys = new Set();
    const handlers = new Map();
    const commandIds = new Map();
    let nextCommandId = FIRST_CUSTOM_COMMAND;
    const shownMenuList = [];
    let shownMenu = null;
    let uiMode = "wheel";
    const launchList = [];
    const logLines = [];
    const executedCommands = [];

    function readSetting(key, defaultValue, convert) {
        return storedSettings.has(key) ? convert(storedSettings.get(key)) : defaultValue;
    }

    const settings = {
        getString: (key, defaultValue) => readSetting(key, defaultValue, text => text),
        getInt: (key, defaultValue) => readSetting(key, defaultValue, text => parseInt(text, 10)),
        getFloat: (key, defaultValue) => readSetting(key, defaultValue, text => parseFloat(text)),
        getBool: (key, defaultValue) =>
            readSetting(key, defaultValue, text => TRUE_STRINGS.includes(text.toLowerCase())),
        set: (key, value) => {
            storedSettings.set(key, toStoredString(value));
            writtenKeys.add(key);
        },
    };

    // PinballY accepts "event.Namespace" names; only the event part matters here.
    function on(eventName, handler) {
        const type = eventName.split(".")[0];
        if (!handlers.has(type)) handlers.set(type, []);
        handlers.get(type).push(handler);
    }

    function fire(type, properties = {}) {
        const ev = {
            type,
            defaultPrevented: false,
            preventDefault() { this.defaultPrevented = true; },
            ...properties,
        };
        for (const handler of [...(handlers.get(type) || [])]) handler(ev);
        return ev;
    }

    function returnToWheel() {
        uiMode = "wheel";
        fire("wheelmode");
    }

    function showMenu(id, items, options = {}) {
        shownMenu = { id, items: [...items], options };
        shownMenuList.push(shownMenu);
        uiMode = "menu";
    }

    function getGameInfo(configId) {
        return allTables.find(table => table.configId === configId || table.id === configId) || null;
    }

    function allocateCommand(name) {
        const id = nextCommandId++;
        commandIds.set(name, id);
        return id;
    }

    const host = {
        settings,
        now: () => new RealDate(nowMs),
        getVisibleTables: () => allTables.filter(table => !table.isHidden),
        getGameInfo,
        getUIMode: () => uiMode,
        showMenu,
        on,
        allocateCommand,
        // PinballY leaves the wheel as soon as a launch starts.
        playGame: (game) => {
            launchList.push(game);
            uiMode = "running";
        },

        setNow(date) { nowMs = date.getTime(); },
        advanceTime(ms) { nowMs += ms; },
        setTables(newTables) { allTables = newTables.map(table => ({ ...table })); },
        seedSettings(values) {
            for (const [key, value] of Object.entries(values)) storedSettings.set(key, toStoredString(value));
        },
        storedSettings: () => Object.fromEntries(storedSettings),
        writtenSettingsKeys: () => new Set(writtenKeys),
        commandId: (name) => commandIds.get(name),
        fire,

        shownMenus: () => [...shownMenuList],
        currentMenu: () => shownMenu,

        // A menu opened by the player (unlike showMenu, which doesn't fire
        // "menuopen"): handlers may add items before it is shown.
        openMenu(id, items) {
            const menuItems = [...items];
            const ev = fire("menuopen", {
                id,
                items: menuItems,
                addMenuItem(where, newItems) {
                    const toAdd = Array.isArray(newItems) ? newItems : [newItems];
                    const afterIndex = menuItems.findIndex(item => item.cmd === where.after);
                    menuItems.splice(afterIndex + 1, 0, ...toAdd);
                },
            });
            if (!ev.defaultPrevented) showMenu(id, menuItems);
        },

        // Closes the current menu (as Escape would). Back to the wheel only if
        // no table was launched from the menu and no "menuclose" handler
        // opened another menu in the meantime.
        closeMenu() {
            if (!shownMenu) throw new Error("No menu is open.");
            const { id } = shownMenu;
            shownMenu = null;
            if (uiMode === "menu") uiMode = "wheel";
            fire("menuclose", { id });
            if (uiMode === "wheel") fire("wheelmode");
        },

        // Picks the item with this title in the current menu: fires its
        // command, then closes the menu.
        selectMenuItem(title) {
            const item = shownMenu && shownMenu.items.find(menuItem => menuItem.title === title);
            if (!item) throw new Error(`No menu item titled "${title}" is showing.`);
            fire("command", { id: item.cmd });
            host.closeMenu();
        },

        launches: () => [...launchList],
        gameStarted(game) {
            uiMode = "running";
            fire("gamestarted", { game });
        },
        gameOver(game) {
            fire("gameover", { game });
            returnToWheel();
        },
        launchError(game) {
            fire("launcherror", { game });
            returnToWheel();
        },

        logLines: () => [...logLines],
        executedCommands: () => [...executedCommands],

        // Exposes this fake as PinballY's globals; returns the function that
        // restores the previous globals.
        installGlobals() {
            const globalNames = ["optionSettings", "gameList", "mainWindow", "command", "logfile", "Date"];
            const previous = globalNames.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);

            class FakeDate extends RealDate {
                constructor(...args) {
                    if (args.length === 0) super(nowMs);
                    else super(...args);
                }
                static now() { return nowMs; }
            }

            Object.assign(globalThis, {
                optionSettings: {
                    get: settings.getString,
                    getInt: settings.getInt,
                    getFloat: settings.getFloat,
                    getBool: settings.getBool,
                    set: settings.set,
                },
                gameList: {
                    getAllGames: () => [...allTables],
                    getAllWheelGames: () => host.getVisibleTables(),
                    getGameInfo,
                },
                mainWindow: {
                    on,
                    showMenu,
                    getUIMode: () => (shownMenu ? { mode: uiMode, menuID: shownMenu.id } : { mode: uiMode }),
                    playGame: host.playGame,
                    doCommand: (id) => { executedCommands.push(id); },
                },
                command: { ...BUILT_IN_COMMANDS, allocate: allocateCommand },
                logfile: { log: (text) => { logLines.push(text); } },
                Date: FakeDate,
            });

            return function uninstallGlobals() {
                for (const [name, descriptor] of previous) {
                    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
                    else delete globalThis[name];
                }
            };
        },
    };

    return host;
}
