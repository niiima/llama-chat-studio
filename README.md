# LlamaChat Studio

A self-hosted, collaborative-style AI chat application built with **Next.js**, **React**, **MongoDB**, and **llama.cpp**.

LlamaChat Studio is designed for running local LLMs through a llama.cpp server while providing a modern multi-conversation chat interface. Conversations, model selection, chat settings, and model-provided reasoning output can be persisted per chat session.

> **Project status:** Active development / personal project. APIs and UI architecture may change as the project evolves.

## Why LlamaChat Studio?

The project started from the idea of building a private ChatGPT-style interface around local models rather than depending on a hosted AI provider.

The application focuses on:

- Local LLM inference through **llama.cpp**
- Multiple independent chat conversations
- Per-conversation model selection
- Per-conversation generation settings
- Optional model-provided thinking/reasoning output
- Persistent conversations with MongoDB
- Streaming responses
- Markdown rendering
- A modular React/Next.js architecture that can be extended with additional AI capabilities

The repository name was previously `collaborative-chat-gpt`. The current project direction is broader than collaboration and is specifically oriented toward local LLMs, so a name such as **LlamaChat Studio** better communicates the project's purpose without tying it to OpenAI or a specific hosted service.

---

## Features

### Conversations

- Create multiple independent conversations
- Switch between conversations from the sidebar
- Persist conversations in MongoDB
- Automatically generate a title from the first user message
- Delete conversations
- Track the currently selected model for each conversation

### Local AI

- Connect to a local **llama.cpp** server
- Use multiple GGUF models
- Stream generated responses
- Support model-provided reasoning/thinking output when supported by the model/template
- Configure whether thinking is enabled for a conversation
- Configure whether saved reasoning is displayed in the UI

### Chat settings

Settings are stored per conversation rather than globally.

Current settings include:

- System prompt
- Temperature
- Top-p
- Top-k
- Frequency penalty
- Presence penalty
- Maximum response tokens
- Mode
- Act
- Enable thinking
- Show reasoning

### UI

- ChatGPT-style conversation workflow
- Collapsible sidebar
- Model selector
- Custom mode/act selectors
- Markdown responses
- Expandable thinking/reasoning blocks
- Streaming assistant messages
- Responsive React UI

---

# Architecture

The application is currently a **Next.js Pages Router** application.

At a high level:

```text
┌──────────────────────────────┐
│          Next.js UI          │
│                              │
│  Sidebar                     │
│  ChatComponent               │
│  ChatControls                │
│  ThinkingBlock               │
└──────────────┬───────────────┘
               │
               │ React Context
               ▼
┌──────────────────────────────┐
│        Application State      │
│                              │
│  ChatContext                 │
│  AIContext                   │
│  UIContext                   │
└──────────────┬───────────────┘
               │
               │ HTTP
               ▼
┌──────────────────────────────┐
│        Next.js API           │
│                              │
│  /api/chats                  │
│  /api/chats/:chatId          │
│  /api/chats/:chatId/messages │
│  /api/generate-chat-         │
│    completion                │
└───────────┬───────────┬──────┘
            │           │
            │           │ Streaming
            ▼           ▼
      ┌──────────┐  ┌───────────┐
      │ MongoDB  │  │ llama.cpp  │
      │          │  │ server     │
      └──────────┘  └───────────┘
```

## Main responsibilities

### `ChatContext`

Responsible for conversation state and persistence:

- Loading the conversation list
- Loading a conversation
- Creating conversations
- Selecting conversations
- Deleting conversations
- Saving messages
- Updating conversation settings
- Updating the selected model

### `AIContext`

Responsible for the currently active AI/model configuration used by the UI.

The application currently separates:

- **engine definitions** in `model.js`
- **conversation-specific settings** in the chat session

This is intentional: changing the model or settings for one conversation should not require changing the global model catalogue.

### `ChatComponent`

Responsible for rendering the active conversation and coordinating the chat controls.

### `ThinkingBlock`

Displays model-provided reasoning output separately from the final answer.

The application treats this as **model-provided reasoning/thinking output**, not as an assertion that the UI exposes hidden internal chain-of-thought.

### llama.cpp integration

The browser does not communicate directly with llama.cpp.

Instead:

```text
Browser
   │
   ▼
Next.js API
   │
   ▼
OpenAI-compatible llama.cpp endpoint
   │
   ▼
Local GGUF model
```

