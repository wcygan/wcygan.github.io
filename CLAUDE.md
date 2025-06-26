# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Essential Commands

### Development

```bash
pnpm run dev          # Start development server on localhost:5173
pnpm run preview      # Preview production build locally
```

### Code Quality & Testing

```bash
pnpm run format       # Format code with Prettier (includes Mermaid formatting fix)
pnpm run format:check # Check formatting without writing changes
pnpm run lint         # Run ESLint checks
pnpm run check        # Type check with svelte-check
pnpm run test         # Run Vitest unit tests

# Automated Mermaid formatting fix (prevents MDsveX parsing issues)
deno task fix-mermaid # Fix Mermaid diagram formatting automatically

# Complete pre-commit workflow
pnpm run pre-commit   # Fix Mermaid + format + lint + typecheck
```

### Building & Deployment

```bash
pnpm run build        # Build static site to /build directory
```

### Content Management

```bash
pnpm run post         # Create new blog post interactively
```

### CI Testing (Local)

```bash
pnpm ci:test          # Test all GitHub Actions locally with act
pnpm ci:test:quick    # Quick CI workflow test
```

## Architecture Overview

### Technology Stack

- **SvelteKit 2.15+** with static adapter for GitHub Pages deployment
- **Svelte 5** - Latest major version with runes
- **MDsveX** for Markdown blog posts with syntax highlighting (Shiki)
- **Tailwind CSS** for styling with Typography plugin
- **TypeScript** with strict mode enabled
- **Vitest** for testing (minimal coverage currently)
- **Dual Package Management**: `deno.json` for Deno scripts + `package.json` for pnpm workflow

### Key Architectural Decisions

#### Blog System

- Blog posts are Markdown files in `/src/posts/`
- Dynamic routing via `/src/routes/blog/[slug]/+page.svelte`
- Metadata (title, date, tags, description) in frontmatter
- Automatic reading time calculation
- RSS feed generation at `/rss.xml`

#### Static Site Generation

- Uses `@sveltejs/adapter-static` for GitHub Pages
- All routes pre-rendered at build time
- Custom 404.html for GitHub Pages fallback
- Build output in `/build` directory

#### Component Architecture

- Shared components in `/src/lib/components/`
- Business logic in `/src/lib/services/`
- Type definitions in `/src/lib/types.ts`
- Utility functions in `/src/lib/utils/`

### Development Patterns

#### Adding New Blog Posts

1. Run `pnpm run post` or create file manually in `/src/posts/`
2. Use frontmatter: title, date, tags, description, published
3. Posts automatically appear in blog listing and RSS feed

#### Using Mermaid Diagrams in Posts

Mermaid diagrams are supported in blog posts for creating flowcharts, sequence
diagrams, and more.

**Basic Usage:**

```svelte
<script>
	import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
</script>

<MermaidDiagram
	height={300}
	diagram={`flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do this]
    B -->|No| D[Do that]`}
/>
```

**Available Components:**

- `MermaidDiagram` - Main component with caching and error handling
- `MermaidViewport` - Lazy-loads when scrolled into view
- `MermaidFlexible` - Supports both prop and slot syntax

**Performance Tips:**

- Diagrams are automatically cached in sessionStorage
- Use `MermaidViewport` for diagrams below the fold
- See `/docs/MERMAID_USAGE.md` for comprehensive guide
- Visit `/mermaid-examples` for live examples

**Automated Mermaid Formatting Fix**

The project includes an automated solution to prevent MDsveX parsing issues with Mermaid diagrams:

```bash
# Automatically fix Mermaid formatting issues
deno task fix-mermaid

# Integrated into formatting workflow
pnpm run format  # Now includes automatic Mermaid fix

# Complete pre-commit check (recommended)
pnpm run pre-commit
```

**How It Works:**

- Scans all `.md` files in `src/posts/`
- Removes empty lines within Mermaid diagram definitions that cause MDsveX to inject `</p>` tags
- Integrates seamlessly with existing pnpm workflow
- Prevents build failures from Mermaid parsing errors

**Manual Formatting Rules (if needed):**

1. **Component Formatting Pattern:**

   ```svelte
   <!-- ✅ CORRECT: No empty lines in diagram content -->
   <MermaidDiagram
   	height={500}
   	diagram={`sequenceDiagram
       participant User
       participant Server
       User->>Server: Request
       Server->>User: Response`}
   />

   <!-- ❌ WRONG: Empty lines cause MDsveX to inject </p> tags -->
   <MermaidDiagram
   	height={500}
   	diagram={`sequenceDiagram

   participant User
   participant Server
   User->>Server: Request
   Server->>User: Response`}
   />
   ```

