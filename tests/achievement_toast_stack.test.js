// ============================================================
// Achievement Toast module on the fake host: a batch stacks with the
// newest card lowest, at most five cards on screen, the others arriving as
// the oldest ones leave, on drawing layers reused from a pool.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createAchievementToasts } from "../common/achievement_toast.js";

const ARRIVAL_GAP_MS = 350;
const MAX_CARDS = 5;

// Titles of the cards on screen, oldest (highest) first.
function cardsOnScreen(fake) {
    return fake.drawingLayers()
        .filter(layer => layer.texts().length > 0)
        .sort((a, b) => b.position().y - a.position().y)
        .map(layer => layer.texts()[1]);
}

test("a batch of Achievement Toasts stacks, five at most, and the oldest leaves first", () => {
    const fake = createFakePinballYHost();
    fake.installGlobals();
    const toasts = createAchievementToasts(fake);
    const titles = ["1", "2", "3", "4", "5", "6", "7"];
    for (const title of titles) toasts.submit({ title, description: "", onShown() {} });

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
