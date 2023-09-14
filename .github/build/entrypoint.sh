#!/usr/bin/env bash
set -x

npm install
npm run postinstall
npm run pack

zip "WBOT-linux.zip"  bot.json github.png github-two.png wbot-linux
zip "WBOT-mac.zip"  bot.json github.png github-two.png wbot-macos
zip "WBOT-win.zip"  bot.json github.png github-two.png wbot-win.exe
