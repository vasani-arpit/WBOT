#!/usr/bin/env bash
set -x

pwd && ls -la
npm install
npm run pack

zip "WBOT-linux.zip"  bot.json github.png github-two.png wbot-linux
zip "WBOT-mac.zip"  bot.json github.png github-two.png wbot-macos
zip "WBOT-win.zip"  bot.json github.png github-two.png wbot-win.exe
