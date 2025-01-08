import type { Post } from './types';

// This uses Vite's glob import feature
const postFiles = import.meta.glob('/src/posts/*.md', { eager: true });

// Create and sort posts array
export const posts: Post[] = Object.entries(postFiles)
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

// Helper function to get recent posts
export const getRecentPosts = (count: number) => posts.slice(0, count);
