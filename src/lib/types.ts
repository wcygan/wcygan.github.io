export interface Post {
    title: string;
    date: string;
    description: string;
    slug: string;
    tags?: string[];
    readingTime?: number;
}

export interface PostFile {
    metadata: {
        title: string;
        date: string;
        description: string;
        tags?: string[];
    };
    default: unknown;
}
