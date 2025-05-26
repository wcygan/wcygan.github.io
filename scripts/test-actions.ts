#!/usr/bin/env -S deno run --allow-run

/**
 * GitHub Actions test script using nektos/act
 * Tests GitHub Actions workflows locally without full integration test
 * 
 * Usage: deno run --allow-run scripts/test-actions.ts
 */

async function runCommand(cmd: string[]): Promise<{success: boolean, output: string}> {
	try {
		const command = new Deno.Command(cmd[0], {
			args: cmd.slice(1),
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

async function checkPrerequisites(): Promise<boolean> {
	console.log("🔍 Checking prerequisites...");

	// Check act
	const actResult = await runCommand(["act", "--version"]);
	if (!actResult.success) {
		console.error("❌ act is not installed");
		console.log("Install act: https://github.com/nektos/act#installation");
		return false;
	}
	console.log("✅ act is installed");

	// Check Docker
	const dockerResult = await runCommand(["docker", "version"]);
	if (!dockerResult.success) {
		console.error("❌ Docker is not running");
		console.log("Please start Docker Desktop or Docker daemon");
		return false;
	}
	console.log("✅ Docker is running");

	return true;
}

async function listWorkflows(): Promise<void> {
	console.log("\n📋 Available workflows:");
	const result = await runCommand(["act", "--list"]);
	if (result.success) {
		console.log(result.output);
	} else {
		console.error("Failed to list workflows:", result.output);
	}
}

async function testBuildJob(): Promise<void> {
	console.log("\n🧪 Testing build job with act...");
	console.log("This may take a few minutes on first run (downloading Docker images)");
	
	const result = await runCommand([
		"act", 
		"push",
		"--job", "build",
		"--dryrun" // Just validate, don't actually run
	]);
	
	if (result.success) {
		console.log("✅ Build job validation successful");
		console.log("To run the actual job: act push --job build");
	} else {
		console.error("❌ Build job validation failed:", result.output);
	}
}

async function main(): Promise<void> {
	console.log("🚀 GitHub Actions Test with nektos/act");
	console.log("=====================================");

	const prereqsOk = await checkPrerequisites();
	if (!prereqsOk) {
		Deno.exit(1);
	}

	await listWorkflows();
	await testBuildJob();

	console.log("\n🎯 Quick Commands:");
	console.log("  act --list                    # List all workflows");
	console.log("  act push --job build          # Run build job");
	console.log("  act push --job build --dryrun # Validate build job");
	console.log("  act pull                      # Download Docker images");
}

if (import.meta.main) {
	await main();
} 