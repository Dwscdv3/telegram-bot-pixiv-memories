export default async function ArgumentsMiddleware(ctx, next) {
    ctx.arguments = parse(ctx.message?.text);
    await next();
}

export function parse(str) {
    if (typeof str != 'string') return [];
    if (!str.startsWith('/')) return [];
    let args = str.split(' ');
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
