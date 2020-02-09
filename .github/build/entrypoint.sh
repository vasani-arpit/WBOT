#!/usr/bin/env bash
set -x

npm install
npm run pack

zip "WBOT-linux.zip"  bot.json github.png wbot-linux
zip "WBOT-mac.zip"  bot.json github.png wbot-macos
zip "WBOT-win.zip"  bot.json github.png wbot-win.exe
