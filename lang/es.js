// ============================================================
// Spanish translations for PinballY's UI.
// Save this file as UTF-8 with BOM so accented characters display correctly.
// ============================================================

export default {
    // Direct translations of PinballY's native menu titles.
    nativeMenuLabels: {
        "About PinballY": "Acerca de PinballY",
        "Add Media": "Añadir contenido multimedia",
        "Add to Favorites": "Añadir a favoritos",
        "Adjust Audio Volume": "Ajustar volumen de audio",
        "All Games": "Todas las mesas",
        "All Tables": "Todas las mesas",
        "Batch Capture": "Captura por lotes",
        "Batch Capture lets you capture screen shot images and videos for multiple games.  Step 1: select which games to include in the capture process:": "La captura por lotes te permite capturar imágenes y vídeos de pantalla para varias mesas. Paso 1: selecciona las mesas que quieres incluir en el proceso de captura:",
        "Begin Capture": "Iniciar captura",
        "Cancel": "Cancelar",
        "Capture images & videos": "Capturar imágenes y vídeos",
        "Confirm Power Off": "Confirmar apagado",
        "Delete game details": "Eliminar detalles de la mesa",
        "Edit category names...": "Editar nombres de categorías...",
        "Edit game details...": "Editar detalles de la mesa...",
        "Enable Videos": "Activar vídeos",
        "Exit": "Salir",
        "Exit PinballY": "Salir de PinballY",
        "Favorites": "Favoritos",
        "Filter by Category": "Filtrar por categoría",
        "Filter by Date Added": "Filtrar por fecha de adición",
        "Filter by Era": "Filtrar por época",
        "Filter by Last Played": "Filtrar por última partida",
        "Filter by Manufacturer": "Filtrar por fabricante",
        "Filter by Rating": "Filtrar por valoración",
        "Filter by System": "Filtrar por sistema",
        "Find game media online": "Buscar archivos multimedia en línea",
        "Games marked for batch capture": "Mesas marcadas para captura por lotes",
        "Game Setup": "Configuración de la mesa",
        "Help": "Ayuda",
        "Hide this game": "Ocultar esta mesa",
        "High Scores": "Mejores puntuaciones",
        "In Favorites": "En favoritos",
        "Information": "Información",
        "Instruction Card": "Tarjeta de instrucciones",
        "Mark for Batch Capture": "Marcar para captura por lotes",
        "Marked for Batch Capture": "Marcada para captura por lotes",
        "Mute Attract Mode": "Silenciar el modo de atracción",
        "Mute Buttons": "Silenciar botones",
        "Mute Table Audio": "Silenciar el audio de la mesa",
        "Mute Videos": "Silenciar vídeos",
        "Operator Menu": "Menú del operador",
        "Options": "Opciones",
        "PinballY Options...": "Opciones...",
        "Play": "Jugar",
        "Play Game": "Iniciar partida",
        "Power Off": "Apagar el ordenador",
        "Proceed": "Continuar",
        "Rate Table": "Valorar la mesa",
        "Reset Coins/Credits": "Restablecer monedas/créditos",
        "Resume Game": "Reanudar partida",
        "Return": "Volver",
        "Save": "Guardar",
        "Search": "Buscar",
        "Select categories": "Seleccionar categorías",
        "Show Hidden Games": "Mostrar mesas ocultas",
        "Show Media Files": "Mostrar archivos multimedia",
        "Show Unconfigured Games": "Mostrar mesas no configuradas",
        "Skip this message next time": "No volver a mostrar este mensaje",
        "Terminate Game": "Finalizar partida",
        "The capture process records the exact same areas of the screen where your PinballY windows are located.  Before proceeding, make sure that your PinballY window layout matches the screen layout of the game you're about to record.  For example, if the game's playfield is full-screen, make sure PinballY's playfield window is full-screen.": "El proceso de captura registra exactamente las mismas áreas de la pantalla donde se encuentran las ventanas de PinballY. Antes de continuar, asegúrate de que la disposición de las ventanas de PinballY coincida con la distribución de la pantalla del juego que vas a grabar. Por ejemplo, si el campo de juego del juego está a pantalla completa, asegúrate de que la ventana del campo de juego de PinballY también esté a pantalla completa.",
        "This will launch a Web browser window to search for media files for this game.  Look for a \"HyperPin Media Pack\" file.  Download the file and drag it onto this window to install it.\n\nNote that you can drop a Media Pack file onto this window at any time to install media for the currently selected game.  This menu step isn't required to install media; it's just a convenience for launching a Web search.": "Esto abrirá una ventana del navegador web para buscar archivos multimedia para esta mesa. Busca un archivo \"HyperPin Media Pack\". Descarga el archivo y arrástralo hasta esta ventana para instalarlo.\n\nTen en cuenta que puedes arrastrar un archivo Media Pack a esta ventana en cualquier momento para instalar contenido multimedia para la mesa seleccionada actualmente. Este paso del menú no es necesario para instalar contenido multimedia; simplemente facilita el inicio de una búsqueda web.",
        "Uncategorized": "Sin categoría",
        "Yes, add to current game": "Sí, añadir a la mesa actual",
        "You must enter the game's bibliographic information (title, system, etc.) before adding media files for the game.  The game information is used to determine the folder locations and file names for the game's media files, so it has to be entered before media files can be added to the game.": "Debes introducir la información bibliográfica de la mesa (título, sistema, etc.) antes de añadir archivos multimedia para la mesa. Esta información se utiliza para determinar las ubicaciones de las carpetas y los nombres de archivo de los elementos multimedia de la mesa, por lo que debe introducirse antes de poder añadir archivos multimedia.",
    },

    // Labels for the media-capture screen's "Item: Action" lines
    // (e.g. "Playfield Image: Skip"), combined via dynamicLabelBuilders.captureItemAction.
    mediaCaptureItemLabels: {
        "Backglass Image": "Imagen del backglass",
        "Backglass Video": "Vídeo del backglass",
        "Flyer Image": "Imagen del cartel",
        "Instruction Card": "Tarjeta de instrucciones",
        "Playfield Image": "Imagen del campo de juego",
        "Playfield Video": "Vídeo del campo de juego",
        "Table Audio": "Audio de la mesa",
        "Wheel Image": "Imagen de la rueda",
    },
    mediaCaptureActionLabels: {
        "Add": "Añadir",
        "Capture": "Capturar",
        "Capture Silent": "Capturar sin sonido",
        "Capture w/Audio": "Capturar con audio",
        "Keep Existing": "Conservar el existente",
        "Replace Existing": "Reemplazar el existente",
        "Skip": "Omitir",
    },

    // Status text shown in PinballY's launch overlay, keyed by the
    // language-independent event id (see the "launchoverlaymessage" event).
    launchOverlayMessages: {
        "after": "",
        "capturing": "Capturando...",
        "gameover": "Game Over",
        "init": "",
        "launching": "Cargando...",
        "running": "Iniciando la mesa...",
        "terminating": "Volviendo a la lista de juegos...",
    },

    // Functions that build translated titles for PinballY's dynamically
    // generated menu text (category names, star ratings, etc.).
    dynamicLabelBuilders: {
        captureInstructions: (seconds) => {
            const plural = seconds === "1" ? "" : "s";
            return `Selecciona los elementos que quieras capturar y, a continuación, haz clic en Iniciar captura. Esto iniciará el juego, capturará las imágenes de la pantalla y cerrará automáticamente el juego al finalizar. El proceso tardará aproximadamente ${seconds} segundo${plural}. (!) significa que se reemplazará un elemento existente.`;
        },
        captureInstructionsOneMinute: () =>
            "Selecciona los elementos que quieras capturar y, a continuación, haz clic en Iniciar captura. Esto iniciará el juego, capturará las imágenes de la pantalla y cerrará automáticamente el juego al finalizar. El proceso tardará aproximadamente 1 minuto. (!) significa que se reemplazará un elemento existente.",
        captureItemAction: (item, action) => `${item}: ${action}`,
        decadeTables: (decade) => `Mesas de los años ${decade}`,
        genericTables: (name) => `Mesas ${name}`,
        mediaGameMismatchWarning: (draggedGame, currentGame) =>
            `Parece que algunos de los archivos multimedia que estás añadiendo podrían estar destinados a otra mesa, "${draggedGame}". Los archivos multimedia siempre se añaden a la mesa seleccionada en la rueda, actualmente "${currentGame}". ¿Deseas añadir estos elementos multimedia a la mesa actual?`,
        mediaGameMismatchWarningMultiple: (gameList, currentGame) =>
            `Parece que algunos de los archivos multimedia que estás añadiendo podrían estar destinados a otras mesas: ${gameList}. Los archivos multimedia siempre se añaden a la mesa seleccionada en la rueda, actualmente "${currentGame}". ¿Deseas añadir estos elementos multimedia a la mesa actual?`,
        mediaReadyToAdd: (gameName) =>
            `Los siguientes elementos multimedia están listos para añadirse a ${gameName}. Selecciona los elementos que deseas añadir o reemplazar.`,
        starTables: (count) => `Mesas con ${count} estrella${count > 1 ? "s" : ""}`,
        startDelay: (seconds) => `Ajustar el retraso de inicio (${seconds} s)`,
        unratedTables: () => "Mesas sin valorar",
    },

    ratingPrompt: {
        message: (tableTitle, minutes) =>
            `¡Has jugado a "${tableTitle}" durante más de ${minutes} minutos! ¿Quieres valorarla ahora?`,
        rateNow: "Valorar ahora",
        notNow: "Más tarde",
    },

    startupPrompt: {
        introWithPicks: (dayTitle, weekTitle) => {
            const lines = ["¿Cómo quieres empezar?"];
            if (dayTitle) lines.push(`Mesa del día: ${dayTitle}`);
            if (weekTitle) lines.push(`Mesa de la semana: ${weekTitle}`);
            return lines.join("\n");
        },
        stayOnLastPlayed: "Quedarme en la última mesa jugada",
        tableOfTheDay: "Iniciar la mesa del día",
        tableOfTheWeek: "Iniciar la mesa de la semana",
        randomTable: "Iniciar una mesa al azar",
    },

    // Lower status line text for the currently selected table.
    // [Filter.Count], [Game.Year], etc. are PinballY placeholders — keep them as-is.
    tableInfoStatusLines: {
        manufacturer: (position) => `Mesa ${position}/[Filter.Count] - fabricada por [Game.Manuf].`,
        manufacturerFictional: (position) => `Mesa ${position}/[Filter.Count] - Flíper ficticio.`,
        playCount: (position) => `Mesa ${position}/[Filter.Count] - iniciada [Game.PlayCount] veces.`,
        playTime: (position) => `Mesa ${position}/[Filter.Count] - jugada durante [Game.PlayTime].`,
        year: (position) => `Mesa ${position}/[Filter.Count] - publicada en [Game.Year].`,
    },

    // Labels for menu items this project adds itself (see custom_menu_commands.js).
    customMenuLabels: {
        originalTablesFilter: "Mesas originales",
        randomGame: "Iniciar una mesa al azar",
        tableOfTheDay: "Iniciar la mesa del día",
        tableOfTheWeek: "Iniciar la mesa de la semana",
        tableSetup: "Configuración de la mesa",
    },

    achievements: {
        dailyStreakTitle: (days) => `¡${days} días seguidos!`,
        dailyStreakDescription: (days) => `¡Has iniciado la mesa del día ${days} días seguidos!`,
        weeklyStreakTitle: (weeks) => `¡${weeks} semanas seguidas!`,
        weeklyStreakDescription: (weeks) => `¡Has iniciado la mesa de la semana ${weeks} semanas seguidas!`,
        manufacturerCompletionTitle: (manufacturer) => `Colección completa: ${manufacturer}`,
        manufacturerCompletionDescription: (manufacturer, count) =>
            `¡Has jugado las ${count} mesas de ${manufacturer} al menos una vez!`,
        firstTableTitle: () => "Primeros pasos",
        firstTableDescription: () => "¡Has jugado tu primera mesa!",
        collectionPercentTitle: (percent) => `${percent} % de la colección`,
        collectionPercentDescription: (percent, playedCount, totalCount) =>
            `¡Has jugado ${playedCount} de ${totalCount} mesas (${percent} % de tu colección)!`,
        playTimeMilestoneTitle: (hours) => `${hours} h de juego en total`,
        playTimeMilestoneDescription: (hours) =>
            `¡Has acumulado más de ${hours} hora${hours > 1 ? "s" : ""} de juego en total!`,
        decadeCompletionTitle: (decadeStartYear) => `Década completa: años ${decadeStartYear}`,
        decadeCompletionDescription: (decadeStartYear, count) =>
            `¡Has jugado las ${count} mesas de los años ${decadeStartYear} al menos una vez!`,
        categoryCompletionTitle: (category) => `Categoría completa: ${category}`,
        categoryCompletionDescription: (category, count) =>
            `¡Has jugado las ${count} mesas de "${category}" al menos una vez!`,
        marathonTitle: (minutes) => `¡Maratón de ${minutes} minutos!`,
        marathonDescription: (minutes) => `¡Has jugado una sola sesión de más de ${minutes} minutos!`,
        rageQuitTitle: () => "¿Abandono por rabia?",
        rageQuitDescription: (seconds) => `Has salido de una mesa en menos de ${seconds} segundos...`,
        grandReturnTitle: () => "El gran regreso",
        grandReturnDescription: (days) => `¡Has vuelto a jugar una mesa tras más de ${days} días sin tocarla!`,
        unlockedIntro: (title, description) => `[Logro desbloqueado]\n\n${title}\n${description}`,
        acknowledge: "¡Genial!",
    },
};