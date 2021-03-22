# What is this project ? 
This project is an adaptation for BoardGameArena of game Conspiracy : Abyss universe edited by Bombyx.
You can play here : https://boardgamearena.com

# TODO editor questions
 - Licence-wise, can we use pictures (score board, player mat, rulebook) not included in game art, but present on official website.
 - When a player plays the "Limit to first lord for this turn" location, and another player plays "Limit to first 2 lords for this turn" location, does it override the first location ? If not, how to react ? (for now, override has been implemented, last of the 2 card is taken into account, no matter the order).

# How to install the auto-build stack

## Install builders
Intall node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files
In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :
```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```
If you use it for another game, replace `conspiracy` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files
Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint
Make sure ftp-sync.json and node_modules are in .gitignore