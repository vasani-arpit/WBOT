# Wbot API

- [appconfig](#appconfig)
  - [headless](#Headless-Boolean)
  - [darkmode](#darkmode-Boolean)
  - [isGroupReply](#isGroupReply-Boolean)
  - [currentChrome](#currentChrome)
  - webhook
- bot
  - contains
  - exact
  - response
  - file
- blocked
- noMatch
- smartreply
  - suggestions
  - clicktosend


## appconfig

These are configs related to wbot features and way of working and other parts but not the bot itself.

### Headless: Boolean
Decides whether to show chrome window or not. If set to false then chrome window will be visible.
this is useful when running wbot on linux VPS'. 

Default:false

### darkmode: Boolean

Only works when headless is false. Adds css to the page which enables dark UI of the whatspapp.

*This feature is not currently working and I have dropped it off as there is not much audience to it. If you want to develop it then PRs are welcome*

### isGroupReply: Boolean

Decides whether to send reply in groups or not. If set to true then BOT will also reply if incoming message is in a group.

Default: false

### currentChrome: String

this is a address of the your existing chrome instance which has exposed remote debugging port. normally it will be 9222 which means value of this setting will be http://localhost:9222/json/version

If you want to do this in windows then open properties of your chrome icon on the desktop go to shortcut and update the value of target to the following 

```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --profile-directory="Default" --remote-debugging-port=9222 -- "%1"
```

Close all the open chrome instances and then start the one which you updated. It should work. 

**for any other OS**

Basically, we are opening chrome binary(app) with two arguments --profile-directory="Default" --remote-debugging-port=9222









