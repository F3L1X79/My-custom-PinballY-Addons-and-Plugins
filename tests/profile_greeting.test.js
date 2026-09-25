// ============================================================
// Profile Greeting on pick, through main.js on the fake PinballY globals:
// picking a Profile in the carousel greets it with its Avatar and name
// (Guest with its own variant), plays the configured sound, then fades out
// on its own. No sound plays when the setting is empty, and a missing sound
// file is logged and never stops the greeting.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost, settle } from "./fake_pinbally_host.js";
import config from "../common/config.js";

const PROFILES_FOLDER = "C:\\PinballY\\Scripts\\profiles";
const ALICE_AVATAR = `${PROFILES_FOLDER}\\Alice\\avatar.png`;
const SOUND_FILE = "C:\\Sounds\\hello.wav";
const PICKER_Z = 6500;
// Comfortably past the greeting's ~1.5 s.
const GREETING_OVER_MS = 2500;

// The picker layer, which the greeting shares with the carousel.
function pickerLayer(fake) {
    const layers = fake.drawingLayers().filter(layer => layer.zIndex === PICKER_Z);
    assert.equal(layers.length, 1, "one picker layer");
    return layers[0];
}

const visibleTexts = fake => (pickerLayer(fake).alpha > 0 ? pickerLayer(fake).texts() : []);

const press = (fake, buttonCommand) => fake.fire("commandbuttondown", { command: buttonCommand, repeat: false });

test("picking a Profile greets it with its Avatar and a sound, then fades out", async () => {
    const fake = createFakePinballYHost();
    fake.addFolder(`${PROFILES_FOLDER}\\Alice`);
    fake.addFile(ALICE_AVATAR, "png");
    fake.addFile(SOUND_FILE, "wav");
    // Never uninstalled: node --test runs each test file in its own process.
    fake.installGlobals();
    for (const key of Object.keys(config.addOns)) config.addOns[key] = key === "profilePicker";
    config.language = "en";

    const { default: lang } = await import("../common/i18n.js");
    await import("../main.js");
    await settle();
    // The startup greeting of Guest, out of the way.
    fake.advanceTime(GREETING_OVER_MS);

    const pick = (steps) => {
        fake.openMenu("main", [{ title: "Play", cmd: fake.getBuiltInCommand("PlayGame") }]);
        fake.selectMenuItem(lang.profiles.menuEntry);
        for (let step = 0; step < steps; step++) press(fake, "Next");
        press(fake, "Select");
    };

    config.profileGreetingSoundFile = SOUND_FILE;
    const soundsBefore = fake.soundsPlayed().length;
    pick(1);
    const greeting = lang.profiles.greeting("Alice");
    assert.ok(visibleTexts(fake).includes(greeting), "greets the picked Profile by name");
    assert.ok(pickerLayer(fake).images().includes(ALICE_AVATAR), "with its Avatar");
    assert.ok(!visibleTexts(fake).includes(lang.profiles.pickerTitle), "without the carousel");
    assert.deepEqual(fake.soundsPlayed().slice(soundsBefore), [SOUND_FILE], "the configured sound plays");

    fake.advanceTime(600);
    assert.ok(visibleTexts(fake).includes(greeting), "still there after a moment");
    fake.advanceTime(GREETING_OVER_MS);
    assert.deepEqual(visibleTexts(fake), [], "fades out on its own");
    assert.equal(press(fake, "Next").defaultPrevented, false, "never keeps the buttons");

    config.profileGreetingSoundFile = "";
    pick(1);
    assert.ok(visibleTexts(fake).includes(lang.profiles.guestGreeting), "Guest has its own greeting");
    assert.equal(fake.soundsPlayed().length, soundsBefore + 1, "no sound when the setting is empty");
    fake.advanceTime(GREETING_OVER_MS);

    config.profileGreetingSoundFile = "C:\\Sounds\\missing.wav";
    pick(1);
    assert.ok(visibleTexts(fake).includes(greeting), "a missing sound never stops the greeting");
    const errors = fake.logLines().filter(line => line.includes("ERROR"));
    assert.equal(errors.length, 1);
    assert.match(errors[0], /\[ProfilePicker\].*missing\.wav/);
    fake.advanceTime(GREETING_OVER_MS);
    assert.deepEqual(visibleTexts(fake), []);
});
