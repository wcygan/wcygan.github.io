#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Script to automatically fix Mermaid formatting issues in MDsveX files
 * that cause MDsveX parser to inject unwanted </p> tags
 */

import { walk } from '@std/fs';
import { extname } from '@std/path';

const MERMAID_COMPONENT_REGEX = /<MermaidDiagram[\s\S]*?\/>/g;
const DIAGRAM_PROP_REGEX = /diagram=\{`([\s\S]*?)`\}/;

async function fixMermaidFormatting(content: string): Promise<string> {
	return content.replace(MERMAID_COMPONENT_REGEX, (match) => {
		const diagramMatch = match.match(DIAGRAM_PROP_REGEX);
		if (!diagramMatch) return match;

		const diagramContent = diagramMatch[1];
		
		// Remove empty lines that cause MDsveX parsing issues
		// Keep the original indentation structure but remove blank lines
		const cleanedDiagram = diagramContent
			.split('\n')
			.filter(line => line.trim() !== '')
			.join('\n');

		// Replace the diagram content without changing component structure
		const fixedMatch = match
			.replace(/diagram=\{`[\s\S]*?`\}/, `diagram={\`${cleanedDiagram}\`}`);

		return fixedMatch;
	});
}

async function processFile(filePath: string): Promise<boolean> {
	try {
		const content = await Deno.readTextFile(filePath);
		const fixedContent = await fixMermaidFormatting(content);
		
		if (content !== fixedContent) {
			await Deno.writeTextFile(filePath, fixedContent);
			console.log(`✅ Fixed Mermaid formatting in: ${filePath}`);
			return true;
		}
		return false;
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error.message);
		return false;
	}
}

async function main() {
	const postsDir = 'src/posts';
	let filesProcessed = 0;
	let filesFixed = 0;

	console.log('🔍 Scanning for Mermaid formatting issues...');

	for await (const entry of walk(postsDir)) {
		if (entry.isFile && extname(entry.path) === '.md') {
			filesProcessed++;
			if (await processFile(entry.path)) {
				filesFixed++;
			}
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`   Files processed: ${filesProcessed}`);
	console.log(`   Files fixed: ${filesFixed}`);
	
	if (filesFixed > 0) {
		console.log('\n💡 Consider running "pnpm run format" to ensure consistent formatting');
	} else {
		console.log('\n✨ No Mermaid formatting issues found!');
	}
}

if (import.meta.main) {
	await main();
}