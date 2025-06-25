---
title: Visualizing Architecture with Mermaid Diagrams
date: January 25, 2025
description: Using Mermaid.js to create beautiful diagrams in markdown blog posts
tags: [Tutorial, Mermaid, Visualization]
---

<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte'
</script>

I've integrated [Mermaid.js](https://mermaid.js.org/) into this blog to create
interactive diagrams directly in markdown. This enables clear visualization of
architectures, workflows, and processes.

## Why Mermaid?

Mermaid allows you to create diagrams using text-based syntax, which means:

- Diagrams are version controlled alongside your content
- No external tools needed
- Consistent styling with your site's theme
- Dynamic rendering with smooth transitions

## Examples

### Flow Chart

Here's a simple deployment flow:

<MermaidDiagram height={300}
diagram={`flowchart TD
    A[Developer Push] --> B{CI Pipeline}
    B -->|Tests Pass| C[Build Docker Image]
    B -->|Tests Fail| D[Notify Developer]
    C --> E[Push to Registry]
    E --> F[Deploy to Kubernetes]
    F --> G[Update Service]`}
/>

### Sequence Diagram

API authentication flow:

<MermaidDiagram height={400} diagram={`sequenceDiagram participant U as User
participant C as Client App participant A as Auth Server participant R as
Resource Server

    U->>C: Login Request
    C->>A: Redirect to Auth
    A->>U: Show Login Form
    U->>A: Submit Credentials
    A->>C: Return Auth Code
    C->>A: Exchange Code for Token
    A->>C: Return Access Token
    C->>R: API Request + Token
    R->>C: Protected Resource`}

/>

### State Diagram

Order processing states:

<MermaidDiagram height={350}
diagram={`stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: Payment Confirmed
    Pending --> Cancelled: Timeout
    Processing --> Shipped: Items Packed
    Processing --> Refunded: Customer Request
    Shipped --> Delivered: Package Received
    Delivered --> [*]
    Cancelled --> [*]
    Refunded --> [*]`}
/>

### Git Flow

<MermaidDiagram height={250}
diagram={`gitGraph
    commit
    branch develop
    checkout develop
    commit
    branch feature/mermaid
    checkout feature/mermaid
    commit
    commit
    checkout develop
    merge feature/mermaid
    checkout main
    merge develop
    commit`}
/>

### Entity Relationship

Database schema for a blog:

<MermaidDiagram height={300}
diagram={`erDiagram
    USER ||--o{ POST : writes
    USER {
        int id PK
        string name
        string email
        datetime created_at
    }
    POST ||--o{ COMMENT : has
    POST {
        int id PK
        int user_id FK
        string title
        text content
        datetime published_at
    }
    COMMENT {
        int id PK
        int post_id FK
        int user_id FK
        text content
        datetime created_at
    }
    POST }o--|| CATEGORY : belongs_to
    CATEGORY {
        int id PK
        string name
        string slug
    }`}
/>

### Pie Chart

Technology stack distribution:

<MermaidDiagram height={300}
diagram={`pie title Technology Stack
    "SvelteKit" : 35
    "TypeScript" : 25
    "Tailwind CSS" : 20
    "MDsveX" : 15
    "Tooling" : 5`}
/>

## Implementation Details

The integration uses:

- **Lazy Loading**: Diagrams render after page load
- **Dark Theme**: Customized to match the site's aesthetic
- **Loading States**: Smooth transitions while diagrams render
- **Error Handling**: Graceful fallbacks for syntax errors

## Usage in Markdown

To use Mermaid in your blog posts:

```markdown
<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte'
</script>

<MermaidDiagram height={300}
diagram={`flowchart LR
    Start --> Process --> End`} />
```

The `height` prop is optional and defaults to 400px. Diagrams are responsive and
will scroll horizontally if needed.

## Future Enhancements

- Copy diagram as SVG/PNG
- Interactive tooltips
- Dynamic theme switching
- More diagram types

This integration makes it easy to explain complex architectures and flows
visually, enhancing the technical content on this blog.
