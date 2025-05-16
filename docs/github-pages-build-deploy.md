# GitHub Pages Build and Deploy

This document outlines the GitHub Actions workflow for building a Deno Fresh
static site and deploying it to Cloudflare Pages.

## Core Process

The deployment uses a GitHub Actions workflow with these main steps:

1. **Checkout Code**: Fetches the latest code.
2. **Setup Deno**: Installs the Deno runtime.
3. **Build Fresh Site**: Runs `deno task build` to generate static assets into
   the `./build` directory.
4. **Publish to Cloudflare Pages**: Deploys the `./build` directory to
   Cloudflare Pages using Wrangler.
   - This step uses the current branch name to differentiate between production
     and preview deployments.
   - It tells Wrangler the build is already complete (`--commit-dirty=true`).

## Key Configuration & Logic

- **Control via GitHub Actions**: The entire build and deploy process is managed
  by a GitHub Actions workflow, providing control over the Deno environment and
  build steps.
- **Wrangler for Deployment**: The `cloudflare/wrangler-action` directly uploads
  the pre-built site from the `./build` directory.
- **Secrets & Variables**: GitHub repository secrets (like
  `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) and variables (like
  `CLOUDFLARE_PAGES_PROJECT`) are used for credentials and project
  configuration.
- **Optimized Deployment**: The `--commit-dirty=true` flag with Wrangler ensures
  that Cloudflare Pages doesn't try to rebuild the site.
- **Branch-based Deploys**: The workflow automatically handles production
  (`main` branch) and preview (other branches) deployments based on the Git
  branch.
- **Cloudflare Settings**: It's recommended to disable automatic builds in
  Cloudflare Pages settings to avoid conflicts with this workflow.

This setup bypasses Cloudflare's native build system, offering more flexibility
for Deno projects.

## Configuration

### Repository Setup

- **Secrets**:
  - `CLOUDFLARE_API_TOKEN`: A Cloudflare API token with "Cloudflare Pages -
    Edit" permissions.
  - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID.
- **Variables**:
  - `CLOUDFLARE_PAGES_PROJECT`: The name of your Cloudflare Pages project.

### Workflow File (`.github/workflows/deploy.yml`)

- **Trigger**: The workflow is triggered on a `push` to the `main` branch. This
  can be customized.
- **Permissions**:
  - `contents: read`: Required to check out the repository.
  - `deployments: write`: Required for the `wrangler-action` to create GitHub
    Deployments.

## Cloudflare Pages Configuration (Recommended)

- **Disable Automatic Deployments**: In your Cloudflare Pages project settings,
  under "Builds & deployments" > "Branch build controls", it's recommended to
  disable "Automatic deployments" and set "Preview branch" to "None". This
  prevents Cloudflare from attempting its own build after the GitHub Action has
  already deployed the site via Wrangler.

## Key Logic

- The workflow leverages Deno for the build process and Wrangler (via
  `cloudflare/wrangler-action`) for direct uploads to Cloudflare Pages.
- This approach gives full control over the build environment and dependencies
  using Deno, rather than relying on Cloudflare's build system which has more
  limited Deno support.
- Secrets and variables in GitHub Actions are used to securely store and access
  Cloudflare credentials and project information.
- The `--commit-dirty=true` flag in the `pages deploy` command optimizes the
  deployment by indicating that the provided directory is already built and
  ready for upload.
- The use of `${{ github.ref_name }}` for the `--branch` parameter allows for
  automatic distinction between production and preview deployments based on the
  branch being pushed.
