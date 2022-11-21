import { PixivAPI } from '../pixiv-api.js';

export default async function PixivAPIMiddleware(ctx, next) {
    ctx.pixiv = new PixivAPI(ctx.axios, ctx.session.pixivUserId);
    await next();
}
