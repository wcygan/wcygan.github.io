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
  console.log(`[getPost] Attempting to read: ./posts/${slug}.md`);
  try {
    const markdown = await Deno.readTextFile(join("./posts", `${slug}.md`));
    const { attrs, body } = extractYaml(markdown as string);
    console.log(`[getPost] For slug '${slug}', extracted attrs:`, attrs);

    if (typeof attrs !== "object" || attrs === null) {
      console.error(
        `[getPost] Invalid front matter type in ${slug}.md: not an object. Attrs:`,
        attrs,
      );
      return null;
    }

    const title = (attrs as Record<string, unknown>).title;
    const raw_published_at = (attrs as Record<string, unknown>).published_at;
    const snippet = (attrs as Record<string, unknown>).snippet;

    let publishedAtDate: Date;

    if (raw_published_at instanceof Date) {
      publishedAtDate = raw_published_at;
    } else if (typeof raw_published_at === "string") {
      publishedAtDate = new Date(raw_published_at);
    } else {
      console.error(
        `[getPost] Invalid type for published_at in ${slug}.md. Expected Date object or ISO string. Got:`,
        typeof raw_published_at,
      );
      return null;
    }

    if (isNaN(publishedAtDate.getTime())) {
      console.error(
        `[getPost] Invalid date for published_at in ${slug}.md after parsing. Original value:`,
        raw_published_at,
      );
      return null;
    }

    if (typeof title !== "string" || typeof snippet !== "string") {
      console.error(
        `[getPost] Missing or invalid type for front matter attributes (title, snippet are required strings) in ${slug}.md. Title: ${typeof title}, Snippet: ${typeof snippet}`,
      );
      return null;
    }
    console.log(`[getPost] Successfully parsed ${slug}.md`);
    return {
      slug,
      title: title,
      publishedAt: publishedAtDate,
      content: body,
      snippet: snippet,
    };
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.warn(
        `[getPost] File not found for slug '${slug}': ./posts/${slug}.md`,
      );
      return null;
    }
    console.error(`[getPost] Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getPosts(): Promise<Post[]> {
  console.log("[getPosts] Reading posts directory...");
  const postsDir = Deno.readDir("./posts");
  const promises: Promise<Post | null>[] = [];
  let foundMdFiles = false;

  for await (const dirEntry of postsDir) {
    console.log(
      `[getPosts] Found entry: ${dirEntry.name}, isFile: ${dirEntry.isFile}`,
    );
    if (dirEntry.isFile && dirEntry.name.endsWith(".md")) {
      foundMdFiles = true;
      const slug = dirEntry.name.replace(".md", "");
      console.log(`[getPosts] Adding slug '${slug}' to promises.`);
      promises.push(getPost(slug));
    }
  }

  if (!foundMdFiles) {
    console.warn("[getPosts] No .md files found in ./posts directory.");
  }

  const settledPosts = await Promise.all(promises);
  console.log(
    "[getPosts] Settled posts (includes nulls):",
    settledPosts.map((p) => p ? p.slug : null),
  );

  const validPosts = settledPosts.filter((post) => post !== null) as Post[];
  console.log(
    "[getPosts] Valid posts (after filtering nulls):",
    validPosts.map((p) => p.slug),
  );

  validPosts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  console.log(
    "[getPosts] Sorted valid posts slugs:",
    validPosts.map((p) => p.slug),
  );
  return validPosts;
}

// The custom parseYaml function is no longer needed as extractYaml handles it.
