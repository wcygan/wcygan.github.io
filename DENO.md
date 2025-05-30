Based on the codebase analysis, here are the precise changes needed to migrate from pnpm to Deno:

## 1. Replace `package.json` with `deno.json`

Create a new `deno.json` file:

```json
{
  "tasks": {
    "dev": "deno task vite:dev",
    "vite:dev": "deno run -A npm:vite dev",
    "build": "deno task vite:build",
    "vite:build": "deno run -A npm:vite build",
    "preview": "deno run -A npm:vite preview",
    "check": "deno run -A npm:svelte-kit sync && deno task svelte-check",
    "svelte-check": "deno run -A npm:svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "deno run -A npm:svelte-kit sync && deno run -A npm:svelte-check --tsconfig ./tsconfig.json --watch",
    "format": "deno run -A npm:prettier --write .",
    "lint": "deno run -A npm:prettier --check . && deno run -A npm:eslint .",
    "test:unit": "deno run -A npm:vitest",
    "test": "deno task test:unit -- --run",
    "post": "deno run --allow-read --allow-write scripts/new-post.js",
    "ci:test": "deno run --allow-all scripts/test-github-actions.ts",
    "ci:test:quick": "deno run --allow-all scripts/quick-test.ts",
    "ci:test:ci": "deno run --allow-all scripts/test-github-actions.ts --workflow ci",
    "ci:test:verbose": "deno run --allow-all scripts/test-github-actions.ts --verbose",
    "ci:check": "deno run --allow-all scripts/test-github-actions.ts --dry-run",
    "ci:help": "deno run --allow-all scripts/test-github-actions.ts --help"
  },
  "imports": {
    "@sveltejs/adapter-static": "npm:@sveltejs/adapter-static@^3.0.8",
    "@sveltejs/kit": "npm:@sveltejs/kit@^2.15.2",
    "@sveltejs/vite-plugin-svelte": "npm:@sveltejs/vite-plugin-svelte@^5.0.3",
    "@tailwindcss/typography": "npm:@tailwindcss/typography@^0.5.16",
    "autoprefixer": "npm:autoprefixer@^10.4.20",
    "eslint": "npm:eslint@^9.17.0",
    "eslint-config-prettier": "npm:eslint-config-prettier@^9.1.0",
    "eslint-plugin-svelte": "npm:eslint-plugin-svelte@^2.46.1",
    "@eslint/compat": "npm:@eslint/compat@^1.2.4",
    "globals": "npm:globals@^15.14.0",
    "mdsvex": "npm:mdsvex@^0.12.3",
    "prettier": "npm:prettier@^3.4.2",
    "prettier-plugin-svelte": "npm:prettier-plugin-svelte@^3.3.2",
    "prettier-plugin-tailwindcss": "npm:prettier-plugin-tailwindcss@^0.6.9",
    "shiki": "npm:shiki@^1.26.1",
    "shiki-transformer-copy-button": "npm:shiki-transformer-copy-button@^0.0.3",
    "svelte": "npm:svelte@^5.16.6",
    "svelte-check": "npm:svelte-check@^4.1.1",
    "tailwindcss": "npm:tailwindcss@^3.4.17",
    "typescript": "npm:typescript@^5.7.2",
    "typescript-eslint": "npm:typescript-eslint@^8.19.1",
    "vite": "npm:vite@^6.0.7",
    "vitest": "npm:vitest@^2.1.8"
  },
  "nodeModulesDir": true,
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es2022"]
  }
}
```

## 2. Update GitHub Actions Workflows

### Update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Cache Deno dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.deno
            ~/.cache/deno
            node_modules
          key: ${{ runner.os }}-deno-${{ hashFiles('deno.lock') }}
          restore-keys: |
            ${{ runner.os }}-deno-

      - name: Install dependencies
        run: deno install

      - name: Format check
        run: deno task format --check

      - name: Lint
        run: deno task lint

      - name: Type check
        run: deno task check

      - name: Run tests
        run: deno task test

      - name: Build
        run: deno task build

      - name: Upload build artifacts
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: build/
          retention-days: 1
```

### Update `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Cache Deno dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.deno
            ~/.cache/deno
            node_modules
          key: ${{ runner.os }}-deno-${{ hashFiles('deno.lock') }}
          restore-keys: |
            ${{ runner.os }}-deno-

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: sveltekit

      - name: Install dependencies
        run: deno install

      - name: Build
        run: deno task build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build/

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Update `.github/workflows/security.yml`:

```yaml
name: Security & Dependencies

on:
  schedule:
    - cron: '0 9 * * 1'
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Cache Deno dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.deno
            ~/.cache/deno
            node_modules
          key: ${{ runner.os }}-deno-${{ hashFiles('deno.lock') }}
          restore-keys: |
            ${{ runner.os }}-deno-

      - name: Install dependencies
        run: deno install

      - name: Check for outdated dependencies
        run: |
          echo "Checking for outdated dependencies..."
          deno run -A jsr:@deno/outdated || true
```

### Update `.github/workflows/performance.yml`:

