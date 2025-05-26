#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-net

/**
 * Integration test script for wcygan.github.io
 * Tests build, deploy, and GitHub Actions workflow using nektos/act
 * 
 * Usage: deno run --allow-read --allow-write --allow-run --allow-net scripts/integration-test.ts
 */

import { join, dirname } from "@std/path";
import { exists } from "@std/fs/exists";

interface TestResult {
	name: string;
	success: boolean;
	duration: number;
	error?: string;
	output?: string;
}

class IntegrationTester {
	private results: TestResult[] = [];
	private startTime = Date.now();

	constructor(private projectRoot: string) {}

	async runCommand(cmd: string[], cwd?: string): Promise<{success: boolean, output: string}> {
		try {
			const command = new Deno.Command(cmd[0], {
				args: cmd.slice(1),
				cwd: cwd || this.projectRoot,
				stdout: "piped",
				stderr: "piped",
			});

			const result = await command.output();
			const output = new TextDecoder().decode(result.stdout) + 
			               new TextDecoder().decode(result.stderr);
			
			return {
				success: result.success,
				output: output.trim()
			};
		} catch (error) {
			return {
				success: false,
				output: error instanceof Error ? error.message : String(error)
			};
		}
	}

	async test(name: string, testFn: () => Promise<void>): Promise<void> {
		const start = Date.now();
		console.log(`🧪 Running: ${name}`);
		
		try {
			await testFn();
			const duration = Date.now() - start;
			this.results.push({ name, success: true, duration });
			console.log(`✅ ${name} (${duration}ms)`);
		} catch (error) {
			const duration = Date.now() - start;
			const errorMsg = error instanceof Error ? error.message : String(error);
			this.results.push({ name, success: false, duration, error: errorMsg });
			console.log(`❌ ${name} (${duration}ms): ${errorMsg}`);
		}
	}

	async checkPrerequisites(): Promise<void> {
		await this.test("Check Deno installation", async () => {
			const result = await this.runCommand(["deno", "--version"]);
			if (!result.success) {
				throw new Error("Deno is not installed or not in PATH");
			}
		});

		await this.test("Check act installation", async () => {
			const result = await this.runCommand(["act", "--version"]);
			if (!result.success) {
				throw new Error(`act is not installed. Install from https://github.com/nektos/act
Installation options:
  - macOS: brew install act
  - Linux: curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
  - Windows: choco install act-cli`);
			}
		});

		await this.test("Check Docker availability", async () => {
			const result = await this.runCommand(["docker", "version"]);
			if (!result.success) {
				throw new Error("Docker is not running. act requires Docker to run workflows.");
			}
		});
	}

	async testBuild(): Promise<void> {
		await this.test("Clean previous build", async () => {
			const buildDir = join(this.projectRoot, "build");
			try {
				await Deno.remove(buildDir, { recursive: true });
			} catch {
				// Ignore if directory doesn't exist
			}
		});

		await this.test("Install dependencies", async () => {
			const result = await this.runCommand(["deno", "install", "--allow-scripts"]);
			if (!result.success) {
				throw new Error(`Failed to install dependencies: ${result.output}`);
			}
		});

		await this.test("Deno format check", async () => {
			const result = await this.runCommand(["deno", "fmt", "--check"]);
			if (!result.success) {
				throw new Error(`Code formatting issues found: ${result.output}`);
			}
		});

		await this.test("Deno lint check", async () => {
			const result = await this.runCommand(["deno", "lint"]);
			if (!result.success) {
				throw new Error(`Lint issues found: ${result.output}`);
			}
		});

		await this.test("SvelteKit type check", async () => {
			const result = await this.runCommand(["deno", "task", "check"]);
			if (!result.success) {
				throw new Error(`Type check failed: ${result.output}`);
			}
		});

		await this.test("Build project", async () => {
			const result = await this.runCommand(["deno", "task", "build"]);
			if (!result.success) {
				throw new Error(`Build failed: ${result.output}`);
			}
		});

		await this.test("Verify build output", async () => {
			const buildDir = join(this.projectRoot, "build");
			const buildExists = await exists(buildDir);
			if (!buildExists) {
				throw new Error("Build directory was not created");
			}

			// Check for essential files
			const essentialFiles = [
				"index.html",
				"_app/immutable", // SvelteKit assets directory
			];

			for (const file of essentialFiles) {
				const filePath = join(buildDir, file);
				const fileExists = await exists(filePath);
				if (!fileExists) {
					throw new Error(`Essential build file missing: ${file}`);
				}
			}

			// Check for blog posts (if any exist)
			const postsDir = join(this.projectRoot, "src", "posts");
			const postsExist = await exists(postsDir);
			if (postsExist) {
				// Check that blog routes were generated
				const blogDir = join(buildDir, "blog");
				const blogExists = await exists(blogDir);
				if (!blogExists) {
					throw new Error("Blog routes were not generated in build");
				}
			}
		});
	}

