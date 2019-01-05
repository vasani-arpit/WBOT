# WBOT
A simple BOT for web.whatsapp

<a href="#preview">Preview</a> •
<a href="#features">Features</a> •
<a href="#downloads">Downloads</a> •
<a href="#how-to-start-the-bot">How to?</a> •
<a href="#technologies">Technologies Used</a> •
<a href="#why">Why?</a> •
<a href="#goals">Goals</a> •
<a href="#faq">FAQ</a>

## Preview

![Screenshot gif](./screenshot/screenshot.gif)

## Features

* 🎨 Highly customizable json
* 💯 Totally Free for personal use
* 🔒 Complete Privacy. Your data stays with you always

## Downloads

macOS | Windows | Linux
-----------------| ---| ---|
[Download v1.0](https://github.com/vasani-arpit/WBOT/releases/download/v1.0/WBOT-mac-v1.0.zip) | [Download v1.0](https://github.com/vasani-arpit/WBOT/releases/download/v1.0/WBOT-win-v1.0.zip) | [Download v1.0](https://github.com/vasani-arpit/WBOT/releases/download/v1.0/WBOT-linux-v1.0.zip)


## Supported Platforms
Following platforms are supported by Wbot:

**macOS**
The minimum version supported is macOS 10.9.

**Windows**
Windows 7 and later are supported

**Linux:**

- Ubuntu 12.04 and later
- Fedora 21
- Debian 8

## How to start the BOT?

### steps

After download extract the zip and command prompt or terminal at that location there will be a file named wbot-* run it and you should be good to go.

### Configurations 

Basic Configuration is in bot.json file like replying to Hi, hello and happy birthday. you can add/remove yours if you need. keep in mind that you need to restart the wbot to see the effect of change. make sure json is valid. use VSCode or [jsonlint](https://jsonlint.com/) to validate json.

### bot.json 

**appconfig**

This is where all the application related(node application behavior and such things) config will stay. will add more in future.

**bot**

An array of object. Properties are self explanatory. 

- **Contains** If message has one of that word anywhere in the message
- **exact** If message is exactly as one of the messages form array

- **Response** If any of the above conditions becomes true then corresponding response string will be sent as message to the user or group.

**Blocked**

Array of numbers with county code to which this bot reply to.

## Technologies
* [Node](https://nodejs.org/en/)
* [puppeteer](https://github.com/GoogleChrome/puppeteer)


## Why?

The main reason I decided to build this is that I need a simple tool to reply to my "happy birthday" message. I know it is kind of blunt and rude but it would take me 2-3 days to reply to all and by that time that moment would be gone. I just need a good solution to this problem. I really don't need a full-fledged AI-BOT or BOT with NLU (or some other acronym). I believe there are many people who also have such need.

## Goals
With that in mind, I know that WBOT would need to satisfy these criteria:

* 🚀 Fast!!!
* 👍 Friendly CLI UX
* 🔒 Does not touch user’s data
* 💰 Free! for personal use

If you think WBOT delivers these, let me know by putting a star on this project 😉


## FAQ

* **Is this app built with NodeJS?**

Yes, it's built with [NodeJS](https://nodejs.org/en/). Please see the [Technologies](#technologies) section for more info.

* **What boilerplate did you use?**

None. The idea was to get a better understanding of how things work together, But I do take a cue from other projects.

* **What npm modules did you use?**

  - [Ora](https://www.npmjs.com/package/ora) for spinner 
  - [cli-progress](https://www.npmjs.com/package/cli-progress) for download progress bar in terminal
  - [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) to generate QRCode in terminal 


* **Apart from development, What else do you do?**

I do motion design and UI/UX development.

* **Are you available for hire?**

I have a full-time job as a software developer at technobrains.net. I am available as a freelance consultant during my spare time please let me know what you have in mind.

* **How do I contact you?**

If you find an issue, please report it here. For everything else, please drop me a line at vasani.arpit@gmail.com