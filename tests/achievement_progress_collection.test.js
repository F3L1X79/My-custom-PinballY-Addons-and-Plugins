// ============================================================
// Achievement Progress of the Collection and Play Time Achievements,
// through main.js on the fake PinballY globals: a collection milestone
// shows the distinct tables played against the count its percentage needs;
// play time shows hours rounded down to one decimal, so it never reads the
// target before the Achievement unlocks; a target of 1 shows none.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { settle } from "./fake_pinbally_host.js";
import { startScenario, table, PROFILES_FOLDER } from "./achievement_progress_scenario.js";

const TABLES = Array.from({ length: 10 }, (_, index) => table(index + 1, `Table ${index + 1}`, "Williams", 1990));
const [FIRST, SECOND] = TABLES;

// 4 h 59 min 50 s: 4.99 hours, which must read 4.9.
const PLAYED_SECONDS = 5 * 3600 - 10;

test("collection milestones show the tables played, play time the hours rounded down", async () => {
    const { fake, lang, getProfileStore, play, familyTitles, cardText, withProgress, progressCard } = await startScenario({
        now: new Date(2026, 8, 23, 10, 0, 0),
        tables: TABLES,
        folders: [`${PROFILES_FOLDER}\\Alice`],
        files: {
            [`${PROFILES_FOLDER}\\guest\\profile.json`]: {
                version: 1,
                notified: [],
                plays: {
                    [FIRST.configId]: { count: 3, seconds: PLAYED_SECONDS - 600, lastPlayed: "2026-09-01T20:00:00" },
                    [SECOND.configId]: { count: 1, seconds: 600, lastPlayed: "2026-09-02T20:00:00" },
                },
            },
        },
    });
    const ACHIEVEMENT = lang.achievements;

    assert.deepEqual(familyTitles("collection"), [
        ACHIEVEMENT.firstTableTitle(),
        ACHIEVEMENT.collectionPercentTitles[10],
        withProgress(ACHIEVEMENT.collectionPercentTitles[25], "tables", 2, 3),
        withProgress(ACHIEVEMENT.collectionPercentTitles[50], "tables", 2, 5),
        withProgress(ACHIEVEMENT.collectionPercentTitles[75], "tables", 2, 8),
        withProgress(ACHIEVEMENT.collectionPercentTitles[100], "tables", 2, 10),
    ]);

    const fiveHours = ACHIEVEMENT.playTimeMilestoneTitles[5];
    assert.deepEqual(familyTitles("playTime"), [
        ACHIEVEMENT.playTimeMilestoneTitles[1],
        withProgress(fiveHours, "hours", 4.9, 5),
        withProgress(ACHIEVEMENT.playTimeMilestoneTitles[10], "hours", 4.9, 10),
        withProgress(ACHIEVEMENT.playTimeMilestoneTitles[50], "hours", 4.9, 50),
        withProgress(ACHIEVEMENT.playTimeMilestoneTitles[100], "hours", 4.9, 100),
    ]);
    assert.equal(cardText("playTime", withProgress(fiveHours, "hours", 4.9, 5)),
        progressCard(fiveHours, ACHIEVEMENT.playTimeMilestoneDescription(5), "hours", 4.9, 5));

    // Ten more seconds reach the 5 hours exactly: the Achievement unlocks
    // as its Achievement Progress reaches its target.
    await play(SECOND, 10);
    assert.deepEqual(familyTitles("playTime").slice(0, 3), [
        ACHIEVEMENT.playTimeMilestoneTitles[1],
        fiveHours,
        withProgress(ACHIEVEMENT.playTimeMilestoneTitles[10], "hours", 5, 10),
    ]);

    // Nothing played: the targets of 1 show no Achievement Progress.
    getProfileStore().switchTo("Alice");
    await settle();
    assert.deepEqual(familyTitles("collection").slice(0, 2),
        [ACHIEVEMENT.firstTableTitle(), ACHIEVEMENT.collectionPercentTitles[10]]);
    assert.equal(familyTitles("playTime")[0], ACHIEVEMENT.playTimeMilestoneTitles[1]);

    assert.deepEqual(fake.logLines().filter(line => line.includes("ERROR")), []);
});
