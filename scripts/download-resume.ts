#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

/**
 * Resume Download Script
 *
 * Downloads the latest resume PDF from GitHub repository and saves it locally.
 * Replaces the existing file if it exists.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-net scripts/download-resume.ts [options]
 *
 * Options:
 *   --output <path>    Output file path (default: static/will_cygan_resume.pdf)
 *   --verbose          Show detailed output
 *   --dry-run          Show what would be downloaded without actually downloading
 *   --help             Show help
 */

import { parseArgs } from "jsr:@std/cli/parse-args";
import { dirname } from "jsr:@std/path";
import { ensureDir } from "jsr:@std/fs";

interface DownloadOptions {
  url: string;
  outputPath: string;
  verbose: boolean;
  dryRun: boolean;
}

const DEFAULT_RESUME_URL =
  "https://github.com/wcygan/resume/raw/main/will_cygan_resume.pdf";
const DEFAULT_OUTPUT_PATH = "static/will_cygan_resume.pdf";

class ResumeDownloader {
  private options: DownloadOptions;

  constructor(options: DownloadOptions) {
    this.options = options;
  }

  async download(): Promise<void> {
    if (this.options.verbose) {
      console.log(`📥 Downloading resume from: ${this.options.url}`);
      console.log(`📁 Output path: ${this.options.outputPath}`);
    }

    if (this.options.dryRun) {
      console.log("🔍 Dry run mode - no files will be downloaded");
      console.log(`Would download: ${this.options.url}`);
      console.log(`Would save to: ${this.options.outputPath}`);
      return;
    }

    try {
      // Check if file exists and get its current size
      let existingSize = 0;
      try {
        const stat = await Deno.stat(this.options.outputPath);
        existingSize = stat.size;
        if (this.options.verbose) {
          console.log(
            `📄 Existing file size: ${this.formatBytes(existingSize)}`,
          );
        }
      } catch {
        // File doesn't exist, which is fine
        if (this.options.verbose) {
          console.log("📄 No existing file found");
        }
      }

      // Download the file
      console.log("🌐 Fetching latest resume...");
      const response = await fetch(this.options.url);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`,
        );
      }

      const contentLength = response.headers.get("content-length");
      const newSize = contentLength ? parseInt(contentLength) : 0;

      if (this.options.verbose && newSize > 0) {
        console.log(`📄 New file size: ${this.formatBytes(newSize)}`);

        if (existingSize > 0) {
          const sizeDiff = newSize - existingSize;
          const diffStr = sizeDiff > 0
            ? `+${this.formatBytes(Math.abs(sizeDiff))}`
            : `-${this.formatBytes(Math.abs(sizeDiff))}`;
          console.log(`📊 Size difference: ${diffStr}`);
        }
      }

      // Ensure output directory exists
      const outputDir = dirname(this.options.outputPath);
      await ensureDir(outputDir);

      // Write the file
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      await Deno.writeFile(this.options.outputPath, uint8Array);

      console.log(`✅ Resume downloaded successfully!`);
      console.log(`📁 Saved to: ${this.options.outputPath}`);

      if (newSize > 0) {
        console.log(`📊 File size: ${this.formatBytes(newSize)}`);
      }

      // Verify the download
      const stat = await Deno.stat(this.options.outputPath);
      if (stat.size !== newSize && newSize > 0) {
        console.warn(
          `⚠️  Warning: Downloaded file size (${
            this.formatBytes(stat.size)
          }) doesn't match expected size (${this.formatBytes(newSize)})`,
        );
      }
    } catch (error) {
      console.error(
        "❌ Download failed:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  async checkUrl(): Promise<void> {
    console.log("🔍 Checking URL accessibility...");

    try {
      const response = await fetch(this.options.url, { method: "HEAD" });

      if (response.ok) {
        console.log("✅ URL is accessible");

        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");
        const lastModified = response.headers.get("last-modified");

        if (this.options.verbose) {
          console.log(`📄 Content-Type: ${contentType || "unknown"}`);
          if (contentLength) {
            console.log(
              `📊 Content-Length: ${this.formatBytes(parseInt(contentLength))}`,
            );
          }
          if (lastModified) {
            console.log(`📅 Last-Modified: ${lastModified}`);
          }
        }

        if (contentType && !contentType.includes("pdf")) {
          console.warn(
            `⚠️  Warning: Content-Type is '${contentType}', expected PDF`,
          );
        }
      } else {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(
        "❌ URL check failed:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}

function showHelp(): void {
  console.log(`
Resume Download Script

Downloads the latest resume PDF from GitHub repository.

Usage: deno run --allow-read --allow-write --allow-net scripts/download-resume.ts [options]

Options:
  --output <path>    Output file path (default: ${DEFAULT_OUTPUT_PATH})
  --verbose          Show detailed output including file sizes and headers
  --dry-run          Show what would be downloaded without actually downloading
  --help             Show this help message

Examples:
  # Download resume to default location
  deno run --allow-read --allow-write --allow-net scripts/download-resume.ts

  # Download with verbose output
  deno run --allow-read --allow-write --allow-net scripts/download-resume.ts --verbose

  # Download to custom location
  deno run --allow-read --allow-write --allow-net scripts/download-resume.ts --output docs/resume.pdf

  # Check what would be downloaded (dry run)
  deno run --allow-read --allow-write --allow-net scripts/download-resume.ts --dry-run

Source: ${DEFAULT_RESUME_URL}
  `);
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    string: ["output"],
    boolean: ["verbose", "dry-run", "help"],
    alias: { h: "help", v: "verbose", o: "output" },
  });

  if (args.help) {
    showHelp();
    return;
  }

  const options: DownloadOptions = {
    url: DEFAULT_RESUME_URL,
    outputPath: args.output || DEFAULT_OUTPUT_PATH,
    verbose: args.verbose || false,
    dryRun: args["dry-run"] || false,
  };

  console.log("📄 Resume Download Script\n");

  const downloader = new ResumeDownloader(options);

  try {
    // Check URL accessibility first
    await downloader.checkUrl();
    console.log();

    // Download the file
    await downloader.download();

    if (!options.dryRun) {
      console.log("\n🎉 Resume download completed successfully!");
    }
  } catch (error) {
    console.error(
      "\n❌ Script failed:",
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Unexpected error:", error.message);
    Deno.exit(1);
  });
}
