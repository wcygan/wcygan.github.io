import type { Post, PostFile } from '$lib/types';

// This uses Vite's glob import feature
const postFiles = import.meta.glob<PostFile>('/src/posts/*.md', { eager: true });

let _posts: Post[] | null = null;

function initPosts(): Post[] {
    if (!_posts) {
        _posts = Object.entries(postFiles)
            .map(([filepath, post]) => {
                const slug = filepath.replace('/src/posts/', '').replace('.md', '');
                return {
                    slug,
                    title: post.metadata.title,
                    date: post.metadata.date,
                    description: post.metadata.description
                };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return _posts;
}

export function getAllPosts(): Post[] {
    return initPosts();
}

export function getRecentPosts(count: number): Post[] {
    return initPosts().slice(0, count);
}

export function getPostBySlug(slug: string): Post | undefined {
    return initPosts().find(post => post.slug === slug);
}
