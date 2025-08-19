import { readFile } from 'fs/promises';
import { Composer, Telegraf } from 'telegraf';
import ErrorHandlerMiddleware from './middleware/error-handler.js';
import SessionMiddleware from './middleware/session.js';
import AxiosInstanceMiddleware from './middleware/axios-instance.js';
import ArgumentsMiddleware, { assertArgumentsAtLeast } from './middleware/arguments.js';
import PixivAPIMiddleware from './middleware/pixiv-api.js';
import { Templates } from './locale.js';
import { MyContext } from './types/context.js';
import { login, onInlineQuery, sendRandomArtwork, sendTagList } from './bot.js';
import { toInt } from './util/convert.js';

const { compose, optional, branch, command } = Composer;

const bot = new Telegraf<MyContext>(await readFile('token', { encoding: 'utf8' }));

bot.use(ErrorHandlerMiddleware);
bot.use(SessionMiddleware);
bot.use(AxiosInstanceMiddleware);
bot.on('text', ArgumentsMiddleware);
bot.use(PixivAPIMiddleware);

bot.start(async ctx => await ctx.reply(Templates.start));
bot.help(async ctx => await ctx.reply(Templates.help));
bot.command('privacy', async ctx => await ctx.reply(Templates.privacy));

bot.command('login_via_cookie', assertArgumentsAtLeast(1), login);
bot.command('logout', async ctx => {
    ctx.session.cookie = '';
    await ctx.reply(Templates.success);
});

bot.on('text', optional(ctx => ctx.message.entities?.[0].type == 'bot_command',
    branch(async ctx => !!ctx.session.cookie,
        compose([
            command('random', async ctx => await sendRandomArtwork(ctx)),
            command('random_private', async ctx => await sendRandomArtwork(ctx, true)),
            command('random_from_user',
                assertArgumentsAtLeast(1),
                async ctx => await sendRandomArtwork(ctx, false, toInt(ctx.arguments.shift()!)),
            ),
            command('mytags', async ctx => sendTagList(ctx)),
            command('mytags_private', async ctx => sendTagList(ctx, true)),
            command('theirtags',
                assertArgumentsAtLeast(1),
                async ctx => await sendTagList(ctx, false, toInt(ctx.arguments.shift()!)),
            ),
        ]),
        async ctx => await ctx.reply(Templates.requireLogin),
    )),
);

bot.on('inline_query', onInlineQuery);

bot.catch(console.error);

bot.launch();

console.log('Bot is now online.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
