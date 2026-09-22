# PinballY Scripts

Collection de scripts JavaScript pour personnaliser PinballY : traduction de l'interface, informations dans la ligne d'état, rotation aléatoire au démarrage, commande de lancement d'une table aléatoire, gestion du backglass, transition de lancement et son de lancement.

## Prérequis

### PinballY

Le package cible **PinballY 1.1.0 Beta 10 ou une version ultérieure**.

Le site officiel de PinballY indique que la version 1.1.0 Beta 10, publiée le 3 novembre 2024, est la dernière version publiée sur la page du projet au moment de la préparation de ce package. PinballY dispose d'un moteur JavaScript et d'une API de script permettant notamment de modifier les menus et les événements de lancement.

> Remarque : cette version minimale est le **niveau de support du package**, pas une prétention sur la toute première version historique de PinballY capable d'exécuter chaque fichier. Le code utilise des modules JavaScript (`import` / `export`) et a été préparé pour l'environnement PinballY actuellement utilisé pour ce projet.

### Windows

PinballY fonctionne sous Windows ; sa documentation officielle indique Windows 7 ou ultérieur.

### Son de lancement

Le son de lancement est **optionnel**. Pour activer cette fonctionnalité, le composant **Windows Media Player** doit être disponible comme fonctionnalité Windows, car le script utilise l'objet COM `WMPlayer.OCX.7`.

Si Windows Media Player n'est pas disponible, le script journalise l'erreur d'initialisation et les autres fonctionnalités du package continuent normalement de fonctionner.

## Installation

Les scripts PinballY sont placés dans le dossier `Scripts` situé dans le dossier principal de PinballY. Le fichier `Main.js` sert ensuite de point d'entrée et importe les scripts à charger.

### 1. Sauvegarder l'installation actuelle

Avant toute mise à jour, faire une copie du dossier `PinballY\Scripts` existant, en particulier de votre `main.js`.

### 2. Copier le package

Copier le contenu du dossier du package dans :

```text
<dossier PinballY>\Scripts\
```

Le fichier `main.js` fourni par ce package devient le point d'entrée des scripts du projet.

### 3. Vérifier la structure

La structure attendue est :

```text
PinballY
└── Scripts
    ├── main.js
    ├── ui_translation.js
    ├── status_line_info.js
    ├── random_table_at_startup.js
    ├── force_backglass.js
    ├── custom_menu_commands.js
    ├── seamless_launch_overlay.js
    ├── play_launch_sound.js
    ├── README.md
    ├── LICENSE
    ├── common
    │   ├── config.js
    │   ├── i18n.js
    │   └── wheel_navigator.js
    └── lang
        ├── en.js
        └── fr.js
```

Ne pas déplacer `common/` ou `lang/` : les `import` du projet utilisent cette arborescence.

### 4. Configurer `common/config.js`

Les réglages utilisateur sont regroupés dans `common/config.js`. Il n'est normalement pas nécessaire de modifier les autres scripts pour personnaliser le comportement.

## Personnalisation

### Langue

La langue active est sélectionnée dans `common/config.js` :

```js
translation: {
    enabled: true,
    language: "fr",
},
```

Pour utiliser l'anglais :

```js
translation: {
    enabled: true,
    language: "en",
},
```

Pour désactiver la traduction et laisser l'interface en anglais :

```js
translation: {
    enabled: false,
    language: "fr",
},
```

Quand `enabled` vaut `false`, le projet utilise explicitement l'anglais pour les éléments qu'il gère lui-même.

### Ajouter une langue

1. Créer un nouveau fichier dans `lang/`, par exemple `de.js`.
2. Reprendre la structure de `lang/en.js` ou `lang/fr.js`.
3. Traduire les libellés correspondants.
4. Ajouter le module dans `common/i18n.js` :

```js
import de from "../lang/de.js";

const AVAILABLE_LANGUAGES = {
    en,
    fr,
    de,
};
```

5. Utiliser ensuite :

```js
translation: {
    enabled: true,
    language: "de",
},
```

Pour une langue non latine ou un encodage particulier, vérifier également l'encodage UTF-8 du fichier.

### Configuration de l'animation

Les principaux paramètres de l'animation se trouvent dans `config.js` :

- `startupWheelSpin.stepDelayMs` pour le spin au démarrage ;
- `randomGameCommand.animationBaseSpeedMs` pour la commande de jeu aléatoire ;
- `randomGameCommand.skipAnimation` pour désactiver l'animation ;
- `randomGameCommand.skipFinalStepProbability` pour le comportement de l'avant-dernier arrêt ;
- `randomGameCommand.usePageJumpOptimization` pour les longs déplacements ;
- `randomGameCommand.postAnimationDelayMs` avant le lancement.

### Son de lancement

Modifier :

```js
launchSound: {
    absoluteFilePath: "C:\\vPinball\\PinballY\\Media\\Sounds\\super-mario-64-voice-clip-here-we-go.mp3",
    volumePercent: 100,
},
```

Le chemin du fichier audio est volontairement absolu. Le package ne suppose pas d'API PinballY supplémentaire pour convertir automatiquement un chemin relatif.

### Fabricant des tables communautaires

Le message spécial de `status_line_info.js` utilise :

```js
tableMetadata: {
    communityManufacturerName: "VPX Community",
},
```

Adapter cette valeur au nom réellement utilisé dans votre base PinballY.

## Points importants avant publication

- `main.js` charge l'ensemble des fonctionnalités du projet ; ne supprimez pas les `import` si vous voulez conserver toutes les fonctions.
- Les fichiers `common/` et `lang/` sont des dépendances du point d'entrée et doivent être copiés avec le reste du package.
- En cas de modification de PinballY ou de changement important de son moteur JavaScript, tester le package avant déploiement sur toutes les machines cibles.

## Licence

Ce projet est distribué sous licence **MIT**. Voir `LICENSE`.

## Historique

Voir `CHANGELOG.md` pour l'historique des versions.

## Références

- PinballY Project : https://mjrnet.org/pinscape/PinballY.php
- PinballY Help — Installation : https://mjrnet.org/pinscape/downloads/PinballY/Help/Install.html
