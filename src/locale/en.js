export const Templates = {
    start:
`Welcome. See /help to get started.`,
    help:
`Usage:

Credentials
- /login_via_cookie <cookie> - device_token and PHPSESSID are required
- /logout - Erase my data from bot's storage

Pick an artwork for me from...
- /random [tag] - my public bookmarks
- /random_private [tag] - my private bookmarks
- /random_from_user <userid> [tag] - other's public bookmarks

Show the most used tags from...
- /mytags [count = 20] - my public bookmarks
- /mytags_private [count] - my private bookmarks
- /theirtags <userid> [count] - other's public bookmarks`,
    privacy:
`This bot will store your pixiv cookie and user ID for necessary servicing.

You can send me /logout to erase your data at any time. Network traffic that contained your information may still be logged, though.`,
    success: '✅',
    unknownError: 'Unknown error occured, please contact the bot maintainers for help.',
    argsMismatch: 'This command requires $0 arguments, but you provided $1.',
    requireLogin: 'You need to login first.',
    argsCookie: 'Please paste your cookie in the same line of this command.',
    loginSuccess: 'Welcome, $0. Your pixiv user ID is $1.',
    repeat: 'One more turn… I mean, pic.',
    tagListHeader: 'Top $0 tags:\n\\(Click to copy\\)',
};