2. **Vite Configuration:**

   Ensure `vite.config.ts` has the correct Mermaid alias:

   ```typescript
   resolve: {
   	alias: {
   		mermaid: 'mermaid/dist/mermaid.esm.min.mjs'; // NOT mermaid.esm.mjs
   	}
   }
   ```

3. **Svelte 5 Compatibility:**

   - For components using `bind:textContent`, add `contenteditable="true"`
   - Use `onMount` with `tick()` for reliable DOM access
   - Avoid using `$app/environment` for browser detection; use `onMount` instead

4. **Common Issues and Solutions:**

   - **SSR/Hydration failures**: Check Vite module resolution config
   - **MDsveX paragraph wrapping**: Use the formatting pattern above
   - **Slot content not working**: Ensure proper `onMount` handling in components
   - **Direct URL access fails**: Verify module aliases and SSR configuration

#### Modifying Routes

- Page routes in `/src/routes/[route]/+page.svelte`
- Load functions in `+page.ts` files
- Layout in `/src/routes/+layout.svelte`

#### Working with Scripts

- Automation scripts in `/scripts/` directory
- GitHub Actions testing uses `act` tool
- Resume download script fetches from external repo

### Testing Approach

- Unit tests with Vitest (run with `pnpm run test`)
- Local GitHub Actions testing with comprehensive test suite
- VS Code task integration for quick testing
- 77 tests covering utilities, services, and component logic

#### Unit Testing Strategy

Due to Svelte 5 compatibility issues with @testing-library/svelte, we use a logic-based testing approach:

```typescript
// Test component logic without full mounting
describe('MermaidDiagram component logic', () => {
	it('should use cached SVG when available', async () => {
		const cachedSVG = '<svg>cached diagram</svg>';
		const mockGetCachedSVG = getCachedSVG as ReturnType<typeof vi.fn>;
		mockGetCachedSVG.mockReturnValue(cachedSVG);

		// Test caching behavior
		const svg = getCachedSVG(diagram);
		expect(svg).toBe(cachedSVG);
	});
});
```

**Test Coverage:**

- `src/lib/utils/*.spec.ts` - Utility functions (mermaid-cache, readingTime)
- `src/lib/services/*.spec.ts` - Service layer (blog filtering, sorting)
- `src/lib/components/*.test.ts` - Component logic (no full mounting)

**Key Testing Utilities:**

- Mock IntersectionObserver for viewport tests
- Mock sessionStorage for caching tests
- Mock Mermaid module for rendering tests

#### Browser Testing with Puppeteer MCP

The Puppeteer MCP tool can be used for end-to-end testing of Mermaid diagrams and blog functionality:

```typescript
// Example: Testing Mermaid diagram rendering
// 1. Navigate to a blog post with Mermaid diagrams
await mcp__puppeteer__puppeteer_navigate({
	url: 'http://localhost:5173/blog/mermaid-diagrams'
});

// 2. Wait for diagram to render and take screenshot
await mcp__puppeteer__puppeteer_screenshot({
	name: 'mermaid-diagram-rendered',
	selector: '.mermaid-render-container',
	width: 800,
	height: 600
});

// 3. Test viewport lazy loading
await mcp__puppeteer__puppeteer_evaluate({
	script: `window.scrollTo(0, document.querySelector('.mermaid-viewport').offsetTop)`
});

// 4. Verify diagram loads when in viewport
await mcp__puppeteer__puppeteer_evaluate({
	script: `document.querySelector('.mermaid-render-container svg') !== null`
});
```

**Common E2E Test Scenarios:**

- Verify Mermaid diagrams render correctly
- Test lazy loading behavior with viewport scrolling
- Validate dark theme styling is applied
- Check sessionStorage caching works
- Test error states with invalid diagram syntax
- Verify blog post navigation and filtering

### Important Configuration Files

- `svelte.config.js` - SvelteKit and MDsveX configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Tailwind customization
- `mdsvex.config.js` - Markdown processing and syntax highlighting
- `deno.json` - Deno task definitions and JSR imports
- `package.json` - pnpm scripts and dependencies

### Dual Package Management

This project uses both `deno.json` and `package.json` for different purposes:

**`deno.json`:**

- Contains Deno-specific tasks (e.g., `fix-mermaid`)
- JSR imports for standard library modules
- Automation scripts that require file system access

