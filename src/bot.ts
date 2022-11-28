import { Templates, format } from './locale.js';
import { PixivAPI } from './pixiv-api.js';
import { MyContext } from './types/context.js';
import { NarrowedContext } from 'telegraf';
import { InlineQueryResult, Update } from 'telegraf/types';
import { inlineQueryPrompt } from './util/telegraf.js';
import { toInt } from './util/convert.js';
import axios from 'axios';

export async function sendRandomArtwork(ctx: MyContext, isPrivate?: boolean, uid?: number) {
    const tag = ctx.arguments[0] ?? '';
    const artwork = await ctx.pixiv.getRandomBookmark({ tag, isPrivate, uid });
    if (!artwork) {
        ctx.reply(format(tag ? Templates.tagEmpty : Templates.bookmarkEmpty, tag));
        return;
    }
    const url = PixivAPI.toLargeURL(artwork.url);
    ctx.replyWithPhoto(url, {
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
        ctx.answerInlineQuery([], {
            switch_pm_text: 'pixiv timed out',
            switch_pm_parameter: 'pixiv_timeout',
            cache_time: 0,
        });
    }, 5000);
    try {
        if (!ctx.session?.cookie) throw '';
        const queries = ctx.inlineQuery.query.split(/\s/);
        const [visibility, search] = queries;
        let results: InlineQueryResult[] = [];
        if (queries.length >= 3) {
            const artworks = await ctx.pixiv.getRandomBookmarks({
                tag: search == 'all' ? undefined : search,
                isPrivate: visibility == 'private',
                count: 4,
            });
            results = artworks.map((artwork): InlineQueryResult => ({
                type: 'photo',
                id: artwork.id,
                thumb_url: PixivAPI.toThumbURL(artwork.url),
                photo_url: PixivAPI.toLargeURL(artwork.url),
                title: artwork.title,
                description: artwork.userName,
                caption: format(Templates.artwork,
                    artwork.id, artwork.title, artwork.userId, artwork.userName),
                parse_mode: 'HTML',
            }));
        } else if (visibility == 'public' || visibility == 'private') {
            results = (await ctx.pixiv.getTagList({
                isPrivate: visibility == 'private',
            })).filter(tag => search?.length ? tag.tag.includes(search) : true)
                .slice(0, 50)
                .map(tag => inlineQueryPrompt(tag.tag, tag.cnt.toString()));
        } else if (queries.length <= 1) {
            results = [inlineQueryPrompt('public'), inlineQueryPrompt('private')];
        }
        clearTimeout(watchdog);
        if (!cancelled) {
            await ctx.answerInlineQuery(results);
        }
    } catch (ex) {
        clearTimeout(watchdog);
        if (!cancelled) {
            await ctx.answerInlineQuery([], {
                switch_pm_text: 'Log in to pixiv',
                switch_pm_parameter: 'login',
                cache_time: 0,
            });
        }
    }
}
