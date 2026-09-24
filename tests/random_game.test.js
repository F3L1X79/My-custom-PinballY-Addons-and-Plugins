// ============================================================
// Random Game behaviour, through the Random Game module's interface with
// the fake PinballY host and a no-delay animator: which table ends up
// launched, depending on the wheel selection and the Last Played Table.
// "Never" rules are checked over many launches.
// Run with "node --test" from the project folder.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakePinballYHost } from "./fake_pinbally_host.js";
import { createRandomGame } from "../common/random_game.js";

const LAUNCH_COUNT = 200;

const MEDIEVAL_MADNESS = { id: 1, configId: "Medieval Madness (Williams 1997)", title: "Medieval Madness", lastPlayed: new Date(2025, 0, 1) };
const ATTACK_FROM_MARS = { id: 2, configId: "Attack from Mars (Bally 1995)", title: "Attack from Mars", lastPlayed: new Date(2026, 5, 1) };
const THEATRE_OF_MAGIC = { id: 3, configId: "Theatre of Magic (Bally 1995)", title: "Theatre of Magic", lastPlayed: new Date(2026, 7, 1) };
const HOMEBREW_TABLE = { id: 4, configId: "Homebrew Table", title: "Homebrew Table", lastPlayed: undefined };

// Theatre of Magic has the most recent play: it is the Last Played Table.
const TABLES = [MEDIEVAL_MADNESS, ATTACK_FROM_MARS, THEATRE_OF_MAGIC, HOMEBREW_TABLE];

// Goes straight to the requested index, like the real animation without its delays.
const noDelayAnimator = { animateTo: async () => {} };

function createRandomGameOn({ tables = TABLES, wheel, skipAnimation = false }) {
    const fake = createFakePinballYHost({ tables });
    fake.setWheelTables(wheel.map(table => table.configId));
    return { fake, randomGame: createRandomGame(fake, { ...noDelayAnimator, skipAnimation }) };
}

async function launchedConfigIds(fake, randomGame, times = LAUNCH_COUNT) {
    for (let i = 0; i < times; i++) await randomGame.launch();
    return new Set(fake.launches().map(game => game.configId));
}

test("never launches the Last Played Table when it is the current table", async () => {
    const { fake, randomGame } = createRandomGameOn({
        wheel: [THEATRE_OF_MAGIC, MEDIEVAL_MADNESS, ATTACK_FROM_MARS],
    });

    const launched = await launchedConfigIds(fake, randomGame);

    assert.equal(fake.launches().length, LAUNCH_COUNT);
    assert.ok(!launched.has(THEATRE_OF_MAGIC.configId), [...launched].join(", "));
});

test("never launches the Last Played Table when it sits just before other tables", async () => {
    const { fake, randomGame } = createRandomGameOn({
        wheel: [MEDIEVAL_MADNESS, THEATRE_OF_MAGIC, ATTACK_FROM_MARS, HOMEBREW_TABLE],
    });

    const launched = await launchedConfigIds(fake, randomGame);

    assert.equal(fake.launches().length, LAUNCH_COUNT);
    assert.ok(!launched.has(THEATRE_OF_MAGIC.configId), [...launched].join(", "));
});

test("never gives the same table twice in a row", async () => {
    const tables = TABLES.map(table => ({ ...table }));
    const { fake, randomGame } = createRandomGameOn({ tables, wheel: tables });

    for (let i = 0; i < LAUNCH_COUNT; i++) {
        await randomGame.launch();
        // PinballY records the play: the launched table becomes the Last Played Table.
        const launchedConfigId = fake.launches()[i].configId;
        fake.setTables(tables.map(table => (table.configId === launchedConfigId
            ? { ...table, lastPlayed: new Date(2026, 8, 23, 10, i) }
            : fake.getGameInfo(table.configId))));
    }

    const launchedConfigIds = fake.launches().map(game => game.configId);
    for (let i = 1; i < launchedConfigIds.length; i++) {
        assert.notEqual(launchedConfigIds[i], launchedConfigIds[i - 1], `launch ${i}`);
    }
});

test("launches the Last Played Table when it is the only table of the selection", async () => {
    const { fake, randomGame } = createRandomGameOn({ wheel: [THEATRE_OF_MAGIC] });

    await randomGame.launch();

    assert.deepEqual(fake.launches().map(game => game.configId), [THEATRE_OF_MAGIC.configId]);
});

test("draws over the whole selection when the Last Played Table is not in it", async () => {
    const { fake, randomGame } = createRandomGameOn({ wheel: [MEDIEVAL_MADNESS, ATTACK_FROM_MARS] });

    const launched = await launchedConfigIds(fake, randomGame);

    assert.deepEqual([...launched].sort(), [ATTACK_FROM_MARS.configId, MEDIEVAL_MADNESS.configId]);
});

test("draws over the whole selection when no table was ever played", async () => {
    const neverPlayed = TABLES.map(table => ({ ...table, lastPlayed: undefined }));
    const { fake, randomGame } = createRandomGameOn({ tables: neverPlayed, wheel: neverPlayed.slice(1, 3) });

    const launched = await launchedConfigIds(fake, randomGame);

    assert.deepEqual([...launched].sort(), [ATTACK_FROM_MARS.configId, THEATRE_OF_MAGIC.configId]);
});

test("never launches the Last Played Table with the animation turned off", async () => {
    const { fake, randomGame } = createRandomGameOn({
        wheel: [THEATRE_OF_MAGIC, MEDIEVAL_MADNESS],
        skipAnimation: true,
    });

    const launched = await launchedConfigIds(fake, randomGame);

    assert.deepEqual([...launched], [MEDIEVAL_MADNESS.configId]);
});

test("does nothing when the wheel selection is empty", async () => {
    const { fake, randomGame } = createRandomGameOn({ wheel: [] });

    await randomGame.launch();

    assert.deepEqual(fake.launches(), []);
});

test("ignores a Random Game requested while the animation is running", async () => {
    const fake = createFakePinballYHost({ tables: TABLES });
    fake.setWheelTables([MEDIEVAL_MADNESS, ATTACK_FROM_MARS].map(table => table.configId));
    let finishAnimation;
    const randomGame = createRandomGame(fake, {
        animateTo: () => new Promise(resolve => { finishAnimation = resolve; }),
    });

    const firstLaunch = randomGame.launch();
    const secondLaunch = randomGame.launch();
    await Promise.resolve();
    finishAnimation();
    await Promise.all([firstLaunch, secondLaunch]);

    assert.equal(fake.launches().length, 1);
});
