# Personal GitHub Pages with Docusaurus Implementation Plan

## Project Overview

This plan outlines the complete setup of a personal GitHub Pages website (wcygan.github.io) using Docusaurus, following modern 2025 best practices with GitHub Actions deployment.

## Phase 1: Foundation Setup ✅

### 1.1 Repository Initialization ✅
- [x] Delete existing SvelteKit-based wcygan.github.io
- [x] Create new directory: `~/Development/wcygan.github.io`
- [x] Initialize git repository
- [x] Create this PLAN.md file

### 1.2 Initial Commit ⏳
- [ ] Make initial commit with PLAN.md
- [ ] Set up basic project structure

## Phase 2: Docusaurus Installation & Configuration

### 2.1 Install Docusaurus
```bash
cd ~/Development/wcygan.github.io
npx create-docusaurus@latest . classic --typescript
```

### 2.2 Configure docusaurus.config.js
Critical settings for personal GitHub Pages:
```javascript
export default {
  title: 'Will Cygan',
  tagline: 'Software Engineer & Backend Developer',
  favicon: 'img/favicon.ico',
  
  // CRITICAL: Personal GitHub Pages settings
  url: 'https://wcygan.github.io',
  baseUrl: '/',  // MUST be '/' for personal pages
  
  // GitHub deployment settings
  organizationName: 'wcygan',
  projectName: 'wcygan.github.io',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  
  // Internationalization (if needed later)
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/wcygan/wcygan.github.io/tree/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/wcygan/wcygan.github.io/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Will Cygan',
      logo: {
        alt: 'Will Cygan Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/wcygan',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/wcygan',
            },
            {
              label: 'LinkedIn',
              href: 'https://linkedin.com/in/will-cygan',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Will Cygan. Built with Docusaurus.`,
    },
  },
};
```

### 2.3 Add Required Static Files
```bash
# Prevent Jekyll processing
touch static/.nojekyll

# Add any custom static assets
mkdir -p static/img
```

## Phase 3: GitHub Actions Deployment

### 3.1 Create GitHub Actions Workflow
File: `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build website
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./build
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3.2 Optional: Test Workflow
File: `.github/workflows/test-deploy.yml`
```yaml
name: Test deployment

on:
  pull_request:
    branches: [main]

jobs:
  test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

## Phase 4: Development Environment Setup

### 4.1 Create deno.json for Lifecycle Management
```json
{
  "tasks": {
    "dev": "npm run start",
    "build": "npm run build",
    "test": "npm run test",
    "lint": "npm run lint",
    "fmt": "npm run format",
    "check": "npm run typecheck || echo 'No typecheck script available'",
    "preview": "npm run serve",
    "init": "npm install",
    "up": "deno task dev",
    "down": "echo 'No down task for static site'",
    "ci": "npm ci && npm run build && npm run test"
  },
  "imports": {
    "@std/fs": "jsr:@std/fs@^1.0.17"
  }
}
```

### 4.2 Update package.json Scripts
Ensure these scripts exist:
```json
{
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids",
    "typecheck": "tsc"
  }
}
```

## Phase 5: Content & Customization

### 5.1 Homepage Customization
Edit `src/pages/index.tsx`:
- Update hero section with personal branding
- Add links to key sections (docs, blog, projects)
- Include brief bio/introduction

### 5.2 Initial Content Structure
```
src/
├── pages/
│   ├── index.tsx          # Homepage
│   ├── about.md           # About page
│   └── projects.md        # Projects showcase
├── components/
│   └── HomepageFeatures/  # Custom components
docs/
├── intro.md              # Getting started
├── projects/             # Project documentation
└── tutorials/            # Technical tutorials
blog/
├── 2025-01-01-welcome.md # Welcome post
└── authors.yml           # Author information
```

### 5.3 Styling Customization
Edit `src/css/custom.css`:
- Update CSS variables for color scheme
- Add custom fonts if desired
- Responsive design improvements

## Phase 6: GitHub Repository Setup

### 6.1 Create Repository on GitHub
1. Go to GitHub.com
2. Create new repository named exactly `wcygan.github.io`
3. Do NOT initialize with README, .gitignore, or license

### 6.2 Configure Repository Settings
1. Go to Settings → Pages
2. Set Source to "GitHub Actions"
3. Verify deployment permissions are enabled

### 6.3 Push Local Repository
```bash
git remote add origin https://github.com/wcygan/wcygan.github.io.git
git add .
git commit -m "Initial Docusaurus setup with GitHub Actions deployment"
git push -u origin main
```

## Phase 7: Testing & Verification

### 7.1 Local Development Testing
```bash
deno task dev  # Start development server
deno task build  # Test build process
deno task preview  # Preview built site
```

### 7.2 Deployment Testing
1. Push changes to main branch
2. Monitor GitHub Actions workflow
3. Verify deployment at https://wcygan.github.io
4. Test all navigation and links

### 7.3 Content Verification
- [ ] Homepage loads correctly
- [ ] Blog section works
- [ ] Docs section navigates properly
- [ ] Mobile responsiveness
- [ ] Social links work

## Phase 8: Documentation & Maintenance

### 8.1 Create README.md
```markdown
# wcygan.github.io

