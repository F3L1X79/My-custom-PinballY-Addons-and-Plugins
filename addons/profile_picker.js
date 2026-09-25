// ============================================================
// Profile picker: a "Change Player" entry, right after "Play" in the main
// menu and right after "Quit" in the exit menu, opens a drawn carousel of
// the Profiles' Avatars on a full-window layer above the menus, starting on
// the active Profile.
// The flipper buttons move through it and wrap, Select or Launch switches
// to the highlighted Profile, Exit closes it; while it is open every
// button is swallowed through "commandbuttondown", so the wheel never moves
// under it; attract mode closes it too. The Avatars glide to their new
// places on each move, and the name shows once they arrive. The Profiles
// are read again each time it opens.
// A badge at the top right of the wheel screen shows the active Profile's
// Avatar and name; it is redrawn on every switch, hidden on "gamestarted"
// and shown again on "wheelmode".
// A Profile Greeting (the Avatar growing slightly, a greeting below, then
// a fade-out, with the optional profileGreetingSoundFile) follows every
// pick after a short pause, the carousel staying still meanwhile. When the
// startup prompt Add-on is off, it also greets the restored Profile once
// at startup, after the same pause, as soon as the wheel is free of menus
// and dialogs; a game or the carousel started first cancels it.
// ============================================================

import lang from "../common/i18n.js";
import { safeHandler } from "../common/safe_handler.js";
import { createPinballYHost } from "../common/pinbally_host.js";
import { getProfileStore } from "../common/profile_store.js";
import { displayNameOf } from "../common/profile_name.js";
import { getMainMenu, MAIN_MENU_POSITION } from "../common/main_menu.js";
import { getWheelDialogs } from "../common/wheel_dialog.js";
import config from "../common/config.js";

const SCRIPT_NAME = "ProfilePicker";

// Above PinballY's menus and popups.
const PICKER_Z_INDEX = 6500;
// Above the wheel and the game info box, under popups and menus.
const BADGE_Z_INDEX = 4500;
const FONT = "Segoe UI";
const COLORS = Object.freeze({
    overlay: 0xD0080A0E,
    gold: 0xFFE8B84A,
    neighbourFrame: 0xFF3E4C60,
    text: 0xFFFFFFFF,
    hint: 0xFFA9B4C2,
    shadow: 0xC0000000,
    transparent: 0x00000000,
});
// By distance from the highlighted Avatar: its size, how far its centre
// sits from the middle, and the dimming drawn over it.
const SLOTS = Object.freeze([
    { size: 220, centerOffset: 0, dim: 0 },
    { size: 130, centerOffset: 210, dim: 0x70000000 },
    { size: 80, centerOffset: 340, dim: 0xA0000000 },
]);
// Where an Avatar goes past the last slot while gliding: smaller, farther
// and fully dark, so one entering from the edge fades in.
const OFF_STAGE_SLOT = Object.freeze({ size: 40, centerOffset: 420, dim: 0xFF000000 });
// The glide slows down as it arrives (exponential ease-out): about 200 ms.
const GLIDE_TIME_CONSTANT_MS = 50;
const GLIDE_SNAP = 0.02;
const HIGHLIGHT_FRAME = 4;
const NEIGHBOUR_FRAME = 1;
// The Avatars' row sits at this fraction of the height; the texts are
// placed from it.
const ROW_HEIGHT_RATIO = 0.4;
const TITLE = Object.freeze({ size: 26, weight: 700, top: -250 });
const NAME = Object.freeze({ size: 24, weight: 700, top: 130 });
const HINT = Object.freeze({ size: 12, weight: 400, top: 180 });
// The badge has its own canvas, pinned to the window's top right corner:
// PinballY stretches a canvas to the window, and at startup the window is
// not laid out yet, so a window-sized canvas drawn then ends up distorted.
// The name is centred under the Avatar, across the canvas width, which also
// leaves the Avatar ~30 px from the right edge.
const BADGE = Object.freeze({ width: 160, height: 170, avatarSize: 96, frame: 3, top: 30, nameGap: 8 });
// The size validated on the cabinet's 1920 px high playfield, kept in
// proportion to the window's height on any other window.
const BADGE_REFERENCE_HEIGHT = 1920;
const BADGE_NAME = Object.freeze({ size: 14, weight: 600 });
// After a pause, the greeted Avatar grows from the highlighted size, holds,
// then the whole layer fades out: about 1.5 s once started.
const GREETING = Object.freeze({ delayMs: 400, grownSize: 260, growMs: 250, holdMs: 700, fadeMs: 550 });
const GREETING_TEXT = Object.freeze({ size: 28, weight: 700, gap: 24 });
const FRAME_MS = 16;

