// ============================================================
// Wheel dialog module tests: dialogs submitted through its interface are
// shown on the fake host one at a time, only when the wheel is free, in
// priority order, and the queue advances however a dialog closes. A dialog
// is shown one tick after its submission or the event that frees the wheel.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createWheelDialogs, DIALOG_PRIORITY } from "../common/wheel_dialog.js";

const GAME = { id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness" };

function setUp() {
    const fake = createFakePinballYHost({ tables: [GAME] });
    const dialogs = createWheelDialogs(fake);
    return { fake, dialogs };
}

function achievementDialog(name, extra = {}) {
    return {
        id: "achievementUnlocked",
        message: `Unlocked ${name}`,
        buttons: [{ label: "Awesome!" }],
        priority: DIALOG_PRIORITY.ACHIEVEMENT,
        ...extra,
    };
}

// Lets the deferred showing (setTimeout 0) run.
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function shownMessages(fake) {
    return fake.shownMenus().map(menu => menu.items[0].title);
}

test("a dialog submitted on a free wheel is shown on the next tick, message then separator then buttons", async () => {
    const { fake, dialogs } = setUp();

    dialogs.submit(achievementDialog("A"));
    assert.equal(fake.currentMenu(), null);
    await settle();

    const menu = fake.currentMenu();
    assert.equal(menu.id, "achievementUnlocked");
    assert.deepEqual(menu.options, { dialogStyle: true });
    assert.equal(menu.items.length, 3);
    assert.deepEqual(menu.items[0], { title: "Unlocked A", cmd: -1 });
    assert.deepEqual(menu.items[1], { cmd: -1 });
    assert.equal(menu.items[2].title, "Awesome!");
    assert.ok(menu.items[2].cmd > 0, "a button needs a real command to be selectable");
});

test("nothing is shown while a game runs; the dialog appears on the next free wheel", async () => {
    const { fake, dialogs } = setUp();
    fake.playGame(GAME);
    fake.gameStarted(GAME);

    dialogs.submit(achievementDialog("A"));
    await settle();
    assert.equal(fake.currentMenu(), null);

    fake.gameOver(GAME);
    await settle();
    assert.deepEqual(shownMessages(fake), ["Unlocked A"]);
});

test("nothing is shown over another menu; the dialog appears once it closes", async () => {
    const { fake, dialogs } = setUp();
    fake.openMenu("main", [{ title: "Play", cmd: 1 }]);

    dialogs.submit(achievementDialog("A"));
    await settle();
    assert.equal(fake.currentMenu().id, "main");

    fake.closeMenu();
    await settle();
    assert.equal(fake.currentMenu().id, "achievementUnlocked");
    assert.equal(fake.shownMenus().filter(menu => menu.id === "achievementUnlocked").length, 1);
});

test("several dialogs are shown one after the other, acknowledged or dismissed", async () => {
    const { fake, dialogs } = setUp();

    dialogs.submit(achievementDialog("A"));
    dialogs.submit(achievementDialog("B"));
    dialogs.submit(achievementDialog("C"));
    await settle();
    assert.deepEqual(shownMessages(fake), ["Unlocked A"]);

    fake.selectMenuItem("Awesome!");
    await settle();
    assert.deepEqual(shownMessages(fake), ["Unlocked A", "Unlocked B"]);

    // Escape.
    fake.closeMenu();
    await settle();
    assert.deepEqual(shownMessages(fake), ["Unlocked A", "Unlocked B", "Unlocked C"]);

    fake.closeMenu();
    await settle();
    assert.equal(fake.currentMenu(), null);
});

test("onShown runs when the dialog is shown, not when it is queued", async () => {
    const { fake, dialogs } = setUp();
    const shown = [];

    dialogs.submit(achievementDialog("A", { onShown: () => shown.push("A") }));
    dialogs.submit(achievementDialog("B", { onShown: () => shown.push("B") }));
    assert.deepEqual(shown, []);
    await settle();
    assert.deepEqual(shown, ["A"]);

    fake.closeMenu();
    await settle();
    assert.deepEqual(shown, ["A", "B"]);
});

test("a button runs its own dialog's action, and a closed dialog's buttons do nothing", async () => {
    const { fake, dialogs } = setUp();
    const actions = [];

    dialogs.submit({
        id: "first",
        message: "First",
        buttons: [{ label: "Yes", action: () => actions.push("first:yes") }, { label: "No", action: () => actions.push("first:no") }],
        priority: DIALOG_PRIORITY.ACHIEVEMENT,
    });
    dialogs.submit({
        id: "second",
        message: "Second",
        buttons: [{ label: "Yes", action: () => actions.push("second:yes") }, { label: "Later" }],
        priority: DIALOG_PRIORITY.ACHIEVEMENT,
    });
    await settle();

    const firstYesCommand = fake.currentMenu().items[2].cmd;
    fake.selectMenuItem("No");
    await settle();
    fake.selectMenuItem("Yes");
    await settle();
    assert.deepEqual(actions, ["first:no", "second:yes"]);

    fake.fire("command", { id: firstYesCommand });
    assert.deepEqual(actions, ["first:no", "second:yes"]);
});

test("a button that launches a game makes the next dialog wait for the wheel", async () => {
    const { fake, dialogs } = setUp();

    dialogs.submit({
        id: "launcher",
        message: "Play?",
        buttons: [{ label: "Play", action: () => fake.playGame(GAME) }],
        priority: DIALOG_PRIORITY.STARTUP_PROMPT,
    });
    dialogs.submit(achievementDialog("A"));
    await settle();

    fake.selectMenuItem("Play");
    await settle();
    assert.equal(fake.currentMenu(), null);

    fake.gameStarted(GAME);
    fake.gameOver(GAME);
    await settle();
    assert.deepEqual(shownMessages(fake), ["Play?", "Unlocked A"]);
});

test("waiting dialogs are shown by priority, whatever the submission order", async () => {
    for (const order of [["rating", "achievement", "startup"], ["startup", "rating", "achievement"]]) {
        const { fake, dialogs } = setUp();
        const descriptions = {
            startup: { id: "startup", message: "Startup", buttons: [{ label: "OK" }], priority: DIALOG_PRIORITY.STARTUP_PROMPT },
            achievement: achievementDialog("A"),
            rating: { id: "rating", message: "Rate", buttons: [{ label: "OK" }], priority: DIALOG_PRIORITY.RATING_PROMPT },
        };
        fake.playGame(GAME);
        fake.gameStarted(GAME);

        for (const name of order) dialogs.submit(descriptions[name]);
        fake.gameOver(GAME);
        await settle();
        fake.closeMenu();
        await settle();
        fake.closeMenu();
        await settle();

        assert.deepEqual(shownMessages(fake), ["Startup", "Unlocked A", "Rate"], order.join(","));
    }
});

test("a dialog with the same priority waits behind the ones already queued", async () => {
    const { fake, dialogs } = setUp();
    fake.playGame(GAME);
    fake.gameStarted(GAME);

    dialogs.submit(achievementDialog("A"));
    dialogs.submit({ id: "rating", message: "Rate", buttons: [{ label: "OK" }], priority: DIALOG_PRIORITY.RATING_PROMPT });
    dialogs.submit(achievementDialog("B"));
    fake.gameOver(GAME);
    await settle();
    fake.closeMenu();
    await settle();
    fake.closeMenu();
    await settle();

    assert.deepEqual(shownMessages(fake), ["Unlocked A", "Unlocked B", "Rate"]);
});

test("dialogs submitted together on a free wheel are shown by priority", async () => {
    const { fake, dialogs } = setUp();

    dialogs.submit(achievementDialog("A"));
    dialogs.submit({ id: "startup", message: "Startup", buttons: [{ label: "OK" }], priority: DIALOG_PRIORITY.STARTUP_PROMPT });
    await settle();
    assert.deepEqual(shownMessages(fake), ["Startup"]);

    fake.closeMenu();
    await settle();
    assert.deepEqual(shownMessages(fake), ["Startup", "Unlocked A"]);
});

test("a dialog on screen is never replaced by a higher-priority one", async () => {
    const { fake, dialogs } = setUp();

    dialogs.submit(achievementDialog("A"));
    await settle();
    dialogs.submit({ id: "startup", message: "Startup", buttons: [{ label: "OK" }], priority: DIALOG_PRIORITY.STARTUP_PROMPT });
    await settle();
    assert.deepEqual(shownMessages(fake), ["Unlocked A"]);

    fake.closeMenu();
    await settle();
    assert.deepEqual(shownMessages(fake), ["Unlocked A", "Startup"]);
});

test("a dialog replaced by another menu lets the next one wait for that menu to close", async () => {
    const { fake, dialogs } = setUp();
    dialogs.submit(achievementDialog("A"));
    dialogs.submit(achievementDialog("B"));
    await settle();

    // PinballY opens the new menu before firing the old one's "menuclose".
    fake.openMenu("main", [{ title: "Play", cmd: 1 }]);
    fake.fire("menuclose", { id: "achievementUnlocked" });
    await settle();
    assert.equal(fake.currentMenu().id, "main");

    fake.closeMenu();
    await settle();
    assert.deepEqual(shownMessages(fake).filter(message => message !== "Play"), ["Unlocked A", "Unlocked B"]);
});

test("another menu closing does not advance the queue", async () => {
    const { fake, dialogs } = setUp();

    dialogs.submit(achievementDialog("A"));
    dialogs.submit(achievementDialog("B"));
    await settle();
    fake.fire("menuclose", { id: "someOtherMenu" });
    await settle();

    assert.deepEqual(shownMessages(fake), ["Unlocked A"]);
});

test("a failing button action is logged and the queue still advances", async () => {
    const { fake, dialogs } = setUp();
    const uninstallGlobals = fake.installGlobals();
    try {
        dialogs.submit({
            id: "broken",
            message: "Broken",
            buttons: [{ label: "Go", action: () => { throw new Error("boom"); } }],
            priority: DIALOG_PRIORITY.ACHIEVEMENT,
        });
        dialogs.submit(achievementDialog("A"));
        await settle();

        fake.selectMenuItem("Go");
        // The command handler is async, so the error is logged a tick later.
        await settle();

        assert.deepEqual(shownMessages(fake), ["Broken", "Unlocked A"]);
        assert.equal(fake.logLines().filter(line => line.includes("[WheelDialog] ERROR") && line.includes("boom")).length, 1);
    } finally {
        uninstallGlobals();
    }
});
