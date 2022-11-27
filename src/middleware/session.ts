import { MyContext } from '../types/context.js';
import storage from '../storage.js';

export default async function SessionMiddleware(ctx: MyContext, next: () => Promise<void>) {
    if (ctx.from) {
        const key = ctx.from.id.toString();
        ctx.session = await storage.has(key) ? await storage.get(key) : {};
        const originalJSON = JSON.stringify(ctx.session);
        await next();
        if (JSON.stringify(ctx.session) !== originalJSON) {
            await storage.set(key, ctx.session);
        }
    } else {
        await next();
    }
}
