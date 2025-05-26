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

# Testing
deno task test         # Run unit tests
deno task test:integration  # Run integration tests
deno task test:actions # Test GitHub Actions locally

# Content
deno task post         # Create a new blog post
```

## Create a New Post

```bash
deno task post
```

The interactive script will guide you through creating a new blog post with proper frontmatter and metadata.

## Integration Testing

The project includes comprehensive integration tests that verify:

- ✅ **Build Process** - Dependency installation, linting, type checking, and build output
- ✅ **Deploy Functionality** - Preview server and static asset generation
- ✅ **GitHub Actions** - Local workflow simulation using [nektos/act](https://github.com/nektos/act)
- ✅ **Blog Workflow** - Post creation and build integration

### Prerequisites for Integration Tests

1. **Docker** - Required for GitHub Actions simulation
2. **act** - GitHub Actions runner for local testing

Install `act`:
```bash
# macOS
brew install act

# Linux
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows
choco install act-cli
```

### Running Integration Tests

```bash
# Run full integration test suite
deno task test:integration

# Test GitHub Actions workflows only
deno task test:actions

# Manual run with full permissions
deno run --allow-read --allow-write --allow-run --allow-net scripts/integration-test.ts
```

The integration tests will:
1. Verify all prerequisites (Deno, act, Docker)
2. Test the complete build pipeline
3. Simulate GitHub Actions workflows locally
4. Validate blog post creation and rendering
5. Check deployment readiness

## Deployment

Automatically deploys to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.