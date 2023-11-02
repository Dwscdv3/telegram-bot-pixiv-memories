export interface PixivTag {
    tag: string;
    cnt: number;
}

export interface PixivArtwork {
    id: string;
    pageCount: number;
    title: string;
    url?: string;
    urls?: {
        original: string;
        regular: string;
        small: string;
        thumb: string;
        mini: string;
    };
    userId: string;
    userName: string;
}
