#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Blog post creation script for Deno
 * Usage: deno run --allow-read --allow-write scripts/new-post.ts
 */

import { join, dirname } from "@std/path";

async function question(query: string): Promise<string> {
	console.log(query);
	const buf = new Uint8Array(1024);
	const n = await Deno.stdin.read(buf) ?? 0;
	const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
	return input;
}

async function createPost(): Promise<void> {
	try {
		// Get post details from user
		const title = await question('Enter post title: ');
		const description = await question('Enter post description: ');
		
		// Get tags with default suggestions
		console.log('\nSuggested tags: website, blog, tutorial, tech, programming, project, review');
		const tagsInput = await question('Enter tags (comma-separated, or press Enter for default "blog, tech"): ');
		
		// Process tags
		let tags: string[];
		if (tagsInput.trim() === '') {
			tags = ['blog', 'tech'];
		} else {
			tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
		}

		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Get current date
		const date = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		// Create markdown content
		const markdownContent = `---
title: ${title}
date: ${date}
description: ${description}
tags: [${tags.map(tag => `${tag}`).join(', ')}]
---

Write your post content here...
`;

		// Get the script directory and create paths
		const scriptDir = dirname(new URL(import.meta.url).pathname);
		const projectRoot = join(scriptDir, '..');
		const postsDir = join(projectRoot, 'src', 'posts');
		const postsFilePath = join(projectRoot, 'src', 'lib', 'posts.ts');

		// Create markdown file
		await Deno.writeTextFile(join(postsDir, `${slug}.md`), markdownContent);

		// Read existing posts.ts
		const postsContent = await Deno.readTextFile(postsFilePath);

		// Add new post to posts array
		const newPost = `    {
        title: '${title}',
        date: '${date}',
        description: '${description}',
        slug: '${slug}',
        tags: [${tags.map(tag => `'${tag}'`).join(', ')}]
    }`;

		// Insert new post at the beginning of the array
		const updatedContent = postsContent.replace(
			'export const posts: Post[] = [',
			`export const posts: Post[] = [\n${newPost},`
		);

		// Write updated posts.ts
		await Deno.writeTextFile(postsFilePath, updatedContent);

		console.log(`\nSuccess! Created new post: ${slug}.md`);
		console.log(`Tags: [${tags.join(', ')}]`);
		console.log(`Added post to posts.ts`);
	} catch (error) {
		console.error('Error creating post:', error);
		Deno.exit(1);
	}
}

if (import.meta.main) {
	await createPost();
} 