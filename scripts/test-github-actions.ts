#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-net --allow-env

/// <reference lib="deno.ns" />

/**
 * GitHub Actions Integration Test using Act
 *
 * This script tests GitHub Actions workflows locally using the `act` tool.
 * It validates that workflows run successfully before pushing to GitHub.
 *
 * Usage:
 *   deno run --allow-all scripts/test-github-actions.ts [options]
 *
 * Options:
 *   --workflow <name>  Test specific workflow (ci, deploy, security, performance)
 *   --verbose          Show detailed output
 *   --dry-run          Check prerequisites only
 *   --help             Show help
 */

import { parseArgs } from 'jsr:@std/cli/parse-args';
import $ from 'jsr:@david/dax';

interface TestResult {
	workflow: string;
	success: boolean;
	duration: number;
	output: string;
	error?: string;
}

interface WorkflowConfig {
	name: string;
	file: string;
	event: string;
	description: string;
	skipLocal?: boolean;
	skipReason?: string;
}

const WORKFLOWS: WorkflowConfig[] = [
	{
		name: 'ci',
		file: 'ci.yml',
		event: 'push',
		description: 'Continuous Integration (format, lint, type check, test, build)'
	},
	{
		name: 'security',
		file: 'security.yml',
		event: 'pull_request',
		description: 'Security audit and dependency check'
	},
	{
		name: 'performance',
		file: 'performance.yml',
		event: 'pull_request',
		description: 'Performance testing and bundle analysis'
	},
	{
		name: 'deploy',
		file: 'deploy.yml',
		event: 'push',
		description: 'Deploy to GitHub Pages',
		skipLocal: true,
		skipReason: 'Requires GitHub Pages permissions and secrets'
	}
];

class GitHubActionsTestRunner {
	private verbose: boolean;
	private results: TestResult[] = [];

	constructor(verbose = false) {
		this.verbose = verbose;
	}

	async checkPrerequisites(): Promise<boolean> {
		console.log('🔍 Checking prerequisites...\n');

		const checks = [
			{ name: 'Docker', command: 'docker', args: ['--version'] },
			{ name: 'Docker daemon', command: 'docker', args: ['info'] },
			{ name: 'Act', command: 'act', args: ['--version'] }
		];

		let allPassed = true;

		for (const check of checks) {
			try {
				// Use dax with proper PATH inheritance
				const result = await $`${check.command} ${check.args}`.env({
					PATH: Deno.env.get('PATH') || ''
				}).quiet();
				console.log(`✅ ${check.name}: Available`);
			} catch (error) {
				console.log(`❌ ${check.name}: Not found or failed`);
				if (this.verbose) {
					console.log(`   Error: ${error}`);
				}
				allPassed = false;
			}
		}

		if (!allPassed) {
			console.log('\n📋 Installation instructions:');
			console.log('• Docker: https://docs.docker.com/get-docker/');
			console.log('• Act: https://github.com/nektos/act#installation');
			console.log('  - macOS: brew install act');
			console.log('  - Windows: choco install act-cli');
			console.log(
				'  - Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash'
			);
			console.log('\n💡 If you have these installed, try running with full paths:');
			console.log(`   Docker path: ${await $.which('docker').catch(() => 'not found')}`);
			console.log(`   Act path: ${await $.which('act').catch(() => 'not found')}`);
		}

		console.log();
		return allPassed;
	}

