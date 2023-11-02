export const Templates = {
    start: `\
Welcome. See /help to get started.`,
    help: `\
Usage:

Credentials
- /login_via_cookie <cookie> - device_token and PHPSESSID are required
- /logout - Erase my cookie from bot's storage

Pick an artwork for me from...
- /random [tag] - my public bookmarks
- /random_private [tag] - my private bookmarks
- /random_from_user <userid> [tag] - other's public bookmarks

Show the most used tags from...
- /mytags [count = 20] - my public bookmarks
- /mytags_private [count] - my private bookmarks
- /theirtags <userid> [count] - other's public bookmarks

Inline query...
In any chat, type:
@botName <"public"|"private"> <tagName|"all"> <number:index|string:randomSeed>
@botName <artworkUrl|pid>`,
    privacy: `\
This bot will store your pixiv cookie and user ID for necessary servicing.

You can send me /logout to erase your cookie at any time. Network traffic that contained your information may still be logged though.`,
    artwork: `\
<a href="https://www.pixiv.net/artworks/$0">$1</a>
by <a href="https://www.pixiv.net/users/$2">$3</a>`,
    success: '✅',
    unknownError: 'Unknown error occured, please contact the bot maintainers for help.',
    argInvalid: 'Argument $0 "$1" is invalid.',
    argsMismatch: 'This command requires $0 arguments, but you provided $1.',
    cookieInvalid: 'The cookie you provided is invalid, please check again.',
    requireLogin: 'You need to log in first.',
    cookieExpired: 'pixiv API refused the request.\n\nThis is likely caused by an expired cookie. Try log in again.',
    loginSuccess: 'Welcome, $0. Your pixiv user ID is $1.',
    tagListHeader: 'Top $0 tags:\n\\(Click to copy\\)',
    tagEmpty: 'You don\'t have any bookmark tagged $0.',
    bookmarkEmpty: 'You don\'t have any bookmarks yet.',
    nopQueryResult: 'This prompt is not clickable. Please type it manually.',
};
