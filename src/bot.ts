import { Templates, format } from './locale.js';
import { PixivAPI } from './pixiv-api.js';
import { MyContext } from './types/context.js';
import { NarrowedContext } from 'telegraf';
import { InlineQueryResult, Update } from 'telegraf/types';
import { htmlEscape, inlineQueryPrompt } from './util/telegraf.js';
import { toInt } from './util/convert.js';
import { PixivArtwork } from './types/pixiv.js';

export async function sendRandomArtwork(ctx: MyContext, isPrivate?: boolean, uid?: number) {
    const tag = ctx.arguments[0] ?? '';
    const artwork = await ctx.pixiv.getRandomBookmark({ tag, isPrivate, uid });
    if (!artwork) {
        await ctx.reply(format(tag ? Templates.tagEmpty : Templates.bookmarkEmpty, tag));
        return;
    }
    const url = PixivAPI.toLargeURL(artwork.url!);
    await ctx.replyWithPhoto(url, {
        caption: format(Templates.artwork,
            artwork.id, artwork.title, artwork.userId, artwork.userName),
        parse_mode: 'HTML',
    });
}

export async function sendTagList(ctx: MyContext, isPrivate?: boolean, uid?: number) {
    const count = ctx.arguments[0] ? ctx.castArgument(0, toInt) : 30;
    let tags = (await ctx.pixiv.getTagList({ uid, isPrivate })).slice(0, count);
    let text = format(Templates.tagListHeader, tags.length) + '\n\n';
    for (let i = 0; i < tags.length; i++) {
        if (i && i % 50 == 0) {
            await ctx.replyWithMarkdownV2(text);
            text = '';
        }
        const tag = tags[i];
        text += `\`${tag.cnt.toString().padStart(5)}\` \`${tag.tag}\`\n`;
    }
    await ctx.replyWithMarkdownV2(text);
}

export async function login(ctx: MyContext) {
    ctx.session.cookie = ctx.arguments.join(' ');
    const response = await ctx.axios.get('/touch/ajax/user/self/status', {
        headers: { 'Cookie': ctx.session.cookie },
    });
    const { user_id, user_name } = response.data?.body?.user_status;
    if (response.status == 200 && user_id) {
        ctx.session.pixivUserId = user_id;
        await ctx.reply(Templates.success);
        await ctx.reply(format(Templates.loginSuccess, user_name, user_id));
    } else {
        ctx.session.cookie = '';
        await ctx.reply(Templates.cookieInvalid);
    }
}

export async function onInlineQuery(ctx: NarrowedContext<MyContext, Update.InlineQueryUpdate>) {
    let cancelled = false;
    const watchdog = setTimeout(() => {
        cancelled = true;
        ctx.answerInlineQuery([inlineQueryPrompt('Timed out')], { cache_time: 0 })
            .catch(console.error);
    }, 5000);
    try {
        if (!ctx.session?.cookie) throw '';
        const queries = ctx.inlineQuery.query.split(/\s/);
        const [visibility, search] = queries;
        const index = parseInt(queries[2]);
        let results: InlineQueryResult[] = [];
        const pid = parseInt(queries[0].match(/\d+/)?.[0]!);
        if (pid) {
            const artwork = await ctx.pixiv.getArtwork(pid);
            results = [artworkToInlineQueryResult(artwork)];
        } else if (queries.length >= 3) {
            const artworks = isNaN(index)
                ? await ctx.pixiv.getRandomBookmarks({
                    tag: search == 'all' ? undefined : search,
                    isPrivate: visibility == 'private',
                    count: 4,
                })
                : await ctx.pixiv.getBookmarks({
                    tag: search == 'all' ? undefined : search,
                    isPrivate: visibility == 'private',
                    count: 4,
                    index,
                });
            results = artworks.map(artworkToInlineQueryResult);
        } else if (visibility == 'public' || visibility == 'private') {
            results = (await ctx.pixiv.getTagList({
                isPrivate: visibility == 'private',
            })).filter(tag => search?.length ? tag.tag.includes(search) : true)
                .slice(0, 50)
                .map(tag => inlineQueryPrompt(tag.tag, tag.cnt.toString()));
        } else if (queries.length <= 1) {
            results = [
                inlineQueryPrompt('public'),
                inlineQueryPrompt('private'),
                inlineQueryPrompt('https://www.pixiv.net/artworks/12345678'),
                inlineQueryPrompt('12345678'),
            ];
        }
        clearTimeout(watchdog);
        if (!cancelled) {
            await ctx.answerInlineQuery(results);
        }
    } catch (ex) {
        console.error(ex);
        clearTimeout(watchdog);
        if (!cancelled) {
            await ctx.answerInlineQuery([], { cache_time: 0 });
        }
    }
}

const artworkToInlineQueryResult = (artwork: PixivArtwork): InlineQueryResult => ({
    type: 'photo',
    id: artwork.id,
    thumbnail_url: artwork.urls?.thumb ?? artwork.url!,
    photo_url: artwork.urls?.regular ?? PixivAPI.toLargeURL(artwork.url!),
    title: artwork.title,
    description: artwork.userName,
    caption: format(Templates.artwork,
        artwork.id,
        htmlEscape(artwork.title),
        artwork.userId,
        htmlEscape(artwork.userName),
    ) + (artwork.pageCount > 1 ? `\n${artwork.pageCount} pages` : ''),
    parse_mode: 'HTML',
});
