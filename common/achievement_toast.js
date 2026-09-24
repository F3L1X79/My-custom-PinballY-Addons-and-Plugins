// ============================================================
// Achievement Toast module: announces each unlocked Achievement with a
// small Steam-like card in the bottom-right corner of the playfield window,
// drawn on a main-window drawing layer above menus and popups (see
// docs/adr/0003). It takes no input and leaves on its own: it rises from
// the bottom edge, holds a few seconds, then fades out. Cards stack, the
// newest at the bottom, arrive staggered, at most five on screen, and
// the oldest leaves first. Toasts wait while a game starts, runs or exits;
// waiting ones start on "wheelmode".
// ============================================================

import lang from "./i18n.js";
import { safeHandler } from "./safe_handler.js";
import { createPinballYHost } from "./pinbally_host.js";

const SCRIPT_NAME = "AchievementToast";

// Above PinballY's menus and popups.
const TOAST_Z_INDEX = 6500;
const FRAME_MS = 16;
const HOLD_MS = 4000;
const FADE_MS = 250;
// Fraction of the remaining distance covered each frame while rising (ease-out).
const RISE_EASE = 0.2;
const ARRIVAL_GAP_MS = 350;
const MAX_CARDS = 5;

// Card look, validated with a prototype in PinballY.
const CARD_WIDTH = 440;
const EDGE_MARGIN = 24;
const STACK_GAP = 10;
const PADDING_Y = 22;
const PADDING_RIGHT = 14;
const GOLD_BAR_WIDTH = 5;
const TILE_SIZE = 64;
const TILE_GAP = 20;
const TROPHY_INSET = 10;
const GLOW_RINGS = 10;
const GLOW_MAX_ALPHA = 0x38;
const FONT = "Segoe UI";
const COLORS = Object.freeze({
    gradientTop: 0xFF2A3547,
    gradientBottom: 0xFF171D27,
    border: 0xFF3E4C60,
    gold: 0xFFE8B84A,
    tile: 0xFF15181E,
    title: 0xFFFFFFFF,
    description: 0xFFA9B4C2,
    transparent: 0x00000000,
});

// drawImage resolves relative paths from the PinballY folder, not Scripts/.
const TROPHY_FILE = "Scripts\\assets\\achievement_trophy.png";

function mixColors(from, to, ratio) {
    let color = 0;
    for (const shift of [24, 16, 8, 0]) {
        const start = (from >>> shift) & 0xFF;
        const end = (to >>> shift) & 0xFF;
        color += Math.round(start + (end - start) * ratio) * 2 ** shift;
    }
    return color;
}

// Drawn as one-pixel rows: the drawing context has no gradient fill.
function fillGradient(dc, x, y, width, height, topColor, bottomColor) {
    for (let row = 0; row < height; row++) {
        dc.fillRect(x, y + row, width, 1, mixColors(topColor, bottomColor, row / Math.max(1, height - 1)));
    }
}

// Dark tile with a gold frame, a soft gold glow made of fading frames, and the trophy.
function drawTile(dc, x, y, trophyPath) {
    const goldRgb = COLORS.gold & 0xFFFFFF;
    for (let ring = GLOW_RINGS; ring >= 1; ring--) {
        const alpha = Math.round(GLOW_MAX_ALPHA * (1 - ring / (GLOW_RINGS + 1)));
        dc.frameRect(x - ring, y - ring, TILE_SIZE + 2 * ring, TILE_SIZE + 2 * ring, 1, alpha * 2 ** 24 + goldRgb);
    }
    dc.fillRect(x, y, TILE_SIZE, TILE_SIZE, COLORS.tile);
    dc.frameRect(x, y, TILE_SIZE, TILE_SIZE, 3, COLORS.gold);
    dc.drawImage(trophyPath, x + TROPHY_INSET, y + TROPHY_INSET, TILE_SIZE - 2 * TROPHY_INSET, TILE_SIZE - 2 * TROPHY_INSET);
}

// Draws the card flush with the bottom-right corner of the layer's layout
// (rotation-aware) and returns its height and the layout height.
// Backgrounds use fillRect and frameRect: a StyledText holding only a
// space draws no background.
function drawCard(host, dc, toast, trophyPath) {
    const size = dc.getSize();
    const textLeft = GOLD_BAR_WIDTH + TILE_GAP + TILE_SIZE + TILE_GAP;
    const textWidth = CARD_WIDTH - textLeft - PADDING_RIGHT;
    const text = host.createStyledText({ textStyle: { font: FONT, size: 11, color: COLORS.description } });
    text.add({ size: 11, weight: 600, color: COLORS.gold, text: lang.achievements.toastHeader.toLocaleUpperCase() + "\n" });
    text.add({ size: 13, weight: 600, color: COLORS.title, text: toast.title + "\n" });
    text.add(toast.description);
    const textHeight = text.measure(textWidth).height;
    const height = Math.max(textHeight, TILE_SIZE) + 2 * PADDING_Y;
    const x = size.width - CARD_WIDTH - EDGE_MARGIN;
    const y = size.height - height - EDGE_MARGIN;

    fillGradient(dc, x, y, CARD_WIDTH, height, COLORS.gradientTop, COLORS.gradientBottom);
    dc.frameRect(x, y, CARD_WIDTH, height, 1, COLORS.border);
    dc.fillRect(x, y, GOLD_BAR_WIDTH, height, COLORS.gold);
    drawTile(dc, x + GOLD_BAR_WIDTH + TILE_GAP, y + (height - TILE_SIZE) / 2, trophyPath);
    text.draw(dc, { x: x + textLeft, y: y + (height - textHeight) / 2, width: textWidth, height: textHeight });
    return { height, layoutHeight: size.height };
}

