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

At its core, an AI agent is more than just a chatbot—it's a system that can **think**, **act**, and **learn** from the results of its actions. While traditional LLMs can only generate text responses, agents can interact with the world around them through tools and APIs, making them capable of completing real tasks.

The fundamental pattern that defines an agent is the **Thought-Action-Observation loop**. This cognitive cycle mirrors how humans approach problem-solving: we think about what to do, take an action, observe the results, and then think about what to do next. This iterative process continues until the task is complete.

In the context of AI agents, this loop manifests as:
- **Thought**: The LLM reasons about the current situation and decides what action to take
- **Action**: The agent executes a tool or function with specific parameters
- **Observation**: The agent receives the results of that action
- **Repeat**: The cycle continues until the agent has enough information to provide a final answer

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

### From Theory to Practice

Let's see how this abstract concept works in practice. When you ask an agent a question like "How many files are in the src directory?", it doesn't just guess or hallucinate an answer. Instead, it follows the Thought-Action-Observation loop to gather real information and provide an accurate response.

The sequence diagram below shows the actual flow of execution. Notice how the agent doesn't immediately answer the user's question. Instead, it:
1. Recognizes that it needs to gather information (Thought)
2. Calls the appropriate tool with the right parameters (Action)
3. Processes the tool's output (Observation)
4. Uses that information to formulate an accurate answer

This is the key difference between a chatbot and an agent: **agents can gather information and perform actions in the real world**, while chatbots can only work with the information they were trained on.

<MermaidDiagram
	height={500}
	diagram={`sequenceDiagram
    participant User
    participant AgentCore as "Agent Core (LLM)"
    participant Tools
    User->>AgentCore: "How many files in src?"
    AgentCore->>AgentCore: Thought: I need to list files. I should use the 'list_directory' tool.
    AgentCore->>Tools: Execute: list_directory(path='src/')
    Tools-->>AgentCore: Observation: ["file1.ts", "file2.ts", ...]
    AgentCore->>AgentCore: Thought: The tool returned a list of files. Now I can count them and answer the user.
    AgentCore-->>User: "There are N files in the src directory."`}
/>

## Internals

Now that we understand the conceptual model, let's dive into how the Gemini CLI actually implements this agent pattern. The architecture is elegantly simple, consisting of three core components that work together to create the agent experience.

### The Three Pillars

The Gemini CLI's core engine is built on three fundamental components, each with a specific responsibility:

1. **GeminiChat**: The brain of the operation. This component manages the conversation with the Gemini API, maintaining context and deciding when to use tools versus when to respond directly.

2. **CoreToolScheduler**: The safety and operations manager. When GeminiChat decides a tool needs to be used, it doesn't execute it directly. Instead, it delegates to the CoreToolScheduler, which handles approval workflows, executes tools safely, and manages the lifecycle of tool calls.

3. **ToolRegistry**: The capability catalog. This component maintains a registry of all available tools, their schemas, and execution logic. It's extensible, allowing new tools to be added dynamically, including custom tools discovered from your project.

### How They Work Together

The beauty of this architecture lies in its separation of concerns. GeminiChat doesn't need to know how tools are executed—it just knows they exist and how to request them. CoreToolScheduler doesn't need to understand the AI model—it just manages tool execution safely. And ToolRegistry doesn't need to know about either—it just provides a catalog of capabilities.

