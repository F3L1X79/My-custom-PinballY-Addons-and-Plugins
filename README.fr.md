# PinballY Arcade Add-ons

*[English version](README.md)*

Une sélection soignée d'add-ons JavaScript pour [PinballY](http://mjrnet.org/pinscape/PinballY.php) qui donnent à une borne de flipper virtuel un air de machine d'arcade. Du JavaScript exécuté tel quel par PinballY : aucune étape de build, aucune dépendance.

## Fonctionnalités

- **Dialogue de démarrage** : rester sur la dernière table jouée, ou lancer la table du jour, la table de la semaine ou une table au hasard.
- **Table du jour** (jamais jouée, ou à défaut jouée il y a le plus longtemps) et **table de la semaine** (au hasard, du lundi au dimanche).
- **Table au hasard** : une animation « roue de la fortune », jamais la dernière table jouée.
- **Entrées du menu principal** après « Jouer » : Changer de joueur (un carrousel d'Avatars piloté par les flippers, aussi dans le menu Quitter et en deuxième choix du dialogue de démarrage ; l'Avatar et le nom du Profile actif restent en haut à droite de l'écran de la roue ; choisir un Profile accueille le joueur, et démarrer PinballY aussi quand le dialogue de démarrage est désactivé), Succès personnels, Configuration de la table, table au hasard, table du jour, table de la semaine.
- **Filtre « Tables Originales »** dans « Filtrer par fabricant » : toutes les tables sauf celles de la communauté.
- **Filtre « Hall of Fame »** dans le menu principal : vos dix tables les plus jouées, classées par temps de jeu.
- **Horloge** en haut à gauche de l'écran de la roue, au format de votre langue (cachée pendant une partie).
- **Succès**, chacun annoncé une fois par une petite carte en bas à droite de l'écran du plateau, qui disparaît toute seule (jamais pendant une partie ; plusieurs cartes s'empilent, avec un son facultatif), et consultables par famille dans « Succès personnels » :
  - collection : première table, puis de 10 à 100 % de la collection jouée ;
  - temps de jeu : de 1 à 100 heures ;
  - tables du jour et de la semaine : première partie, total de jours ou de semaines joués, séries ;
  - sessions : marathon de 30 ou 60 minutes, rage quit (une session de 30 secondes à moins d'une minute), grand retour après 31 jours ;
  - table au hasard : 10, 50 et 100 tables au hasard jouées ;
  - fabricants : 3, 5 ou 8 fabricants différents joués le même jour, complétion d'un fabricant ;
  - complétion d'une décennie ou d'une catégorie.
- **Interface** : PinballY traduit en français, allemand, espagnol, italien ou portugais ; une ligne d'état sur la table sélectionnée ; un rappel pour noter une table après 60 minutes de jeu.
- **Lancement** : pas de flash noir entre la roue et la table, un son de lancement optionnel, le backglass masqué pendant une partie.

## Installation

Nécessite **Windows** et **PinballY 1.1.0 Beta 10** ou plus récent (plus la fonctionnalité facultative *Lecteur Windows Media*, pour les sons de lancement et de succès uniquement).

1. **Sauvegardez** `PinballY\Scripts`, en particulier `main.js` : ce projet le remplace.
2. **Copiez le projet** dans `PinballY\Scripts`, en gardant votre dossier `System`.
3. **Copiez `.env.example` en `.env.local`** et réglez ce qu'il vous faut, un `CLÉ=valeur` par ligne (UTF-8). Les réglages absents gardent leur valeur par défaut ; `.env.local` est ignoré par git.
4. **Redémarrez PinballY** et consultez `PinballY.log` : il liste vos réglages, une ligne « initialized » par add-on, et des lignes `ERROR` qui désignent l'add-on en cause.

| Réglage | Défaut | Rôle |
|---|---|---|
| `LANGUAGE` | `en` | `en`, `fr`, `de`, `es`, `it` ou `pt`. |
| `LAUNCH_SOUND_FILE` | vide | Chemin complet du son de lancement, par exemple `C:\PinballY\Media\Sounds\launch.mp3`. |
| `ACHIEVEMENT_SOUND_FILE` | vide | Chemin complet d'un son joué avec chaque carte de succès. |
| `PROFILE_GREETING_SOUND_FILE` | vide | Chemin complet d'un son joué quand un joueur est accueilli. |
| `COMMUNITY_TABLES_MANUFACTURER` | `VPX Community` | Nom de fabricant de vos tables de la communauté. |
| `SKIP_RANDOM_GAME_ANIMATION` | `false` | `true` saute l'animation de la roue. |
| `ASK_TO_RATE_AFTER_MINUTES_PLAYED` | `60` | Temps de jeu avant le rappel de notation. |
| `ACHIEVEMENT_TOAST_SECONDS` | `4` | Secondes pendant lesquelles une carte de succès reste pleinement visible (plus de 0, au plus 60). |
| `ACHIEVEMENT_TOAST_SCALE` | `1.6` | Taille d'une carte de succès : `1` = taille d'origine, `2` = deux fois plus grande (de 0,5 à 3, avec un point : `1.6`). |
| `ADD_ON_<NOM>` | `true` | `false` désactive un add-on, par exemple `ADD_ON_FORCE_BACKGLASS=false`. |

Vous aviez modifié `common\config.js` dans une ancienne version ? Reportez vos valeurs dans `.env.local` et lancez `git checkout common/config.js` avant de faire un pull.

## Votre progression

Enregistrée dans le `Settings.txt` de PinballY, sous des clés commençant par `custom.`. Fermez PinballY et supprimez des lignes pour les réinitialiser (par exemple `custom.achievements.notified.*` annonce de nouveau tous les succès débloqués). Les succès de collection, de complétion et de temps de jeu utilisent les statistiques de PinballY et comptent vos parties passées ; les autres comptent à partir de l'installation.

## Langues

Les traductions sont dans `lang\<code>.js` ; l'anglais sert de secours, et les clés manquantes sont listées dans `PinballY.log`. Pour ajouter une langue, copiez `fr.js` (pas `en.js`), traduisez-le en gardant les clés, les marqueurs `[Game.Xxx]` et les paramètres `${...}`, déclarez-le dans `common\i18n.js` (un `import` et une entrée dans `AVAILABLE_LANGUAGES`), et enregistrez-le en UTF-8.

## Contribuer

- `main.js` démarre les add-ons listés dans `SCRIPTS`. `addons\` contient un fichier par add-on ; le code partagé va dans `common\`, les définitions de succès dans `achievements\`, les traductions dans `lang\`, les tests dans `tests\`.
- Modules partagés : `pinbally_host` (seul accès à PinballY pour les modules testables), `period_table`, `random_game`, `wheel_dialog` (dialogues spontanés, affichés un par un quand la roue est libre), `achievement_toast` (annonces de succès dessinées en bas à droite, image du trophée dans `assets\`), `main_menu` (entrées après « Jouer »).
- Conventions : code et commentaires en anglais, un bloc d'en-tête par fichier, pas de JSDoc, pas de globales, chaque texte affiché dans les 6 langues, gestionnaires d'événements enveloppés dans `safeHandler`. Détails dans `.claude/rules/`.
- Tests : `node --test` (Node.js 22+). `tests/persisted_data_pinning.test.js` fige les clés enregistrées et les ID des succès.

Référence du scripting PinballY : `PinballY\Help\Javascript.html` ([en ligne](https://mjrnet.org/pinscape/downloads/PinballY/Help/PinballY.html)) ; exemples dans [PinballY-Addons-and-Examples](https://github.com/PinballY/PinballY-Addons-and-Examples). Bugs et idées : [issues GitHub](https://github.com/F3L1X79/PinballY-Arcade-Addons/issues).

## Licence

MIT. Voir [LICENSE](LICENSE).