	async runWorkflowTest(workflow: WorkflowConfig): Promise<TestResult> {
		const startTime = Date.now();

		console.log(`🧪 Testing ${workflow.name} workflow...`);
		if (this.verbose) {
			console.log(`   File: .github/workflows/${workflow.file}`);
			console.log(`   Event: ${workflow.event}`);
			console.log(`   Description: ${workflow.description}`);
		}

		if (workflow.skipLocal) {
			console.log(`⏭️  Skipping: ${workflow.skipReason}\n`);
			return {
				workflow: workflow.name,
				success: true,
				duration: Date.now() - startTime,
				output: `Skipped: ${workflow.skipReason}`
			};
		}

		try {
			console.log('📺 Streaming output from Act:\n');
			console.log('─'.repeat(80));

			// Build the act command with proper environment
			const actCmd = $`act ${workflow.event}
				--workflows .github/workflows/${workflow.file}
				--platform ubuntu-latest=catthehacker/ubuntu:act-latest
				--artifact-server-path /tmp/artifacts`
				.env({
					PATH: Deno.env.get('PATH') || '',
					HOME: Deno.env.get('HOME') || '',
					USER: Deno.env.get('USER') || ''
				});

			// Set timeout for the command
			const timeoutMs = 600000; // 10 minutes
			const timeoutPromise = $.sleep(timeoutMs).then(() => {
				throw new Error(`Workflow test timed out after ${timeoutMs / 1000} seconds`);
			});

			let result;
			if (this.verbose) {
				// Stream output in real-time for verbose mode
				result = await Promise.race([
					actCmd,
					timeoutPromise
				]);
			} else {
				// Capture output but still show some progress
				result = await Promise.race([
					actCmd.quiet(),
					timeoutPromise
				]);
			}

			console.log('─'.repeat(80));
			const duration = Date.now() - startTime;

			console.log(`✅ ${workflow.name} workflow passed (${Math.round(duration / 1000)}s)\n`);
			return {
				workflow: workflow.name,
				success: true,
				duration,
				output: result.stdout || 'Success'
			};

		} catch (error) {
			console.log('─'.repeat(80));
			const duration = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);

			console.log(`❌ ${workflow.name} workflow failed (${Math.round(duration / 1000)}s)`);
			
			// Show error details
			if (error && typeof error === 'object' && 'stderr' in error) {
				console.log('Error output:');
				console.log(String(error.stderr).split('\n').slice(-10).join('\n'));
			} else {
				console.log(`Error: ${errorMessage}`);
			}
			console.log();

			return {
				workflow: workflow.name,
				success: false,
				duration,
				output: '',
				error: errorMessage
			};
		}
	}

	async runAllTests(selectedWorkflow?: string): Promise<void> {
		const workflowsToTest = selectedWorkflow
			? WORKFLOWS.filter((w) => w.name === selectedWorkflow)
			: WORKFLOWS;

		if (workflowsToTest.length === 0) {
			console.log(`❌ Workflow '${selectedWorkflow}' not found`);
			console.log(`Available workflows: ${WORKFLOWS.map((w) => w.name).join(', ')}`);
			return;
		}

		console.log(`🚀 Running ${workflowsToTest.length} workflow test(s)...\n`);

		for (const workflow of workflowsToTest) {
			const result = await this.runWorkflowTest(workflow);
			this.results.push(result);
		}

		this.printSummary();
	}

	printSummary(): void {
		console.log('📊 Test Summary');
		console.log('================');

		const passed = this.results.filter((r) => r.success).length;
		const failed = this.results.filter((r) => !r.success).length;
		const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

		console.log(`Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`);
		console.log(`Total time: ${Math.round(totalTime / 1000)}s\n`);

		// Detailed results
		for (const result of this.results) {
			const status = result.success ? '✅ PASS' : '❌ FAIL';
			const time = Math.round(result.duration / 1000);
			console.log(`${status} ${result.workflow.padEnd(12)} (${time}s)`);
		}

		if (failed > 0) {
			console.log('\n❌ Some tests failed. Check the output above for details.');
			Deno.exit(1);
		} else {
			console.log('\n✅ All tests passed!');
		}
	}
}

function showHelp(): void {
	console.log(`
GitHub Actions Integration Test

Usage: deno run --allow-all scripts/test-github-actions.ts [options]

Options:
  --workflow <name>  Test specific workflow (ci, deploy, security, performance)
  --verbose          Show detailed output from act
  --dry-run          Check prerequisites only
  --help             Show this help message

Examples:
  # Test all workflows
  deno run --allow-all scripts/test-github-actions.ts

  # Test only CI workflow with verbose output
  deno run --allow-all scripts/test-github-actions.ts --workflow ci --verbose

  # Check prerequisites only
  deno run --allow-all scripts/test-github-actions.ts --dry-run

Available workflows:
${WORKFLOWS.map((w) => `  • ${w.name.padEnd(12)} - ${w.description}`).join('\n')}
  `);
}

async function main(): Promise<void> {
	const args = parseArgs(Deno.args, {
		string: ['workflow'],
		boolean: ['verbose', 'dry-run', 'help'],
		alias: { h: 'help', v: 'verbose', w: 'workflow' }
	});

	if (args.help) {
		showHelp();
		return;
	}

	console.log('🎭 GitHub Actions Integration Test\n');

	const runner = new GitHubActionsTestRunner(args.verbose);

	// Check prerequisites
	const prerequisitesPassed = await runner.checkPrerequisites();

	if (!prerequisitesPassed) {
		console.log('❌ Prerequisites not met. Please install missing dependencies.');
		Deno.exit(1);
	}

	if (args['dry-run']) {
		console.log('✅ Prerequisites check passed. Ready to run tests.');
		return;
	}

	// Run tests
	await runner.runAllTests(args.workflow);
}

if (import.meta.main) {
	main().catch((error) => {
		console.error('❌ Test runner failed:', error.message);
		Deno.exit(1);
	});
}
