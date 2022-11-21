export class PixivAPI {

    constructor(axios, uid) {
        this.axios = axios;
        this.uid = uid;
    }

    async getBookmark({
        isPrivate = false,
        tag = '',
        offset = 0,
        uid = this.uid,
    } = {}) {
        return (await this.axios.get(
            `/ajax/user/${uid}/illusts/bookmarks`,
            {
                params: {
                    tag,
                    offset,
                    limit: 1,
                    rest: isPrivate ? 'hide' : 'show',
                },
            }
        )).data.body;
    }

    async getTagList(uid = this.uid) {
        return (await this.axios.get(
            `/ajax/user/${uid}/illusts/bookmark/tags`
        )).data.body;
    }

    static thumbURLToLargeURL(url) {
        return url
            .replace(/(?<=pximg.net\/).+(?=\/img\/)/, 'img-master')
            .replace('custom', 'master')
            .replace('square', 'master');
    }
}
