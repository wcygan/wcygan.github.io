---
title: Agents
date: June 26, 2025
description: What is an AI Agent?
tags: [AI, Agents, LLMs]
---

Google recently open-sourced [Gemini CLI](https://github.com/google-gemini/gemini-cli), an AI agent that lives in the terminal. You can quickly get it running with the following commands:

```bash
npm install -g @google/gemini-cli
gemini

 ███            █████████  ██████████ ██████   ██████ █████ ██████   █████ █████
░░░███         ███░░░░░███░░███░░░░░█░░██████ ██████ ░░███ ░░██████ ░░███ ░░███
  ░░░███      ███     ░░░  ░███  █ ░  ░███░█████░███  ░███  ░███░███ ░███  ░███
    ░░░███   ░███          ░██████    ░███░░███ ░███  ░███  ░███░░███░███  ░███
     ███░    ░███    █████ ░███░░█    ░███ ░░░  ░███  ░███  ░███ ░░██████  ░███
   ███░      ░░███  ░░███  ░███ ░   █ ░███      ░███  ░███  ░███  ░░█████  ░███
 ███░         ░░█████████  ██████████ █████     █████ █████ █████  ░░█████ █████
░░░            ░░░░░░░░░  ░░░░░░░░░░ ░░░░░     ░░░░░ ░░░░░ ░░░░░    ░░░░░ ░░░░░
```

**Fair Warning**: if you are using the Gemini free tier, it's harvesting all of the data you provide it. That said, anything available on the public internet has already been crawled hundred of thousands of times.

## Introspection

We can easily have Gemini review the Gemini CLI:

```bash
git clone git@github.com:google-gemini/gemini-cli.git

gemini --prompt 'explore the gemini-cli codebase and TLDR how it looks architecturaly and how it works. Keep your response to a paragraph of summarization.'

The Gemini CLI is a TypeScript-based, modular application designed for extensibility. It's architecturally split into a user-facing `packages/cli` and a backend `packages/core`. The CLI handles user interaction, rendering, and input, while the core orchestrates communication with the Gemini API, manages conversation state, and executes tools. These tools, located in `packages/core/src/tools`, extend Gemini's functionality by allowing it to interact with the local environment, such as the file system or shell. The workflow involves the CLI capturing user input, passing it to the core, which then constructs and sends a request to the Gemini API. The API's response, which may include a request to use a tool, is processed by the core, and the final result is displayed to the user by the CLI. Security is a key consideration, with user confirmation required for any potentially risky operations.
```

## What is an "Agent"?

<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
</script>

AI agents are systems that can **think**, **act**, and **learn** from results. Unlike chatbots that only generate text, agents interact with the world through tools and APIs to complete real tasks.

The core pattern is the **Thought-Action-Observation loop**: the LLM reasons about what to do (Thought), executes tools with specific parameters (Action), receives results (Observation), and repeats until the task is complete.

<MermaidDiagram
	height={400}
	diagram={`graph TD
    subgraph "Agent"
        A(Thought) --> B(Action);
        B --> C(Observation);
        C --> A;
    end
    User_Input --> A;
    B --> External_World;
    External_World --> C;
    A --> Final_Response;`}
/>

## Agents are Just Programs

Here's the crucial insight: **agents don't contain AI models**. They're regular programs that make API calls to external LLMs, just like any application that calls a weather API or database service.

<MermaidDiagram
	height={300}
	diagram={`graph LR
    subgraph "Your Computer"
        A[Gemini CLI<br/>TypeScript Program]
    end
    subgraph "Google's Servers"
        C[Gemini LLM API]
    end
    A -->|HTTPS Request| C
    C -->|JSON Response| A
    D[API Key: GEMINI_API_KEY] -.->|Authenticates| A`}
/>

The Gemini CLI is a TypeScript application that:
1. Takes your input from the terminal
2. Sends it to Google's Gemini API servers
3. Receives the AI's response
4. Executes any requested tools locally
5. Sends results back to the API for further reasoning

### Setting Up the Connection

Just like any API client, you need credentials:

```bash
# Get an API key from Google AI Studio
export GEMINI_API_KEY="your-api-key-here"

# Or use Google account authentication
gemini login
```

The agent then makes API calls similar to:

```typescript
// Simplified version of what happens inside Gemini CLI
const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: userMessage }] }],
    tools: availableTools
  })
});
```

## Agents are Just Programs

Here's a crucial insight: **agents don't contain AI models**. The Gemini CLI is simply a TypeScript program that makes API calls to Google's external LLM servers. It's no different from a weather app calling a weather API—the intelligence lives in the cloud, not in your terminal.

```typescript
// From packages/core/src/api/content-generator.ts
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

export class ContentGenerator {
  constructor(
    private readonly apiKey: string,  // Your GEMINI_API_KEY
    private readonly modelId: string  // e.g., "gemini-1.5-flash"
  ) {}
  
  async generateContent(request: GenerateContentRequest) {
    const response = await fetch(`${API_URL}${this.modelId}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey
      },
      body: JSON.stringify(request)
    });
    return response.json();
  }
}
```

The entire "agent" is just orchestration code that:
1. Takes your input
2. Constructs a JSON request with available tools
3. Sends it to Google's API over HTTPS
4. Processes the response and executes any requested tools
5. Repeats until done

<MermaidDiagram
	height={300}
	diagram={`graph LR
    A[Your Terminal] --> B[Gemini CLI<br/>TypeScript Program]
    B --> C[HTTPS API Call]
    C --> D[Google's Servers<br/>Actual LLM]
    D --> E[JSON Response]
    E --> B
    B --> F[Execute Tools<br/>Locally]
    F --> B`}
/>

### From Theory to Practice

When you ask "How many files are in the src directory?", the agent doesn't guess—it uses the TAO loop to gather real information. The key difference: **agents perform real-world actions**, while chatbots only process training data.

<MermaidDiagram
	height={500}
	diagram={`sequenceDiagram
    participant User
    participant CLI as "Gemini CLI"
    participant API as "Google's API"
    participant Tools as "Local Tools"
    User->>CLI: "How many files in src?"
    CLI->>API: POST /generateContent<br/>{messages, tools: [list_directory]}
    API->>API: LLM thinks: "I need to list files"
    API-->>CLI: {toolCall: "list_directory", args: {path: 'src/'}}
    CLI->>Tools: Execute: list_directory(path='src/')
    Tools-->>CLI: ["file1.ts", "file2.ts", ...]
    CLI->>API: POST /generateContent<br/>{toolResults: ["file1.ts", "file2.ts"]}
    API->>API: LLM processes results
    API-->>CLI: {text: "There are 2 files in src"}
    CLI-->>User: "There are 2 files in the src directory."`}
/>

## Internals

The Gemini CLI implements agents through three core components that orchestrate API calls to Google's LLM:

- **GeminiChat**: Constructs API requests with your messages and available tools, then sends them to Google's servers
- **CoreToolScheduler**: When the API responds with tool requests, safely executes them locally
- **ToolRegistry**: Tells the API what tools are available (file reading, shell commands, etc.)

The key insight: these components don't "think"—they format requests for the external API that does the actual reasoning.

<MermaidDiagram
	height={400}
	diagram={`graph TD
    subgraph "Core Engine"
        A["📄 GeminiChat"]
        B["📄 CoreToolScheduler"]
        C["📄 ToolRegistry"]
    end
    A -- Tool Call Request --> B;
    B -- "What tool can do this?" --> C;
    C -- "Here is the tool" --> B;
    B -- "Run this tool" --> C;
    C -- "Here is the result" --> B;
    B -- Tool Output --> A;
    click A "https://github.com/google-gemini/gemini-cli/blob/c55b15f705d083e3dadcfb71494dcb0d6043e6c6/packages/core/src/core/geminiChat.ts#L136" _blank
    click B "https://github.com/google-gemini/gemini-cli/blob/c55b15f705d083e3dadcfb71494dcb0d6043e6c6/packages/core/src/core/coreToolScheduler.ts#L224" _blank
    click C "https://github.com/google-gemini/gemini-cli/blob/c55b15f705d083e3dadcfb71494dcb0d6043e6c6/packages/core/src/tools/tool-registry.ts#L124" _blank`}
/>

### Safety and Extensibility

The system requires user approval for dangerous operations:

```typescript
if (tool.requiresApproval && this.approvalMode !== ApprovalMode.AUTO_APPROVE) {
  this.setStatusInternal(toolCall, 'awaiting_approval');
  await this.waitForApproval(toolCall);
}
```

It also supports dynamic tool discovery from your projects:

```typescript
export class DiscoveredTool extends BaseTool<ToolParams, ToolResult> {
  async execute(params: ToolParams): Promise<ToolResult> {
    const child = spawn(this.config.getToolCallCommand()!, [this.name]);
    child.stdin.write(JSON.stringify(params));
    // ... handle execution and results
  }
}
```

## How Gemini Implements Thought-Action-Observation

### Hidden Thoughts

The system captures internal reasoning without showing it to users:

```typescript
if (part.thought) {
  thoughtParts.push(part);  // Hidden from user
} else if (part.text) {
  textBuffer += part.text;  // Shown to user
}
```

### Tool Execution

Tools progress through a state machine: `validating → awaitingApproval → scheduled → executing → success/error`:

```typescript
if (response.functionCalls) {
  await this.toolScheduler.scheduleToolCalls(response.functionCalls);
}
```

### Automatic Observations

Tool results automatically feed back into the conversation:

```typescript
if (allToolsComplete && !isClientInitiated) {
  submitQuery(mergePartListUnions([
    { functionResponses: toolResponses }
  ]), { isContinuation: true });
}
```

### Example: Counting TypeScript Files

**User**: "How many TypeScript files are in src?"

**Thought** (hidden): "Use list_directory tool"

**Action**: 
```typescript
list_directory(path='src/', pattern='*.ts')
```

**Observation**: 
```json
{files: ['a.ts', 'b.ts'], count: 2}
```

**Response**: "There are 2 TypeScript files in src"

### Key Features

- **Streaming**: Real-time feedback via async streams
- **Concurrency**: Multiple tools execute in parallel using `Promise.all()`
- **State Machine**: Tools progress through well-defined states
- **Auto-feedback**: Results automatically re-enter the conversation loop

## Key Takeaways

- **Agents are API Clients**: They don't contain AI—they call external LLM services
- **Clean Architecture**: Separation of concerns (Chat/Scheduler/Registry) enables maintainability
- **Safety First**: User approval for dangerous operations builds trust
- **Practical Design**: Streaming, concurrency, and extensibility make agents useful today
- **Anyone Can Build One**: With an API key and some code, you can create your own agent

## The Future of AI Agents

As LLMs evolve, agents will become our primary interface for complex systems. The patterns from Gemini CLI—safety, transparency, and extensibility—show how to build practical agents that bridge AI reasoning with real-world actions.