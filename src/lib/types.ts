export interface Post {
    title: string;
    date: string;
    description: string;
    slug: string;
}

export interface PostFile {
    metadata: {
        title: string;
        date: string;
        description: string;
    };
    default: unknown;
}
