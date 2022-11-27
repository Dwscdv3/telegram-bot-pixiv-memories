import { MyContext } from '../types/context.js';
import { Templates } from '../locale.js';

export class UserError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        super.name = 'UserError';
    }
}

export default async function ErrorHandlerMiddleware(ctx: MyContext, next: () => Promise<void>) {
    try {
        await next();
    } catch (ex) {
        if (ex instanceof UserError) {
            await ctx.reply(ex.message || Templates.unknownError);
        } else {
            console.error(ex);
            await ctx.reply(Templates.unknownError);
        }
    }
}
