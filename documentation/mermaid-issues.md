# Mermaid.js Integration Issues with MDsveX

## Overview

This document describes the challenges encountered when integrating Mermaid.js
diagrams into a SvelteKit blog that uses MDsveX for Markdown processing.

## The Problem

MDsveX was incorrectly parsing Mermaid diagram components in Markdown files,
specifically:

1. **Unwanted HTML Tags**: MDsveX was inserting `</p>` tags within component
   syntax
2. **JavaScript Expression Parsing**: Curly braces `{}` in Mermaid diagrams were
   being interpreted as JavaScript expressions
3. **Compilation Errors**: The parsing issues caused build failures with errors
   like:
   - `Expected token >`
   - `</p> attempted to close an element that was not open`

## Root Cause

MDsveX processes Markdown content before it reaches Svelte, and it was:

- Wrapping inline content in paragraph tags
- Attempting to parse template literal syntax within component props
- Conflicting with the complex syntax of Mermaid diagrams (especially those
  containing curly braces)

## Solutions Attempted

### 1. Direct Component Usage (Failed)

```markdown
<MermaidDiagram height={400}
diagram={`sequenceDiagram
    participant U as User
    ...`} />
```

**Result**: MDsveX added paragraph tags, breaking the component syntax

### 2. Slot-Based Approach (Failed)

```markdown
<MermaidFlexible height={400}>
sequenceDiagram
    participant U as User
    ...
</MermaidFlexible>
```

**Result**: MDsveX still parsed curly braces as JavaScript expressions

### 3. Escaped Content in Slots (Failed)

```markdown
<MermaidFlexible height={400}>
{`sequenceDiagram
    participant U as User
    ...`}
</MermaidFlexible>
```

**Result**: MDsveX wrapped the backticks in paragraph tags

### 4. Working Format from Git History (Success)

The solution that worked in commit `bb13005` used specific formatting:

```markdown
<MermaidDiagram height={400} diagram={`sequenceDiagram participant U as User
participant C as Client App participant A as Auth Server participant R as
Resource Server

    U->>C: Login Request
    ...`}

/>
```

Key differences:

- Participant declarations on a single line (wrapped naturally)
- Blank line before the closing `/>`
- Specific indentation pattern

## Lessons Learned

1. **MDsveX Parsing Behavior**: MDsveX's paragraph wrapping and expression
   parsing can interfere with complex component syntax
2. **Formatting Sensitivity**: The exact formatting of components in Markdown
   can significantly affect parsing
3. **Alternative Approaches**: The James Joy article suggested using slots to
   avoid prop parsing issues, but this didn't work in our case due to MDsveX's
   aggressive parsing

## Recommendations

For future Mermaid.js integrations with MDsveX:

1. **Consider Using Code Blocks**: Instead of inline components, use standard
   Markdown code blocks with a custom transformer
2. **Pre-process Diagrams**: Convert Mermaid syntax to SVG at build time to
   avoid runtime parsing issues
3. **Custom MDsveX Plugin**: Create a rehype/remark plugin to handle Mermaid
   blocks specially
4. **Escape Sequences**: Develop a consistent escaping strategy for special
   characters in component props

## Related Issues

- MDsveX and Prism.js syntax highlighting conflicts (as noted in James Joy's
  article)
- Component prop parsing with complex string content
- Whitespace sensitivity in MDsveX processing

## Implemented Solution (January 2025)

### What Was Fixed

The core issue was successfully resolved by implementing the exact formatting pattern that worked in commit `bb13005`. Here's what was done:

#### 1. **Restored Working Formatting in `src/posts/mermaid-diagrams.md`**

The sequence diagram was reformatted to use the exact pattern that avoids MDsveX parsing conflicts:

```markdown
<MermaidDiagram height={400} diagram={`sequenceDiagram participant U as User
participant C as Client App participant A as Auth Server participant R as
Resource Server

    U->>C: Login Request
    ...`}

/>
```

**Key formatting elements:**
- Participant declarations on single line with natural wrapping
- Blank line before the closing `/>`
- No manual line breaks within the template literal

#### 2. **Fixed Svelte 5 Compatibility Issues**

Updated `src/lib/components/MermaidFlexible.svelte` to handle Svelte 5's new requirement:

```svelte
<div style="display: none" contenteditable="true" bind:textContent={slotContent}>
```

The `contenteditable="true"` attribute is now required for `textContent` bindings in Svelte 5.

#### 3. **Resolved TypeScript Linting Errors**

- **MermaidDiagram.svelte**: Fixed type annotation instead of using `any`:
  ```typescript
  console.log('[MermaidDiagram] Mermaid version:', (mermaid as { version?: string }).version || 'unknown');
  ```

- **MermaidLazy.svelte**: Added proper type annotation for dynamic import:
  ```typescript
  let MermaidComponent: typeof import('./MermaidDiagram.svelte').default | null = null;
  ```

- **MermaidViewport.svelte**: Removed unused `isIntersecting` variable

- **mermaid-cache.ts**: Removed unused error variable by using bare catch clause

#### 4. **Root Cause Analysis**

The issue was caused by MDsveX's processing pipeline:

1. **MDsveX processes Markdown before Svelte compilation**
2. **Paragraph wrapping**: MDsveX automatically wraps content in `<p>` tags
3. **Expression parsing**: Curly braces `{}` are interpreted as JavaScript expressions
4. **Line breaking sensitivity**: Manual line breaks within template literals trigger unwanted parsing

The working solution avoids these issues by:
- Using natural line wrapping instead of manual breaks
- Keeping participant declarations compact
- Adding strategic blank lines to separate content

#### 5. **Verification**

All components are now working correctly:
- ✅ Flowchart diagrams render properly
- ✅ Sequence diagrams render with complex participant lists
- ✅ State diagrams work as expected
- ✅ Error handling displays helpful debug information
- ✅ Caching system improves performance
- ✅ Dark theme styling applied correctly

### Performance Improvements

The solution also includes several performance enhancements:
- **SessionStorage caching** of rendered SVG diagrams
- **Viewport loading** with `MermaidViewport` component for below-fold diagrams
- **Dynamic imports** to reduce initial bundle size
- **Error boundaries** with detailed debugging information

## References

- [James Joy's Mermaid + Svelte Article](https://jamesjoy.site/posts/2023-06-26-svelte-mermaidjs)
- Git commits: `c9aa8af` (broken), `bb13005` (working pattern restored)
- MDsveX documentation on component usage in Markdown
- Working commit: Current implementation (January 2025)
