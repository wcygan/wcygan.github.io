# wcygan.github.io

This is the source code for my personal website, [wcygan.github.io](https://wcygan.github.io).

## Tech Stack

Modern web development stack using minimal files by leveraging Deno:

- **Deno** - JavaScript runtime and package manager
- **Vite** - Build tool and dev server
- **Svelte** - Framework for building interfaces  
- **SvelteKit** - Full-stack web app framework with routing
- **TailwindCSS** - Utility-first CSS framework
- **MDSvex** - Markdown processor with Svelte component support
- **Shiki** - Syntax highlighting with copy buttons

## Quickstart

```bash
# Development server (local only)
deno task dev

# Development server with external access
deno task dev:network

# or use the script (includes network access)
./scripts/develop.sh
```

The `dev:network` task includes `--host` for access from other devices and `--port 3000` for a consistent port.

## Available Commands

```bash
# Development
deno task dev          # Start dev server (local only)
deno task dev:network  # Start dev server with network access
deno task build        # Build for production
deno task preview      # Preview built site

# Quality
deno task format       # Format code with Deno
deno task lint         # Lint code
deno task check        # Type check

# Content
deno task post         # Create a new blog post
```

## Create a New Post

```bash
deno task post
```

The interactive script will guide you through creating a new blog post with proper frontmatter and metadata.

## Deployment

Automatically deploys to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.