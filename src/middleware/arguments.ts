import { UserError } from './error-handler.js';
import { format, Templates } from '../locale.js';
import { MyContext, MyTextMessageContext } from '../types/context.js';

export class CommandNotEnoughArgumentsError extends UserError {
    constructor(requireCount: number, providedCount: number) {
        super(format(Templates.argsMismatch, requireCount, providedCount));
        this.name = 'CommandNotEnoughArgumentsError';
    }
}

export class ArgumentInvalidError extends UserError {
    constructor(index: number, value: string, cause?: unknown) {
        super(format(Templates.argInvalid, index + 1, value), { cause });
        this.name = 'ArgumentInvalidError';
    }
}

export default async function ArgumentsMiddleware(
    ctx: MyTextMessageContext,
    next: () => Promise<void>,
) {
    ctx.arguments = parse(ctx.message?.text);
    ctx.assertArgumentsAtLeast = (count: number) => {
        if (ctx.arguments.length < count) {
            throw new CommandNotEnoughArgumentsError(count, ctx.arguments.length);
        }
    };
    ctx.castArgument = (index: number, fn: (arg: string) => any) => {
        try {
            return fn(ctx.arguments[index]);
        } catch (ex) {
            throw new ArgumentInvalidError(index, ctx.arguments[index], ex);
        }
    };
    await next();
}

export function assertArgumentsAtLeast(count: number) {
    return async (ctx: MyContext, next: () => Promise<void>) => {
        ctx.assertArgumentsAtLeast(count);
        await next();
    };
}

function parse(str: string) {
    if (typeof str != 'string') return [];
    if (!str.startsWith('/')) return [];
    let args = str.split(/\s/);
    args.shift();
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('"')) {
            let end = -1, j = i;
            for (; j < args.length; j++) {
                if (args[j].endsWith('"')) {
                    end = j;
                    break;
                }
            }
            if (end >= 0) {
                let joined = args.slice(i, j + 1).join(' ');
                joined = joined.slice(1, joined.length - 1);
                args.splice(i, j - i + 1, joined);
            }
        }
    }
    return args.filter(s => s.length > 0);
}
