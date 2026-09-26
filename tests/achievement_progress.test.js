// ============================================================
// Achievement Progress of the completion Achievements, through main.js on
// the fake PinballY globals and read in the Achievement List after real
// plays: a completion Achievement shows its tables played, drops its
// Achievement Progress once Unlocked, shows none for a target of 1, and
// follows a Profile switch.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { settle } from "./fake_pinbally_host.js";
import { startScenario, table, PROFILES_FOLDER } from "./achievement_progress_scenario.js";

const MEDIEVAL = table(1, "Medieval Madness", "Williams", 1997, ["Fantasy"]);
const TWILIGHT = table(2, "Twilight Zone", "Williams", 1993, ["Fantasy"]);
const ADDAMS = table(3, "Addams Family", "Williams", 1992, ["Horror"]);
const MARS = table(4, "Attack from Mars", "Bally", 1995, ["SciFi"]);

test("a completion Achievement shows its tables played until it unlocks, and follows the active Profile", async () => {
    const { fake, lang, getProfileStore, play, familyTitles, cardText, withProgress, progressCard } = await startScenario({
        now: new Date(2026, 8, 23, 10, 0, 0),
        tables: [MEDIEVAL, TWILIGHT, ADDAMS, MARS],
        folders: [`${PROFILES_FOLDER}\\Alice`],
    });
    const TEXT = lang.achievementList;
    const ACHIEVEMENT = lang.achievements;
    const williams = ACHIEVEMENT.manufacturerCompletionTitle("Williams");
    const williamsDescription = ACHIEVEMENT.manufacturerCompletionDescription("Williams", 3);
    const bally = ACHIEVEMENT.manufacturerCompletionTitle("Bally");
    const fantasy = ACHIEVEMENT.categoryCompletionTitle("Fantasy");
    const nineties = ACHIEVEMENT.decadeCompletionTitle(1990);

    assert.ok(familyTitles("manufacturers").includes(withProgress(williams, "tables", 0, 3)));

    await play(MEDIEVAL);
    const manufacturers = familyTitles("manufacturers");
    assert.ok(manufacturers.includes(withProgress(williams, "tables", 1, 3)));
    assert.ok(manufacturers.includes(bally), "a target of 1 shows no Achievement Progress");
    assert.ok(familyTitles("categories").includes(withProgress(fantasy, "tables", 1, 2)));
    assert.ok(familyTitles("decades").includes(withProgress(nineties, "tables", 1, 4)));
    assert.equal(cardText("manufacturers", withProgress(williams, "tables", 1, 3)),
        progressCard(williams, williamsDescription, "tables", 1, 3));

    getProfileStore().switchTo("Alice");
    await settle();
    assert.ok(familyTitles("manufacturers").includes(withProgress(williams, "tables", 0, 3)), "Alice's own progress");

    getProfileStore().switchTo("guest");
    await settle();
    await play(TWILIGHT);
    await play(ADDAMS);
    assert.ok(familyTitles("manufacturers").includes(williams), "Unlocked: the bare title");
    assert.equal(cardText("manufacturers", williams), TEXT.cardMessage(williams, williamsDescription, TEXT.unlocked));

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