**`package.json`:**

- Primary package manager is pnpm
- Contains SvelteKit, Vitest, and frontend tooling
- Integrates Deno tasks into pnpm workflow
- Main development and CI/CD scripts

**Task Resolution:**

- Deno can execute tasks from both files
- `pnpm run format` calls `deno task fix-mermaid` automatically
- Cross-calling between package managers works seamlessly
- Use `pnpm run <script>` for primary workflow commands

## Mermaid Diagram Styling Guidelines

### Core Design Principles

- **Semantic Colors**: Use consistent colors that convey meaning across all diagrams
- **Human Readability**: Optimize for comprehension with clear visual hierarchy
- **Accessibility**: Maintain WCAG AA contrast ratios and 2px minimum stroke widths
- **Consistency**: Apply the same visual language across all diagram types

### Color Palette System

**Primary Semantic Colors:**

```css
/* Actions & Processing */
--action-primary: fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000  /* Light Yellow + Black Text */
--processing: fill:#e5e7eb,stroke:#6b7280,stroke-width:2px,color:#000      /* Light Gray + Black Text */

/* Data & States */
--data-state: fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#000      /* Light Blue + Black Text */
--neutral: fill:#f9fafb,stroke:#6b7280,stroke-width:2px,color:#000         /* Very Light Gray + Black Text */

/* System Interactions */
--external: fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#000        /* Light Red + Black Text */
--success: fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#000         /* Light Green + Black Text */

/* Component Types */
--storage: fill:#fed7aa,stroke:#f97316,stroke-width:2px,color:#000         /* Light Orange + Black Text */
--interface: fill:#fef3c7,stroke:#fbbf24,stroke-width:2px,color:#000       /* Light Golden Yellow + Black Text */
```

### Diagram-Specific Guidelines

#### Flowcharts
- **Decision nodes**: Use `--processing` (purple) for logic/decisions
- **Action nodes**: Use `--action-primary` (yellow) for processes
- **Start/End**: Use `--success` (green) for terminals
- **External systems**: Use `--external` (red) for outside dependencies

#### Sequence Diagrams
- **User/Client**: Use `--success` (green) for user-facing participants
- **Internal Services**: Use `--data-state` (blue) for internal systems
- **External APIs**: Use `--external` (red) for third-party services
- **Databases**: Use `--storage` (orange) for data stores

#### State Diagrams
- **Initial state**: Use `--neutral` (gray)
- **Processing states**: Use `--action-primary` (yellow)
- **Success states**: Use `--success` (green)
- **Error states**: Use `--external` (red)

#### Architecture Diagrams
- **Core components**: Use `--processing` (purple) for main logic
- **Data layer**: Use `--storage` (orange) for data components
- **APIs/Interfaces**: Use `--interface` (golden yellow)
- **External systems**: Use `--external` (red)

### Style Templates

#### Basic Flowchart Pattern
```
style NodeName fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000
style DecisionNode fill:#e5e7eb,stroke:#6b7280,stroke-width:2px,color:#000
style ExternalSystem fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#000
```

#### Sequence Diagram Pattern
```
participant User
participant System as "Internal System"
participant API as "External API"
Note over User: Green for user-facing
Note over System: Blue for internal
Note over API: Red for external
```

#### Multi-Component System Pattern
```
style CoreLogic fill:#e5e7eb,stroke:#6b7280,stroke-width:2px,color:#000
style DataStore fill:#fed7aa,stroke:#f97316,stroke-width:2px,color:#000
style Interface fill:#fef3c7,stroke:#fbbf24,stroke-width:2px,color:#000
style External fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#000
```

### Best Practices

1. **Always specify stroke-width:2px and color:#000** for accessibility and clarity
2. **Use light backgrounds with dark text** to ensure readability
3. **Use semantic naming** in style declarations for maintainability
4. **Group related nodes** with consistent colors within each diagram
5. **Limit color palette** to 4-5 colors per diagram to avoid confusion
6. **Test contrast** - ensure black text remains readable on all light background colors
7. **Document color choices** when deviating from standard patterns

### Quality Checklist

Before publishing any Mermaid diagram, verify:
- [ ] Uses semantic colors from the defined palette
- [ ] Uses light backgrounds with dark (black) text
- [ ] Maintains consistent styling within the diagram
- [ ] Has adequate contrast for accessibility
- [ ] Follows diagram-specific color conventions
- [ ] Includes stroke-width:2px and color:#000 for all styled elements
- [ ] Limits color palette to avoid visual confusion
