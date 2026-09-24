// ============================================================
// Italian translations for PinballY's UI.
// Save this file as UTF-8 with BOM so accented characters display correctly.
// ============================================================

export default {
    // Direct translations of PinballY's native menu titles.
    nativeMenuLabels: {
        "About PinballY": "Informazioni su PinballY",
        "Add Media": "Aggiungi contenuti multimediali",
        "Add to Favorites": "Aggiungi ai preferiti",
        "Adjust Audio Volume": "Regola volume audio",
        "All Games": "Tutti i tavoli",
        "All Tables": "Tutti i tavoli",
        "Batch Capture": "Acquisizione in batch",
        "Batch Capture lets you capture screen shot images and videos for multiple games.  Step 1: select which games to include in the capture process:": "L'acquisizione in batch ti permette di acquisire screenshot e video per più tavoli. Passaggio 1: seleziona i tavoli da includere nel processo di acquisizione:",
        "Begin Capture": "Avvia acquisizione",
        "Cancel": "Annulla",
        "Capture images & videos": "Acquisisci immagini e video",
        "Confirm Power Off": "Conferma spegnimento",
        "Delete game details": "Elimina dettagli del tavolo",
        "Edit category names...": "Modifica nomi categorie...",
        "Edit game details...": "Modifica dettagli del tavolo...",
        "Enable Videos": "Abilita video",
        "Exit": "Esci",
        "Exit PinballY": "Esci da PinballY",
        "Favorites": "Preferiti",
        "Filter by Category": "Filtra per categoria",
        "Filter by Date Added": "Filtra per data di aggiunta",
        "Filter by Era": "Filtra per epoca",
        "Filter by Last Played": "Filtra per ultima partita",
        "Filter by Manufacturer": "Filtra per produttore",
        "Filter by Rating": "Filtra per valutazione",
        "Filter by System": "Filtra per sistema",
        "Find game media online": "Cerca contenuti multimediali online",
        "Games marked for batch capture": "Tavoli contrassegnati per l'acquisizione in batch",
        "Game Setup": "Configurazione del tavolo",
        "Help": "Aiuto",
        "Hide this game": "Nascondi questo tavolo",
        "High Scores": "Punteggi migliori",
        "In Favorites": "Nei preferiti",
        "Information": "Informazioni",
        "Instruction Card": "Scheda istruzioni",
        "Mark for Batch Capture": "Segna per acquisizione in batch",
        "Marked for Batch Capture": "Segnato per acquisizione in batch",
        "Mute Attract Mode": "Disattiva audio della modalità attrazione",
        "Mute Buttons": "Disattiva audio dei pulsanti",
        "Mute Table Audio": "Disattiva audio del tavolo",
        "Mute Videos": "Disattiva audio dei video",
        "Operator Menu": "Menu operatore",
        "Options": "Opzioni",
        "PinballY Options...": "Opzioni...",
        "Play": "Gioca",
        "Play Game": "Avvia partita",
        "Power Off": "Spegni il computer",
        "Proceed": "Continua",
        "Rate Table": "Valuta il tavolo",
        "Reset Coins/Credits": "Reimposta monete/crediti",
        "Resume Game": "Riprendi partita",
        "Return": "Indietro",
        "Save": "Salva",
        "Search": "Cerca",
        "Select categories": "Seleziona categorie",
        "Show Hidden Games": "Mostra tavoli nascosti",
        "Show Media Files": "Mostra file multimediali",
        "Show Unconfigured Games": "Mostra tavoli non configurati",
        "Skip this message next time": "Non mostrare più questo messaggio",
        "Terminate Game": "Termina partita",
        "The capture process records the exact same areas of the screen where your PinballY windows are located.  Before proceeding, make sure that your PinballY window layout matches the screen layout of the game you're about to record.  For example, if the game's playfield is full-screen, make sure PinballY's playfield window is full-screen.": "Il processo di acquisizione registra esattamente le stesse aree dello schermo in cui si trovano le finestre di PinballY. Prima di procedere, assicurati che la disposizione delle finestre di PinballY corrisponda a quella dello schermo del gioco che stai per registrare. Ad esempio, se il piano di gioco del gioco è a schermo intero, assicurati che anche la finestra del piano di gioco di PinballY sia a schermo intero.",
        "This will launch a Web browser window to search for media files for this game.  Look for a \"HyperPin Media Pack\" file.  Download the file and drag it onto this window to install it.\n\nNote that you can drop a Media Pack file onto this window at any time to install media for the currently selected game.  This menu step isn't required to install media; it's just a convenience for launching a Web search.": "Verrà aperta una finestra del browser Web per cercare file multimediali per questo tavolo. Cerca un file \"HyperPin Media Pack\". Scarica il file e trascinalo su questa finestra per installarlo.\n\nNota che puoi trascinare un file Media Pack su questa finestra in qualsiasi momento per installare i contenuti multimediali per il tavolo attualmente selezionato. Questo passaggio del menu non è necessario per installare i contenuti multimediali; serve solo come comoda scorciatoia per avviare una ricerca sul Web.",
        "Uncategorized": "Non categorizzati",
        "Yes, add to current game": "Sì, aggiungi al tavolo attuale",
        "You must enter the game's bibliographic information (title, system, etc.) before adding media files for the game.  The game information is used to determine the folder locations and file names for the game's media files, so it has to be entered before media files can be added to the game.": "Devi inserire le informazioni bibliografiche del tavolo (titolo, sistema, ecc.) prima di aggiungere file multimediali per il tavolo. Queste informazioni vengono utilizzate per determinare i percorsi delle cartelle e i nomi dei file per i contenuti multimediali del tavolo, quindi devono essere inserite prima di poter aggiungere file multimediali.",
    },

    // Labels for the media-capture screen's "Item: Action" lines
    // (e.g. "Playfield Image: Skip"), combined via dynamicLabelBuilders.captureItemAction.
    mediaCaptureItemLabels: {
        "Backglass Image": "Immagine del backglass",
        "Backglass Video": "Video del backglass",
        "Flyer Image": "Immagine del volantino",
        "Instruction Card": "Scheda istruzioni",
        "Playfield Image": "Immagine del piano di gioco",
        "Playfield Video": "Video del piano di gioco",
        "Table Audio": "Audio del tavolo",
        "Wheel Image": "Immagine della wheel",
    },
    mediaCaptureActionLabels: {
        "Add": "Aggiungi",
        "Capture": "Acquisisci",
        "Capture Silent": "Acquisisci senza audio",
        "Capture w/Audio": "Acquisisci con audio",
        "Keep Existing": "Mantieni quello esistente",
        "Replace Existing": "Sostituisci quello esistente",
        "Skip": "Ignora",
    },

    // Status text shown in PinballY's launch overlay, keyed by the
    // language-independent event id (see the "launchoverlaymessage" event).
    launchOverlayMessages: {
        "after": "",
        "capturing": "Acquisizione in corso...",
        "gameover": "Game Over",
        "init": "",
        "launching": "Caricamento in corso...",
        "running": "Avvio del tavolo...",
        "terminating": "Ritorno all'elenco dei giochi...",
    },

    // Functions that build translated titles for PinballY's dynamically
    // generated menu text (category names, star ratings, etc.).
    dynamicLabelBuilders: {
        captureInstructions: (seconds) => {
            const plural = seconds === "1" ? "" : "i";
            return `Seleziona gli elementi da acquisire, quindi fai clic su Avvia acquisizione. Questo avvierà il gioco, acquisirà le immagini dello schermo e chiuderà automaticamente il gioco al termine. Il processo richiederà circa ${seconds} second${plural}. (!) indica che un elemento esistente verrà sostituito.`;
        },
        captureInstructionsOneMinute: () =>
            "Seleziona gli elementi da acquisire, quindi fai clic su Avvia acquisizione. Questo avvierà il gioco, acquisirà le immagini dello schermo e chiuderà automaticamente il gioco al termine. Il processo richiederà circa 1 minuto. (!) indica che un elemento esistente verrà sostituito.",
        captureItemAction: (item, action) => `${item}: ${action}`,
        decadeTables: (decade) => `Tavoli degli anni ${decade}`,
        genericTables: (name) => `Tavoli ${name}`,
        mediaGameMismatchWarning: (draggedGame, currentGame) =>
            `Sembra che alcuni dei file multimediali che stai aggiungendo possano essere destinati a un tavolo diverso, "${draggedGame}". I file multimediali vengono sempre aggiunti al tavolo selezionato sulla wheel, attualmente "${currentGame}". Vuoi aggiungere questi elementi multimediali al tavolo attuale?`,
        mediaGameMismatchWarningMultiple: (gameList, currentGame) =>
            `Sembra che alcuni dei file multimediali che stai aggiungendo possano essere destinati ad altri tavoli: ${gameList}. I file multimediali vengono sempre aggiunti al tavolo selezionato sulla wheel, attualmente "${currentGame}". Vuoi aggiungere questi elementi multimediali al tavolo attuale?`,
        mediaReadyToAdd: (gameName) =>
            `I seguenti elementi multimediali sono pronti per essere aggiunti a ${gameName}. Seleziona gli elementi che desideri aggiungere o sostituire.`,
        starTables: (count) => `Tavoli con ${count} stella${count > 1 ? "e" : ""}`,
        startDelay: (seconds) => `Regola ritardo di avvio (${seconds} sec)`,
        unratedTables: () => "Tavoli non valutati",
    },

    ratingPrompt: {
        message: (tableTitle, minutes) =>
            `Hai giocato a "${tableTitle}" per più di ${minutes} minuti! Vuoi valutarlo ora?`,
        rateNow: "Valuta ora",
        notNow: "Più tardi",
    },

    startupPrompt: {
        introWithPicks: (dayTitle, weekTitle) => {
            const lines = ["Come vuoi iniziare?"];
            if (dayTitle) lines.push(`Tavolo del giorno: ${dayTitle}`);
            if (weekTitle) lines.push(`Tavolo della settimana: ${weekTitle}`);
            return lines.join("\n");
        },
        stayOnLastPlayed: "Resta sull'ultimo tavolo giocato",
        tableOfTheDay: "Avvia il tavolo del giorno",
        tableOfTheWeek: "Avvia il tavolo della settimana",
        randomTable: "Avvia un tavolo casuale",
    },
    // Lower status line text for the currently selected table.
    // [Filter.Count], [Game.Year], etc. are PinballY placeholders — keep them as-is.
    tableInfoStatusLines: {
        manufacturer: (position) => `Tavolo ${position}/[Filter.Count] - prodotto da [Game.Manuf].`,
        manufacturerFictional: (position) => `Tavolo ${position}/[Filter.Count] - Flipper fittizio.`,
        playCount: (position) => `Tavolo ${position}/[Filter.Count] - avviato [Game.PlayCount] volte.`,
        playTime: (position) => `Tavolo ${position}/[Filter.Count] - giocato per [Game.PlayTime].`,
        year: (position) => `Tavolo ${position}/[Filter.Count] - pubblicato nel [Game.Year].`,
    },

    // Labels for menu items this project adds itself (see custom_menu_commands.js).
    customMenuLabels: {
        originalTablesFilter: "Tavoli originali",
        randomGame: "Avvia un tavolo casuale",
        tableOfTheDay: "Avvia il tavolo del giorno",
        tableOfTheWeek: "Avvia il tavolo della settimana",
        tableSetup: "Configurazione del tavolo",
    },

    achievements: {
        dailyStreakTitle: (days) => `${days} giorni di fila!`,
        dailyStreakDescription: (days) => `Hai avviato il tavolo del giorno per ${days} giorni di fila!`,
        weeklyStreakTitle: (weeks) => `${weeks} settimane di fila!`,
        weeklyStreakDescription: (weeks) => `Hai avviato il tavolo della settimana per ${weeks} settimane di fila!`,
        manufacturerCompletionTitle: (manufacturer) => `Collezione completa: ${manufacturer}`,
        manufacturerCompletionDescription: (manufacturer, count) =>
            `Hai giocato tutti i ${count} tavoli ${manufacturer} almeno una volta!`,
        firstTableTitle: () => "Primi passi",
        firstTableDescription: () => "Hai giocato il tuo primissimo tavolo!",
        collectionPercentTitle: (percent) => `${percent}% della collezione`,
        collectionPercentDescription: (percent, playedCount, totalCount) =>
            `Hai giocato ${playedCount} tavoli su ${totalCount} (${percent}% della tua collezione)!`,
        playTimeMilestoneTitle: (hours) => `${hours} h di gioco totali`,
        playTimeMilestoneDescription: (hours) =>
            `Hai accumulato più di ${hours} or${hours > 1 ? "e" : "a"} di gioco in totale!`,
        decadeCompletionTitle: (decadeStartYear) => `Decennio completo: anni ${decadeStartYear}`,
        decadeCompletionDescription: (decadeStartYear, count) =>
            `Hai giocato tutti i ${count} tavoli degli anni ${decadeStartYear} almeno una volta!`,
        categoryCompletionTitle: (category) => `Categoria completa: ${category}`,
        categoryCompletionDescription: (category, count) =>
            `Hai giocato tutti i ${count} tavoli "${category}" almeno una volta!`,
        marathonTitle: (minutes) => `Maratona di ${minutes} minuti!`,
        marathonDescription: (minutes) => `Hai giocato una singola sessione di oltre ${minutes} minuti!`,
        rageQuitTitle: () => "Abbandono per rabbia?",
        rageQuitDescription: (seconds) => `Hai lasciato un tavolo in meno di ${seconds} secondi...`,
        grandReturnTitle: () => "Il grande ritorno",
        grandReturnDescription: (days) => `Hai rigiocato un tavolo dopo oltre ${days} giorni di assenza!`,
        unlockedIntro: (title, description) => `[Obiettivo sbloccato]\n\n${title}\n${description}`,
        acknowledge: "Fantastico!",
    },

    achievementList: {
        menuEntry: "Elenco degli obiettivi",
        totalLine: (unlockedCount, totalCount) => `Totale: ${unlockedCount}/${totalCount}`,
        familyLine: (family, unlockedCount, totalCount) => `${family} (${unlockedCount}/${totalCount})`,
        back: "Indietro",
        families: {
            collection: "Collezione",
            playTime: "Tempo di gioco",
            streaks: "Serie",
            sessions: "Sessioni",
            manufacturers: "Produttori",
            decades: "Decenni",
            categories: "Categorie",
        },
    },
};