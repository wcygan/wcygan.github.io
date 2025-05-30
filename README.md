# wcygan.github.io

This is the source code for my personal website, [wcygan.github.io](https://wcygan.github.io).

[![CI](https://github.com/wcygan/wcygan.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/wcygan/wcygan.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/deploy.yml)
[![Security](https://github.com/wcygan/wcygan.github.io/actions/workflows/security.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/security.yml)
[![Performance](https://github.com/wcygan/wcygan.github.io/actions/workflows/performance.yml/badge.svg)](https://github.com/wcygan/wcygan.github.io/actions/workflows/performance.yml)

Managed on https://dash.cloudflare.com/

## Prerequisites

- [Deno](https://deno.land/) v1.x or v2.x (latest stable recommended)

## Quickstart

```bash
deno task dev --open

# or
./scripts/develop.sh
```

## Create a new post

```bash
deno task post
```

## CI Tasks (Local Execution)

To run checks similar to those in CI:

```bash
deno task check  # Type checking
deno task lint   # Linting
deno task format --check # Formatting check
deno task test   # Run tests
deno task build  # Build the project
```
