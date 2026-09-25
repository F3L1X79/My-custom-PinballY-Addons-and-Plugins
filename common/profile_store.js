// ============================================================
// Profile store: the only module that knows the Profiles folder
// (Scripts\profiles). Each Profile is a sub-folder named after it, with its
// Avatar and its profile.json; cabinet.json, next to them, remembers the
// active Profile. Files are read at startup and on each switch, kept in
// memory, and rewritten whole on every change (tmp, backup, rename).
// Listens to "gamestarted" / "gameover" to record every finished game for
// the Profile active when it started; at startup, creates the Guest folder
// and writes cabinet.json when they are missing.
// ============================================================

import { safeHandler, logHandlerError } from "./safe_handler.js";
import { createPinballYHost } from "./pinbally_host.js";

const SCRIPT_NAME = "ProfileStore";

// Also the folder name; any letter case is Guest.
const GUEST_NAME = "guest";
// Bumped when a shape change needs an older file migrated; a new domain or
// session stat needs no bump, since a missing one is read as empty.
const PROFILE_VERSION = 1;
const CABINET_VERSION = 1;
// Still images only: PinballY keeps an animated image locked while it shows it.
const AVATAR_FILES = ["avatar.png", "avatar.jpg"];

const isGuestName = name => name.toLowerCase() === GUEST_NAME;
const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();
const pad = number => String(number).padStart(2, "0");