This keeps the llama.cpp endpoint behind the application's API layer and gives the application a place to normalize streaming responses.

---

# Repository Structure

The exact structure may evolve, but the main architecture currently follows this pattern:

```text
.
├── components/
│   ├── ChatComponent.js
│   ├── ChatControls.js
│   ├── ThinkingBlock.js
│   └── ...
│
├── context/
│   ├── AIContext.js
│   ├── ChatContext.js
│   └── UIContext.js
│
├── model/
│   └── model.js
│
├── models/
│   └── ChatSession.js
│
├── pages/
│   ├── api/
│   │   ├── chats/
│   │   │   ├── index.js
│   │   │   ├── [chatId].js
│   │   │   └── [chatId]/
│   │   │       └── messages/
│   │   │           └── index.js
│   │   │
│   │   ├── generate-chat-completion.js
│   │   └── OpenAIChatStream.js
│   │
│   └── ...
│
├── config/
│   └── db.js
│
├── public/
├── package.json
├── .env.local
└── README.md
```

---

# Requirements

Before running the application, install:

- **Node.js**
- **npm** (or your preferred Node package manager)
- **MongoDB**
- **llama.cpp**

You also need at least one compatible GGUF model.

The application does not include model weights in the repository.

## Recommended development environment

The project can be developed on Windows, Linux, or macOS.

For local LLM development, Windows + NVIDIA CUDA + llama.cpp is a practical setup, but the application itself is not inherently limited to NVIDIA hardware.

---

# Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd llamachat-studio
```

Install dependencies:

```bash
npm install
```

Create the local environment file:

```text
.env.local
```

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/llamachat
LLAMA_CPP_URL=http://127.0.0.1:8080
```

Adjust the values for your environment.

> Never commit `.env.local` or other files containing credentials, database passwords, API keys, or private configuration.

---

# MongoDB

The application persists chat sessions in MongoDB.

A typical local MongoDB database can use:

```text
mongodb://127.0.0.1:27017/llamachat
```

The application creates the relevant collections/documents through Mongoose.

## Chat session model

A conversation contains approximately:

```text
ChatSession
├── title
├── createdAt
├── updatedAt
├── currentEngine
├── settings
│   ├── systemPrompt
│   ├── temperature
│   ├── top_p
│   ├── top_k
│   ├── frequency_penalty
│   ├── presence_penalty
│   ├── max_response_tokens
│   ├── mode
│   ├── act
│   ├── enableThinking
│   └── showReasoning
└── messages[]
    ├── role
    ├── content
    ├── reasoning
    ├── timestamp
    └── engine
```

User messages do not need to store an engine because the engine belongs to the generated assistant response / conversation configuration.

Assistant messages can store the engine used to generate them.

---

# llama.cpp Setup

LlamaChat Studio uses the OpenAI-compatible chat completion endpoint provided by llama.cpp.

Install/build llama.cpp according to the official llama.cpp documentation, then make sure the `llama` executable is available.

Place your GGUF models in your model directory.

For example:

```text
D:\AI\my-models\
├── Qwen3-8B-Q4_K_M.gguf
├── Qwen3.8-27B-Q4_K_M.gguf
├── gemma-3-12b-it-ablit-norms-biproj-Q4_K_M.gguf
└── ...
```

## Example server

A development configuration can look like:

```powershell
llama serve --models-dir "D:\AI\my-models" `
  --no-models-autoload `
  --jinja `
  --host 127.0.0.1 `
  --port 8080 `
  -ngl 38 `
  -c 16384 `
  --cache-type-k q4_0 `
  --flash-attn `
  --reasoning-format deepseek
```

Adjust GPU layers, context size, KV cache, and other parameters for your hardware and model.

The important part for the application is that llama.cpp exposes its OpenAI-compatible endpoint at:

```text
http://127.0.0.1:8080/v1/chat/completions
```

The Next.js application accesses that endpoint through:

```env
LLAMA_CPP_URL=http://127.0.0.1:8080
```

---

# Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The complete local development stack is:

```text
MongoDB
   │
   │
   ├───────────────┐
   │               │
   ▼               ▼
MongoDB        Next.js
                 │
                 │ HTTP
                 ▼
              llama.cpp
                 │
                 ▼
              GGUF model
