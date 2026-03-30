# Roadmap: Brainstormer "Master Personal Suite" (BYOK)

This document outlines the strategic tasks to transition the framework into a private, multi-model, fact-first "Second Brain" for product engineering.

## 1. The AI Vault (Security & Privacy)
*Goal: Securely store and manage personal API keys for multiple providers.*

- [ ] **Encryption Layer**: Implement `src/lib/encryption.ts` using AES-256-GCM to encrypt/decrypt API keys at rest.
- [ ] **Key Management UI**: Build a "Personal AI Settings" page to manage:
    - OpenAI Keys
    - Anthropic Keys
    - Google Gemini Keys
    - Local LLM (Ollama) Endpoints
- [ ] **Secure Storage**: Add `user_ai_keys` table to PostgreSQL to store encrypted credentials tied to the user profile.

## 2. Multi-Provider Orchestration (The Router)
*Goal: Use the best "brand" for each specific brainstorming role.*

- [ ] **Universal AI Client**: Create a unified interface `src/lib/ai/client.ts` that abstracts the differences between OpenAI, Anthropic, and Gemini SDKs.
- [ ] **Role-to-Model Mapping**: Implement logic to route tasks based on user preference:
    - **PM Role** (e.g., Gemini 1.5 Pro for creative breadth)
    - **Architect Role** (e.g., Claude 3.5 Sonnet for precise logic)
    - **Security Role** (e.g., GPT-4o for rigorous standards)
- [ ] **Fallback Logic**: Automatically switch to a secondary provider if the primary brand hits a rate limit or service outage.

## 3. Fact-First Intelligence (The Compiler)
*Goal: Deepen the reasoning capabilities of the Peer agent.*

- [ ] **Graph-Based Reasoning**: Instead of flat prompts, send the "Fact Graph" (JSON) to the AI so it understands the relationships between features and infra.
- [ ] **Logic Debugger**: Create an agent that specifically looks for "Red Flags" or contradictions in the project graph.
- [ ] **Personal Pattern RAG**: Allow the user to upload "Gold Standard" reference PRDs to guide the AI's tone and depth.

## 4. Personal Workflow Integration
*Goal: Turn brainstorms into actionable artifacts in your personal tools.*

- [ ] **Obsidian/Notion Sync**: Direct export of the Fact Graph into linked notes (Graph-to-Graph sync).
- [ ] **Live Cost Tracking**: Real-time dashboard showing the exact cost (in cents) of each brainstorming session based on token usage.
- [ ] **Linear/Jira Backlog Generation**: Turn "Feature Facts" directly into a structured backlog.