// Local time, readable in the file: "2026-09-24T21:10:00".
function toLocalIsoString(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// The session stats: shortestSeconds stays 0 until a first timed game.
const emptySessions = () => ({
    longestSeconds: 0,
    shortestSeconds: 0,
    rageQuit: false,
    grandReturn: false,
    dayManufacturers: { day: "", list: [] },
    mostManufacturersInADay: 0,
});
const emptyProfileData = () => ({ version: PROFILE_VERSION, plays: {}, sessions: emptySessions(), notified: [] });
const NO_PLAY = Object.freeze({ count: 0, seconds: 0, lastPlayed: "" });

export function createProfileStore(host) {
    const scriptsFolder = `${host.getProgramFolder().replace(/\\+$/, "")}\\Scripts`;
    const profilesFolder = `${scriptsFolder}\\profiles`;
    const defaultAvatarPath = `${scriptsFolder}\\assets\\default_avatar.png`;
    const files = host.files;
    const switchListeners = [];

    function avatarPathOf(folder) {
        const ownAvatar = AVATAR_FILES.map(name => `${folder}\\${name}`).find(path => files.fileExists(path));
        return ownAvatar || defaultAvatarPath;
    }

    function profileAt(folderName) {
        const folder = `${profilesFolder}\\${folderName}`;
        return { name: folderName, isGuest: isGuestName(folderName), folder, avatarPath: avatarPathOf(folder) };
    }

    // Guest first, then the others alphabetically. Re-read on every call, so a folder added while
    // PinballY runs shows up.
    function listProfileRecords() {
        const folderNames = files.listFolders(profilesFolder);
        const guest = profileAt(folderNames.find(isGuestName) || GUEST_NAME);
        const others = folderNames
            .filter(name => !isGuestName(name))
            .sort((a, b) => a.localeCompare(b))
            .map(profileAt);
        return [guest, ...others];
    }

    const findProfile = name => listProfileRecords().find(profile => sameName(profile.name, name));

    function readJson(path) {
        return files.fileExists(path) ? JSON.parse(files.readText(path)) : null;
    }

    // Writes "<name>.tmp.json", renames the current file to "<name>.bak.json"
    // (replacing the older backup), then renames the tmp file into place: a
    // crash at any point leaves a readable file or its backup.
    function saveJson(folder, baseName, data) {
        const path = `${folder}\\${baseName}.json`;
        const tmpPath = `${folder}\\${baseName}.tmp.json`;
        const backupPath = `${folder}\\${baseName}.bak.json`;
        files.createFolder(profilesFolder);
        files.createFolder(folder);
        files.writeText(tmpPath, JSON.stringify(data, null, 2));
        if (files.fileExists(path)) {
            if (files.fileExists(backupPath)) files.deleteFile(backupPath);
            files.renameFile(path, backupPath);
        }
        files.renameFile(tmpPath, path);
    }

    // A file saved before a domain or a session stat existed gets it empty.
    function readProfileData(profile) {
        const saved = readJson(`${profile.folder}\\profile.json`) || {};
        return { ...emptyProfileData(), ...saved, sessions: { ...emptySessions(), ...saved.sessions } };
    }
    const saveProfileData = (profile, data) => saveJson(profile.folder, "profile", data);
    const saveCabinet = () => saveJson(profilesFolder, "cabinet", cabinet);

    // Guest always exists: its folder ships with the add-ons and comes back
    // at startup if a player deleted it.
    files.createFolder(profilesFolder);
    files.createFolder(findProfile(GUEST_NAME).folder);

    const savedCabinet = readJson(`${profilesFolder}\\cabinet.json`);
    const cabinet = savedCabinet || { version: CABINET_VERSION, activeProfile: GUEST_NAME };
    let activeProfile = findProfile(cabinet.activeProfile) || findProfile(GUEST_NAME);
    let activeData = readProfileData(activeProfile);
    if (!savedCabinet) saveCabinet();

    const publicProfile = ({ name, isGuest, avatarPath }) => ({ name, isGuest, avatarPath });

    // Changes the data of the named Profile (the active one by default) and
    // saves it; another Profile's file is read, changed and written back.
    function updateProfileData(change, profileName = activeProfile.name) {
        if (sameName(profileName, activeProfile.name)) {
            change(activeData);
            saveProfileData(activeProfile, activeData);
            return;
        }
        const profile = findProfile(profileName);
        if (!profile) throw new Error(`No Profile named "${profileName}".`);
        const data = readProfileData(profile);
        change(data);
        saveProfileData(profile, data);
    }

    function switchTo(name) {
        const profile = findProfile(name);
        if (!profile) throw new Error(`No Profile named "${name}".`);
        const data = readProfileData(profile);
        activeProfile = profile;
        activeData = data;
        cabinet.activeProfile = profile.name;
        saveCabinet();
        // The switch is already saved: one failing listener must not keep
        // the others from hearing of it.
        for (const listener of switchListeners) {
            try {
                listener(publicProfile(activeProfile));
            } catch (error) {
                logHandlerError(SCRIPT_NAME, error);
            }
        }
    }

    // The Profile active at "gamestarted" and when the game started, by table.
    const runningGames = new Map();

    // Fires on table launch.
    host.on("gamestarted", safeHandler(SCRIPT_NAME, ev => {
        runningGames.set(ev.game.configId, { profileName: activeProfile.name, startMs: host.now().getTime() });
    }));

    // Fires on table exit: one play, and its seconds when its start is
    // known, as PinballY counts them.
    host.on("gameover", safeHandler(SCRIPT_NAME, ev => {
        const { configId } = ev.game;
        const now = host.now();
        const running = runningGames.get(configId);
        runningGames.delete(configId);
        const seconds = running ? Math.round((now.getTime() - running.startMs) / 1000) : 0;

        updateProfileData(data => {
            const play = data.plays[configId] || NO_PLAY;
            data.plays[configId] = {
                count: play.count + 1,
                seconds: play.seconds + seconds,
                lastPlayed: toLocalIsoString(now),
            };
        }, running ? running.profileName : activeProfile.name);
    }));

    return {
        listProfiles: () => listProfileRecords().map(publicProfile),
        getActiveProfile: () => ({ ...publicProfile(activeProfile), data: activeData }),
        switchTo,
        getProfileData: () => activeData,
        // The active Profile's play record of a table, all zero when never played.
        getPlay: (configId) => activeData.plays[configId] || NO_PLAY,
        hasPlayed: (configId) => (activeData.plays[configId] || NO_PLAY).count > 0,
        updateProfileData,
        getCabinetData: () => cabinet,
        updateCabinetData: (change) => {
            change(cabinet);
            saveCabinet();
        },
        onSwitch: (listener) => { switchListeners.push(listener); },
    };
}

let sharedProfileStore = null;

// One store for every Add-on, so they all see the same active Profile.
export function getProfileStore() {
    if (!sharedProfileStore) sharedProfileStore = createProfileStore(createPinballYHost());
    return sharedProfileStore;
}
