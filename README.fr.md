# Mes add-ons PinballY

*[English version](README.md)*

Un ensemble d'add-ons JavaScript pour [PinballY](https://mjrnet.org/pinscape/PinballY.php), le front-end de flipper virtuel. Ils donnent à votre borne un air de machine d'arcade :
- une table du jour et une table de la semaine ;
- une table au hasard, choisie par une animation « roue de la fortune » ;
- des succès ;
- une interface traduite en 6 langues ;
- des lancements de table plus fluides.

Tout est en JavaScript exécuté tel quel par PinballY : aucune étape de build, aucune dépendance.

## Fonctionnalités

**Choisir à quoi jouer**
- **Dialogue de démarrage.** Au démarrage de PinballY, il propose de rester sur la dernière table jouée, ou de lancer la table du jour, la table de la semaine ou une table au hasard.
- **Table du jour.** Un tirage par jour : une table jamais jouée, ou à défaut celle jouée il y a le plus longtemps.
- **Table de la semaine.** Un tirage purement aléatoire par semaine, du lundi au dimanche.
- **Table au hasard.** La roue tourne jusqu'à une table au hasard avec une animation « roue de la fortune » (départ rapide, fin lente), puis la lance.
- **Entrées du menu principal.** « Succès personnels » (avec l'add-on des succès), un raccourci vers « Configuration de la table », « Lancer une table au hasard », « Lancer la table du jour » et « Lancer la table de la semaine » sont ajoutés juste après « Jouer », dans cet ordre.
- **Filtre « Tables Originales ».** Ajouté au menu « Filtrer par fabricant ». Il liste toutes les tables sauf celles créées par la communauté (voir `COMMUNITY_TABLES_MANUFACTURER` dans la configuration plus bas).

**Succès.** Une fenêtre de félicitations s'affiche quand vous revenez sur la roue. Chaque succès n'est annoncé qu'une fois. L'entrée « Succès personnels » du menu principal montre tous les succès par famille (collection, temps de jeu, tables du jour et de la semaine, sessions, fabricants, décennies, catégories), les succès débloqués cochés en tête. Choisir un succès affiche sa fiche : ce qu'il demande et s'il est débloqué.
- **Première table.** Votre toute première table jouée.
- **Collection.** 10, 25, 50, 75 et 100 % de votre collection jouée.
- **Complétion.** Toutes les tables d'un fabricant, d'une décennie ou d'une catégorie jouées.
- **Temps de jeu total.** 1, 5, 10, 50 et 100 heures.
- **Tables du jour et de la semaine.** La première fois que vous jouez la table du jour, et la table de la semaine. La table du jour jouée 10, 50 ou 100 jours au total, et la table de la semaine 10, 26 ou 52 semaines au total, consécutifs ou non. Séries : la table du jour jouée 3, 7 ou 30 jours d'affilée ; la table de la semaine jouée 4 ou 12 semaines d'affilée. Un jour ou une semaine compte une fois, dès que vous jouez sa table, que vous l'ayez lancée depuis les menus ou choisie vous-même sur la roue.
- **Jalons de session.** Un marathon de 30 ou 60 minutes, un rage quit (30 secondes ou moins), et un grand retour sur une table délaissée depuis 31 jours ou plus.

**Interface**
- **Traduction.** Les menus et messages de lancement de PinballY sont traduits en français, allemand, espagnol, italien ou portugais. L'anglais est la langue par défaut.
- **Ligne d'état.** La ligne d'état du bas fait défiler des informations sur la table sélectionnée : sa position dans la liste, son année de sortie, son fabricant, son nombre de parties et son temps de jeu total.
- **Rappel de notation.** Quand le temps de jeu total d'une table dépasse 60 minutes, on vous propose de la noter si ce n'est pas déjà fait.

**Lancer une table**
- **Lancement sans coupure.** La roue est masquée pendant le chargement, ce qui évite un flash noir entre la roue et l'écran de chargement de la table.
- **Son de lancement.** Un son optionnel (par exemple « Here we go! ») est joué au démarrage d'une table.
- **Gestion du backglass.** La fenêtre du backglass est affichée au démarrage, masquée pendant une partie (Visual Pinball dessine le sien), puis réaffichée.

## Prérequis

- **Windows**, avec **PinballY 1.1.0 Beta 10** ou plus récent.
- **Pour le son de lancement uniquement :** la fonctionnalité facultative Windows **Lecteur Windows Media** (*Paramètres › Applications › Fonctionnalités facultatives*). Sans elle, seul le son est ignoré ; tout le reste fonctionne.

## Installation rapide

**1. Sauvegardez** votre dossier `PinballY\Scripts` actuel, en particulier `main.js` si vous en avez déjà un : ce projet le remplace.

**2. Copiez le projet** dans `PinballY\Scripts`. Le dossier `System` est fourni avec PinballY : gardez le vôtre et ne l'écrasez pas.

```text
PinballY\
└── Scripts\
    ├── System\            ← issu de votre installation PinballY, n'y touchez pas
    ├── main.js            ← point d'entrée chargé par PinballY au démarrage
    ├── *.js               ← un fichier par add-on
    ├── .env.example       ← tous les réglages, avec leur valeur par défaut
    ├── .env.local         ← vos réglages (vous le créez à l'étape 3)
    ├── common\            ← code partagé
    ├── achievements\
    └── lang\
```

**3. Créez votre fichier de réglages.** Copiez `.env.example` en `.env.local` dans le même dossier, ouvrez `.env.local` dans un éditeur de texte et renseignez les trois lignes sous « Set these for your setup » :

| Réglage | Défaut | Quoi mettre |
|---|---|---|
| `LANGUAGE` | `en` | Votre langue : `en`, `fr`, `de`, `es`, `it` ou `pt`. |
| `LAUNCH_SOUND_FILE` | vide (pas de son) | Le chemin complet de votre fichier son, écrit normalement, par ex. `C:\PinballY\Media\Sounds\launch.mp3`. Laissez vide pour ne pas avoir de son. |
| `COMMUNITY_TABLES_MANUFACTURER` | `VPX Community` | Le nom de fabricant que vous avez donné aux tables de la communauté dans PinballY. Il sert à la ligne d'état et au filtre « Tables Originales ». |

Par exemple, pour une installation en français avec un son de lancement :

```text
LANGUAGE=fr
LAUNCH_SOUND_FILE=C:\PinballY\Media\Sounds\launch.mp3
```

Vous pouvez supprimer toutes les lignes que vous ne modifiez pas : les réglages absents gardent leur valeur par défaut. Enregistrez le fichier en **UTF-8**. `.env.local` est ignoré par git, donc une mise à jour du projet n'y touche jamais. Sans `.env.local`, tout tourne avec les valeurs par défaut (anglais, pas de son de lancement).

**4. Redémarrez PinballY**, puis ouvrez `PinballY.log` dans le dossier de PinballY. Il liste les réglages modifiés par votre `.env.local` :

```text
[Script] [Config] .env.local overrides: LANGUAGE, LAUNCH_SOUND_FILE.
```

Un réglage mal orthographié ou une valeur invalide est journalisé avec son numéro de ligne, puis ignoré. Chaque add-on écrit aussi une ligne comme celle-ci :

```text
[Script] [Startup] "achievements" initialized in 4 ms.
```

Une ligne contenant `ERROR` désigne l'add-on en cause. Les autres add-ons continuent de fonctionner.

## Configuration

Tous les réglages sont listés dans `.env.example`, avec un commentaire et leur valeur par défaut. Renseignez ceux que vous voulez changer dans `.env.local`, un `CLÉ=valeur` par ligne. Les guillemets autour des valeurs sont facultatifs, et les lignes commençant par `#` sont des commentaires.

| Réglage | Ce qu'il contrôle |
|---|---|
| **À régler pour votre installation** | |
| `LANGUAGE` | Langue de l'interface. `en` pour l'anglais. |
| `LAUNCH_SOUND_FILE` | Son joué au lancement d'une table. Vide pour aucun son. |
| `COMMUNITY_TABLES_MANUFACTURER` | Nom utilisé pour les tables de la communauté. |
| **Préférences facultatives** | |
| `SKIP_RANDOM_GAME_ANIMATION` | `true` va directement à la table au hasard, sans l'animation de la roue. |
| `ASK_TO_RATE_AFTER_MINUTES_PLAYED` | Temps de jeu total sur une table avant qu'on vous propose de la noter. |
| **Add-ons** | |
| `ADD_ON_<NOM>` | `false` désactive un add-on, par exemple `ADD_ON_FORCE_BACKGLASS=false` si vous n'avez pas d'écran de backglass. |

**Vous utilisez déjà une ancienne version ?** Si vous aviez modifié `common\config.js`, reportez vos valeurs dans `.env.local`, puis annulez vos modifications avec `git checkout common/config.js` avant de faire un pull ; sinon git signale un conflit sur ce fichier.

## Où votre progression est enregistrée

Les séries, les records de session, les tirages de la table du jour et les succès « déjà annoncés » sont enregistrés dans le `Settings.txt` de PinballY, sous des clés commençant par `custom.`. Pour en réinitialiser un, fermez PinballY et supprimez les lignes correspondantes. Par exemple, supprimer les lignes `custom.achievements.notified.*` annonce de nouveau tous les succès débloqués.

Les succès de collection, de complétion et de temps de jeu sont calculés à partir des statistiques de jeu de PinballY : les tables déjà jouées avant l'installation comptent tout de suite. Les séries et les jalons de session (marathon, rage quit, grand retour) ne comptent qu'à partir de l'installation.

## Ajouter ou améliorer une langue

Les traductions sont dans `lang\<code>.js`. L'anglais (`en.js`) est la langue de secours.

- **Pour améliorer une traduction,** modifiez le texte dans le fichier de cette langue.
- **Pour ajouter une langue :**
  1. Copiez une traduction existante comme `fr.js` (pas `en.js` : ses tables de menus PinballY sont vides, puisque les textes de PinballY sont déjà en anglais) dans un nouveau fichier, par exemple `nl.js`, et traduisez-le. Gardez tels quels les clés, les marqueurs `[Game.Xxx]` et les paramètres `${...}`.
  2. Déclarez-la dans `common\i18n.js` : ajoutez un `import` et une entrée dans `AVAILABLE_LANGUAGES`.
  3. Choisissez-la avec `LANGUAGE` dans `.env.local`.

S'il manque un texte dans une langue, le texte anglais s'affiche à la place, et les clés manquantes sont listées une fois dans `PinballY.log` au démarrage. Enregistrez les fichiers de langue en **UTF-8** pour que les caractères accentués s'affichent correctement.

## Pour les contributeurs

`main.js` démarre chaque add-on à tour de rôle, dans l'ordre de sa liste `SCRIPTS`. Le commentaire au-dessus de la liste explique quelles contraintes d'ordre comptent. Chaque add-on est un module dont la fonction `init()` par défaut le met en place, en général en enregistrant des écouteurs d'événements PinballY.

```text
main.js                  point d'entrée et liste des add-ons
*.js                     un fichier par add-on enregistré dans main.js, et rien d'autre
                         (ui_translation, session_stats_tracker, rating_prompt, ...)
common\                  code partagé, jamais un add-on : config, i18n, safe_handler,
                         pinbally_host, period_table, wheel_dialog, random_game...
achievements\            définitions des succès
lang\                    traductions
tests\                   tests node (jamais chargés par PinballY)
```

Pour ajouter un add-on, créez son fichier à la racine, puis déclarez-le dans `main.js` (`import` et `SCRIPTS`) et dans `addOns` de `common\config.js`. Le code partagé par plusieurs add-ons va dans `common\`.

Quatre modules partagés portent l'essentiel de la logique :
- **PinballY host** (`common/pinbally_host.js`). Tout ce que les modules Period Table et wheel dialog prennent à PinballY : réglages, horloge, tables visibles, menus de la fenêtre principale, mode d'interface et événements, commandes, lancement de table. Il transmet tout directement à PinballY ; les tests le remplacent par une imitation en mémoire. Les autres add-ons et utilitaires utilisent encore directement les globales de PinballY.
- **Period Table** (`common/period_table.js`). Un seul module pour la table du jour et la table de la semaine : il tire la table une fois par période et la garde, la lance, et tient sa série et son total de périodes jouées (jamais inférieur à la plus longue série). Une période compte dans les deux dès que sa table démarre vraiment. Les add-ons partagent une instance de chaque via `getTableOfTheDay()` et `getTableOfTheWeek()`.
- **Wheel dialog** (`common/wheel_dialog.js`). Les add-ons soumettent avec `submit()` la description d'un dialogue (message, boutons et leurs actions, priorité) à la file renvoyée par `getWheelDialogs()`. Elle affiche les dialogues un par un, seulement quand la roue est libre, dans un ordre de priorité fixe (dialogue de démarrage, puis succès, puis rappel de notation), et passe au suivant dès qu'un dialogue se ferme. L'ordre des add-ons dans `main.js` ne décide jamais quel dialogue passe en premier.
- **Main menu** (`common/main_menu.js`). Les add-ons ajoutent avec `add()` leurs entrées du menu principal (libellé, action, position) au module renvoyé par `getMainMenu()`. Il les place juste après « Jouer » dans un ordre de positions fixe : l'ordre des add-ons dans `main.js` ne décide jamais où arrive une entrée.

Les conventions, vérifiées en relecture :
- **Langue.** Le code, les commentaires et les messages de journal sont en anglais.
- **Style.** Noms de fichiers en `snake_case.js`. Aucune variable globale : seulement les globales fournies par PinballY.
- **Commentaires.** Chaque fichier commence par un bloc d'en-tête qui décrit son rôle, quand il s'exécute et ses effets de bord. Ajoutez de courts commentaires `//` pour le *pourquoi* des choix non évidents. Pas de JSDoc.
- **Textes affichés.** Tout texte montré au joueur passe par `common/i18n.js` et doit exister dans les 6 langues.
- **Gestion d'erreurs.** Enveloppez chaque gestionnaire d'événement avec `safeHandler(SCRIPT_NAME, ...)` de `common/safe_handler.js`. Une erreur est alors journalisée avec le nom de l'add-on, et les autres add-ons continuent de fonctionner.
- **Réglages.**
  - Lisez les valeurs typées avec `optionSettings.getInt` / `getFloat` / `getBool`, car `get()` renvoie toujours une chaîne.
  - N'appelez pas `optionSettings.save()` : PinballY sauvegarde tout seul.
- **Dialogues.** Soumettez les dialogues spontanés (annonces, invites) au module wheel dialog, qui attend que la roue soit libre. Un menu ouvert par le joueur (comme la liste des succès) s'ouvre directement. Tout autre menu ouvert directement ne doit s'ouvrir que si `mainWindow.getUIMode().mode === "wheel"` ; sinon, attendez l'événement `wheelmode`.
- **Entrées du menu principal** : elles s'ajoutent via `getMainMenu().add(...)` avec une position de `MAIN_MENU_POSITION`.
- **Séparateurs de menu** : ils s'écrivent `{ cmd: -1 }`.

**Tests.** Depuis le dossier du projet, lancez `node --test` (Node.js 22 ou plus récent, rien à installer). Les tests font tourner les add-ons sur une imitation de PinballY en mémoire (`tests/fake_pinbally_host.js`), le jumeau de test de `common/pinbally_host.js`. `tests/persisted_data_pinning.test.js` fige les clés de réglages enregistrées et les ID des succès : s'il échoue, un changement ferait perdre leur progression aux joueurs.

La référence de script PinballY est dans l'aide de PinballY (`PinballY\Help\Javascript.html`, aussi [en ligne](https://mjrnet.org/pinscape/downloads/PinballY/Help/PinballY.html)). Les exemples officiels sont dans [PinballY-Addons-and-Examples](https://github.com/PinballY/PinballY-Addons-and-Examples).

Bugs et idées : [issues GitHub](https://github.com/F3L1X79/My-custom-PinballY-Addons-and-Plugins/issues).

## Licence

MIT. Voir [LICENSE](LICENSE).
