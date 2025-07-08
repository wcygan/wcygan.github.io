# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm start           # Start development server at http://localhost:3000
npm run build       # Build for production (outputs to ./build/)
npm run serve       # Serve built site locally
npm run typecheck   # Run TypeScript type checking

# Content Management
npm run clear             # Clear Docusaurus cache
npm run write-translations  # Generate translation files
npm run write-heading-ids   # Add heading IDs for markdown

# Legacy yarn commands (from README.md)
yarn start          # Alternative to npm start
yarn build          # Alternative to npm run build
```

## Architecture Overview

This is a **personal GitHub Pages site** (wcygan.github.io) built with **Docusaurus 3.8.1 + TypeScript**, following a specific configuration pattern for personal pages deployment.

### Core Configuration Pattern

**Critical**: This site uses `baseUrl: '/'` in `docusaurus.config.ts` because it's a **personal GitHub Pages site** (username.github.io), not a project site. This is different from typical Docusaurus deployments that use `baseUrl: '/project-name/'`.

Key configuration in `docusaurus.config.ts`:
```typescript
url: 'https://wcygan.github.io',
baseUrl: '/',  // MUST be '/' for personal pages
organizationName: 'wcygan',
projectName: 'wcygan.github.io',
trailingSlash: false,
```

### Deployment Architecture

**GitHub Actions Deployment**: Uses modern 2024-2025 workflow pattern with separate build/deploy jobs:
- `.github/workflows/deploy.yml` - Production deployment (triggers on main branch push)
- `.github/workflows/test-deploy.yml` - PR testing (build validation only)

**Action versions**: configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v4 (future-proofed for 2025 deprecations)

### Content Structure

```
docs/           # Documentation pages (sidebars.ts controls navigation)
blog/           # Blog posts with authors.yml and tags.yml
src/pages/      # Custom React pages (index.tsx = homepage)
src/components/ # Reusable React components
static/         # Static assets (contains .nojekyll for GitHub Pages)
```

**Important**: `static/.nojekyll` file prevents Jekyll processing on GitHub Pages - required for Docusaurus deployment.

### TypeScript Integration

- Full TypeScript support with `tsconfig.json` extending `@docusaurus/tsconfig`
- Config file is `docusaurus.config.ts` (not .js)
- All React components use `.tsx` extensions
- Type checking available via `npm run typecheck`

## Development Notes

**Node.js Requirement**: Requires Node.js 18+ (specified in package.json engines)

**Content Editing**: 
- Docs use MDX format with edit links pointing to GitHub repo
- Blog posts support MDX with author attribution system
- Homepage customization via `src/pages/index.tsx` and `src/components/HomepageFeatures/`

**Styling**: Uses CSS modules pattern (`styles.module.css`) with custom CSS in `src/css/custom.css`

## Implementation Context

This site was built following a comprehensive implementation plan (see PLAN.md) with phases for Docusaurus setup, GitHub Actions deployment, and content customization. The current state represents completion of Phases 1-3 (foundation, Docusaurus setup, GitHub Actions).