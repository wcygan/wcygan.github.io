# Mermaid Diagram Integration Tests

Comprehensive E2E tests for all Mermaid diagram types used in the blog.

## Test Coverage

- **Flow Chart** - Deployment pipeline diagrams
- **Sequence** - API authentication flows  
- **State** - Order processing states
- **Git Graph** - Branch and commit visualization
- **Entity Relationship** - Database schemas
- **Pie Chart** - Technology stack distribution
- **Viewport Loading** - Lazy loading behavior
- **Caching** - SessionStorage persistence
- **Error Handling** - Invalid syntax recovery
- **Responsive Design** - Mobile viewport testing
- **Accessibility** - ARIA labels and roles

## Running Tests

```bash
# Start dev server in one terminal
pnpm run dev

# Run integration tests in another terminal
NODE_OPTIONS="" pnpm run test:integration

# Or run specific test file
NODE_OPTIONS="" pnpm run test:integration tests/integration/mermaid-complete.test.ts
```

## Test Files

- `mermaid-diagrams.test.ts` - Comprehensive tests with preview server
- `mermaid-complete.test.ts` - Simplified tests using dev server
- `mermaid-diagrams-simple.test.ts` - Basic smoke tests

## Requirements

- Node.js 18+
- Puppeteer (installed via pnpm)
- Built site in `/build` directory