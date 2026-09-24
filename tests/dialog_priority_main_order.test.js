// ============================================================
// Dialog priority with the add-ons started in main.js's order: startup
// prompt, then Achievements, then rating prompt.
// ============================================================

import { test } from "node:test";
import { runDialogPriorityScenario } from "./dialog_priority_scenario.js";

test("dialogs follow the fixed priority with main.js's add-on order", async () => {
    await runDialogPriorityScenario(["sessionStatsTracker", "achievements", "ratingPrompt", "startupChoicePrompt"]);
});
