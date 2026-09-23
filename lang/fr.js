// ============================================================
// French translations for PinballY's UI.
// Save this file as UTF-8 with BOM so accented characters display correctly.
// ============================================================

export default {
    // Direct translations of PinballY's native menu titles.
    nativeMenuLabels: {
        "About PinballY": "À propos",
        "Add Media": "Ajouter des médias",
        "Add to Favorites": "Ajouter aux favoris",
        "Adjust Audio Volume": "Régler le volume audio",
        "All Games": "Toutes les tables",
        "All Tables": "Toutes les tables",
        "Batch Capture": "Capture par lot",
        "Batch Capture lets you capture screen shot images and videos for multiple games.  Step 1: select which games to include in the capture process:": "La capture par lot vous permet de capturer des captures d'écran et des vidéos pour plusieurs tables. Étape 1 : sélectionnez les tables à inclure dans le processus de capture :",
        "Begin Capture": "Démarrer la capture",
        "Cancel": "Annuler",
        "Capture images & videos": "Capturer images et vidéos",
        "Confirm Power Off": "Confirmer l'arrêt",
        "Delete game details": "Supprimer les détails de la table",
        "Edit category names...": "Modifier les noms de catégories...",
        "Edit game details...": "Modifier les détails de la table...",
        "Enable Videos": "Activer les vidéos",
        "Exit": "Quitter",
        "Exit PinballY": "Quitter",
        "Favorites": "Favoris",
        "Filter by Category": "Filtrer par catégorie",
        "Filter by Date Added": "Filtrer par date d'ajout",
        "Filter by Era": "Filtrer par époque",
        "Filter by Last Played": "Filtrer par dernière partie",
        "Filter by Manufacturer": "Filtrer par fabricant",
        "Filter by Rating": "Filtrer par note",
        "Filter by System": "Filtrer par système",
        "Find game media online": "Rechercher les médias en ligne",
        "Game Setup": "Configuration de la table",
        "Games marked for batch capture": "Tables marquées pour la capture par lot",
        "Help": "Aide",
        "Hide this game": "Masquer cette table",
        "High Scores": "Meilleurs scores",
        "In Favorites": "Dans les favoris",
        "Information": "Informations",
        "Instruction Card": "Carte d'instructions",
        "Mark for Batch Capture": "Marquer pour capture par lot",
        "Marked for Batch Capture": "Marquée pour capture par lot",
        "Mute Attract Mode": "Couper le son du mode attraction",
        "Mute Buttons": "Couper le son des boutons",
        "Mute Table Audio": "Couper l'audio de la table",
        "Mute Videos": "Couper le son des vidéos",
        "Operator Menu": "Menu opérateur",
        "Options": "Options",
        "PinballY Options...": "Options...",
        "Play": "Jouer",
        "Play Game": "Lancer la partie",
        "Power Off": "Éteindre l'ordinateur",
        "Proceed": "Continuer",
        "Rate Table": "Noter la table",
        "Reset Coins/Credits": "Réinitialiser pièces/crédits",
        "Resume Game": "Reprendre la partie",
        "Return": "Retour",
        "Save": "Enregistrer",
        "Search": "Rechercher",
        "Select categories": "Sélectionner les catégories",
        "Show Hidden Games": "Afficher les tables masquées",
        "Show Media Files": "Afficher les fichiers médias",
        "Show Unconfigured Games": "Afficher les tables non configurées",
        "Skip this message next time": "Ne plus afficher ce message",
        "Terminate Game": "Arrêter la partie",
        "The capture process records the exact same areas of the screen where your PinballY windows are located.  Before proceeding, make sure that your PinballY window layout matches the screen layout of the game you're about to record.  For example, if the game's playfield is full-screen, make sure PinballY's playfield window is full-screen.": "Le processus de capture enregistre exactement les mêmes zones de l'écran où sont situées vos fenêtres PinballY. Avant de continuer, assurez-vous que la disposition de vos fenêtres PinballY correspond à celle du jeu que vous allez enregistrer. Par exemple, si le plateau du jeu est en plein écran, assurez-vous que la fenêtre de plateau de PinballY l'est aussi.",
        "This will launch a Web browser window to search for media files for this game.  Look for a \"HyperPin Media Pack\" file.  Download the file and drag it onto this window to install it.\n\nNote that you can drop a Media Pack file onto this window at any time to install media for the currently selected game.  This menu step isn't required to install media; it's just a convenience for launching a Web search.": "Ceci va ouvrir une fenêtre de navigateur Web pour rechercher des fichiers médias pour cette table. Cherchez un fichier \"HyperPin Media Pack\". Téléchargez le fichier et déposez-le sur cette fenêtre pour l'installer.\n\nNotez que vous pouvez déposer un fichier Media Pack sur cette fenêtre à tout moment pour installer des médias pour la table actuellement sélectionnée. Cette étape du menu n'est pas obligatoire pour installer des médias ; c'est juste un raccourci pour lancer une recherche Web.",
        "Uncategorized": "Non catégorisées",
        "Yes, add to current game": "Oui, ajouter à la table actuelle",
        "You must enter the game's bibliographic information (title, system, etc.) before adding media files for the game.  The game information is used to determine the folder locations and file names for the game's media files, so it has to be entered before media files can be added to the game.": "Vous devez saisir les informations bibliographiques de la table (titre, système, etc.) avant d'ajouter des fichiers médias pour cette table. Ces informations sont utilisées pour déterminer les emplacements des dossiers et les noms de fichiers des médias de la table ; elles doivent donc être renseignées avant de pouvoir ajouter des fichiers médias.",
    },

    // Labels for the media-capture screen's "Item: Action" lines
    // (e.g. "Playfield Image: Skip"), combined via dynamicLabelBuilders.captureItemAction.
    mediaCaptureItemLabels: {
        "Backglass Image": "Image du backglass",
        "Backglass Video": "Vidéo du backglass",
        "Flyer Image": "Image de l'affiche",
        "Instruction Card": "Carte d'instructions",
        "Playfield Image": "Image du plateau",
        "Playfield Video": "Vidéo du plateau",
        "Table Audio": "Audio de la table",
        "Wheel Image": "Image de la roue",
    },
    mediaCaptureActionLabels: {
        "Add": "Ajouter",
        "Capture": "Capturer",
        "Capture Silent": "Capturer sans son",
        "Capture w/Audio": "Capturer avec audio",
        "Keep Existing": "Conserver l'existant",
        "Replace Existing": "Remplacer l'existant",
        "Skip": "Ignorer",
    },

    // Status text shown in PinballY's launch overlay, keyed by the
    // language-independent event id (see the "launchoverlaymessage" event).
    launchOverlayMessages: {
        "after": "",
        "capturing": "Capture en cours...",
        "gameover": "Game Over",
        "init": "",
        "launching": "Chargement en cours...",
        "running": "Lancement de la table...",
        "terminating": "Retour à la liste des jeux...",
    },

    // Functions that build translated titles for PinballY's dynamically
    // generated menu text (category names, star ratings, etc.).
    dynamicLabelBuilders: {
        /**
         * Builds the media-capture instructions for a duration given in seconds.
         * @param {string} seconds - Capture duration, as captured from PinballY's English text.
         * @returns {string} Translated instructions.
         */
        captureInstructions: (seconds) => {
            const plural = seconds === "1" ? "" : "s";
            return `Sélectionnez les éléments à capturer, puis cliquez sur Démarrer la capture. Cela va lancer votre jeu, capturer les images de l'écran, et quitter automatiquement le jeu une fois terminé. Le processus prendra environ ${seconds} seconde${plural}. (!) signifie qu'un élément existant sera remplacé.`;
        },
        captureInstructionsOneMinute: () =>
            "Sélectionnez les éléments à capturer, puis cliquez sur Démarrer la capture. Cela va lancer votre jeu, capturer les images de l'écran, et quitter automatiquement le jeu une fois terminé. Le processus prendra environ 1 minute. (!) signifie qu'un élément existant sera remplacé.",
        captureItemAction: (item, action) => `${item} : ${action}`,
        decadeTables: (decade) => `Tables années ${decade}`,
        genericTables: (name) => `Tables ${name}`,
        mediaGameMismatchWarning: (draggedGame, currentGame) =>
            `Il semblerait que certains fichiers médias que vous ajoutez soient destinés à une autre table, "${draggedGame}". Les fichiers médias sont toujours ajoutés à la table sélectionnée sur la roue, actuellement "${currentGame}". Voulez-vous ajouter ces éléments à la table actuelle ?`,
        mediaGameMismatchWarningMultiple: (gameList, currentGame) =>
            `Il semblerait que certains fichiers médias que vous ajoutez soient destinés à d'autres tables : ${gameList}. Les fichiers médias sont toujours ajoutés à la table sélectionnée sur la roue, actuellement "${currentGame}". Voulez-vous ajouter ces éléments à la table actuelle ?`,
        mediaReadyToAdd: (gameName) =>
            `Les éléments médias suivants sont prêts à être ajoutés pour ${gameName}. Choisissez les éléments que vous souhaitez ajouter ou remplacer.`,
        starTables: (count) => `Tables ${count} étoile${count > 1 ? "s" : ""}`,
        startDelay: (seconds) => `Ajuster le délai de démarrage (${seconds} sec)`,
        unratedTables: () => "Tables non notées",
    },

    ratingPrompt: {
        message: (tableTitle, minutes) =>
            `Eh beh mon chocho ! T'as totalisé plus de ${minutes} minutes de jeu sur la table "${tableTitle}" ! Est-ce que ce serait pas le moment de lui mettre une petite note ?`,
        rateNow: "Allez, go !",
        notNow: "Nan, flemme...",
    },

    startupPrompt: {
        /**
         * Builds the startup prompt text, listing today's and this week's picks when known.
         * @param {string | null} dayTitle - Title of the table of the day, or null if none.
         * @param {string | null} weekTitle - Title of the table of the week, or null if none.
         * @returns {string} Multi-line prompt text.
         */
        introWithPicks: (dayTitle, weekTitle) => {
            const lines = ["Salut à toi, jeune chochodin des bois !"];
            lines.push('');
            lines.push(`Choisis une option parmi celles-ci pour pouvoir démarrer ton pèlerinage de Geek :`);
            lines.push('');
            if (dayTitle) lines.push(`Table du jour : ${dayTitle}`);
            lines.push('-');
            if (weekTitle) lines.push(`Table de la semaine : ${weekTitle}`);
            return lines.join("\n");
        },
        stayOnLastPlayed: "Rester sur la dernière table jouée",
        tableOfTheDay: "Lancer la table du jour",
        tableOfTheWeek: "Lancer la table de la semaine",
        randomTable: "Lancer une table au pif !",
    },

    // Lower status line text for the currently selected table.
    // [Filter.Count], [Game.Year], etc. are PinballY placeholders — keep them as-is.
    tableInfoStatusLines: {
        manufacturer: (position) => `Table ${position}/[Filter.Count] - fabriqué par [Game.Manuf].`,
        manufacturerFictional: (position) => `Table ${position}/[Filter.Count] - Flipper fictif.`,
        playCount: (position) => `Table ${position}/[Filter.Count] - lancé [Game.PlayCount] fois.`,
        playTime: (position) => `Table ${position}/[Filter.Count] - joué pendant [Game.PlayTime].`,
        year: (position) => `Table ${position}/[Filter.Count] - sorti en [Game.Year].`,
    },

    // Labels for menu items this project adds itself (see custom_menu_commands.js).
    customMenuLabels: {
        originalTablesFilter: "Tables Originales",
        randomGame: "Lancer une table au hasard",
        tableOfTheDay: "Lancer la table du jour",
        tableOfTheWeek: "Lancer la table de la semaine",
        tableSetup: "Configuration de la table",
    },

    achievements: {
        dailyStreakTitle: (days) => `${days} jours d'affilée !`,
        dailyStreakDescription: (days) => `Vous avez lancé la table du jour ${days} jours consécutifs !`,
        weeklyStreakTitle: (weeks) => `${weeks} semaines d'affilée !`,
        weeklyStreakDescription: (weeks) => `Vous avez lancé la table de la semaine ${weeks} semaines consécutives !`,
        decadeCompletionTitle: (decadeStartYear) => `Décennie complète : années ${decadeStartYear}`,
        manufacturerCompletionTitle: (manufacturer) => `Collection complète : ${manufacturer}`,
        manufacturerCompletionDescription: (manufacturer, count) =>
            `Vous avez joué aux ${count} tables ${manufacturer} au moins une fois !`,
        firstTableTitle: () => "Premiers pas",
        firstTableDescription: () => "Vous avez joué votre toute première table !",
        collectionPercentTitle: (percent) => `${percent}% de la collection`,
        collectionPercentDescription: (percent, playedCount, totalCount) =>
            `Vous avez joué à ${playedCount} tables sur ${totalCount} (${percent}% de votre collection) !`,
        playTimeMilestoneTitle: (hours) => `${hours}h de jeu cumulées`,
        playTimeMilestoneDescription: (hours) =>
            `Vous avez cumulé plus de ${hours} heure${hours > 1 ? "s" : ""} de jeu au total !`,
        decadeCompletionDescription: (decadeStartYear, count) =>
            `Vous avez joué aux ${count} tables des années ${decadeStartYear} au moins une fois !`,
        categoryCompletionTitle: (category) => `Catégorie complète : ${category}`,
        categoryCompletionDescription: (category, count) => `Vous avez joué aux ${count} tables "${category}" au moins une fois !`,
        marathonTitle: (minutes) => `Marathon de ${minutes} min !`,
        marathonDescription: (minutes) => `Vous avez joué une session de plus de ${minutes} minutes d'affilée !`,
        rageQuitTitle: () => "Rage quit ?",
        rageQuitDescription: (seconds) => `Vous avez quitté une table en moins de ${seconds} secondes...`,
        grandReturnTitle: () => "Le grand retour",
        grandReturnDescription: (days) => `Vous avez rejoué une table après plus de ${days} jours d'absence !`,
        unlockedIntro: (title, description) => `[Succès débloqué]\n\n${title}\n${description}`,
        acknowledge: "Merci mon coco !",
    },
};