import { Templates } from '../locale.js';

export default async function ErrorHandlerMiddleware(ctx, next) {
    try {
        await next();
    } catch (ex) {
        console.error(ex);
        await ctx.reply(Templates.unknownError);
    }
}