	async testDeploy(): Promise<void> {
		await this.test("Test preview server", async () => {
			// Start preview server in background
			const server = new Deno.Command("deno", {
				args: ["task", "preview", "--port", "4173", "--host"],
				cwd: this.projectRoot,
				stdout: "piped",
				stderr: "piped",
			}).spawn();

			// Wait for server to start
			await new Promise(resolve => setTimeout(resolve, 3000));

			try {
				// Test if server responds
				const response = await fetch("http://localhost:4173");
				if (!response.ok) {
					throw new Error(`Preview server returned ${response.status}`);
				}

				const html = await response.text();
				if (!html.includes("Will Cygan")) {
					throw new Error("Preview server not serving expected content");
				}
			} finally {
				// Kill the server
				server.kill();
				await server.output();
			}
		});

		await this.test("Verify static assets", async () => {
			const buildDir = join(this.projectRoot, "build");
			const assetsDir = join(buildDir, "_app");
			
			const assetsExist = await exists(assetsDir);
			if (!assetsExist) {
				throw new Error("Static assets directory not found");
			}

			// Check for favicon
			const favicon = join(buildDir, "favicon.ico");
			const faviconExists = await exists(favicon);
			if (!faviconExists) {
				console.warn("⚠️  favicon.ico not found in build output");
			}
		});
	}

	async testGitHubActions(): Promise<void> {
		await this.test("Validate GitHub Actions workflow", async () => {
			const workflowFile = join(this.projectRoot, ".github", "workflows", "deploy.yml");
			const workflowExists = await exists(workflowFile);
			if (!workflowExists) {
				throw new Error("GitHub Actions workflow file not found");
			}

			// Check workflow syntax with act
			const result = await this.runCommand(["act", "--list"]);
			if (!result.success) {
				throw new Error(`Workflow validation failed: ${result.output}`);
			}

			if (!result.output.includes("Deploy with GitHub Actions (Deno)")) {
				throw new Error("Expected workflow not found in act output");
			}
		});

		await this.test("Run GitHub Actions build job with act", async () => {
			// Run only the build job to avoid deployment
			const result = await this.runCommand([
				"act", 
				"push",
				"--job", "build",
				"--verbose",
				"--pull=false" // Don't pull images if they exist
			]);
			
			if (!result.success) {
				// Check if it's a Docker image issue
				if (result.output.includes("unable to pull image") || result.output.includes("image not found")) {
					console.warn("⚠️  Act test skipped: Docker images not available. This is normal for first run.");
					console.warn("    To fix: run `act --pull` to download required images");
					return;
				}
				throw new Error(`GitHub Actions simulation failed: ${result.output}`);
			}

			// Verify that the simulated workflow would have succeeded
			if (!result.output.includes("successfully") && !result.output.includes("Job succeeded")) {
				console.warn("⚠️  Act simulation completed but success unclear");
				console.log("Act output:", result.output.slice(-500)); // Last 500 chars
			}
		});
	}

	async testBlogWorkflow(): Promise<void> {
		const tempPostSlug = `test-post-${Date.now()}`;
		const tempPostPath = join(this.projectRoot, "src", "posts", `${tempPostSlug}.md`);

		await this.test("Test blog post creation script", async () => {
			// Create a temporary test post
			const testContent = `---
title: Test Post
date: January 1, 2024
description: Test post for integration testing
tags: [test, integration]
---

This is a test post for integration testing.
`;
			await Deno.writeTextFile(tempPostPath, testContent);

			// Verify the file was created
			const postExists = await exists(tempPostPath);
			if (!postExists) {
				throw new Error("Test post was not created");
			}
		});

		await this.test("Verify blog post builds correctly", async () => {
			// Rebuild to include the test post
			const result = await this.runCommand(["deno", "task", "build"]);
			if (!result.success) {
				throw new Error(`Build with test post failed: ${result.output}`);
			}

			// Check that the test post was built
			const blogBuildDir = join(this.projectRoot, "build", "blog", tempPostSlug);
			const postBuildExists = await exists(blogBuildDir);
			if (!postBuildExists) {
				throw new Error("Test blog post was not built correctly");
			}
		});

		// Cleanup
		await this.test("Cleanup test post", async () => {
			try {
				await Deno.remove(tempPostPath);
			} catch (error) {
				console.warn(`Warning: Could not cleanup test post: ${error}`);
			}
		});
	}

	async printResults(): Promise<void> {
		const totalTime = Date.now() - this.startTime;
		const passed = this.results.filter(r => r.success).length;
		const failed = this.results.filter(r => !r.success).length;

		console.log("\n" + "=".repeat(50));
		console.log("🧪 INTEGRATION TEST RESULTS");
		console.log("=".repeat(50));
		console.log(`✅ Passed: ${passed}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`⏱️  Total time: ${totalTime}ms`);
		console.log("");

		if (failed > 0) {
			console.log("❌ FAILED TESTS:");
			this.results
				.filter(r => !r.success)
				.forEach(r => {
					console.log(`  • ${r.name}: ${r.error}`);
				});
			console.log("");
		}

		console.log("📊 DETAILED RESULTS:");
		this.results.forEach(r => {
			const status = r.success ? "✅" : "❌";
			console.log(`  ${status} ${r.name} (${r.duration}ms)`);
		});

		if (failed > 0) {
			console.log("\n🚨 Integration tests failed! Please check the errors above.");
			Deno.exit(1);
		} else {
			console.log("\n🎉 All integration tests passed!");
		}
	}

	async run(): Promise<void> {
		console.log("🚀 Starting integration tests for wcygan.github.io");
		console.log("=".repeat(50));

		await this.checkPrerequisites();
		await this.testBuild();
		await this.testDeploy();
		await this.testGitHubActions();
		await this.testBlogWorkflow();
		await this.printResults();
	}
}

async function main(): Promise<void> {
	const scriptDir = dirname(new URL(import.meta.url).pathname);
	const projectRoot = join(scriptDir, "..");
	const tester = new IntegrationTester(projectRoot);
	await tester.run();
}

if (import.meta.main) {
	await main();
} 