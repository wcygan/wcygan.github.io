#!/usr/bin/env deno run --allow-all

import { $ } from "@david/dax@0.42.0";
import { cyan, green, red, yellow } from "@std/fmt@1.0.0/colors";

console.log(cyan("🧪 Running Mermaid Integration Tests"));
console.log(yellow("This will build the site and run Puppeteer tests\n"));

try {
  // First, ensure the site is built
  console.log(cyan("📦 Building site..."));
  await $`pnpm run build`.quiet();
  console.log(green("✓ Build complete"));

  // Run the integration tests
  console.log(cyan("\n🚀 Running integration tests..."));
  await $`pnpm run test:integration`;
  
  console.log(green("\n✨ All integration tests passed!"));
} catch (error) {
  console.error(red("\n❌ Integration tests failed:"));
  console.error(error);
  Deno.exit(1);
}