Personal website built with Docusaurus and deployed to GitHub Pages.

## Quick Start

```bash
# Clone repository
git clone https://github.com/wcygan/wcygan.github.io.git
cd wcygan.github.io

# Install dependencies
deno task init

# Start development server
deno task dev

# Build for production
deno task build
```

## Deployment

Site automatically deploys via GitHub Actions when changes are pushed to main branch.

## Technology Stack

- **Docusaurus 3.x** - Static site generator
- **TypeScript** - Type safety
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Hosting

## Local Development

Visit http://localhost:3000 during development.
```

### 8.2 Create CLAUDE.md
```markdown
# CLAUDE.md

This file provides guidance for Claude Code when working with this Docusaurus site.

## Essential Commands

```bash
deno task dev     # Start development server
deno task build   # Build for production
deno task test    # Run tests
deno task lint    # Lint code
```

## Architecture

- **Docusaurus 3.x** with TypeScript
- **GitHub Actions** deployment
- **Personal GitHub Pages** (baseUrl: '/')
- **Markdown** content with MDX support

## Key Files

- `docusaurus.config.js` - Site configuration
- `sidebars.ts` - Documentation sidebar
- `src/pages/` - Custom pages
- `docs/` - Documentation content
- `blog/` - Blog posts
- `static/` - Static assets

## Development Notes

- Always use `baseUrl: '/'` for personal GitHub Pages
- Build output goes to `./build` directory
- GitHub Actions handles deployment automatically
- Add `.nojekyll` file to prevent Jekyll processing
```

## Phase 9: Future Enhancements

### 9.1 Content Additions
- [ ] Technical blog posts
- [ ] Project showcases
- [ ] Resume/CV page
- [ ] Contact form

### 9.2 Feature Enhancements
- [ ] Search functionality
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] RSS feed configuration

### 9.3 Advanced Configuration
- [ ] Custom domain setup (if desired)
- [ ] PWA configuration
- [ ] Performance optimizations
- [ ] Internationalization setup

## Troubleshooting

### Common Issues

1. **404 Errors**: Check `baseUrl` is set to `/` for personal pages
2. **Build Failures**: Ensure Node.js 18+ and all dependencies installed
3. **Deployment Issues**: Verify GitHub Pages source is set to "GitHub Actions"
4. **Styling Problems**: Check CSS imports and custom.css file

### Debug Commands

```bash
# Check build output
deno task build && ls -la build/

# Test deployment locally
deno task preview

# Check GitHub Actions logs
# Go to repository → Actions tab → View latest run
```

## Completion Checklist

### Phase 1: Foundation ✅
- [x] Repository created and initialized
- [x] PLAN.md created
- [x] Initial commit made

### Phase 2: Docusaurus Setup
- [ ] Docusaurus installed with TypeScript
- [ ] Configuration updated for personal pages
- [ ] Static files added (.nojekyll)

### Phase 3: GitHub Actions
- [ ] Deploy workflow created
- [ ] Test workflow created (optional)
- [ ] Workflows tested and verified

### Phase 4: Development Environment
- [ ] deno.json created with lifecycle tasks
- [ ] package.json scripts verified
- [ ] Local development tested

### Phase 5: Content
- [ ] Homepage customized
- [ ] Initial content structure created
- [ ] Styling customized

### Phase 6: GitHub Setup
- [ ] Repository created on GitHub
- [ ] GitHub Pages configured
- [ ] Local repository pushed

### Phase 7: Testing
- [ ] Local development verified
- [ ] Deployment tested
- [ ] Content verified

### Phase 8: Documentation
- [ ] README.md created
- [ ] CLAUDE.md created
- [ ] Documentation complete

---

**Next Steps**: Execute Phase 2 - Docusaurus installation and configuration.