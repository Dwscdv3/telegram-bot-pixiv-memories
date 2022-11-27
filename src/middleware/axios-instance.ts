import { MyContext } from '../types/context.js';
import axios from 'axios';

export default async function AxiosInstanceMiddleware(ctx: MyContext, next: () => Promise<void>) {
    ctx.axios = axios.create({
        baseURL: 'https://www.pixiv.net/',
        headers: {
            'Cookie': ctx.session.cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        },
    });
    await next();
}
