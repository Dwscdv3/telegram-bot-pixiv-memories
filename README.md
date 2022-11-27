# Telegram Bot - pixiv Memories

## Installation

```
git clone --depth=1 https://github.com/Dwscdv3/telegram-bot-pixiv-memories.git
cd telegram-bot-pixiv-memories
echo YOUR_BOT_TOKEN > token
npm install
npm run build
npm start
```

## Usage

Credentials

- `/login_via_cookie <cookie>` - device_token and PHPSESSID are required
- `/logout` - Erase my cookie from bot's storage

Pick an artwork for me from...

- `/random [tag]` - my public bookmarks
- `/random_private [tag]` - my private bookmarks
- `/random_from_user <userid> [tag]` - other's public bookmarks

Show the most used tags from...

- `/mytags [count = 20]` - my public bookmarks
- `/mytags_private [count]` - my private bookmarks
- `/theirtags <userid> [count]` - other's public bookmarks

Inline query...  
In any chat, type:

`@botName <"public"|"private"> <tagName|"all"> [type to re-roll artworks]`
