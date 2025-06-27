---
title: Agents
date: June 26, 2025
description: What is an AI Agent?
tags: [AI, Agents, LLMs]
---

<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
  import InfoBox from '$lib/components/InfoBox.svelte';
</script>

## Quick Start

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

## What is an "Agent"?

<InfoBox title="Insight">
  {#snippet children()}
    <p>AI agents are systems that can <strong>think</strong>, <strong>act</strong>, and <strong>learn</strong> from results. Unlike chatbots that only generate text, agents interact with the world through tools and APIs to complete real tasks.</p>
  {/snippet}
</InfoBox>

The core pattern is the **Thought-Action-Observation (TAO) loop**:

<MermaidDiagram
	height={500}
	diagram={`graph TD
    subgraph "TAO Loop"
        A[🤔 Think] --> B[⚡ Act]
        B --> C[👁️ Observe]
        C --> A
    end
    User[User Query] --> A
    B --> World[🌍 Real World]
    World --> C
    A --> Response[Final Answer]
    style A fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style B fill:#3f3f46,stroke:#34d399
    style C fill:#3f3f46,stroke:#34d399
    style User fill:#52525b,stroke:#71717a
    style World fill:#52525b,stroke:#71717a
    style Response fill:#52525b,stroke:#71717a`}
/>

## Agents are Just Programs

<InfoBox title="Insight">
  {#snippet children()}
    <p><strong>Agents don't contain AI models!</strong> The Gemini CLI is simply a TypeScript program that makes API calls to Google's external LLM servers. It's no different from a weather app calling a weather API—the intelligence lives in the "cloud", not in your terminal.</p>
  {/snippet}
</InfoBox>

The entire "agent" is just orchestration code that looks like this:

<MermaidDiagram
	height={200}
	diagram={`graph LR
    A[💻 Terminal] --> B[📦 Gemini CLI]
    B --> C[🔒 HTTPS]
    C --> D[☁️ Google LLM]
    D --> E[📄 JSON]
    E --> B
    B --> F[🔧 Tools]
    F --> B
    style A fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style B fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style C fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style D fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style E fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style F fill:#3f3f46,stroke:#34d399,stroke-width:3px`}
/>

---

## From Theory to Practice

When you ask "How many files are in the src directory?", the agent doesn't guess—it uses the TAO loop to gather real information. The key difference: **agents perform real-world actions**, while chatbots only process training data.

<MermaidDiagram
	height={600}
	diagram={`sequenceDiagram
    participant U as 👤 User
    participant C as 📦 CLI
    participant A as ☁️ API
    participant T as 🔧 Tools
    
    U->>C: "How many files in src?"
    Note over C: Parse & prepare request
    
    C->>A: POST {tools: [list_dir]}
    Note over A: LLM thinks:<br/>"I need to list files"
    
    A-->>C: {tool: "list_dir", path: "src/"}
    
    C->>T: Execute locally
    T-->>C: ["file1.ts", "file2.ts"]
    
    C->>A: POST {results: [...]}
    Note over A: Process results
    
    A-->>C: "There are 2 files"
    C-->>U: "2 files in src directory"`}
/>

---

## Internals

The Gemini CLI implements agents through three core components that orchestrate API calls to Google's LLM:

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">📄 Turn Handler</h4>
    <p class="text-zinc-300 text-sm">Extracts tool calls from API responses and initiates the TAO loop</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">⚙️ CoreToolScheduler</h4>
    <p class="text-zinc-300 text-sm">Manages tool state progression and executes tools safely with user approval</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">🔧 ToolRegistry</h4>
    <p class="text-zinc-300 text-sm">Stores and provides access to available tools (file reading, shell commands, etc.)</p>
  </div>
</div>

<MermaidDiagram
	height={500}
	diagram={`graph TD
    subgraph "Core Engine"
        A[📄 Turn Handler]
        B[⚙️ Scheduler]
        C[🔧 Registry]
    end
    A -->|Request| B
    B -->|Lookup| C
    C -->|Tool| B
    B -->|Execute| B
    B -->|Results| A
    style A fill:#3f3f46,stroke:#34d399,stroke-width:2px
    style B fill:#3f3f46,stroke:#34d399,stroke-width:2px
    style C fill:#3f3f46,stroke:#34d399,stroke-width:2px
    click A "https://github.com/google-gemini/gemini-cli/blob/c55b15f705d083e3dadcfb71494dcb0d6043e6c6/packages/core/src/core/turn.ts#L206" _blank
    click B "https://github.com/google-gemini/gemini-cli/blob/c55b15f705d083e3dadcfb71494dcb0d6043e6c6/packages/core/src/core/coreToolScheduler.ts#L601" _blank
    click C "https://github.com/google-gemini/gemini-cli/blob/c55b15f705d083e3dadcfb71494dcb0d6043e6c6/packages/core/src/tools/tool-registry.ts#L124" _blank`}
/>

### Safety and Extensibility

The system requires user approval for dangerous operations:

<details>
<summary><strong>🔒 Security Implementation</strong></summary>

```typescript
// Approval flow
if (this.approvalMode === ApprovalMode.YOLO) {
  this.setStatusInternal(reqInfo.callId, 'scheduled');
} else {
  const confirmationDetails = await toolInstance.shouldConfirmExecute(
    reqInfo.args,
    signal,
  );

  if (confirmationDetails) {
    // Wrap confirmation handler
    this.setStatusInternal(
      reqInfo.callId,
      'awaiting_approval',
      wrappedConfirmationDetails,
    );
  } else {
    this.setStatusInternal(reqInfo.callId, 'scheduled');
  }
}
```

</details>

It also supports dynamic tool discovery:

<details>
<summary><strong>🔌 Tool Registration</strong></summary>

```typescript
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }
}
```

</details>

### Real Tool Example: ReadFileTool

<details>
<summary><strong>📂 Example Tool Implementation</strong></summary>

```typescript
export class ReadFileTool extends BaseTool<ReadFileToolParams, ToolResult> {
  static readonly Name: string = 'read_file';

  constructor(private rootDirectory: string, private config: Config) {
    super(
      ReadFileTool.Name,
      'ReadFile',
      'Reads and returns the content of a specified file',
      {
        properties: {
          absolute_path: { type: 'string', pattern: '^/' },
          offset: { type: 'number' },
          limit: { type: 'number' },
        },
        required: ['absolute_path'],
      },
    );
  }
  // ... execution logic
}
```

</details>

---

## How Gemini Implements Thought-Action-Observation

### The TAO Implementation

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">🤔 Hidden Thoughts</h4>
    <p class="text-zinc-300 text-sm">Internal reasoning is captured but not shown to users</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">⚡ Tool Execution</h4>
    <p class="text-zinc-300 text-sm">API requests trigger local tool execution in the scheduler</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">👁️ Auto-Feedback</h4>
    <p class="text-zinc-300 text-sm">Results automatically feed back into the conversation</p>
  </div>
</div>

<details>
<summary><strong>💻 Implementation Details</strong></summary>

```typescript
// Hidden thoughts handling
if (!part.thought && part.text !== undefined && part.text === '') {
  return false;
}

// Tool execution flow
const functionCalls = resp.functionCalls ?? [];
for (const fnCall of functionCalls) {
  const event = this.handlePendingFunctionCall(fnCall);
  if (event) yield event;
}

// Scheduler execution
scheduledCall.tool
  .execute(scheduledCall.request.args, signal, liveOutputCallback)
  .then((toolResult: ToolResult) => {
    const successResponse = {
      callId,
      responseParts: response,
      resultDisplay: toolResult.returnDisplay,
    };
    this.setStatusInternal(callId, 'success', successResponse);
  })
```

</details>

### Tool State Machine

Tools progress through well-defined states:

<MermaidDiagram
	height={350}
	diagram={`stateDiagram-v2
    [*] --> Validating
    Validating --> AwaitingApproval: Needs permission
    Validating --> Scheduled: Auto-approved
    AwaitingApproval --> Scheduled: User approves
    AwaitingApproval --> [*]: User denies
    Scheduled --> Executing: Start
    Executing --> Success: Complete
    Executing --> Error: Failed
    Success --> [*]
    Error --> [*]`}
/>

### Example: Counting TypeScript Files

<div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4 my-6">
  <div class="space-y-3">
    <div><strong class="text-emerald-400">👤 User:</strong> "How many TypeScript files are in src?"</div>
    <div><strong class="text-zinc-400">🤔 Thought:</strong> <em>(hidden)</em> "Use list_directory tool"</div>
    <div><strong class="text-emerald-400">⚡ Action:</strong> <code>list_directory(path='src/', pattern='*.ts')</code></div>
    <div><strong class="text-zinc-400">👁️ Observation:</strong> <code>&#123;files: ['a.ts', 'b.ts'], count: 2&#125;</code></div>
    <div><strong class="text-emerald-400">💬 Response:</strong> "There are 2 TypeScript files in src"</div>
  </div>
</div>

### Key Features

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
  <div class="text-center">
    <div class="text-2xl mb-1">🚀</div>
    <div class="text-sm text-zinc-300">Streaming</div>
  </div>
  <div class="text-center">
    <div class="text-2xl mb-1">⚡</div>
    <div class="text-sm text-zinc-300">Concurrent</div>
  </div>
  <div class="text-center">
    <div class="text-2xl mb-1">🔄</div>
    <div class="text-sm text-zinc-300">State Machine</div>
  </div>
  <div class="text-center">
    <div class="text-2xl mb-1">♻️</div>
    <div class="text-sm text-zinc-300">Auto-feedback</div>
  </div>
</div>

---

## Key Takeaways

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
  <div class="rounded-lg bg-emerald-900/20 border border-emerald-400/30 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">🎯 Technical Insights</h4>
    <ul class="text-zinc-300 space-y-1 text-sm">
      <li>• Agents are just API clients to external LLMs</li>
      <li>• Clean architecture with separated concerns</li>
      <li>• Safety through user approval flows</li>
    </ul>
  </div>
  <div class="rounded-lg bg-emerald-900/20 border border-emerald-400/30 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">🚀 Practical Benefits</h4>
    <ul class="text-zinc-300 space-y-1 text-sm">
      <li>• Real-time streaming and concurrency</li>
      <li>• Extensible tool system</li>
      <li>• Anyone can build one with an API key</li>
    </ul>
  </div>
</div>

## The Future of AI Agents

<div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4 my-6">
  <p class="text-zinc-100">As LLMs evolve, agents will become our primary interface for complex systems. The patterns from Gemini CLI—safety, transparency, and extensibility—show how to build practical agents that bridge AI reasoning with real-world actions.</p>
</div>