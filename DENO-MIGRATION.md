# Deno Migration Plan

**Note: Mark tasks with ✅ when complete**

This document outlines a sequential, dependency-aware migration from pnpm to Deno.

## Task 1: Create deno.json

- Description: Replace `package.json` by creating a `deno.json` in the project root.
- Actions:
  - Define `tasks` section (`dev`, `build`, `preview`, `check`, `format`, `lint`, `test`, `post`, CI tasks).
  - Map npm dependencies under `imports`.
  - Set `"nodeModulesDir": true` and appropriate `compilerOptions`.
- Dependencies: None.

## Task 2: Update .gitignore

- Description: Ignore Deno and legacy npm artifacts.
- Actions:
  - Add entries: `.deno/`, `node_modules/`.
- Dependencies: Task 1.

## Task 3: Update scripts

- Description: Switch shell scripts to use Deno tasks.
- Actions:
  - Modify `scripts/develop.sh` to `deno task dev --open`.
  - Add Deno shebang to `scripts/new-post.js`: `#!/usr/bin/env -S deno run --allow-read --allow-write`.
- Dependencies: Task 1.

## Task 4: Remove pnpm-specific files

- Description: Clean up old package management files.
- Actions:
  - Delete `package.json`, `pnpm-lock.yaml`, `.npmrc`.
- Dependencies: Task 1, Task 2, Task 3.

## Task 5: Update GitHub Actions workflows

- Description: Migrate CI/CD workflows to Deno.
- Actions:
  - For each workflow (`ci.yml`, `deploy.yml`, `security.yml`, `performance.yml`):
    - Add `Setup Deno` step.
    - Use `deno install` and `deno task ...` instead of pnpm commands.
    - Configure caching for Deno (`~/.deno`, `~/.cache/deno`, `node_modules`).
- Dependencies: Task 1, Task 2, Task 3, Task 4.

## Task 6: Update documentation

- Description: Reflect Deno usage in `README.md`.
- Actions:
  - Update prerequisites to require Deno v2.x+.
  - Replace npm/pnpm commands with `deno task` commands.
  - Update badges to point to Deno-based workflows.
- Dependencies: Task 5.

## Task 7: Update development workflow documentation

- Description: Update internal workflow docs to describe Deno-based processes.
- Actions:
  - Edit `.cursor/rules/development-workflow.mdc` to list Deno tasks.
- Dependencies: Task 6.
