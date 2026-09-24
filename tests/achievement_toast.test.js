// ============================================================
// Achievement Toast module on the fake host: a batch stacks with the
// newest card lowest, at most five cards on screen, the others arriving as
// the oldest ones leave, on drawing layers reused from a pool. A card holds
// for the configured duration (4 s when out of range, with a log line) and
// the configured sound plays once per card, a failing one only logged.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createAchievementToasts } from "../common/achievement_toast.js";

const ARRIVAL_GAP_MS = 350;
const MAX_CARDS = 5;
const SOUND_FILE = "C:\\Sounds\\achievement.wav";
// Enough for a card to rise into place, shorter than any hold.
const SETTLE_MS = 1000;

// Titles of the cards on screen, oldest (highest) first.
function cardsOnScreen(fake) {
    return fake.drawingLayers()
        .filter(layer => layer.texts().length > 0)
        .sort((a, b) => b.position().y - a.position().y)
        .map(layer => layer.texts()[1]);
}

function submitOne(toasts, title) {
    toasts.submit({ title, description: "", onShown() {} });
}

test("a batch of Achievement Toasts stacks, five at most, and the oldest leaves first", () => {
    const fake = createFakePinballYHost();
    fake.installGlobals();
    const toasts = createAchievementToasts(fake);
    const titles = ["1", "2", "3", "4", "5", "6", "7"];
    for (const title of titles) submitOne(toasts, title);

    fake.advanceTime(10 * ARRIVAL_GAP_MS);
    assert.deepEqual(cardsOnScreen(fake), ["1", "2", "3", "4", "5"], "the newest card lowest, five at most");

    let maxOnScreen = 0;
    for (let elapsedMs = 0; fake.drawings().length < titles.length || cardsOnScreen(fake).length > 0; elapsedMs += 100) {
        assert.ok(elapsedMs < 60000, "every toast leaves");
        const before = cardsOnScreen(fake);
        fake.advanceTime(100);
        const after = cardsOnScreen(fake);
        maxOnScreen = Math.max(maxOnScreen, after.length);
        const gone = before.filter(title => !after.includes(title));
        assert.deepEqual(gone, before.slice(0, gone.length), "the oldest card leaves first");
    }
    assert.equal(maxOnScreen, MAX_CARDS);
    assert.equal(fake.drawingLayers().length, MAX_CARDS, "layers reused from a pool");
});

test("a card holds for the configured duration, 4 s when the setting is out of range", () => {
    const fake = createFakePinballYHost();
    fake.installGlobals();
    const tenSeconds = createAchievementToasts(fake, { toastSeconds: 10 });
    submitOne(tenSeconds, "ten");
    fake.advanceTime(9900);
    assert.deepEqual(cardsOnScreen(fake), ["ten"]);
    fake.advanceTime(SETTLE_MS);
    assert.deepEqual(cardsOnScreen(fake), []);

    assert.deepEqual(fake.logLines(), []);
    const outOfRange = createAchievementToasts(fake, { toastSeconds: 0 });
    assert.equal(fake.logLines().filter(line => line.includes("achievementToastSeconds")).length, 1);
    submitOne(outOfRange, "default");
    fake.advanceTime(3900);
    assert.deepEqual(cardsOnScreen(fake), ["default"]);
    fake.advanceTime(SETTLE_MS);
    assert.deepEqual(cardsOnScreen(fake), []);
});

test("the configured sound plays once per card, and a failing one never stops the card", () => {
    const fake = createFakePinballYHost();
    fake.installGlobals();
    fake.addFile(SOUND_FILE);
    const toasts = createAchievementToasts(fake, { soundFile: SOUND_FILE });
    submitOne(toasts, "1");
    submitOne(toasts, "2");
    fake.advanceTime(SETTLE_MS);
    assert.deepEqual(fake.soundsPlayed(), [SOUND_FILE, SOUND_FILE]);

    fake.playSound = () => { throw new Error("Windows Media Player unavailable"); };
    let shown = false;
    toasts.submit({ title: "3", description: "", onShown() { shown = true; } });
    fake.advanceTime(SETTLE_MS);
    assert.ok(shown, "the card still starts");
    assert.ok(cardsOnScreen(fake).includes("3"));
    assert.equal(fake.logLines().filter(line => line.includes("Windows Media Player unavailable")).length, 1);
});
