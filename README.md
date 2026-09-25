# PinballY Arcade Add-ons

*[Version française](README.fr.md)*

A curated list of JavaScript add-ons for [PinballY](http://mjrnet.org/pinscape/PinballY.php) that make a virtual pinball cabinet feel more like an arcade machine. Plain JavaScript run by PinballY itself: no build step, no dependencies.

## Features

- **Startup dialog**: stay on the last played table, or launch the table of the day, the table of the week or a random table.
- **Table of the day** (never played, or else played longest ago) and **table of the week** (random, Monday to Sunday).
- **Random table**: a "wheel of fortune" animation, never the last played table.
- **Main menu entries** after "Play": Achievement List, Table Setup, Random Game, Table of the Day, Table of the Week, Change Player (a carousel of Avatars driven by the flipper buttons).
- **"Original Tables" filter** in "Filter by Manufacturer": every table except the community-made ones.
- **"Hall of Fame" filter** in the main menu: your ten most played tables, ranked by play time.
- **Achievements**, each announced once by a small card in the bottom-right corner of the playfield screen that disappears on its own (never during a game; several stack, with an optional sound), and browsable by family in the "Achievement List":
  - collection: first table, then 10 to 100 % of your collection played;
  - play time: 1 to 100 hours;
  - tables of the day and week: first play, total days or weeks played, streaks;
  - sessions: 30 or 60 minute marathon, rage quit (a session of 30 seconds to under a minute), grand comeback after 31 days;
  - random game: 10, 50 and 100 random tables played;
  - manufacturers: 3, 5 or 8 different manufacturers played the same day, completion of a manufacturer;
  - completion of a decade or a category.
- **Interface**: PinballY translated into French, German, Spanish, Italian or Portuguese; a status line about the selected table; a reminder to rate a table after 60 minutes of play.
- **Launch**: no black flash between the wheel and the table, an optional launch sound, the backglass hidden while a table runs.

## Install

Requires **Windows** and **PinballY 1.1.0 Beta 10** or later (plus the *Windows Media Player* optional feature for the launch and Achievement sounds only).

1. **Back up** `PinballY\Scripts`, especially `main.js`: this project replaces it.
2. **Copy the project** into `PinballY\Scripts`, keeping your own `System` folder.
3. **Copy `.env.example` to `.env.local`** and set what you need, one `KEY=value` per line (UTF-8). Missing settings keep their default; `.env.local` is ignored by git.
4. **Restart PinballY** and check `PinballY.log`: it lists your overrides, one "initialized" line per add-on, and `ERROR` lines naming the add-on at fault.

| Setting | Default | Meaning |
|---|---|---|
| `LANGUAGE` | `en` | `en`, `fr`, `de`, `es`, `it` or `pt`. |
| `LAUNCH_SOUND_FILE` | empty | Full path to the launch sound, e.g. `C:\PinballY\Media\Sounds\launch.mp3`. |
| `ACHIEVEMENT_SOUND_FILE` | empty | Full path to a sound played with each Achievement card. |
| `COMMUNITY_TABLES_MANUFACTURER` | `VPX Community` | Manufacturer name of your community-made tables. |
| `SKIP_RANDOM_GAME_ANIMATION` | `false` | `true` skips the wheel animation. |
| `ASK_TO_RATE_AFTER_MINUTES_PLAYED` | `60` | Play time before the rating reminder. |
| `ACHIEVEMENT_TOAST_SECONDS` | `4` | Seconds an Achievement card stays fully visible (above 0, at most 60). |
| `ADD_ON_<NAME>` | `true` | `false` turns an add-on off, e.g. `ADD_ON_FORCE_BACKGLASS=false`. |

Upgrading from a version where you edited `common\config.js`? Move your values into `.env.local` and run `git checkout common/config.js` before pulling.

## Your progress

Saved in PinballY's `Settings.txt`, under keys starting with `custom.`. Close PinballY and delete lines to reset them (for example `custom.achievements.notified.*` announces every unlocked achievement again). Collection, completion and play-time achievements use PinballY's own statistics and count your past plays; the others count from installation onwards.

## Languages

Translations live in `lang\<code>.js`; English is the fallback, and missing keys are listed in `PinballY.log`. To add a language, copy `fr.js` (not `en.js`), translate it keeping the keys, `[Game.Xxx]` markers and `${...}` parameters, register it in `common\i18n.js` (an `import` and an `AVAILABLE_LANGUAGES` entry), and save it as UTF-8.

## Contributing

- `main.js` starts the add-ons listed in `SCRIPTS`. `addons\` holds one file per add-on; shared code goes in `common\`, achievement definitions in `achievements\`, translations in `lang\`, tests in `tests\`.
- Shared modules: `pinbally_host` (the only way to PinballY for testable modules), `period_table`, `random_game`, `wheel_dialog` (spontaneous dialogs, shown one at a time when the wheel is free), `achievement_toast` (Achievement announcements drawn in the bottom-right corner, trophy image in `assets\`), `main_menu` (entries after "Play").
- Conventions: English code and comments, a header block per file, no JSDoc, no globals, every displayed text in all 6 languages, event handlers wrapped in `safeHandler`. Details in `.claude/rules/`.
- Tests: `node --test` (Node.js 22+). `tests/persisted_data_pinning.test.js` locks saved keys and achievement IDs.

PinballY scripting reference: `PinballY\Help\Javascript.html` ([online](https://mjrnet.org/pinscape/downloads/PinballY/Help/PinballY.html)); examples in [PinballY-Addons-and-Examples](https://github.com/PinballY/PinballY-Addons-and-Examples). Bugs and ideas: [GitHub issues](https://github.com/F3L1X79/PinballY-Arcade-Addons/issues).

## License

MIT. See [LICENSE](LICENSE).
