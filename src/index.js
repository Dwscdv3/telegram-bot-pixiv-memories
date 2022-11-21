import { readFile } from 'fs/promises';
import { Markup, Telegraf } from 'telegraf';
import ErrorHandlerMiddleware from './middleware/error-handler.js';
import SessionMiddleware from './middleware/session.js';
import AxiosInstanceMiddleware from './middleware/axios-instance.js';
import ArgumentsMiddleware from './middleware/arguments.js';
import PixivAPIMiddleware from './middleware/pixiv-api.js';
import { format, Templates } from './locale.js';
import { PixivAPI } from './pixiv-api.js';

const bot = new Telegraf(await readFile('token'));

bot.use(ErrorHandlerMiddleware);
bot.use(SessionMiddleware);
bot.use(AxiosInstanceMiddleware);
bot.use(ArgumentsMiddleware);
bot.use(PixivAPIMiddleware);

bot.start(async ctx => await ctx.reply(Templates.start));
bot.help(async ctx => await ctx.reply(Templates.help));
bot.command('privacy', async ctx => await ctx.reply(Templates.privacy));

bot.command('login_via_cookie', async ctx => {
    if (ctx.arguments.length < 1) {
        await ctx.reply(Templates.argsCookie);
        return;
    }
    ctx.session.cookie = ctx.arguments.join(' ');
    const response = await ctx.axios.get('/touch/ajax/user/self/status', {
        headers: {
            'Cookie': ctx.session.cookie,
        },
    });
    const { user_id, user_name } = response.data?.body?.user_status;
    if (response.status == 200 && user_id) {
        ctx.session.pixivUserId = user_id;
        await ctx.reply(format(Templates.loginSuccess, user_name, user_id));
    } else {
        ctx.session = {};
        await ctx.reply(Templates.unknownError);
    }
});
bot.command('logout', async ctx => {
    ctx.session = {};
    await ctx.reply(Templates.success);
});

bot.command('random', async ctx => await randomPic(ctx));
bot.command('random_private', async ctx => await randomPic(ctx, true));
bot.command('random_from_user', async ctx => {
    if (ctx.arguments.length < 1) {
        await ctx.reply(format(Templates.argsMismatch, 1, 0));
        return;
    }
    await randomPic(ctx, false, ctx.arguments.shift());
});

bot.command('mytags', async ctx => getTagList(ctx));
bot.command('mytags_private', async ctx => getTagList(ctx, true));
bot.command('theirtags',async ctx => {
    if (ctx.arguments.length < 1) {
        await ctx.reply(format(Templates.argsMismatch, 1, 0));
        return;
    }
    await getTagList(ctx, false, ctx.arguments.shift());
});

bot.launch();

console.log('Bot is now online.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

async function randomPic(ctx, isPrivate, uid) {
    if (!ctx.session.cookie) {
        await ctx.reply(Templates.requireLogin);
        return;
    }
    const [tag] = ctx.arguments ?? '';
    const { total } =
        (await ctx.pixiv.getBookmark({ tag, isPrivate, uid }));
    const offset = Math.floor(Math.random() * total);
    const [artwork] =
        (await ctx.pixiv.getBookmark({ tag, isPrivate, uid, offset })).works;
    const url = PixivAPI.thumbURLToLargeURL(artwork.url);
    console.debug(artwork.url);
    ctx.replyWithPhoto(url, {
        caption:
`<a href="https://www.pixiv.net/artworks/${artwork.id}">${artwork.title}</a>
by <a href="https://www.pixiv.net/users/${artwork.userId}">${artwork.userName}</a>`,
        parse_mode: 'HTML',
    });
}

async function getTagList(ctx, isPrivate, uid) {
    if (!ctx.session.cookie) {
        await ctx.reply(Templates.requireLogin);
        return;
    }
    const count = ctx.arguments[0] || 30;
    let tags = (await ctx.pixiv.getTagList(uid))[isPrivate ? 'private' : 'public'];
    tags = tags.sort((a, b) => b.cnt - a.cnt).slice(0, count);
    let text = format(Templates.tagListHeader, count) + '\n\n';
    for (const tag of tags) {
        text += `\`${tag.cnt.toString().padStart(5)}\` \`${tag.tag}\`\n`;
    }
    await ctx.replyWithMarkdownV2(text);
}
