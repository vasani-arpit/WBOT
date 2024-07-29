#!/usr/bin/env bash
set -x

pwd && ls -la
npm install
npm install -g @yao-pkg/pkg
npm run pack

zip "WBOT-linux.zip"  bot.json github.png github-two.png wbot-linux file_example_MP3_700KB.mp3 messages.json
zip "WBOT-mac.zip"  bot.json github.png github-two.png wbot-macos file_example_MP3_700KB.mp3 messages.json
zip "WBOT-win.zip"  bot.json github.png github-two.png wbot-win.exe file_example_MP3_700KB.mp3 messages.json
