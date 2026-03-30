# Roadmap: Brainstormer "Professional Peer" Intelligence

This document outlines the strategic tasks to transition the framework into a Fact-First, Peer-Agentic system.

## 1. The Fact-Graph Architecture (The "Product OS")
*Goal: Move from flat text to a relational graph of product entities.*

- [ ] **Fact Schema Definition**: Design a JSON schema for core entities (Personas, Features, Constraints, Metrics) and their relationships (e.g., Feature X -> requires -> Infrastructure Y).
- [ ] **Graph Persistence**: Implement a PostgreSQL/JSONB structure to store and version these fact nodes per project.
- [ ] **Traceability Engine**: Map which "Fact Nodes" contribute to which sections of the Markdown documents to allow surgical updates.

## 2. The Dynamic Peer Wizard (The "Senior Colleague")
*Goal: Replace the static form with a proactive, decision-oriented conversation.*

- [ ] **Actionable Chat UI**: Build a chat interface that supports "Decision Chips" (e.g., buttons to accept/reject AI architectural suggestions).
- [ ] **Multi-Agent Orchestration**:
    - **Synthesizer Agent**: Runs in the background to extract facts from the chat.
    - **Analyst Agent**: Compares facts against industry patterns to find logic gaps.
    - **Facilitator Agent**: Manages the conversation tone and presents decisions to the user.
- [ ] **The Convergence Metric**: Implement a "Confidence Score" that triggers the transition from brainstorming to document generation once the Fact Graph is sufficiently complete.

## 3. The Pattern-Aware RAG (The "Industry Knowledge")
*Goal: Ground the Peer's advice in real-world engineering and product standards.*

- [ ] **Archetype Library**: Create a library of "Product Archetypes" (e.g., E-commerce, SaaS, Fintech) with mandatory requirements.
- [ ] **Vector Integration**: Enable `pgvector` to allow the Analyst agent to retrieve relevant technical patterns during the chat.
- [ ] **Risk Identification**: Pre-load the system with common failure modes (e.g., "Marketplace deal abandonment") to allow the AI to ask proactive mitigation questions.

## 4. Reverse Extraction (The "Text-Fact Sync")
*Goal: Keep the Fact Graph in sync with manual document edits.*

- [ ] **Edit Monitoring**: Implement a system that detects manual changes in the Markdown documents.
- [ ] **Reverse Mapping**: Use an AI agent to parse manual edits and update the corresponding nodes in the Fact Graph, maintaining a single source of truth.
