#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Quick GitHub Actions Test
 * 
 * This is a simplified version of the full integration test that focuses
 * on testing just the CI workflow quickly.
 * 
 * Usage: deno run --allow-all scripts/quick-test.ts
 */

async function runCommand(cmd: string[], options: { stream?: boolean } = {}): Promise<{ success: boolean; output: string }> {
  try {
    if (options.stream) {
      // Stream output in real-time
      const command = new Deno.Command(cmd[0], {
        args: cmd.slice(1),
        stdout: "inherit",
        stderr: "inherit",
      });

      const result = await command.output();
      return {
        success: result.success,
        output: "" // Output was streamed directly to console
      };
    } else {
      // Capture output for processing
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
    }
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkPrerequisites(): Promise<boolean> {
  console.log("🔍 Checking prerequisites...");
  
  const dockerCheck = await runCommand(["docker", "--version"]);
  const actCheck = await runCommand(["act", "--version"]);
  
  if (!dockerCheck.success) {
    console.log("❌ Docker not found. Please install Docker first.");
    return false;
  }
  
  if (!actCheck.success) {
    console.log("❌ Act not found. Please install act first.");
    console.log("   macOS: brew install act");
    console.log("   Windows: choco install act-cli");
    return false;
  }
  
  console.log("✅ Prerequisites met");
  return true;
}

async function testCIWorkflow(): Promise<boolean> {
  console.log("\n🧪 Testing CI workflow...");
  console.log("📺 Streaming output from Act:\n");
  
  const startTime = Date.now();
  const result = await runCommand([
    "act",
    "push",
    "--workflows", ".github/workflows/ci.yml",
    "--platform", "ubuntu-latest=catthehacker/ubuntu:act-latest"
  ], { stream: true });
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  if (result.success) {
    console.log(`\n✅ CI workflow passed (${duration}s)`);
    return true;
  } else {
    console.log(`\n❌ CI workflow failed (${duration}s)`);
    return false;
  }
}

async function main(): Promise<void> {
  console.log("🎭 Quick GitHub Actions Test\n");
  
  // Check prerequisites
  const prerequisitesPassed = await checkPrerequisites();
  if (!prerequisitesPassed) {
    Deno.exit(1);
  }
  
  // Test CI workflow
  const ciPassed = await testCIWorkflow();
  
  console.log("\n📊 Results");
  console.log("===========");
  
  if (ciPassed) {
    console.log("✅ Quick test passed! Your CI workflow is working.");
    console.log("\n💡 To run full tests: deno run --allow-all scripts/test-github-actions.ts");
  } else {
    console.log("❌ Quick test failed. Check the CI workflow.");
    console.log("\n💡 For detailed output: deno run --allow-all scripts/test-github-actions.ts --workflow ci --verbose");
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Quick test failed:", error.message);
    Deno.exit(1);
  });
} 