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

gemini --prompt 'explore the gemini-cli codebase and TLDR how it looks architecturaly and how it works'

I will start by exploring the codebase to understand its architecture and functionality.

First, I'll examine the `package.json` and `tsconfig.json` files to understand the project's structure and build process. Then, I'll look for architecture documentation, such as the `docs/architecture.md` file and any Mermaid diagrams. I'll also explore the `packages` directory, which seems to contain the core and CLI modules.

After gathering this information, I will provide a concise summary of the architecture and how the CLI operates. I'll begin by reading `docs/architecture.md`.I've reviewed the architecture overview. Now, to get a deeper understanding, I'll examine the contents of the `packages/cli` and `packages/core` directories. This will reveal the internal structure of these key components.The Gemini CLI has a modular architecture centered around two main packages: `packages/cli` and `packages/core`.

- **`packages/cli`**: This is the user-facing part of the CLI, which is responsible for handling user input, rendering the user interface, and managing the overall user experience.
- **`packages/core`**: This is the backend of the CLI, which is responsible for orchestrating interactions with the Gemini API, managing the execution of available tools, and handling the core logic of the application.

The CLI works by taking user input and sending it to the `packages/core` package, which then constructs a prompt for the Gemini API. The API's response, which may include a request to use a tool, is then processed by the `packages/core` package. If a tool is requested, the user is prompted for confirmation, and the tool is executed. The final response is then sent back to the `packages/cli` package and displayed to the user.
```

## What is an "Agent"?

<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
</script>

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

<MermaidDiagram
	height={400}
	diagram={`graph TD
    subgraph "Core Engine"
        A[GeminiChat]
        B[CoreToolScheduler]
        C[ToolRegistry]
    end
    A -- Tool Call Request --> B;
    B -- "What tool can do this?" --> C;
    C -- "Here is the tool" --> B;
    B -- "Run this tool" --> C;
    C -- "Here is the result" --> B;
    B -- Tool Output --> A;`}
/>



## Code References

  1. ToolRegistry
   * URL: https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/tools/tool-registry.ts
   * Role: The Toolbox.
   * Why it's important: This component acts as a comprehensive catalog of all the capabilities the agent has beyond generating text. It holds the definitions,
     parameters, and execution logic for every tool (e.g., read_file, run_shell_command). When the agent needs to perform an action, it consults this registry to know
     what tools are available and how to use them. Without the ToolRegistry, the agent would be a simple chatbot, unable to interact with the file system, execute
     commands, or perform any other actions on the user's behalf.


  2. GeminiChat
   * URL: https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/core/geminiChat.ts
   * Role: The Core Brain.
   * Why it's important: This is the central component that communicates directly with the Gemini Large Language Model. It is responsible for sending the user's prompt,
     the conversation history, and the list of available tools (from the ToolRegistry) to the LLM. It then receives the LLM's response, which could be a text answer or a
     request to use a specific tool. This class is the "Gemini" in the Gemini CLI; it's where the model's reasoning and decision-making happen.


  3. CoreToolScheduler
   * URL: https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/core/coreToolScheduler.ts
   * Role: The Safety and Operations Manager.
   * Why it's important: When the GeminiChat component receives a request from the LLM to use a tool, it doesn't execute it directly. Instead, it hands the request to
     the CoreToolScheduler. This is a crucial security and orchestration layer. It manages the entire lifecycle of a tool call: validating parameters, asking the user
     for confirmation before executing potentially dangerous actions (like modifying files), running the tool, and handling success or error states. It ensures that the
     agent acts safely and predictably.


  4. useGeminiStream
   * URL: https://github.com/google-gemini/gemini-cli/blob/main/packages/cli/src/ui/hooks/useGeminiStream.ts
   * Role: The UI-to-Core Bridge.
   * Why it's important: This is a high-level React hook that orchestrates the entire interactive session from the UI's perspective. It captures user input, sends it to
     the GeminiChat service, and processes the stream of events that come back—including text chunks for the response, tool call requests, and status updates. It's the
     primary component that makes the CLI feel "live" and responsive, connecting the user-facing elements to the powerful core logic.


  5. useReactToolScheduler
   * URL: https://github.com/google-gemini/gemini-cli/blob/main/packages/cli/src/ui/hooks/useReactToolScheduler.ts
   * Role: The Tool Status Communicator.
   * Why it's important: This React hook is a specialized wrapper around the CoreToolScheduler. Its job is to take the raw status of tool calls (e.g., executing,
     awaiting_approval) and translate that information into state that the UI can render. It allows the user to see in real-time that a tool is waiting for their
     confirmation, is currently running, or has completed with success or an error. This transparency is essential for user trust and a good user experience, as it makes
     the agent's actions observable.