export default function init() {
    const { profiles: TEXT } = lang;
    const host = createPinballYHost();
    const profileStore = getProfileStore();
    const layer = host.createDrawingLayer(PICKER_Z_INDEX);
    const badgeLayer = host.createDrawingLayer(BADGE_Z_INDEX);
    badgeLayer.setScale({ ySpan: BADGE.height / BADGE_REFERENCE_HEIGHT });
    badgeLayer.setPos(0, 0, "top right");

    // The Profiles shown and the highlighted one's index; null when closed.
    let profiles = null;
    let highlighted = 0;
    // How far, in slots, the Avatars still sit from their places while they
    // glide (positive: to the right); 0 at rest.
    let glide = 0;
    let glideTimer = null;
    let glideLastMs = 0;
    // The pause before the greeting and its animation frames; null when idle.
    let greetingDelayTimer = null;
    let greetingTimer = null;
    // The startup prompt already greets the Profile by name: a second
    // greeting right after it would be too much.
    let startupGreetingPending = config.addOns.startupChoicePrompt === false;
    // A sound that cannot play is logged and never stops the greeting.
    const playGreetingSound = safeHandler(SCRIPT_NAME, () => {
        if (config.profileGreetingSoundFile) host.playSound(config.profileGreetingSoundFile);
    });

    // Text with a soft drop shadow, so it reads over any background video;
    // centred across the whole width unless given a column.
    function drawShadowedText(dc, { size, weight }, color, text, y, { x = 0, width = dc.getSize().width } = {}) {
        for (const [offset, textColor] of [[2, COLORS.shadow], [0, color]]) {
            const styled = host.createStyledText({ textAlign: "center", textStyle: { font: FONT, size, weight, color: textColor } });
            styled.add(text);
            const height = styled.measure(width).height;
            styled.draw(dc, { x: x + offset, y: y + offset, width, height });
        }
    }

    // Slot offsets drawn around the highlighted Avatar, farthest first, so
    // each Profile shows once and the nearer ones cover the farther ones.
    function neighbourOffsets(count) {
        const others = count - 1;
        const right = Math.min(SLOTS.length - 1, Math.ceil(others / 2));
        const left = Math.min(SLOTS.length - 1, Math.floor(others / 2));
        const offsets = [];
        for (let distance = SLOTS.length - 1; distance >= 1; distance--) {
            if (distance <= left) offsets.push(-distance);
            if (distance <= right) offsets.push(distance);
        }
        return offsets;
    }

    // The look of an Avatar at a fractional slot position, blended between
    // the two slots around it.
    function slotAt(position) {
        const distance = Math.abs(position);
        const last = SLOTS.length - 1;
        const index = Math.min(last, Math.floor(distance));
        const from = SLOTS[index];
        const to = index === last ? OFF_STAGE_SLOT : SLOTS[index + 1];
        const ratio = Math.min(1, distance - index);
        const blend = (a, b) => a + (b - a) * ratio;
        const dimAlpha = Math.round(blend(from.dim >>> 24, to.dim >>> 24));
        return {
            size: blend(from.size, to.size),
            centerOffset: Math.sign(position) * blend(from.centerOffset, to.centerOffset),
            dim: dimAlpha * 2 ** 24,
        };
    }

    // offset: the Avatar's place from the highlighted one, drawn at
    // offset + glide while it glides there.
    function drawAvatar(dc, profile, offset, centerY) {
        const slot = slotAt(offset + glide);
        const x = dc.getSize().width / 2 + slot.centerOffset - slot.size / 2;
        const y = centerY - slot.size / 2;
        const frame = offset === 0 ? HIGHLIGHT_FRAME : NEIGHBOUR_FRAME;
        dc.fillRect(x - frame, y - frame, slot.size + 2 * frame, slot.size + 2 * frame,
            offset === 0 ? COLORS.gold : COLORS.neighbourFrame);
        dc.drawImage(profile.avatarPath, x, y, slot.size, slot.size);
        if (slot.dim) dc.fillRect(x, y, slot.size, slot.size, slot.dim);
    }

    // The places drawn, farthest first so the nearer Avatars cover the
    // farther ones; while gliding, the Avatar leaving past the last slot is
    // drawn too, when it is not already shown on the other side.
    function drawnOffsets(count) {
        const offsets = [...neighbourOffsets(count), 0];
        if (glide !== 0 && count > 2 * SLOTS.length - 1) offsets.push(-Math.sign(glide) * SLOTS.length);
        return offsets.sort((a, b) => Math.abs(b + glide) - Math.abs(a + glide));
    }

    function draw() {
        layer.clear(COLORS.transparent);
        layer.draw(dc => {
            const size = dc.getSize();
            dc.fillRect(0, 0, size.width, size.height, COLORS.overlay);
            const centerY = size.height * ROW_HEIGHT_RATIO;
            drawShadowedText(dc, TITLE, COLORS.text, TEXT.pickerTitle, centerY + TITLE.top);
            const count = profiles.length;
            for (const offset of drawnOffsets(count)) {
                drawAvatar(dc, profiles[((highlighted + offset) % count + count) % count], offset, centerY);
            }
            if (glide === 0) {
                const current = profiles[highlighted];
                const isActive = current.name === profileStore.getActiveProfile().name;
                drawShadowedText(dc, NAME, isActive ? COLORS.gold : COLORS.text, displayNameOf(current), centerY + NAME.top);
            }
            drawShadowedText(dc, HINT, COLORS.hint, TEXT.pickerHint, centerY + HINT.top);
        });
    }

    function drawBadge() {
        const profile = profileStore.getActiveProfile();
        badgeLayer.clear(COLORS.transparent);
        badgeLayer.draw(dc => {
            const { width, avatarSize, frame, top, nameGap } = BADGE;
            const x = (width - avatarSize) / 2;
            dc.fillRect(x - frame, top - frame, avatarSize + 2 * frame, avatarSize + 2 * frame, COLORS.gold);
            dc.drawImage(profile.avatarPath, x, top, avatarSize, avatarSize);
            drawShadowedText(dc, BADGE_NAME, COLORS.text, displayNameOf(profile), top + avatarSize + nameGap);
        }, BADGE.width, BADGE.height);
    }

    function drawGreeting(profile, avatarSize) {
        layer.clear(COLORS.transparent);
        layer.draw(dc => {
            const size = dc.getSize();
            dc.fillRect(0, 0, size.width, size.height, COLORS.overlay);
            const centerY = size.height * ROW_HEIGHT_RATIO;
            const x = size.width / 2 - avatarSize / 2;
            const y = centerY - avatarSize / 2;
            dc.fillRect(x - HIGHLIGHT_FRAME, y - HIGHLIGHT_FRAME,
                avatarSize + 2 * HIGHLIGHT_FRAME, avatarSize + 2 * HIGHLIGHT_FRAME, COLORS.gold);
            dc.drawImage(profile.avatarPath, x, y, avatarSize, avatarSize);
            drawShadowedText(dc, GREETING_TEXT, COLORS.text, TEXT.greeting(displayNameOf(profile)),
                centerY + avatarSize / 2 + GREETING_TEXT.gap);
        });
    }

    // Stops the pause or the greeting, and clears the layer the greeting
    // shares with the carousel.
    function stopGreeting() {
        host.clearTimeout(greetingDelayTimer);
        greetingDelayTimer = null;
        host.clearInterval(greetingTimer);
        greetingTimer = null;
        layer.clear(COLORS.transparent);
        layer.alpha = 1;
    }

    function greet(profile) {
        stopGreeting();
        const startSize = SLOTS[0].size;
        const { grownSize, growMs, holdMs, fadeMs } = GREETING;
        // Timed on the clock: Windows timers fire late, and a redraw takes a
        // while, so counting frames would stretch the greeting.
        const startMs = host.now().getTime();
        let grown = false;
        drawGreeting(profile, startSize);
        greetingTimer = host.setInterval(safeHandler(SCRIPT_NAME, () => {
            const elapsed = host.now().getTime() - startMs;
            if (!grown) {
                const ratio = Math.min(1, elapsed / growMs);
                drawGreeting(profile, startSize + (grownSize - startSize) * ratio);
                grown = ratio === 1;
            }
            if (elapsed >= growMs + holdMs + fadeMs) stopGreeting();
            else if (elapsed > growMs + holdMs) layer.alpha = 1 - (elapsed - growMs - holdMs) / fadeMs;
        }), FRAME_MS);
        playGreetingSound();
    }

    const isWheelFree = () => host.getUIMode() === "wheel" && getWheelDialogs().isIdle();

    // Greets the active Profile after a pause: right on the press or on the
    // wheel's first frame, it felt abrupt. Whatever is drawn stays still
    // meanwhile. A menu or dialog that opened during the pause cancels it;
    // at startup the greeting then waits for the next free wheel.
    function greetAfterPause({ atStartup = false } = {}) {
        startupGreetingPending = false;
        greetingDelayTimer = host.setTimeout(safeHandler(SCRIPT_NAME, () => {
            greetingDelayTimer = null;
            if (isWheelFree()) {
                greet(profileStore.getActiveProfile());
                return;
            }
            layer.clear(COLORS.transparent);
            if (atStartup) startupGreetingPending = true;
        }), GREETING.delayMs);
    }

    // Greets the restored Profile once the wheel is free: no menu, no
    // dialog on screen or waiting, and no carousel.
    function greetAtStartupIfFree() {
        if (!startupGreetingPending || profiles || greetingDelayTimer !== null) return;
        if (isWheelFree()) greetAfterPause({ atStartup: true });
    }

    function stopGlide() {
        host.clearInterval(glideTimer);
        glideTimer = null;
        glide = 0;
    }

    // Runs every frame while the Avatars glide; timed on the clock, like the
    // greeting.
    function glideStep() {
        const nowMs = host.now().getTime();
        glide *= Math.exp(-(nowMs - glideLastMs) / GLIDE_TIME_CONSTANT_MS);
        glideLastMs = nowMs;
        if (Math.abs(glide) < GLIDE_SNAP) stopGlide();
        draw();
    }

    // direction: 1 for Next, -1 for Prev. A press during a glide carries on
    // from where the Avatars are.
    function move(direction) {
        highlighted = (highlighted + direction + profiles.length) % profiles.length;
        glide += direction;
        if (glideTimer === null) {
            glideLastMs = host.now().getTime();
            glideTimer = host.setInterval(safeHandler(SCRIPT_NAME, glideStep), FRAME_MS);
        }
        draw();
    }

    function open() {
        stopGreeting();
        // The player is already choosing: greeting them afterwards would
        // come out of nowhere.
        startupGreetingPending = false;
        // A native menu left open would stay stuck behind the carousel.
        if (host.getUIMode() === "menu") host.doCommand(host.getBuiltInCommand("MenuReturn"));
        profiles = profileStore.listProfiles();
        const activeName = profileStore.getActiveProfile().name;
        highlighted = Math.max(0, profiles.findIndex(profile => profile.name === activeName));
        draw();
    }

    function close() {
        stopGlide();
        stopGreeting();
        profiles = null;
    }

    getMainMenu().add({ name: "profilePicker", label: TEXT.menuEntry, position: MAIN_MENU_POSITION.PROFILE_PICKER, action: open });

    // The main menu module only serves the main menu: the exit menu entry
    // has its own command.
    const exitMenuCommand = host.allocateCommand("profilePickerExitMenu");

    // Fires when any menu opens, with a fresh item list each time.
    host.on("menuopen", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id !== "exit") return;
        ev.addMenuItem({ after: host.getBuiltInCommand("Quit") }, { title: TEXT.menuEntry, cmd: exitMenuCommand });
    }));

    // Fires on every command.
    host.on("command", safeHandler(SCRIPT_NAME, ev => {
        if (ev.id === exitMenuCommand) open();
    }));

    // Fires on every mapped button press; drives the carousel while it is open.
    host.on("commandbuttondown", safeHandler(SCRIPT_NAME, ev => {
        if (!profiles) return;
        // Swallowed first, so a failing switch still never reaches the wheel.
        ev.preventDefault();
        if (ev.command === "Next" || ev.command === "Prev") {
            move(ev.command === "Next" ? 1 : -1);
        } else if (ev.command === "Select" || ev.command === "Launch") {
            const chosen = profiles[highlighted];
            // The carousel stays drawn, at rest, until the greeting replaces it.
            stopGlide();
            draw();
            profiles = null;
            profileStore.switchTo(chosen.name);
            greetAfterPause();
        } else if (ev.command === "Exit") {
            close();
        }
    }));

    profileStore.onSwitch(safeHandler(SCRIPT_NAME, drawBadge));

    // The badge and the greeting must never cover a game; a player who
    // started one from the startup prompt was greeted by it already.
    host.on("gamestarted", safeHandler(SCRIPT_NAME, () => {
        badgeLayer.alpha = 0;
        startupGreetingPending = false;
        stopGreeting();
    }));
    // Fires back on the wheel, after a game, a menu or a dialog.
    host.on("wheelmode", safeHandler(SCRIPT_NAME, () => {
        badgeLayer.alpha = 1;
        greetAtStartupIfFree();
    }));

    // Fires when the cabinet sits idle: the player left without picking, so
    // the carousel must not stay drawn over attract mode or keep the buttons.
    host.on("attractmodestart", safeHandler(SCRIPT_NAME, close));

    drawBadge();
    // One tick after the inits, so the dialogs every Add-on submits at
    // startup are already waiting, whatever the order in main.js.
    host.setTimeout(safeHandler(SCRIPT_NAME, greetAtStartupIfFree), 0);
}