This clean separation makes the system both robust and extensible. You can add new tools without touching the core chat logic, implement new safety features without modifying the AI integration, and even swap out the underlying model without changing the tool system.

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
    
    click A "https://github.com/google-gemini/gemini-cli/blob/32c16b75/packages/core/src/core/geminiChat.ts#L136" _blank
    click B "https://github.com/google-gemini/gemini-cli/blob/32c16b75/packages/core/src/core/coreToolScheduler.ts#L224" _blank
    click C "https://github.com/google-gemini/gemini-cli/blob/32c16b75/packages/core/src/tools/tool-registry.ts#L124" _blank`}
/>

### Safety First: The Approval System

One of the most important aspects of the Gemini CLI is its focus on safety. The CoreToolScheduler implements an approval system that ensures potentially dangerous operations (like modifying files or running shell commands) require user confirmation:

```typescript
// From CoreToolScheduler - handling tool execution with approval
private async executeWithApproval(toolCall: ToolCall): Promise<void> {
  const tool = await this.toolRegistry.getTool(toolCall.name);
  
  if (tool.requiresApproval && this.approvalMode !== ApprovalMode.AUTO_APPROVE) {
    this.setStatusInternal(toolCall, 'awaiting_approval');
    // Wait for user to approve or reject
    await this.waitForApproval(toolCall);
  }
  
  // Execute the tool with proper error handling
  try {
    const result = await tool.execute(toolCall.parameters);
    this.setStatusInternal(toolCall, 'completed', result);
  } catch (error) {
    this.setStatusInternal(toolCall, 'error', error);
  }
}
```

### Extensibility Through Tool Discovery

The ToolRegistry supports dynamic tool discovery, allowing the CLI to find and use custom tools from your project:

```typescript
// From ToolRegistry - discovering project-specific tools
export class DiscoveredTool extends BaseTool<ToolParams, ToolResult> {
  constructor(
    private readonly config: Config,
    readonly name: string,
    readonly description: string,
    readonly parameterSchema: Record<string, unknown>,
  ) {
    const discoveryCmd = config.getToolDiscoveryCommand()!;
    const callCommand = config.getToolCallCommand()!;
    
    // Tools are discovered by executing a command in your project
    // and can be called through a standardized interface
    super(name, name, description, parameterSchema, false, false);
  }
  
  async execute(params: ToolParams): Promise<ToolResult> {
    // Execute the tool through your project's tool command
    const child = spawn(this.config.getToolCallCommand()!, [this.name]);
    child.stdin.write(JSON.stringify(params));
    // ... handle execution and results
  }
}
```

## How Gemini Implements Thought-Action-Observation

The Gemini CLI implements the Thought-Action-Observation loop in a sophisticated way that balances transparency with user experience. Here's how each component of the loop works in practice:

### The Hidden Thought Process

One of the most interesting discoveries in the Gemini CLI codebase is the implementation of "hidden thoughts." The system supports internal reasoning that's never shown to the user:

```typescript
// From packages/core/src/core/geminiChat.ts (lines 186-197)
for (const part of parts) {
  if (part.thought) {
    // Thoughts are captured but not added to history
    thoughtParts.push(part);
  } else if (part.text) {
    // Regular content is shown to user
    textBuffer += part.text;
  }
}
```

This means when Gemini is deciding what to do, it can generate internal reasoning like:
- "I need to check if this file exists before trying to read it"
- "The user is asking about file count, so I should use the list_directory tool"
- "This operation might be dangerous, I should ask for confirmation"

These thoughts guide the agent's behavior but remain invisible to maintain a clean user experience.

### The Action Phase: Tool Execution

When the model decides to take an action, it generates a tool call request. Here's the flow:

```typescript
// From GeminiChat - the model's response includes tool calls
const response = await this.model.generateContent({
  contents: messages,
  tools: [{ functionDeclarations: availableTools }]
});

// Tool calls are extracted and sent to the scheduler
if (response.functionCalls) {
  await this.toolScheduler.scheduleToolCalls(response.functionCalls);
}
```

The CoreToolScheduler then manages the entire lifecycle with a sophisticated state machine:

```typescript
// Tool execution states (from packages/core/src/types/tool.ts)
export type ToolCallState =
  | 'validating'           // Initial validation
  | 'awaitingApproval'     // Waiting for user confirmation
  | 'scheduled'            // Ready to execute
  | 'executing'            // Currently running
  | 'success'              // Completed successfully
  | 'error'                // Failed with error
  | 'cancelled'            // Cancelled by user

