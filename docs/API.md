# Wbot API

- [appconfig](#appconfig)
  - [headless](#Headless-Boolean)
  - [darkmode](#darkmode-Boolean)
  - [isGroupReply](#isGroupReply-Boolean)
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