export function createAchievementToasts(host) {
    const waiting = [];
    const trophyPath = `${host.getProgramFolder().replace(/\\+$/, "")}\\${TROPHY_FILE}`;
    // Cards on screen, oldest first. Each one: its layer, its height, the
    // layout height, its lift above the bottom slot (layout pixels, up is
    // positive), its alpha and whether it is leaving.
    const cards = [];
    // Layers of cards that left, kept for the next ones.
    const freeLayers = [];
    let frameTimer = null;
    // False for ARRIVAL_GAP_MS after a card arrives, so a batch arrives staggered.
    let arrivalOpen = true;

    function placeLayer(card) {
        card.layer.alpha = card.alpha;
        card.layer.setPos(0, card.lift / card.layoutHeight);
    }

    function startFrames() {
        if (frameTimer === null) frameTimer = host.setInterval(safeHandler(SCRIPT_NAME, step), FRAME_MS);
    }

    function stopFrames() {
        host.clearInterval(frameTimer);
        frameTimer = null;
    }

    // Every card's slot sits above the newer cards below it.
    function targetLift(index) {
        let lift = 0;
        for (let newer = index + 1; newer < cards.length; newer++) lift += cards[newer].height + STACK_GAP;
        return lift;
    }

    function startLeaving(card) {
        card.leaving = true;
        startFrames();
    }

    // Runs every frame while a card rises, eases up or fades, then stops.
    function step() {
        let moving = false;
        cards.forEach((card, index) => {
            const remaining = targetLift(index) - card.lift;
            if (Math.abs(remaining) * (1 - RISE_EASE) >= 0.5) {
                card.lift += remaining * RISE_EASE;
                moving = true;
            } else card.lift += remaining;
            if (card.leaving) {
                card.alpha = Math.max(0, card.alpha - FRAME_MS / FADE_MS);
                moving = true;
            }
            placeLayer(card);
        });
        if (cards.length > 0 && cards[0].leaving && cards[0].alpha === 0) {
            const gone = cards.shift();
            gone.layer.clear(COLORS.transparent);
            freeLayers.push(gone.layer);
            showNext();
            moving = true;
        }
        if (!moving) stopFrames();
    }

    function openArrival() {
        arrivalOpen = true;
        showNext();
    }

    function showNext() {
        if (!arrivalOpen || cards.length >= MAX_CARDS || waiting.length === 0) return;
        // PinballY stops redrawing its window while a game starts, runs or
        // exits, and the game covers it.
        if (host.getFullUIMode().runMode !== undefined) return;

        const toast = waiting.shift();
        const layer = freeLayers.pop() || host.createDrawingLayer(TOAST_Z_INDEX);
        let drawn = null;
        layer.draw(dc => { drawn = drawCard(host, dc, toast, trophyPath); });
        // Starts just below the bottom edge, then rises into place.
        const card = {
            layer, height: drawn.height, layoutHeight: drawn.layoutHeight,
            lift: -(drawn.height + EDGE_MARGIN), alpha: 1, leaving: false,
        };
        cards.push(card);
        placeLayer(card);
        // Every card holds as long from its arrival: the oldest leaves first.
        host.setTimeout(safeHandler(SCRIPT_NAME, () => startLeaving(card)), HOLD_MS);
        arrivalOpen = false;
        host.setTimeout(safeHandler(SCRIPT_NAME, openArrival), ARRIVAL_GAP_MS);
        // Animated before onShown, so a failing callback never leaves the card stuck on screen.
        startFrames();
        toast.onShown();
    }

    const safeShowNext = safeHandler(SCRIPT_NAME, showNext);

    // Fires on every return to the wheel: starts the toasts that waited for a game.
    host.on("wheelmode", safeShowNext);

    // toast: { title, description, onShown }, onShown running when the toast starts.
    function submit(toast) {
        waiting.push(toast);
        safeShowNext();
    }

    return { submit };
}

let sharedAchievementToasts = null;

export function getAchievementToasts() {
    if (!sharedAchievementToasts) sharedAchievementToasts = createAchievementToasts(createPinballYHost());
    return sharedAchievementToasts;
}
