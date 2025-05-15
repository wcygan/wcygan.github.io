import { extractYaml } from "jsr:@std/front-matter@1.0.9"; // Use extractYaml from JSR
import { join } from "$std/path/mod.ts";

export interface Post {
  slug: string;
  title: string;
  publishedAt: Date;
  content: string; 
  snippet: string;
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const markdown = await Deno.readTextFile(join("./posts", `${slug}.md`));
    // Use extractYaml directly; it handles YAML parsing.
    const { attrs, body } = extractYaml(markdown as string);

    // Validate required attributes
    // attrs are typically Record<string, unknown>, so we need type assertions or checks
    const title = attrs.title as string;
    const published_at = attrs.published_at as string;
    const snippet = attrs.snippet as string;

    if (!title || !published_at || !snippet) {
      console.error(`Invalid or missing front matter attributes (title, published_at, snippet) in ${slug}.md`);
      return null;
    }

    return {
      slug,
      title: title,
      publishedAt: new Date(published_at),
      content: body,
      snippet: snippet,
    };
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return null;
    }
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getPosts(): Promise<Post[]> {
  const postsDir = Deno.readDir("./posts");
  const promises: Promise<Post | null>[] = [];

  for await (const dirEntry of postsDir) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".md")) {
      const slug = dirEntry.name.replace(".md", "");
      promises.push(getPost(slug));
    }
  }

  const settledPosts = await Promise.all(promises);
  const validPosts = settledPosts.filter(post => post !== null) as Post[];

  validPosts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return validPosts;
}

// The custom parseYaml function is no longer needed as extractYaml handles it.