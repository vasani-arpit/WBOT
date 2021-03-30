

# WBOT 

 [![Support me on Patreon][badge_patreon]][patreon] [![Buy me a book][badge_amazon]][amazon] [![PayPal][badge_paypal]][paypal-donations] 


> A simple Nodejs BOT for whatsapp web

<a href="#preview">Preview</a> •
<a href="#features">Features</a> •
<a href="#downloads">Downloads</a> •
<a href="#how-to-start-the-bot">How to?</a> •
<a href="#technologies">Technologies Used</a> •
<a href="#why">Why?</a> •
<a href="#goals">Goals</a> •
<a href="#faq">FAQ</a>

## ✨Update 30th Mar 2021
Started as small side project, WBOT has become essential tool for small business owners who runs their business on whatsapp. WBOT helps them simplify business transitions by saving time and resources. I am overwhelmed by the support I received from all people on my email and telegram. I will continue updating WBOT. 

Thank you 🙏



## 🔍 Preview 

### Quick preview
![Screenshot gif](https://user-images.githubusercontent.com/6497827/58411958-1dcc8000-8093-11e9-8aeb-5747efe10266.gif)

<!---
### Full YouTube Video

[![Video thumbnail](https://img.youtube.com/vi/y7LAbdoNBJA/0.jpg)](https://www.youtube.com/watch?v=y7LAbdoNBJA)

-->

## ⚡ Features 

* 🎨 Highly customizable json
* 💯 Totally Free for personal use
* 🔒 Complete Privacy. Your data stays with you always
* 💻 Download media files automatically
* 👥 Multiple instances 

## ⬇ Downloads ⬇

macOS | Windows | Linux
-----------------| ---| ---|
[Download Latest Release](https://github.com/vasani-arpit/WBOT/releases/latest/download/WBOT-mac.zip) | [Download Latest Release](https://github.com/vasani-arpit/WBOT/releases/latest/download/WBOT-win.zip) | [Download Latest Release](https://github.com/vasani-arpit/WBOT/releases/latest/download/WBOT-linux.zip)


## Supported Platforms
Following platforms are supported by Wbot:

**macOS**
The minimum version supported is macOS 10.9.

**Windows**
Windows 7 and later are supported.

**Linux:**

- Ubuntu 12.04 and later
- Fedora 21
- Debian 8

## How to start the BOT?

### STEPS

After downloading, extract the zip file and navigate to that location in your terminal. There will be a file named wbot-* . Run it and you should be good to go.

For Linux you need to provide executable permission before you execute the binary. 
Run the command - 
```
chmod +x wbot-linux && wbot-linux
```

Note: on Linux you need a running display server (X11 or Wayland).
If you run Linux on a headless server or wan't to run chmomium without visible display try ```xvfb-run wbot-linux```.

*I haven't tested Mac and Linux binaries. If you find any issues using them feel free to raise one from [here](https://github.com/vasani-arpit/WBOT/issues/new)*

### Configurations 

Basic configuration is in bot.json file like replying to Hi, hello and happy birthday. You can add/remove yours if you need. Keep in mind that you need to restart the wbot to see the effects of your changes. Make sure the JSON is valid. Use VSCode or [jsonlint](https://jsonlint.com/) to validate the JSON.

### bot.json 

**appconfig**

This is where all the application related (node application behavior and such things) config will stay. Will add more in future.

- **headless** whether to start chrome as headless or not. this is regarding #4. Apparently, Whatsapp doesn't allow headless instances.
- **isGroupReply** whether to send replies in group or not. If set to false, Bot will not reply if message received in group chat.

- **webhook** A URL which will be called for every message with payload data. this can be useful if you want do other operation over messages in your server. for example server code take a look [here](https://github.com/vasani-arpit/WBOT/blob/master/docs/Webhook-example.md)

- **downloadMedia** Whether to download incoming message media or not. 

**bot**

An array of objects. Properties of Object are self explanatory. 

- **Contains** If message has one of that word anywhere in the message
- **exact** If message is exactly as one of the messages form array

- **Response** If any of the above conditions becomes true then corresponding response string or [spintax](https://spintaxtool.appspot.com/) will be sent as message to the user or group. there is two variables name and phoneNumber which you can use to create custom message for sender. sample message with variable is in `bot.json`

- **file** name of the file (from current directory) which you want to send along with response 

**Blocked**

Array of numbers with county code to which this bot will not reply to.

**noMatch**

Default reply message or [spintax](https://spintaxtool.appspot.com/) when no exact match found in BOT

**smartreply** *(This feature is under maintenance at the moment.)*

An object which contains suggestions and it's configs.

- **suggestions** An Array of suggestions
- **clicktosend** Whether to send or just write message when user clicks on suggestion

here is how that looks

![smart reply gif](https://user-images.githubusercontent.com/6497827/58412366-f1653380-8093-11e9-8427-1ca19235faed.gif)


## Run the latest code from github

**This is only recommended for advanced 'node.js' users.**

open a Terminal and create a new directory in your home directory, e.g. 'node' and goto there.
Now download and run the latest code from github by:

```
git clone https://github.com/vasani-arpit/WBOT.git
cd WBOT
npm install
node src/index.js
```

If you run Linux on a headless server or wan't to run chmomium without visible display try ```xvfb-run wbot-linux```.

## Known bugs
Sometimes, closing the `node` server directly does not clear browser cache. Next time when the bot is started, it runs into errors due to which smart reply is not setup correctly. A temporary fix to this is to clear `node` cache.

```java-script 
npm cache clean
```


## 💻 Technologies
* [Node](https://nodejs.org/en/)
* [puppeteer](https://github.com/GoogleChrome/puppeteer)


## Why?

The main reason I decided to build this is that I needed a simple tool to reply to my "happy birthday" messages. I know it is kind of blunt and rude but it would take me 2-3 days to reply to all and by that time that moment would be gone. I needed a good solution to this problem. I really don't need a full-fledged AI-BOT or BOT with NLU (or some other acronym). I believe there are many people who also have such needs.

## Goals
With that in mind, I know that WBOT would need to satisfy these criteria:

* 🚀 Fast!!!
* 👍 Friendly CLI UX
* 🔒 Does not touch user’s data
* 💰 Free! for personal use

If you think WBOT delivers these, let me know by putting a **star ⭐** on this project


## FAQ

* **Is this app built with NodeJS?**

  Yes, it's built with [NodeJS](https://nodejs.org/en/). Please see the [Technologies](#technologies) section for more info.

* **What boilerplate did you use?**

  None. The idea was to get a better understanding of how things work together, But I do take a cue from other projects.

* **What npm modules did you use?**

  - [Ora](https://www.npmjs.com/package/ora) for spinner 
  - [cli-progress](https://www.npmjs.com/package/cli-progress) for download progress bar in terminal
  - [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) to generate QRCode in terminal 
  - [mime](https://www.npmjs.com/package/mime) detect mime file sent
  - [mel-spintax](https://www.npmjs.com/package/mel-spintax) to support spintax

* **Apart from development, What else do you do?**

  I do motion design and UI/UX development.

* **Are you available for hire?**

  I have a full-time job as a software developer at technobrains.net and at mindtechconsultancy.com. I am available as a freelance consultant during my spare time please let me know what you have in mind.

* **How do I contact you?**

  If you find an issue, please report it here. For everything else, please drop me a line at vasani.arpit@gmail.com

* **Do you have any other projects?**

  I thought you'd never ask. Yes, I do. [SMA](https://github.com/vasani-arpit/Social-Media-Automation) is one of them.

[badge_paypal]: https://user-images.githubusercontent.com/6497827/53698092-42032280-3dfe-11e9-8054-1597c62d344e.png
[badge_patreon]: https://user-images.githubusercontent.com/6497827/53698102-4af3f400-3dfe-11e9-9749-4104ceb6ea3c.png
[badge_amazon]: https://user-images.githubusercontent.com/6497827/53698105-51826b80-3dfe-11e9-9e63-b14ad6ad7c19.png
[twitter_logo]: https://user-images.githubusercontent.com/6497827/57843958-c30e6b00-77ec-11e9-97bd-dfbc800f96a9.png
[telegram_logo]: https://user-images.githubusercontent.com/6497827/57844175-2ac4b600-77ed-11e9-8488-f2d45efa7497.png
[gmail_logo]: https://user-images.githubusercontent.com/6497827/62424751-c1b85480-b6f0-11e9-97de-096c0a980829.png

[patreon]: https://www.patreon.com/arpit_vasani
[amazon]: http://amzn.in/iCUjhKZ
[paypal-donations]: https://www.paypal.me/arpitvasani
[twitter]: https://twitter.com/ArpitVasani
[telegram]: http://t.me/Arpit_Vasani
[gmail]: mailto:vasani.arpit@gmail.com?subject=Regarding%20Wbot&body=Hi

## 📃 Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk. **Commercial use of this code/repo is strictly prohibited.**

## 👋 Contact Me 👋

[![Contact me on twitter][twitter_logo]][twitter]
[![Contact me on telegram][telegram_logo]][telegram]
[![Mail me][gmail_logo]][gmail]

