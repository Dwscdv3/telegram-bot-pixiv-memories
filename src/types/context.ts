import { Context } from 'telegraf';
import { NarrowedContext } from 'node_modules/telegraf/typings/context.js';
import { Update } from 'telegraf/types';
import { Message } from 'typegram';
import { Axios } from 'axios';
import { PixivAPI } from '../pixiv-api.js';
import { MySession } from './session.js';

export interface MyContext extends Context {
    session: MySession;
    axios: Axios;
    arguments: string[];
    assertArgumentsAtLeast: (count: number) => void;
    castArgument: <T>(index: number, fn: (arg: string) => T) => T;
    pixiv: PixivAPI;
}

export type MyTextMessageContext = NarrowedContext<MyContext, {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
}>;
