#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createPost() {
	try {
		// Get post details from user
		const title = await question('Enter post title: ');
		const description = await question('Enter post description: ');

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
---

Write your post content here...
 `;

		// Create markdown file
		await fs.writeFile(path.join(__dirname, '..', 'src', 'posts', `${slug}.md`), markdownContent);

		// Read existing posts.ts
		const postsPath = path.join(__dirname, '..', 'src', 'lib', 'posts.ts');
		const postsContent = await fs.readFile(postsPath, 'utf-8');

		// Add new post to posts array
		const newPost = `    {
         title: '${title}',
         date: '${date}',
         description: '${description}',
         slug: '${slug}'
     }`;

		// Insert new post at the beginning of the array
		const updatedContent = postsContent.replace(
			'export const posts: Post[] = [',
			`export const posts: Post[] = [\n${newPost},`
		);

		// Write updated posts.ts
		await fs.writeFile(postsPath, updatedContent);

		console.log(`\nSuccess! Created new post: ${slug}.md`);
		console.log(`Added post to posts.ts`);
	} catch (error) {
		console.error('Error creating post:', error);
	} finally {
		rl.close();
	}
}

createPost();
