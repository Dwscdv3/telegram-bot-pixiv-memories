import * as en from './locale/en.js';

export const Templates = en.Templates;

export function format(template, ...args) {
    for (let i = 0; i < args.length; i++) {
        template = template.replace(new RegExp(`\\$${i}`, 'g'), args[i].toString());
    }
    return template;
}
