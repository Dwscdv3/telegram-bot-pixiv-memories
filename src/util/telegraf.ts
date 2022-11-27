import { Templates } from '../locale.js';
import { InlineQueryResultArticle } from 'telegraf/types';

export function inlineQueryPrompt(title: string, description?: string): InlineQueryResultArticle {
    return {
        type: 'article',
        id: 'hint_' + title.slice(0, 59).replace(/\s/g, '_'),
        title,
        description,
        input_message_content: { message_text: Templates.nopQueryResult },
    };
}