```yaml
name: Performance & Bundle Analysis

on:
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  bundle-analysis:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Cache Deno dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.deno
            ~/.cache/deno
            node_modules
          key: ${{ runner.os }}-deno-${{ hashFiles('deno.lock') }}
          restore-keys: |
            ${{ runner.os }}-deno-

      - name: Install dependencies
        run: deno install

      - name: Build and analyze bundle
        run: |
          deno task build
          echo "Build completed successfully"

      - name: Check bundle size
        run: |
          echo "Checking bundle sizes..."
          find build -name "*.js" -exec ls -lh {} \; | head -10
          find build -name "*.css" -exec ls -lh {} \; | head -5

      - name: Build summary
        run: |
          echo "📊 Build Summary"
          echo "================"
          echo "Total build size:"
          du -sh build/
          echo ""
          echo "JavaScript files:"
          js_count=$(find build -name "*.js" | wc -l)
          echo "Count: $js_count"
          if [ $js_count -gt 0 ]; then
            find build -name "*.js" -exec du -ch {} + | tail -1
          else
            echo "No JavaScript files found"
          fi
          echo ""
          echo "CSS files:"
          css_count=$(find build -name "*.css" | wc -l)
          echo "Count: $css_count"
          if [ $css_count -gt 0 ]; then
            find build -name "*.css" -exec du -ch {} + | tail -1
          else
            echo "No CSS files found"
          fi
          echo ""
          echo "Largest files:"
          find build -type f -exec ls -lh {} \; | sort -k5 -hr | head -5
```

## 3. Update Scripts

### Update `scripts/develop.sh`:

```bash
#!/bin/bash
deno task dev --open
```

### Update `scripts/new-post.js`:

Add Deno shebang at the top:
```javascript
#!/usr/bin/env -S deno run --allow-read --allow-write
```

## 4. Update Documentation

### Update `README.md`:

```markdown
# wcygan.github.io

This is the source code for my personal website, [wcygan.github.io](https://wcygan.github.io).

[![CI](https://github.com/wcygan/wcygan.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/wcygan/wcygan.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/deploy.yml)
[![Security](https://github.com/wcygan/wcygan.github.io/actions/workflows/security.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/security.yml)
[![Performance](https://github.com/wcygan/wcygan.github.io/actions/workflows/performance.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/performance.yml)

Managed on https://dash.cloudflare.com/

## Prerequisites

- [Deno](https://deno.land/) v2.x or higher

## Quickstart

```bash
deno task dev

# or
./scripts/develop.sh
```

## Create a new post

```bash
deno task post
```

## CI Testing

```bash
deno task ci:test
```

```bash
deno task ci:test:quick
```

## Development

This project uses Deno as the runtime and package manager. All npm dependencies are accessed through Deno's npm compatibility layer.

### Install dependencies
```bash
deno install
```

### Run development server
```bash
deno task dev
```

### Build for production
```bash
deno task build
```

### Run tests
```bash
deno task test
```
```

## 5. Update `.gitignore`

Add Deno-specific entries:
```gitignore
# Existing entries...

# Deno
.deno
node_modules/
```

## 6. Remove pnpm-specific files

Delete these files:
- `package.json`
- `pnpm-lock.yaml`
- `.npmrc`

## 7. Update Development Workflow Documentation

Update `.cursor/rules/development-workflow.mdc`:

```markdown
---
description: 
globs: 
alwaysApply: true
---
# Development Workflow Standards

## Local Development
- Start dev server: `deno task dev` or use [develop.sh](mdc:scripts/develop.sh)
- Hot reload available for all Svelte components
- Test with `deno task test` (Vitest configured)
- Linting: `deno task lint` (ESLint + Prettier)
- Formatting: `deno task format`

## Content Creation
- New blog posts: `deno task post` - runs [new-post.js](mdc:scripts/new-post.js)
- Interactive script prompts for title, description
- Auto-generates slug and frontmatter
- Creates markdown file in `src/posts/`

## Build Process
- Build command: `deno task build` 
- Outputs static files to `./build` directory
- Uses SvelteKit adapter-static for GitHub Pages
- Preview built site: `deno task preview`

## Deployment Pipeline
- Auto-deploys on push to `main` branch
- GitHub Actions workflow: [deploy.yml](mdc:.github/workflows/deploy.yml)
- Process: Install deps → Build → Upload artifacts → Deploy to Pages
- Static site generation with prerendering enabled

## Package Management
- Uses Deno as runtime and package manager
- Lock file: [deno.lock](mdc:deno.lock)
- Dependencies defined in: [deno.json](mdc:deno.json)
- npm packages accessed via Deno's npm compatibility

## Configuration Files
- Deno config: [deno.json](mdc:deno.json)
- SvelteKit: [svelte.config.js](mdc:svelte.config.js)
- Vite: [vite.config.ts](mdc:vite.config.ts)
- TypeScript: [tsconfig.json](mdc:tsconfig.json)
- ESLint: [eslint.config.js](mdc:eslint.config.js)
```

## Summary

The key changes are:
1. **Replace pnpm with Deno** in all GitHub Actions workflows
2. **Create `deno.json`** with tasks and imports mapping
3. **Enable `nodeModulesDir`** in deno.json for Vite compatibility
4. **Update scripts** to use Deno instead of pnpm
5. **Update documentation** to reflect Deno usage
6. **Remove pnpm-specific files**

The migration preserves all existing functionality while leveraging Deno's built-in tooling and npm compatibility layer. Vite continues to handle the build process, with Deno serving as the runtime and dependency manager.