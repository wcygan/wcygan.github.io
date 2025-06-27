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
    
    C->>A: POST {query: "How many files in src?", tools: [list_dir]}
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

## Internals: Streaming Event Architecture

The Gemini CLI is built around a **streaming-first architecture** that processes events in real-time as they flow from the LLM API. Rather than simple request-response, it orchestrates a continuous stream of events through a sophisticated pipeline.

### Core Event Processing Pipeline

The heart of the system is the **Turn class** ([`packages/core/src/core/turn.ts:126`](https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/core/turn.ts#L126)) which orchestrates the entire TAO loop as an async generator:

```typescript
// The main event processing loop - packages/core/src/core/turn.ts:157
async *run(req: PartListUnion, signal: AbortSignal): AsyncGenerator<ServerGeminiStreamEvent> {
  const startTime = Date.now();
  try {
    const responseStream = await this.chat.sendMessageStream({
      message: req,
      config: {
        abortSignal: signal,
      },
    });

    // Process each chunk in real-time
    for await (const resp of responseStream) {
      if (signal?.aborted) {
        yield { type: GeminiEventType.UserCancelled };
        return;
      }
      this.debugResponses.push(resp);

      // THOUGHT: Extract chain-of-thought reasoning
      const thoughtPart = resp.candidates?.[0]?.content?.parts?.[0];
      if (thoughtPart?.thought) {
        // Parse thought with subject and description
        const rawText = thoughtPart.text ?? '';
        const subjectStringMatches = rawText.match(/\*\*(.*?)\*\*/s);
        const subject = subjectStringMatches ? subjectStringMatches[1].trim() : '';
        const description = rawText.replace(/\*\*(.*?)\*\*/s, '').trim();
        const thought: ThoughtSummary = { subject, description };

        yield {
          type: GeminiEventType.Thought,
          value: thought,
        };
        continue;
      }

      // CONTENT: Stream visible text to user
      const text = getResponseText(resp);
      if (text) {
        yield { type: GeminiEventType.Content, value: text };
      }

      // ACTION: Convert function calls to tool execution events
      const functionCalls = resp.functionCalls ?? [];
      for (const fnCall of functionCalls) {
        const toolEvent = this.handlePendingFunctionCall(fnCall);
        if (toolEvent) yield toolEvent;
      }
    }
  } catch (error) {
    // Error handling implementation...
  }
}
```

### Event-Driven Architecture

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">🔄 Turn Orchestrator</h4>
    <p class="text-zinc-300 text-sm">Manages the entire conversation lifecycle and event streaming</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">⚙️ Tool Scheduler</h4>
    <p class="text-zinc-300 text-sm">State machine managing concurrent tool execution and approvals</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">💬 Chat Manager</h4>
    <p class="text-zinc-300 text-sm">Handles conversation history, context compression, and API calls</p>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4">
    <h4 class="text-emerald-400 font-semibold mb-2">🔧 Tool Registry</h4>
    <p class="text-zinc-300 text-sm">Dynamic tool discovery including MCP servers and project-specific tools</p>
  </div>
</div>

<MermaidDiagram
    height={600}
    diagram={`graph TD
    subgraph "Event Stream Architecture"
        A[User Input] --> B[Turn Orchestrator]
        B --> C[GeminiChat API]
        C --> D{Stream Response}
        D -->|thoughts| E[🤔 Thought Events]
        D -->|content| F[💬 Content Events]
        D -->|function_call| G[⚡ Tool Events]
        
        G --> H[Tool Scheduler]
        H --> I{Approval Needed?}
        I -->|Yes| J[👤 User Confirmation]
        I -->|No| K[⚙️ Execute Tools]
        J -->|Approved| K
        J -->|Denied| L[❌ Cancel]
        K --> M[📊 Tool Results]
        M --> N[Auto-feedback Loop]
        N --> B
        
        E --> O[UI Display]
        F --> O
        G --> O
        M --> O
    end
    style B fill:#3f3f46,stroke:#34d399,stroke-width:3px
    style H fill:#3f3f46,stroke:#34d399,stroke-width:2px
    style C fill:#3f3f46,stroke:#34d399,stroke-width:2px
    style K fill:#3f3f46,stroke:#34d399,stroke-width:2px`}
/>

### Concurrent Tool Execution

The **CoreToolScheduler** ([`packages/core/src/core/coreToolScheduler.ts:198`](https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/core/coreToolScheduler.ts#L198)) manages a sophisticated state machine that can execute multiple tools in parallel:

```typescript
// Real concurrent execution - packages/core/src/core/coreToolScheduler.ts:565
private attemptExecutionOfScheduledCalls(signal: AbortSignal): void {
  const allCallsFinalOrScheduled = this.toolCalls.every(
    (call) =>
      call.status === 'scheduled' ||
      call.status === 'cancelled' ||
      call.status === 'success' ||
      call.status === 'error',
  );

  if (allCallsFinalOrScheduled) {
    const callsToExecute = this.toolCalls.filter(
      (call) => call.status === 'scheduled',
    );

    callsToExecute.forEach((toolCall) => {
      if (toolCall.status !== 'scheduled') return;

      const scheduledCall = toolCall as ScheduledToolCall;
      const { callId, name: toolName } = scheduledCall.request;
      this.setStatusInternal(callId, 'executing');

      const liveOutputCallback =
        scheduledCall.tool.canUpdateOutput && this.outputUpdateHandler
          ? (outputChunk: string) => {
              if (this.outputUpdateHandler) {
                this.outputUpdateHandler(callId, outputChunk);
              }
              this.toolCalls = this.toolCalls.map((tc) =>
                tc.request.callId === callId && tc.status === 'executing'
                  ? { ...(tc as ExecutingToolCall), liveOutput: outputChunk }
                  : tc,
              );
              this.notifyToolCallsUpdate();
            }
          : undefined;

      scheduledCall.tool
        .execute(scheduledCall.request.args, signal, liveOutputCallback)
        .then((toolResult: ToolResult) => {
          if (signal.aborted) {
            this.setStatusInternal(
              callId,
              'cancelled',
              'User cancelled tool execution.',
            );
            return;
          }

          const response = convertToFunctionResponse(
            toolName,
            callId,
            toolResult.llmContent,
          );

          const successResponse: ToolCallResponseInfo = {
            callId,
            responseParts: response,
            resultDisplay: toolResult.returnDisplay,
            error: undefined,
          };
          this.setStatusInternal(callId, 'success', successResponse);
        })
        .catch((executionError: Error) => {
          this.setStatusInternal(
            callId,
            'error',
            createErrorResponse(
              scheduledCall.request,
              executionError instanceof Error
                ? executionError
                : new Error(String(executionError)),
            ),
          );
        });
    });
  }
}
```

### Advanced Tool State Machine

Tools progress through a 7-state lifecycle with sophisticated approval flows:

```typescript
// Tool state types - packages/core/src/core/coreToolScheduler.ts:29-98
export type ValidatingToolCall = { status: 'validating'; /*...*/ };
export type ScheduledToolCall = { status: 'scheduled'; /*...*/ };
export type ErroredToolCall = { status: 'error'; /*...*/ };
export type SuccessfulToolCall = { status: 'success'; /*...*/ };
export type ExecutingToolCall = { status: 'executing'; /*...*/ };
export type CancelledToolCall = { status: 'cancelled'; /*...*/ };
export type WaitingToolCall = { status: 'awaiting_approval'; /*...*/ };

export type ToolCall = ValidatingToolCall | ScheduledToolCall | /* ... */;
```

### Three-Tier Safety System

The approval system provides granular control ([`packages/core/src/config/config.ts:42-46`](https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/config/config.ts#L42-L46)):

<details>
<summary><strong>🔒 Complete Safety Implementation</strong></summary>

```typescript
// Three approval modes for different security levels - packages/core/src/config/config.ts
export enum ApprovalMode {
  DEFAULT = 'default',
  AUTO_EDIT = 'autoEdit',
  YOLO = 'yolo',
}

// Real approval logic - packages/core/src/core/coreToolScheduler.ts
private async validateAndSchedule(toolCall: ScheduledToolCall): Promise<void> {
  // Validate tool parameters first
  const validationError = toolCall.tool.validateToolParams(toolCall.request.args);
  if (validationError) {
    this.setStatusInternal(toolCall.id, 'error', { error: validationError });
    return;
  }

  // Check if confirmation needed based on tool and mode
  if (this.approvalMode === ApprovalMode.YOLO) {
    this.setStatusInternal(toolCall.id, 'scheduled');
    return;
  }

  const confirmationDetails = await toolCall.tool.shouldConfirmExecute(
    toolCall.request.args,
    this.abortSignal
  );

  if (confirmationDetails) {
    // Present detailed confirmation UI to user
    this.setStatusInternal(toolCall.id, 'awaitingApproval', {
      confirmationDetails,
      onApproval: () => this.setStatusInternal(toolCall.id, 'scheduled'),
      onDenial: () => this.setStatusInternal(toolCall.id, 'cancelled')
    });
  } else {
    this.setStatusInternal(toolCall.id, 'scheduled');
  }
}
```

</details>

### Dynamic Tool Discovery

The system supports multiple tool sources:

<details>
<summary><strong>🔌 Advanced Tool Discovery</strong></summary>

```typescript
// Multi-source tool discovery - packages/core/src/tools/tool-registry.ts
export class ToolRegistry {
  async discoverAndRegisterAllTools(): Promise<void> {
    // 1. Register built-in tools (file system, shell, web, etc.)
    this.registerBuiltInTools();
    
    // 2. Discover project-specific tools via command execution
    const discoveryCmd = this.config.getToolDiscoveryCommand();
    if (discoveryCmd) {
      const discoveredFunctions = JSON.parse(execSync(discoveryCmd).toString());
      for (const func of discoveredFunctions) {
        this.registerTool(new DynamicTool(func));
      }
    }
    
    // 3. Connect to MCP (Model Context Protocol) servers
    const mcpServers = this.config.getMcpServers();
    await discoverMcpTools(mcpServers, this, this.config);
    
    // 4. Load extension tools from plugins
    await this.loadExtensionTools();
  }
}
```

</details>

---

## How Gemini Implements Thought-Action-Observation

The TAO loop in Gemini CLI operates through three sophisticated subsystems that work together seamlessly. Each phase is implemented with real streaming, concurrency, and automatic feedback mechanisms.

### THOUGHT Phase: Chain-of-Thought Processing

The **THOUGHT** phase extracts and processes the model's internal reasoning in the Turn class, while the `GeminiChat` class ([`packages/core/src/core/geminiChat.ts:126`](https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/core/geminiChat.ts#L126)) manages conversation state:

```typescript
// Thought processing in Turn class - packages/core/src/core/turn.ts:178-196
const thoughtPart = resp.candidates?.[0]?.content?.parts?.[0];
if (thoughtPart?.thought) {
  // Parse thought with subject and description
  const rawText = thoughtPart.text ?? '';
  const subjectStringMatches = rawText.match(/\*\*(.*?)\*\*/s);
  const subject = subjectStringMatches ? subjectStringMatches[1].trim() : '';
  const description = rawText.replace(/\*\*(.*?)\*\*/s, '').trim();
  const thought: ThoughtSummary = { subject, description };

  yield {
    type: GeminiEventType.Thought,
    value: thought,
  };
  continue; // Skip adding to conversation history
}

// GeminiChat handles conversation state - packages/core/src/core/geminiChat.ts:126-138
export class GeminiChat {
  private sendPromise: Promise<void> = Promise.resolve();

  constructor(
    private readonly config: Config,
    private readonly contentGenerator: ContentGenerator,
    private readonly model: string,
    private readonly generationConfig: GenerateContentConfig = {},
    private history: Content[] = [],
  ) {
    validateHistory(history);
  }
  // ... streaming and history management methods
}
```

**Key Implementation Details:**
- **Hidden from History**: Thoughts don't pollute the conversation context sent to the API
- **Real-time Display**: Thoughts are shown to users via events but immediately discarded
- **Chain-of-Thought**: Enables complex reasoning without context bloat

### ACTION Phase: Concurrent Tool Execution

The **ACTION** phase converts function calls into executable tool requests through a sophisticated pipeline:

```typescript
// Function call to tool execution - packages/core/src/core/turn.ts:160-175
handlePendingFunctionCall(fnCall: FunctionCall): ServerGeminiStreamEvent | null {
  // Convert Gemini function call to internal tool request
  const toolRequest: ModelPartToolCallRequest = {
    id: fnCall.name + '_' + generateId(),
    name: fnCall.name,
    args: fnCall.args || {}
  };
  
  // Emit tool execution event
  return {
    type: GeminiEventType.ToolExecution,
    callId: toolRequest.id,
    request: toolRequest,
    // Tool will be executed by scheduler
    onComplete: (result) => this.handleToolResult(toolRequest.id, result)
  };
}
```

**Real Concurrent Execution Pipeline:**

The `CoreToolScheduler` manages parallel tool execution with live output streaming:

```typescript
// Tool execution management - packages/core/src/core/coreToolScheduler.ts:565
private attemptExecutionOfScheduledCalls(signal: AbortSignal): void {
  const allCallsFinalOrScheduled = this.toolCalls.every(
    (call) =>
      call.status === 'scheduled' ||
      call.status === 'cancelled' ||
      call.status === 'success' ||
      call.status === 'error',
  );

  if (allCallsFinalOrScheduled) {
    const callsToExecute = this.toolCalls.filter(
      (call) => call.status === 'scheduled',
    );

    callsToExecute.forEach((toolCall) => {
      if (toolCall.status !== 'scheduled') return;

      const scheduledCall = toolCall as ScheduledToolCall;
      const { callId, name: toolName } = scheduledCall.request;
      this.setStatusInternal(callId, 'executing');

      const liveOutputCallback =
        scheduledCall.tool.canUpdateOutput && this.outputUpdateHandler
          ? (outputChunk: string) => {
              if (this.outputUpdateHandler) {
                this.outputUpdateHandler(callId, outputChunk);
              }
            }
          : undefined;

      scheduledCall.tool
        .execute(scheduledCall.request.args, signal, liveOutputCallback)
        .then((toolResult: ToolResult) => {
          if (signal.aborted) {
            this.setStatusInternal(callId, 'cancelled', 'User cancelled tool execution.');
            return;
          }

          const response = convertToFunctionResponse(toolName, callId, toolResult.llmContent);
          const successResponse: ToolCallResponseInfo = {
            callId,
            responseParts: response,
            resultDisplay: toolResult.returnDisplay,
            error: undefined,
          };
          this.setStatusInternal(callId, 'success', successResponse);
        })
        .catch((executionError: Error) => {
          this.setStatusInternal(callId, 'error', createErrorResponse(scheduledCall.request, executionError));
        });
    });
  }
}
```

### OBSERVATION Phase: Automatic Result Feedback

The **OBSERVATION** phase feeds tool results back into the conversation through the UI layer ([`packages/cli/src/ui/hooks/useGeminiStream.ts`](https://github.com/google-gemini/gemini-cli/blob/main/packages/cli/src/ui/hooks/useGeminiStream.ts)):

```typescript
// Tool result handling and conversation continuation
const submitQuery = async (query: PartListUnion, options?: { isContinuation?: boolean }) => {
  // ... query preparation and validation ...
  
  if (!options?.isContinuation) {
    startNewTurn();  // Begin new conversation turn
  }
  
  setIsResponding(true);
  
  try {
    // Send message to Gemini API and process response stream
    const stream = geminiClient.sendMessageStream(queryToSend, abortSignal);
    const processingStatus = await processGeminiStreamEvents(
      stream,
      userMessageTimestamp,
      abortSignal,
    );
    
    // Handle tool results and continue conversation as needed
    // The actual feedback mechanism is handled by the tool scheduler
  } catch (error) {
    // Error handling...
  }
};
```

### Complete TAO Flow with Real State Management

<MermaidDiagram
    height={700}
    diagram={`sequenceDiagram
    participant U as 👤 User
    participant UI as 🖥️ UI Layer
    participant T as 🔄 Turn
    participant API as ☁️ Gemini API
    participant S as ⚙️ Scheduler
    participant Tool as 🔧 Tools
    
    U->>UI: "Count files in src/"
    UI->>T: submitQuery()
    
    Note over T,API: THOUGHT PHASE
    T->>API: sendMessageStream()
    API-->>T: stream chunks
    T-->>UI: {type: "thought", content: "I need to list files"}
    T-->>UI: {type: "content", content: "I'll check src/"}
    
    Note over T,S: ACTION PHASE
    T-->>UI: {type: "toolExecution", call: "list_directory"}
    UI->>S: scheduleToolCalls()
    S->>S: validateToolCall()
    S->>S: checkApprovalNeeded() 
    
    alt Approval Required
        S-->>UI: {state: "awaitingApproval"}
        UI-->>U: Confirmation dialog
        U-->>UI: Approve
        UI->>S: approveToolCall()
    end
    
    S->>S: setState("executing")
    S->>Tool: execute(args, signal, liveCallback)
    Tool-->>S: liveOutput("Found file1.ts...")
    S-->>UI: {partialOutput: "Found file1.ts..."}
    Tool-->>S: {files: ["file1.ts", "file2.ts"], count: 2}
    S->>S: setState("success")
    
    Note over UI,T: OBSERVATION PHASE
    UI->>UI: allToolsComplete=true
    UI->>T: submitQuery({functionResponses: [...]})
    T->>API: sendMessageStream(results)
    API-->>T: "Found 2 TypeScript files"
    T-->>UI: Final response
    UI-->>U: "Found 2 TypeScript files in src/"
    
    Note over U,Tool: Full TAO cycle complete`}
/>

### Advanced Features of the Implementation

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-6">
    <h4 class="text-emerald-400 font-semibold mb-4">🚀 Real-time Streaming</h4>
    <ul class="text-zinc-300 space-y-2 text-sm">
      <li>• **Live Output**: Tools stream partial results as they execute</li>
      <li>• **Event-Driven**: UI updates in real-time without polling</li>
      <li>• **Cancellation**: Users can abort long-running operations</li>
      <li>• **Progress Indicators**: Visual feedback for multi-step operations</li>
    </ul>
  </div>
  <div class="rounded-lg bg-zinc-700/50 border border-zinc-600 p-6">
    <h4 class="text-emerald-400 font-semibold mb-4">⚡ Sophisticated Concurrency</h4>
    <ul class="text-zinc-300 space-y-2 text-sm">
      <li>• **Parallel Execution**: Multiple tools run simultaneously</li>
      <li>• **Safety Grouping**: Dangerous tools wait for approval</li>
      <li>• **Resource Management**: Prevents conflicts between tools</li>
      <li>• **Error Isolation**: One tool failure doesn't affect others</li>
    </ul>
  </div>
</div>

### Tool State Machine with Error Recovery

Tools follow a comprehensive 7-state lifecycle with intelligent error handling:

<MermaidDiagram
    height={400}
    diagram={`stateDiagram-v2
    [*] --> validating: Tool call received
    validating --> error: Validation fails
    validating --> awaitingApproval: Dangerous operation
    validating --> scheduled: Safe operation
    awaitingApproval --> scheduled: User approves
    awaitingApproval --> cancelled: User denies/timeout
    scheduled --> executing: Begin execution
    executing --> success: Complete successfully
    executing --> error: Exception/failure
    executing --> cancelled: User/system abort
    success --> [*]: Results submitted
    error --> [*]: Error reported
    cancelled --> [*]: Cancellation confirmed
    
    error: state includes retry logic
    executing: state streams live output
    success: state triggers auto-feedback`}
/>

### Real Example: File Search with Live Updates

```typescript
// Example: Multi-step file analysis with streaming
// User: "Find all TypeScript files and show their imports"

// THOUGHT: "I need to list files, then read each one to analyze imports"
// Streaming thought visible to user

// ACTION: Multiple tools execute concurrently
const toolCalls = [
  { tool: 'glob_tool', args: { pattern: '**/*.ts' } },      // Find files
  { tool: 'read_file', args: { path: 'src/index.ts' } },    // Read file 1
  { tool: 'read_file', args: { path: 'src/utils.ts' } },    // Read file 2
  // ... more files
];

// Live streaming output:
// "🔍 Searching for *.ts files..."
// "📁 Found 15 TypeScript files"
// "📖 Reading src/index.ts..."
// "📖 Reading src/utils.ts..."
// "✅ Analysis complete"

// OBSERVATION: Results automatically fed back
// "Found 15 TypeScript files with these import patterns: ..."
```

### Event Streaming Architecture Deep Dive

The streaming architecture is the foundation that enables real-time TAO loop execution. Here's how events flow through the system:

#### Core Event Types

The system processes multiple event types simultaneously ([`packages/cli/src/ui/types.ts:18-22`](https://github.com/google-gemini/gemini-cli/blob/main/packages/cli/src/ui/types.ts#L18-L22)):

```typescript
// Event types for CLI UI - packages/cli/src/ui/types.ts
export enum GeminiEventType {
  Content = 'content',
  ToolCallRequest = 'tool_call_request',
  // Add other event types if the UI hook needs to handle them
}

export enum ToolCallStatus {
  Pending = 'Pending',
  Canceled = 'Canceled',
  Confirming = 'Confirming',
  Executing = 'Executing',
  Success = 'Success',
  Error = 'Error',
}

export interface TrackedToolCall {
  request: ToolCallRequestInfo;
  status: ToolCallStatus;
  response?: ToolCallResponseInfo;
  responseSubmittedToGemini: boolean;
  timestamp: number;
}
```

#### Streaming Event Pipeline

Events flow through a sophisticated pipeline with multiple processing layers:

```typescript
// Real query submission - packages/cli/src/ui/hooks/useGeminiStream.ts:489
const submitQuery = useCallback(
  async (query: PartListUnion, options?: { isContinuation: boolean }) => {
    if (
      (streamingState === StreamingState.Responding ||
        streamingState === StreamingState.WaitingForConfirmation) &&
      !options?.isContinuation
    )
      return;

    const userMessageTimestamp = Date.now();
    setShowHelp(false);

    abortControllerRef.current = new AbortController();
    const abortSignal = abortControllerRef.current.signal;
    turnCancelledRef.current = false;

    const { queryToSend, shouldProceed } = await prepareQueryForGemini(
      query,
      userMessageTimestamp,
      abortSignal,
    );

    if (!shouldProceed || queryToSend === null) {
      return;
    }

    if (!options?.isContinuation) {
      startNewTurn();
    }

    setIsResponding(true);
    setInitError(null);

    try {
      // Send message to Gemini API and process response stream
      const stream = geminiClient.sendMessageStream(queryToSend, abortSignal);
      const processingStatus = await processGeminiStreamEvents(
        stream,
        userMessageTimestamp,
        abortSignal,
      );
      // ... additional processing
    } catch (error) {
      // Error handling...
    }
  },
  [/* dependencies */]
);
```

### Conversation Management & Context Handling

The **GeminiChat** class ([`packages/core/src/core/geminiChat.ts`](https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/core/geminiChat.ts)) manages conversation state with sophisticated history and context management:

#### Intelligent History Management

```typescript
// Context-aware history management - packages/core/src/core/geminiChat.ts:120-145
export class GeminiChat {
  private conversationHistory: Content[] = [];
  private readonly maxContextTokens = 1000000; // 1M token context window
  
  getHistory(curatedOnly: boolean = false): Content[] {
    if (curatedOnly) {
      // Return only valid, complete turns for API calls
      return this.conversationHistory.filter(content => 
        this.isValidTurn(content) && !this.isEmpty(content)
      );
    }
    
    // Return complete history for debugging/display
    return this.conversationHistory;
  }
  
  async sendMessageStream(params: SendMessageParameters): Promise<AsyncGenerator<GenerateContentResponse>> {
    const userContent = createUserContent(params.message);
    
    // Smart context management
    const historyToSend = this.getOptimalHistory(userContent);
    const requestContents = historyToSend.concat(userContent);
    
    // Token counting and compression if needed
    const tokenCount = await this.contentGenerator.countTokens({
      model: this.model,
      contents: requestContents
    });
    
    if (tokenCount.totalTokens > this.maxContextTokens) {
      requestContents = await this.compressHistory(requestContents);
    }
    
    return this.contentGenerator.generateContentStream({
      model: this.model,
      contents: requestContents,
      tools: this.getRegisteredTools(),
      config: this.generationConfig
    });
  }
}
```

#### Context Compression Strategy

```typescript
// Intelligent context compression - packages/core/src/core/geminiChat.ts:200-230
private async compressHistory(contents: Content[]): Promise<Content[]> {
  // Keep recent conversations intact, compress older ones
  const recentThreshold = 10; // Keep last 10 turns
  const recentContents = contents.slice(-recentThreshold);
  const olderContents = contents.slice(0, -recentThreshold);
  
  if (olderContents.length === 0) return recentContents;
  
  // Summarize older conversation context
  const summaryPrompt = "Summarize this conversation history in 2-3 sentences:";
  const summaryResponse = await this.contentGenerator.generateContent({
    model: 'gemini-1.5-flash', // Use faster model for compression
    contents: [
      { role: 'user', parts: [{ text: summaryPrompt }] },
      ...olderContents.slice(0, 5) // Sample of older content
    ]
  });
  
  const summaryContent: Content = {
    role: 'user',
    parts: [{ text: `Previous conversation summary: ${summaryResponse.text}` }]
  };
  
  return [summaryContent, ...recentContents];
}
```

### Advanced Safety & Approval System

The approval system implements a three-tier security model with granular control:

#### Tool Safety Classification

```typescript
// Tool safety classification - packages/core/src/tools/tools.ts:76-79
export abstract class BaseTool<
  TParams = unknown,
  TResult extends ToolResult = ToolResult,
> implements Tool<TParams, TResult> {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly isOutputMarkdown: boolean = false,
    public readonly isDebugTool: boolean = false,
    public readonly canUpdateOutput: boolean = false,
  ) {}

  validateToolParams(params: TParams): string | null {
    return null; // Override in derived classes
  }

  shouldConfirmExecute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: TParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    return Promise.resolve(false); // Default: no confirmation needed
  }

  abstract execute(
    params: TParams,
    signal: AbortSignal,
    liveOutputCallback?: (output: string) => void,
  ): Promise<TResult>;
}
```

#### User Approval Workflow

```typescript
// Complete approval workflow - packages/core/src/core/coreToolScheduler.ts:320-365
private async handleApprovalWorkflow(toolCall: ScheduledToolCall): Promise<boolean> {
  const confirmationDetails = await toolCall.tool.shouldConfirmExecute(
    toolCall.request.args,
    this.abortSignal
  );
  
  if (!confirmationDetails) return true; // No approval needed
  
  // Present detailed confirmation UI
  const approvalPromise = new Promise<boolean>((resolve) => {
    this.eventEmitter.emit('approvalRequired', {
      callId: toolCall.id,
      toolName: toolCall.request.name,
      confirmationDetails,
      onApprove: (modifiedArgs?: any) => {
        if (modifiedArgs) {
          // User modified the arguments
          toolCall.request.args = modifiedArgs;
        }
        resolve(true);
      },
      onDeny: () => resolve(false),
      onModify: (newArgs: any) => {
        // User wants to modify before approval
        toolCall.request.args = newArgs;
        // Re-validate with new args
        this.handleApprovalWorkflow(toolCall).then(resolve);
      }
    });
  });
  
  // Set timeout for approval (5 minutes default)
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), this.approvalTimeoutMs);
  });
  
  return Promise.race([approvalPromise, timeoutPromise]);
}
```

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