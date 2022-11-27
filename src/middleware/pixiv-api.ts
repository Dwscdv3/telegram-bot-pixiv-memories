import { MyContext } from '../types/context.js';
import { PixivAPI } from '../pixiv-api.js';

export default async function PixivAPIMiddleware(ctx: MyContext, next: () => Promise<void>) {
    ctx.pixiv = new PixivAPI(ctx.axios, ctx.session.pixivUserId);
    await next();
}
