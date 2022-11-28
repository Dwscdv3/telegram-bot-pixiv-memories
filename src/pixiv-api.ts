import { Axios } from 'axios';
import { PixivBookmark, PixivTag } from './types/pixiv.js';

const CacheTTL = 5 * 60 * 1000;

export class PixivAPI {
    uid: number;
    private axios: Axios;
    private static cache: { [key: string]: { time: number, body: any } } = {};

    constructor(axios: Axios, uid: number) {
        this.axios = axios;
        this.uid = uid;
    }

    async getBookmarks({
        isPrivate = false,
        tag = '',
        index = 0,
        count = 20,
        uid = this.uid,
    } = {}): Promise<PixivBookmark[]> {
        return (await this.axios.get(`/ajax/user/${uid}/illusts/bookmarks`, {
            params: {
                tag,
                offset: index,
                limit: count,
                rest: isPrivate ? 'hide' : 'show',
            },
        })).data.body.works;
    }

    async getBookmark({
        isPrivate = false,
        tag = '',
        index = 0,
        uid = this.uid,
    } = {}) {
        return (await this.getBookmarks({ tag, isPrivate, uid, index, count: 1 }))[0];
    }

    async getRandomBookmarks({
        isPrivate = false,
        tag = '',
        count = 4,
        uid = this.uid,
    } = {}) {
        const total = await this.getBookmarkCount({ tag, isPrivate, uid });
        const index = Math.floor(Math.random() * total);
        return await this.getBookmarks({ tag, isPrivate, uid, index, count });
    }

    async getRandomBookmark({
        isPrivate = false,
        tag = '',
        uid = this.uid,
    } = {}) {
        return (await this.getRandomBookmarks({ tag, isPrivate, uid, count: 1 }))[0];
    }

    async getBookmarkCount({
        isPrivate = false,
        tag = '',
        uid = this.uid,
    } = {}): Promise<number> {
        return (await this.cachedRequest(`/ajax/user/${uid}/illusts/bookmarks`, {
            tag,
            offset: 0,
            limit: 1,
            rest: isPrivate ? 'hide' : 'show',
        })).body.total;
    }

    async getTagList({ uid = this.uid, isPrivate = false } = {}): Promise<PixivTag[]> {
        return (await this.cachedRequest(`/ajax/user/${uid}/illusts/bookmark/tags`))
            .body[isPrivate ? 'private' : 'public']
            .sort((a: { cnt: number; }, b: { cnt: number; }) => b.cnt - a.cnt);
    }

    private async cachedRequest(url: string, params?: object) {
        const key = this.axios.getUri({ url, params });
        let body: any;
        if (PixivAPI.cache[key] && Date.now() - PixivAPI.cache[key].time < CacheTTL) {
            body = PixivAPI.cache[key].body;
        } else {
            PixivAPI.cache[key] = {
                time: Date.now(),
                body: body = (await this.axios.get(url, { params })).data,
            }
        }
        return body;
    }

    static toLargeURL(url: string) {
        return url
            .replace(/(?<=pximg.net\/).+(?=\/img\/)/, 'img-master')
            .replace('custom', 'master')
            .replace('square', 'master');
    }

    static toThumbURL(url: string) {
        return url.replace(/(?<=\/c\/).+?(?=\/)/, '260x260_80');
    }

    static toPixivCatURL(url: string) {
        return url.replace('i.pximg.net', 'i.pixiv.cat');
    }
}
