# My custom PinballY add-ons

A set of JavaScript add-ons for [PinballY](https://mjrnet.org/pinscape/PinballY.php), the virtual pinball front end. They make your cabinet feel more like an arcade machine:
- a table of the day and a table of the week;
- a random table picked by a "wheel of fortune" animation;
- achievements;
- a translated interface in 6 languages;
- smoother table launches.

Everything is plain JavaScript run by PinballY itself: no build step, no dependencies.

## Features

**Choosing what to play**
- **Startup dialog.** When PinballY starts, it offers to stay on the last played table, or to launch the table of the day, the table of the week or a random table.
- **Table of the day.** One pick per day: a table you've never played, or else the one you played longest ago.
- **Table of the week.** One purely random pick per week, Monday to Sunday.
- **Random table.** The wheel spins to a random table with a "wheel of fortune" animation (fast start, slow finish), then launches it.
- **Main menu entries.** "Launch Table of the Day", "Launch Table of the Week", "Start Random Game" and a shortcut to "Table Setup" are added right after "Play".
- **"Original Tables" filter.** Added to the "Filter by Manufacturer" menu. It lists every table except the community-made ones (see `tableMetadata` in the configuration below).

**Achievements.** A congratulations dialog appears when you're back at the wheel. Each achievement is shown only once.
- **First table.** Your very first table played.
- **Collection.** 10, 25, 50, 75 and 100 % of your collection played.
- **Completion.** All the tables of a manufacturer, of a decade or of a category played.
- **Total play time.** 1, 5, 10, 50 and 100 hours.
- **Streaks.** The table of the day played 3, 7 or 30 days in a row; the table of the week played 4 or 12 weeks in a row. A day or week counts as soon as you play its table, whether you launched it from the menus or picked it yourself on the wheel.
- **Session milestones.** A 30 or 60 minute marathon, a rage quit (30 seconds or less), and a grand comeback on a table untouched for a year.

**Interface**
- **Translation.** PinballY's own menus and launch messages are translated into French, German, Spanish, Italian or Portuguese. English is the default.
- **Status line.** The lower status line cycles through information about the selected table: its position in the list, release year, manufacturer, play count and total play time.
- **Rating reminder.** Once a table's total play time passes 60 minutes, you're asked to rate it if you haven't yet.

**Launching a table**
- **Seamless launch.** The wheel is hidden during loading, which avoids a black flash between the wheel and the table's own loading screen.
- **Launch sound.** An optional sound (for example "Here we go!") plays when a table starts.
- **Backglass handling.** The backglass window is shown at startup, hidden while a table runs (Visual Pinball draws its own), then shown again.

## Requirements

- **Windows**, with **PinballY 1.1.0 Beta 10** or later.
- **For the launch sound only:** the **Windows Media Player** optional Windows feature (*Settings › Apps › Optional features*). Without it, only the sound is skipped; everything else works.

## Quick install

**1. Back up** your current `PinballY\Scripts` folder, especially `main.js` if you already have one: this project replaces it.

**2. Copy the project** into `PinballY\Scripts`. The `System` folder ships with PinballY itself: keep yours and don't overwrite it.

```text
PinballY\
└── Scripts\
    ├── System\            ← from your PinballY install, leave it alone
    ├── main.js            ← entry point PinballY loads at startup
    ├── *.js               ← one file per add-on
    ├── common\            ← shared code
    │   └── config.js      ← the only file you need to edit
    ├── achievements\
    └── lang\
```

**3. Edit `common\config.js`.** Three settings depend on your machine and your preferences:

| Setting | Default | What to set |
|---|---|---|
| `translation.language` | `"fr"` | Your language: `"en"`, `"fr"`, `"de"`, `"es"`, `"it"` or `"pt"`. |
| `launchSound.absoluteFilePath` | the author's file | The **absolute** path to your own sound file, with doubled backslashes, e.g. `"C:\\PinballY\\Media\\Sounds\\launch.mp3"`. Use `""` for no sound. |
| `tableMetadata.communityManufacturerName` | `"VPX Community"` | The manufacturer name you gave community-made tables in PinballY. It's used by the status line and the "Original Tables" filter. |

For example, for an English setup with no launch sound:

```js
translation: {
    enabled: true,
    language: "en",
},
// ...
launchSound: {
    absoluteFilePath: "",
    volumePercent: 100,
},
```

**4. Restart PinballY**, then open `PinballY.log` in the PinballY folder. Every add-on writes a line like this:

```text
[Script] [Startup] "achievements" initialized in 4 ms.
```

A line containing `ERROR` names the add-on at fault. The other add-ons keep working.

## Configuration

Every setting lives in `common\config.js`, and each one has a comment there. The main sections:

| Section | What it controls |
|---|---|
| `scripts.enabled` | Turn any add-on off by setting it to `false`, for example `forceBackglass: false` if you have no backglass screen. |
| `scripts.logStartupTiming` | Logs how long each add-on takes to start. |
| `translation` | Language. `enabled: false` forces English. |
| `menuTranslation.logUnknownTitles` | Logs PinballY menu titles that have no translation yet. Useful when adding a language. |
| `achievements` | Thresholds: collection percentages, play time hours, marathon minutes, rage-quit seconds, grand-comeback days. |
| `randomGameCommand` | Wheel animation: speed, skipping it, the chance of stopping one table early, the delay before launch. |
| `ratingPrompt.thresholdMinutes` | Total play time before you're asked to rate a table. |
| `launchSound` | Sound file and volume. |
| `tableMetadata` | Name used for community-made tables. |

## Where your progress is stored

Streaks, session records, table-of-the-day picks and "already notified" achievements are saved in PinballY's own `Settings.txt`, under keys starting with `custom.`. To reset one, close PinballY and delete the matching lines. For example, deleting the `custom.achievements.notified.*` lines shows every unlocked achievement again.

Collection, completion and play-time achievements are computed from PinballY's own play statistics, so tables you had already played before installing count straight away. Streaks and session milestones (marathon, rage quit, grand comeback) only count from installation onwards.

## Adding or improving a language

Translations live in `lang\<code>.js`. English (`en.js`) is the fallback language.

- **To improve a translation,** edit the text in that language's file.
- **To add a language:**
  1. Copy an existing translation such as `fr.js` (not `en.js`: its PinballY menu tables are empty, since PinballY's own texts are already in English) to a new file, for example `nl.js`, and translate it. Keep the keys, the `[Game.Xxx]` placeholders and the `${...}` parameters as they are.
  2. Register it in `common\i18n.js`: add an `import` and an entry in `AVAILABLE_LANGUAGES`.
  3. Select it with `translation.language`.

If a text is missing from a language, the English text is shown instead, and the missing keys are listed once in `PinballY.log` at startup. Save language files as **UTF-8** so accented characters display correctly.

## For contributors

`main.js` starts each add-on in turn, in the order of its `SCRIPTS` list. The comment above the list explains which order constraints matter. Each add-on is a module whose default `init()` function sets it up, usually by registering PinballY event listeners.

```text
main.js                  entry point and add-on list
*.js                     one file per add-on registered in main.js, and nothing else
                         (ui_translation, session_stats_tracker, rating_prompt, ...)
common\                  shared code, never an add-on: config, i18n, safe_handler,
                         pinbally_host, period_table, wheel_dialog, random_game...
achievements\            achievement definitions
lang\                    translations
tests\                   node tests (never loaded by PinballY)
```

To add an add-on, create its file at the root, then register it in `main.js` (`import` and `SCRIPTS`) and in `config.scripts.enabled`. Code shared by several add-ons goes in `common\`.

Three shared modules carry most of the logic:
- **PinballY host** (`common/pinbally_host.js`). Everything the Period Table and wheel dialog modules take from PinballY: settings, clock, visible tables, main window menus, UI mode and events, commands, table launch. It passes straight through to PinballY; the tests replace it with an in-memory fake. The other add-ons and helpers still use PinballY's globals directly.
- **Period Table** (`common/period_table.js`). One module for both the table of the day and the table of the week: it picks the table once per period and keeps it, launches it, and keeps its streak. A period counts in the streak when its table actually starts playing. Add-ons share one instance of each through `getTableOfTheDay()` and `getTableOfTheWeek()`.
- **Wheel dialog** (`common/wheel_dialog.js`). Add-ons `submit()` a dialog description (message, buttons with their actions, priority) to the queue returned by `getWheelDialogs()`. It shows the dialogs one at a time, only when the wheel is free, in a fixed priority order (startup prompt, then achievements, then rating prompt), and moves on as soon as one closes. The order of add-ons in `main.js` never decides which dialog comes first.

The conventions, enforced in review:
- **Language.** Code, comments and log messages are in English.
- **Style.** File names in `snake_case.js`. No global variables: only the globals PinballY provides.
- **Comments.** Each file starts with a header block describing its role, when it runs and its side effects. Add short `//` comments for the *why* of non-obvious choices. No JSDoc.
- **Displayed text.** Every text shown to the player goes through `common/i18n.js` and must exist in all 6 languages.
- **Error handling.** Wrap every event handler with `safeHandler(SCRIPT_NAME, ...)` from `common/safe_handler.js`. An error is then logged with the add-on's name, and the other add-ons keep working.
- **Settings.**
  - Read typed values with `optionSettings.getInt` / `getFloat` / `getBool`, because `get()` always returns a string.
  - Don't call `optionSettings.save()`: PinballY saves on its own.
- **Dialogs.** Submit them to the wheel dialog module, which waits for the wheel to be free. A menu opened directly must only open when `mainWindow.getUIMode().mode === "wheel"`; otherwise, wait for the `wheelmode` event.
- **Menu separators** are written `{ cmd: -1 }`.

**Tests.** From the project folder, run `node --test` (Node.js 22 or later, nothing to install). The tests run the add-ons on an in-memory fake PinballY (`tests/fake_pinbally_host.js`), the test twin of `common/pinbally_host.js`. `tests/persisted_data_pinning.test.js` locks the saved settings keys and Achievement IDs: if it fails, a change would lose players' progress.

The PinballY scripting reference is in PinballY's help (`PinballY\Help\Javascript.html`, also [online](https://mjrnet.org/pinscape/downloads/PinballY/Help/PinballY.html)). Official examples are in [PinballY-Addons-and-Examples](https://github.com/PinballY/PinballY-Addons-and-Examples).

Bugs and ideas: [GitHub issues](https://github.com/F3L1X79/My-custom-PinballY-Addons-and-Plugins/issues).

## License

MIT. See [LICENSE](LICENSE).
