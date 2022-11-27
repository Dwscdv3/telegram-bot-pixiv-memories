import { MyContext } from '../types/context.js';
import { PixivAPI } from '../pixiv-api.js';
import axios from 'axios';
import { Templates } from '../locale.js';

export default async function PixivAPIMiddleware(ctx: MyContext, next: () => Promise<void>) {
    ctx.pixiv = new PixivAPI(ctx.axios, ctx.session.pixivUserId);
    try {
        await next();
    } catch (ex) {
        if (axios.isAxiosError(ex)) {
            if (ex.response?.status == 401 || ex.response?.status == 403) {
                ctx.reply(Templates.cookieExpired);
            } else {
                throw ex;
            }
        } else {
            throw ex;
        }
    }
}