// From CoreToolScheduler (lines 128-156)
async scheduleToolCalls(
  toolCallRequests: ModelPartToolCallRequest[],
  options?: ScheduleOptions
): Promise<ScheduledToolCall[]> {
  const scheduledToolCalls = toolCallRequests.map(request => ({
    id: generateId(),
    state: options?.skipConfirmation ? 'scheduled' : 'validating',
    request,
    // ... other fields
  }));
  
  // Validate and potentially request user approval
  for (const toolCall of scheduledToolCalls) {
    if (toolCall.state === 'validating') {
      await this.validateToolCall(toolCall);
    }
  }
  
  return scheduledToolCalls;
}
```

### The Observation Phase: Processing Results

After tools execute, their results become observations that feed back into the conversation automatically:

```typescript
// From packages/cli/src/ui/hooks/useGeminiStream.ts (lines 516-538)
useEffect(() => {
  if (!toolCalls || toolCalls.length === 0) return;
  
  const allToolsComplete = toolCalls.every(tool => 
    ['success', 'error', 'cancelled'].includes(tool.state)
  );
  
  if (allToolsComplete && !isClientInitiated) {
    // Gather all tool responses
    const toolResponses = toolCalls.map(tool => ({
      id: tool.id,
      response: tool.response || tool.error
    }));
    
    // OBSERVATION: Feed results back into the conversation
    submitQuery(mergePartListUnions([
      { functionResponses: toolResponses }
    ]), { isContinuation: true });
  }
}, [toolCalls]);
```

This automatic feedback loop is key to the agent's ability to iteratively solve problems—once all tools complete, their observations are immediately fed back to the model for further processing.

### The Complete Loop in Action

Here's a real example of the loop from the codebase:

1. **User Input**: "How many TypeScript files are in the src directory?"

2. **Thought** (hidden): "I need to list files in src and filter for .ts extensions"

3. **Action**: 
   ```typescript
   {
     name: 'list_directory',
     parameters: { path: './src', pattern: '*.ts' }
   }
   ```

4. **Observation**: 
   ```typescript
   {
     files: ['index.ts', 'config.ts', 'utils.ts'],
     count: 3
   }
   ```

5. **Response**: "There are 3 TypeScript files in the src directory: index.ts, config.ts, and utils.ts"

This cycle continues until the agent has enough information to provide a complete answer.

### Key Architectural Innovations

The Gemini CLI's implementation includes several sophisticated features that make it particularly powerful:

#### Streaming Architecture
The entire loop operates on a streaming basis, allowing for real-time feedback and long-running operations:

```typescript
// From geminiChat.ts (lines 174-182)
const stream = await response.stream;
for await (const chunk of stream) {
  const chunkContent = parseChunkContent(chunk);
  yield {
    type: 'content',
    content: chunkContent
  };
}
```

#### Concurrent Tool Execution
Multiple tools can execute in parallel, dramatically improving performance for complex tasks:

```typescript
// From coreToolScheduler.ts (lines 210-225)
const executionPromises = toolCalls.map(async (toolCall) => {
  try {
    const result = await this.executeTool(toolCall);
    toolCall.state = 'success';
    toolCall.response = result;
  } catch (error) {
    toolCall.state = 'error';
    toolCall.error = error;
  }
});

await Promise.all(executionPromises);
```

This means if an agent needs to check multiple files or run several commands, it can do them all at once rather than sequentially.

## Key Takeaways

The Gemini CLI demonstrates several important principles for building AI agents:

1. **Separation of Concerns**: By clearly separating the AI logic (GeminiChat), tool execution (CoreToolScheduler), and capability management (ToolRegistry), the system remains maintainable and extensible.

2. **Safety by Design**: The approval system ensures that agents can't perform destructive actions without user consent. This is crucial for building trust in AI systems that can interact with the real world.

3. **Extensibility**: The tool discovery mechanism allows agents to adapt to different environments and projects, making them truly useful across various contexts.

4. **Transparency**: By making the Thought-Action-Observation loop visible to users, the system builds trust and helps users understand what the agent is doing and why.

5. **Practical Over Theoretical**: While the concept of agents can seem abstract, the Gemini CLI shows that with thoughtful architecture, we can build practical tools that augment human capabilities today.

## The Future of AI Agents

As LLMs become more capable and tools become more sophisticated, we're moving toward a future where AI agents will be our primary interface for interacting with complex systems. The patterns established by projects like Gemini CLI—safety, transparency, and extensibility—will be crucial for ensuring these powerful systems remain beneficial and under human control.

Whether you're building your own agent or just trying to understand how they work, remember that at their core, agents are about bridging the gap between AI's ability to understand and reason, and the real world's need for concrete actions and results.