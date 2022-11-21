import { Context } from 'telegraf';
import storage from '../storage.js';

/**
 * @param {Context} ctx
 */
export default async function SessionMiddleware(ctx, next) {
    if (ctx.from) {
        ctx.session = await storage.has(ctx.from.id)
            ? await storage.get(ctx.from.id)
            : {};
        const originalJSON = JSON.stringify(ctx.session);
        await next();
        if (JSON.stringify(ctx.session) !== originalJSON) {
            await storage.set(ctx.from.id, ctx.session);
        }
    } else {
        await next();
    }
}