```

All three services need to be available for a complete chat test:

1. MongoDB
2. llama.cpp
3. Next.js

---

# Verifying the llama.cpp Connection

Before debugging the React application, verify that llama.cpp itself is responding.

The endpoint should be:

```text
POST /v1/chat/completions
```

A basic request can be tested with PowerShell:

```powershell
$body = @{
  messages = @(
    @{
      role = "user"
      content = "Say hello in one sentence."
    }
  )
  stream = $false
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8080/v1/chat/completions" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

If this fails, debug llama.cpp before debugging the Next.js application.

---

# Testing the Application

## 1. Application startup

Run:

```bash
npm run dev
```

Confirm:

- The Next.js server starts without errors.
- The browser loads the application.
- No MongoDB connection errors appear in the terminal.

## 2. Conversation creation

Create a new chat.

Verify:

- A new conversation appears in the sidebar.
- The conversation is stored in MongoDB.
- The selected model is stored as `currentEngine`.

## 3. Message persistence

Send a message.

Verify:

- The user message appears immediately.
- llama.cpp generates a response.
- The assistant response streams into the UI.
- The assistant message is persisted in MongoDB.

Refresh the browser and confirm the conversation remains available.

## 4. Conversation switching

Create two or more conversations.

Send different messages in each.

Switch between them and verify:

- The correct messages appear.
- The correct title appears.
- The selected model is restored.
- Conversation settings remain associated with the correct chat.

## 5. Model switching

Change the model for the active conversation.

Verify:

- The UI changes to the selected model.
- `currentEngine` changes in MongoDB.
- New assistant responses use the selected engine.

Previously generated assistant messages should retain the engine with which they were generated.

## 6. Settings persistence

Change settings such as:

- Temperature
- Top-p
- Top-k
- System prompt
- Mode
- Act

Then refresh or switch conversations.

Verify that the settings remain associated with the correct conversation.

## 7. Thinking / reasoning

For a model/template that supports reasoning:

### Thinking ON + Show reasoning ON

Expected:

```text
Thinking
   ↓
model reasoning output

Final answer
```

### Thinking ON + Show reasoning OFF

Expected:

```text
Final answer
```

The reasoning may still be persisted even when it is hidden.

### Thinking OFF + Show reasoning ON

New generations should not request thinking.

Previously saved reasoning can still be displayed.

### Thinking OFF + Show reasoning OFF

No reasoning should be generated for new requests and existing reasoning should remain hidden.

> Thinking support depends on the selected model and its chat template. The UI setting cannot make a model produce a reasoning format that it does not support.

---

# API Reference

## List conversations

```http
GET /api/chats
```

Returns the conversation list.

---

## Create conversation

```http
POST /api/chats
Content-Type: application/json
```

Example:

```json
{
  "currentEngine": "Qwen3-8B-Q4_K_M",
  "settings": {
    "temperature": 0.6,
    "top_p": 0.95,
    "enableThinking": true,
    "showReasoning": true
  }
}
```

---

## Get conversation

```http
GET /api/chats/:chatId
```

Returns the complete conversation including its messages and settings.

---

## Update conversation

```http
PATCH /api/chats/:chatId
Content-Type: application/json
```

Update the model:

```json
{
  "currentEngine": "Qwen3.8-27B-Q4_K_M"
}
```

Update settings:

```json
{
  "settings": {
    "temperature": 0.8,
    "enableThinking": false
  }
}
```

Settings updates should be merged with the existing settings rather than replacing the entire settings object.

---

## Delete conversation

```http
DELETE /api/chats/:chatId
```

---

## Get messages

```http
GET /api/chats/:chatId/messages
```

---

## Save message

```http
POST /api/chats/:chatId/messages
Content-Type: application/json
```

Example assistant message:

```json
{
  "role": "assistant",
  "content": "Hello!",
  "reasoning": "Model-provided reasoning output...",
  "engine": "Qwen3-8B-Q4_K_M"
}
```

---

## Generate completion

```http
POST /api/generate-chat-completion
```

The API forwards the request to the OpenAI-compatible llama.cpp endpoint and converts the response into the application's streaming format.

Thinking configuration is forwarded through:

```json
{
  "chat_template_kwargs": {
    "enable_thinking": true
  }
}
```

The application can receive separate streaming events for:

```text
reasoning
content
done
```

---

# Streaming Protocol

The internal application stream uses newline-delimited JSON (NDJSON).

Example:

```json
{"type":"reasoning","content":"..."}
{"type":"reasoning","content":"..."}
{"type":"content","content":"Hello"}
{"type":"content","content":" there!"}
{"type":"done","content":""}
```

This allows the frontend to independently accumulate:

```text
reasoning
```

and:

```text
final answer
```

while the response is being generated.

---

# Model Configuration

Model definitions are currently maintained in:

```text
model/model.js
```

A model entry contains configuration such as:

```js
{
  id: 2,
  name: "Qwen3-8B",
  key: "Qwen3-8B-Q4_K_M",
  maxTokens: 8192,
  max_response_tokens: 2048,
  temperature: 0.6,
  top_p: 0.95,
  top_k: 20,
  presence_penalty: 1.5
}
```

The `key` should correspond to the model identifier expected by the llama.cpp server.

When adding a new model:

1. Add its definition to `model.js`.
2. Make sure the corresponding GGUF model is available to llama.cpp.
3. Restart the relevant development services if required.
4. Create a new conversation and test generation.
5. Verify that the correct `currentEngine` is persisted.

---

# Development Workflow

The recommended development workflow is:

```text
1. Create a branch
       │
       ▼
2. Make a focused change
       │
       ▼
3. Run the application
       │
       ▼
4. Test the affected workflow
       │
       ▼
5. Check MongoDB/API behavior
       │
       ▼
6. Review the diff
       │
       ▼
7. Commit
       │
       ▼
8. Push branch
       │
       ▼
9. Open Pull Request
```

## Keep changes focused

Prefer small, focused commits such as:

```text
feat: add conversation settings persistence
fix: preserve chat settings during patch
feat: stream reasoning events
fix: restore active model when switching chats
refactor: separate chat persistence from generation
docs: improve local development setup
```

Avoid combining unrelated UI, database, API, and infrastructure changes into one commit when possible.

---

# Collaboration Guide

This repository is intended to be easy to extend without requiring every contributor to understand the entire application at once.

## Before changing code

Read:

```text
README.md
model/model.js
context/ChatContext.js
context/AIContext.js
models/ChatSession.js
```

Then identify whether your change belongs primarily to:

- UI
- React state
- API
- database
- llama.cpp integration
- model configuration

## Pull requests

A useful pull request should explain:

### What changed?

Example:

```text
Added persistent per-chat thinking settings.
```

### Why?

```text
Thinking configuration previously came from a global state,
which caused settings to leak between conversations.
```

### How was it tested?

```text
- Created two conversations
- Enabled thinking in chat A
- Disabled thinking in chat B
- Switched between chats
- Refreshed browser
- Verified MongoDB documents
```

### Breaking changes

Mention any changes to:

- database schemas
- API request/response formats
- environment variables
- model configuration
- llama.cpp requirements

---

# Database Changes

Schema changes require extra care because MongoDB documents created by older versions of the application may contain previous field names or structures.

For example, an older version may have used:

```text
startingEngine
```

while the current schema uses:

```text
currentEngine
```

Do not automatically delete or rename production data during development.

For migrations:

1. Back up the database.
2. Identify old documents.
3. Test the migration against a copy.
4. Run the migration.
5. Verify the resulting documents.
6. Restart the application if Mongoose has cached the old schema.

Example migration pattern:

```js
db.chats.updateMany(
  { startingEngine: { $exists: true } },
  [
    { $set: { currentEngine: "$startingEngine" } },
    { $unset: "startingEngine" }
  ]
)
```

Only run migrations when the corresponding schema change is actually required.

---

# Environment Variables

Do not commit secrets.

Recommended local configuration:

```env
MONGODB_URI=
LLAMA_CPP_URL=
```

Future integrations may introduce additional variables, for example:

```env
...
```

Document every required environment variable in this README when it becomes part of the application.

---

# Troubleshooting

## The application starts but generation fails

Check:

```text
1. Is llama.cpp running?
2. Is LLAMA_CPP_URL correct?
3. Is the selected model loaded/available?
4. Does /v1/chat/completions respond?
5. Does the llama.cpp terminal show an error?
```

Test llama.cpp independently before debugging React.

## Chat settings do not persist

Check:

```text
1. Browser Network tab
2. PATCH /api/chats/:chatId
3. PATCH response body
4. MongoDB document
5. Mongoose schema
```

For settings updates, make sure the API merges the incoming settings instead of replacing unrelated fields.

## Thinking toggle changes in the UI but generation still thinks

Check the request sent to:

```text
/api/generate-chat-completion
```

The payload should contain the current value:

```json
{
  "chat_template_kwargs": {
    "enable_thinking": false
  }
}
```

Also verify that the server-side API does not overwrite it with:

```js
enable_thinking: true
```

The value must be forwarded from the active conversation.

## Reasoning is not appearing

Check:

```text
1. The selected model supports reasoning.
2. The llama.cpp server was started with an appropriate reasoning format.
3. The response contains reasoning_content.
4. OpenAIChatStream forwards reasoning events.
5. The frontend stores msg.reasoning.
6. showReasoning is enabled.
```

## Changes to a Mongoose schema appear to have no effect

Restart the Next.js development server.

Mongoose model caching during development can cause an old model definition to remain active.

---

# Security Notes

This application is currently designed primarily for local/private use.

Before exposing it to the public internet, add appropriate security controls, including:

- Authentication
- Authorization / conversation ownership
- Rate limiting
- Input validation
- CSRF protection where applicable
- Secure environment configuration
- Network access controls
- HTTPS
- Request size limits
- Abuse protection

Do not expose an unauthenticated local LLM endpoint or database to the public internet.

---

# Roadmap

Potential future directions include:

- User authentication
- Conversation ownership
- Public/private conversations
- Improved model capability metadata
- Vision/multimodal models
- File attachments
- Tool/function calling
- Web search
- Agent workflows
- Conversation export/import
- Search across conversations
- Message editing
- Regeneration
- Branching conversations
- Token/context usage information
- Model performance metrics
- Better mobile UI
- Automated tests
- End-to-end testing
- Docker-based development
- Production deployment configuration

The roadmap is intentionally flexible while the core architecture is being established.

---

# Contributing

Contributions, experiments, bug reports, and architectural ideas are welcome.

For code contributions:

```text
1. Fork the repository or create a branch.
2. Make a focused change.
3. Test locally.
4. Verify affected API/database behavior.
5. Review the diff.
6. Commit with a descriptive message.
7. Open a pull request with testing details.
```

When reporting a bug, include:

- Operating system
- Node.js version
- Browser
- llama.cpp version/build
- Model name
- Relevant application logs
- Relevant llama.cpp logs
- Steps to reproduce
- Expected behavior
- Actual behavior

Never include:

- MongoDB credentials
- API keys
- private environment variables
- private conversation data
- other secrets

---

# License

MIT License

---

# Project Name

The previous repository name:

```text
collaborative-chat-gpt
```

does not clearly communicate the current architecture or local-LLM focus.

A stronger naming direction is:

## LlamaChat Studio



# License and Third-Party Projects

This project uses third-party open-source software. Their respective licenses and terms remain applicable.

In particular, the application integrates with:

- Next.js
- React
- MongoDB / Mongoose
- llama.cpp
- ChatScope
- styled-components
- React Markdown
- React Icons

Check each project's license before redistributing a packaged version of the application or model files.

---

# Acknowledgements

Special thanks to the open-source projects that make local AI applications possible, especially the llama.cpp ecosystem and the broader GGUF/local-LLM community.

This application is intended to provide a flexible user interface and application layer around local inference rather than replace the underlying inference engine.

---

## Quick Start

For experienced contributors:

```bash
git clone <YOUR_REPOSITORY_URL>
cd llamachat-studio
npm install
```

Create `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/llamachat
LLAMA_CPP_URL=http://127.0.0.1:8080
```

Start MongoDB.

Start llama.cpp:

```powershell
llama serve --models-dir "D:\AI\my-models" `
  --no-models-autoload `
  --jinja `
  --host 127.0.0.1 `
  --port 8080 `
  -ngl 38 `
  -c 16384 `
  --cache-type-k q4_0 `
  --flash-attn `
  --reasoning-format deepseek
```

Start Next.js:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Then create a conversation, select a model, and send a message.

---

## Current Project Philosophy

The goal is not simply to reproduce a hosted ChatGPT interface.

The project is intended to become a flexible **local AI workspace** where the application, conversation state, model configuration, inference backend, and future tools remain modular.

```text
Conversation
     │
     ├── Model
     ├── System Prompt
     ├── Generation Settings
     ├── Thinking / Reasoning
     └── Messages
              │
              ▼
          llama.cpp
              │
              ▼
          Local Model
```

That separation is the foundation for future capabilities such as multimodal models, tools, agents, and richer local AI workflows.
