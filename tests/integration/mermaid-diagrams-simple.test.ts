import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

const execAsync = promisify(exec);

describe('Mermaid Diagrams Integration Tests (Simple)', () => {
  let browser: Browser;
  let page: Page;
  let previewProcess: any;
  const baseUrl = 'http://localhost:4173';

  beforeAll(async () => {
    // Start preview server
    console.log('Starting preview server...');
    previewProcess = exec('pnpm run preview', (error, stdout, stderr) => {
      if (error) console.error('Preview server error:', error);
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }, 30000);

  afterAll(async () => {
    await browser?.close();
    
    // Kill preview server
    if (previewProcess) {
      try {
        process.kill(-previewProcess.pid);
      } catch (e) {
        console.log('Could not kill preview process');
      }
    }
  });

  it('should load the mermaid diagrams page', async () => {
    page = await browser.newPage();
    await page.goto(`${baseUrl}/blog/mermaid-diagrams`, { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    expect(title).toContain('Mermaid');
  });

  it('should render mermaid diagrams', async () => {
    page = await browser.newPage();
    await page.goto(`${baseUrl}/blog/mermaid-diagrams`, { waitUntil: 'networkidle2' });
    
    // Wait for diagrams to render
    await page.waitForSelector('.mermaid-render-container svg', { timeout: 10000 });
    
    // Count rendered diagrams
    const diagramCount = await page.$$eval('.mermaid-render-container svg', elements => elements.length);
    expect(diagramCount).toBeGreaterThan(0);
  });
});