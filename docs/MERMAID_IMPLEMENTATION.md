# Mermaid Diagram Implementation Guide

Quick reference for implementing consistent Mermaid diagrams across the application.

## Quick Start

### 1. Import Component
```svelte
<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
</script>
```

### 2. Basic Usage
```svelte
<MermaidDiagram
  height={400}
  diagram={`flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`}
/>
```

## Diagram Templates

### Flow Chart
```javascript
diagram={`flowchart TD
    subgraph "System"
        A[Input] --> B[Process]
        B --> C[Output]
    end
    D[External] --> A`}
```

### Sequence Diagram
```javascript
diagram={`sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System-->>User: Response`}
```

### State Diagram
```javascript
diagram={`stateDiagram-v2
    [*] --> Active
    Active --> Inactive: timeout
    Inactive --> Active: trigger
    Active --> [*]: complete`}
```

### Git Graph
```javascript
diagram={`gitGraph
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature`}
```

### Entity Relationship
```javascript
diagram={`erDiagram
    USER ||--o{ POST : creates
    POST ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes`}
```

## Height Guidelines

| Diagram Type | Recommended Height | Use Case |
|-------------|-------------------|----------|
| Simple Flow | 300px | 3-5 nodes |
| Complex Flow | 400-500px | 6-10 nodes with branches |
| Sequence | 500-600px | 4-6 participants |
| State | 350-400px | 4-6 states |
| ER Diagram | 300-400px | 3-5 entities |
| Git Graph | 250-300px | Simple branch/merge |

## Style Consistency Checklist

- [ ] Using dark theme (`theme: 'dark'` in config)
- [ ] Container has `bg-zinc-900` background
- [ ] Text is readable (`zinc-100` color)
- [ ] Nodes use `zinc-700` fill with `emerald-400` borders
- [ ] Edges use `zinc-500` color
- [ ] Minimum height set appropriately
- [ ] Responsive overflow handling enabled

## Common Patterns

### Clickable Nodes
```javascript
diagram={`flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
    click A "https://example.com" _blank
    click B callback "Tooltip text"`}
```

### Styled Nodes
```javascript
diagram={`flowchart TD
    A[Normal] --> B[Important]:::highlight
    classDef highlight fill:#34d399,stroke:#10b981,color:#000`}
```

### Complex Labels
```javascript
diagram={`flowchart TD
    A["Multi-line<br/>Label"] --> B["Label with<br/>Details"]`}
```

## Performance Tips

1. **Use Caching**: Diagrams are automatically cached in sessionStorage
2. **Lazy Loading**: For below-fold diagrams, consider using `MermaidViewport`
3. **Batch Small Diagrams**: Group related small diagrams in one component
4. **Limit Complexity**: Keep node count under 20 for optimal performance

## Debugging

### Check Console
```javascript
// Component logs status updates
[MermaidDiagram] Loading Mermaid module...
[MermaidDiagram] Rendering with ID: mermaid-xxx
[MermaidDiagram] Render complete!
```

### Common Issues

**Diagram Not Rendering**
- Check for syntax errors in diagram definition
- Ensure no empty lines within the diagram string
- Verify Mermaid module loads correctly

**Styling Not Applied**
- CSS overrides need `!important` flag
- Check specificity of selectors
- Verify theme is set to 'dark'

**Text Not Visible**
- Ensure text fill color is set
- Check contrast against background
- Verify font family is loaded

## Accessibility

Always include descriptive context:
```svelte
<!-- Good -->
<p>The following diagram shows the user authentication flow:</p>
<MermaidDiagram height={500} diagram={authFlow} />

<!-- Better -->
<figure>
  <figcaption>User authentication flow with OAuth2</figcaption>
  <MermaidDiagram height={500} diagram={authFlow} />
</figure>
```

## Testing

1. **Visual Testing**: Check appearance in light/dark modes
2. **Responsive Testing**: Verify on mobile devices
3. **Performance Testing**: Monitor render times
4. **Accessibility Testing**: Verify with screen readers