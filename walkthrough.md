# Walkthrough: Horizontal Navigation & 8-Stage Pipeline

This walkthrough details the design updates, backend pipeline sequence alignment, and verification results for the top horizontal navigation layout and updated 8-stage LangGraph workflow in the TCS SDD Framework.

---

## 1. Summary of Changes

### A. Horizontal Header Navigation Layout (`main.jsx`)
* **Sidebar Menu Cleanup**: Removed the `Requirement Agent` and `Agent Orchestrator` from the vertical sidebar navigation panel.
* **Top Header Tabs**: Integrated step buttons directly into the top bar header:
  - **1. Requirement Agent** (links to `/requirements`)
  - **2. Agent Orchestrator** (links to `/orchestrator`)
* Styled these tabs with a dark-mode theme, sleek borders, and active/inactive visual states to clearly indicate the workflow steps.

### B. Updated 8-Stage LangGraph Pipeline Sequence (`orchestrator.service.js`)
* **Stage Sequence Updates**: Configured the LangGraph orchestrator to run 8 stages in this sequence:
  1. `spec-to-story`
  2. `user-stories`
  3. `functional-spec`
  4. `tech-architecture`
  5. `database-design`
  6. `ux-wireframe`
  7. `test-cases`
  8. `traceability-matrix`
* **Story & Task Generation**: Implemented detailed prompts and JSON output schemas for `spec-to-story` and `user-stories` stages inside `generatorNode`.
* **Output Persistence**: Extended `saveAndIndexStageOutput` to handle conversions and index/save logic for `spec-to-story` (to `User_Stories.md` and `User_Stories.json`) and `user-stories` (to `JIRA_Backlog.md` and `JIRA_Backlog.json`).
* **Stage Ordering**: Updated stage transition logic inside `respondToStage` and start node initialization.

### C. Agent Orchestrator UI Updates (`AgentOrchestrator.jsx`)
* Updated `stagesOrder` to match the exact 8-stage pipeline sequence.

---

## 2. Verification & Testing

### A. Automated Node Verification Test
We updated the verification script and ran `node src/scripts/test-orchestrator.js` inside `/Users/saravanan/Prakash/SDD Framework/sdd-framework-org/server`:
1. **Initial execution**: The graph successfully initialized at `spec-to-story`.
2. **Model selection**: The Selector model correctly routed the stage to `gemini-3.1-flash-lite` (SLM) based on documentation rules.
3. **Generation**: The generator successfully generated User Stories in JSON format.
4. **Approval & Transition**: Resuming the graph successfully saved `User_Stories.md` and `User_Stories.json` to disk, and transitioned the graph state to the next stage (`user-stories`).

Test Execution Output:
```
Starting LangGraph Orchestrator verification test...
Starting graph for spec: 001-return-request-tracker...
Graph started successfully.
Thread ID: thread-1784380978439
Initial Stage: spec-to-story
Selector routed model for current stage: gemini-3.1-flash-lite
Logs so far:
 [Queue] Initializing LangGraph multi-agent orchestrator for spec: 001-return-request-tracker...
[Selector] Analyzing stage complexity for: spec-to-story...
[Selector] Routed task to SLM (gemini-3.1-flash-lite).
[Generator] Activating spec-to-story agent...
[Generator] Processing draft output using gemini-3.1-flash-lite...
[Generator] Generation completed successfully.

Simulating Human-in-the-Loop APPROVAL for stage: spec-to-story...
[Storage] Saved file to disk: .../User_Stories.md
[Indexer] Generating embeddings and indexing 2 chunks for User_Stories.md...
[Qdrant] Successfully indexed 2 chunks for User_Stories.md.
[Orchestrator] Saved raw JSON state to: .../User_Stories.json
Resumed state.
New Stage in Graph State: user-stories

Verifying file outputs on disk...
[PASS] Markdown output saved to disk: .../User_Stories.md
[PASS] JSON output saved to disk: .../User_Stories.json

Verification test completed successfully!
```

---

## 3. Session Reset & Artifact Cleaning
* **New Backend Route**: Added `POST /api/orchestrator/reset` which removes the active thread ID from the server's cache and permanently deletes all generated files (`.md`, `.html`, and `.json` stage outputs) from `storage/`.
* **Frontend Reset Controller**: Styled the button in the top right of the orchestrator card to read **"Stop & Reset Session"** when an active execution state exists.
* Clicking it triggers the cleanup API and reloads the page context state dynamically, which instantly clears the dashboards for every agent in the workspace.

---

## 4. Logo Routing & Default Page Alignment
* **Logo Brand Redirect**: Configured the **"SDD AI Studio Requirements Framework"** branding logo in the top-left sidebar header in [main.jsx](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/framework/src/main.jsx) to link to `/requirements`.
* **Default App Load**: Set the React Router root path `/` to redirect directly to `/requirements` using React Router's `<Navigate replace />`.
* **User Stories Path Mapping**: Remapped the **User Stories** backlog dashboard route from `/` to `/user-stories`.

---

## 5. Agent Workspace Sync & FSD Rendering Fix
* **Real-time Workspace Sync**: Modified `generatorNode` to call `saveAndIndexStageOutput` immediately upon generating a stage result (instead of waiting for approval). On the frontend, added `loadSavedOutputs()` to the status polling loop in `AgentOrchestrator.jsx`. This ensures that as each agent runs in the orchestrator, its generated output instantly populates the individual sidebar workspace dashboards.
* **FSD CSS Styles Isolation**: Replaced the `dangerouslySetInnerHTML` rendering inside [FunctionalSpec.jsx](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/framework/src/pages/FunctionalSpec.jsx) with a styled `<iframe>` using `srcDoc`. This isolates the HTML document's CSS styles, resolving layout pollution and overflow issues.

---

## 6. Prominent Header Step Navigation
* **Enhanced Visual Weight**: Redesigned the horizontal step buttons **"1. Requirement Agent"** and **"2. Agent Orchestrator"** in the top bar header:
  * Increased text weight, converted labels to uppercase, and set tracking to wider.
  * Configured active states to render with a solid indigo background (`bg-indigo-600`), white text, and a glowing drop shadow (`shadow-md shadow-indigo-500/20`).
  * Styled the step number badges to pop in inverse colors when active (white circle with indigo text).
  * Styled inactive button states with dark borders and background panels (`bg-slate-900/40 border-slate-800`), making them look robust, prominent, and highly professional.

---

## 7. Active Specification & Orchestrator Session Sync
* **Local Session Reset on Spec Shift**: Whenever you change the active spec in the top-right header selector dropdown or activate a newly scaffolded spec in the **Requirement Agent** dashboard, the cached `orchestrator_thread_id` token is cleared from `localStorage`.
* **State Synchronization**: This resets any active orchestrator session and forces the orchestrator graph on the next page view to load the selected spec, rather than reloading the previous spec run.

---

## 8. Specs Directory Path Resolution Fix
* **Relative Path Bug**: Identified a silent path resolution error in `getSpecContent` inside [orchestrator.service.js](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/server/src/services/orchestrator.service.js#L36-L47). The file was resolving path `../../specs` relative to the `services` directory instead of the server root, returning an empty specification string (`""`). This forced the generator model to generate fallback/hallucinated mock user stories.
* **Resolved Lookup**: Updated `getSpecContent` to resolve `../../../specs` (three directories up), matching the structure of `sdd-framework-org/specs`. The generator now correctly receives and processes the actual specification content of the selected workspace.

---

## 9. Comprehensive Story Generation Prompts
* **Explicit Decomposition Guidance**: Configured specialized generative prompts in [orchestrator.service.js](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/server/src/services/orchestrator.service.js#L274-L302) for the `spec-to-story` and `user-stories` stages.
* **Coverage Mandates**: Instructed the LLM to cover all features, flows, and modules of the active specification rather than just extracting stories for a single sub-module. Specifically, added a hard mandate in the prompt to generate **at least 5-7 user stories** and **6-10 JIRA issues** covering specific product components (Calendar Intake, STT transcription, AI Insights, Qdrant semantic search, external PM tool sync, and OIDC Auth/RBAC). This ensures that even lightweight models generate a comprehensive and complete domain backlog.

---

## 10. Mermaid Diagram Rendering Syntax Fix
* **Double-Colon Syntax Conflict**: Identified that the LLM occasionally generates styling markers using double colons (e.g. `NodeId::className`) instead of standard triple-colon class style notation (`NodeId:::className`). This threw parser errors in the Mermaid layout renderer.
* **Regex Sanitizer Integration**: Updated `sanitizeMermaid` in [TechArchitecture.jsx](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/framework/src/pages/TechArchitecture.jsx#L34-L44) and `sanitizeErd` in [DatabaseDesign.jsx](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/framework/src/pages/DatabaseDesign.jsx#L34-L44) to run a negative-lookbehind regular expression: `text.replace(/(?<!https?)::([a-zA-Z0-9_-]+)/gi, ':::$1')`. This converts class declarations to standard triple-colons at load time without breaking URL links, resolving all parser rendering errors.

---

## 11. Multi-Model Registry & Dynamic Routing
* **Unified Model Catalog**: Created [models.json](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/server/src/config/models.json) configuration mapping model IDs to provider metadata (Google, OpenAI, Anthropic) and API key environment parameters.
* **Environment Overrides**: Set up `orchestrator.service.js` to parse this catalog at startup and respect `.env` overrides `ACTIVE_LLM` and `ACTIVE_SLM` to assign complexity categories.
* **Unified API Client Dispatcher**: Implemented `callGenerativeModel` inside [orchestrator.service.js](file:///Users/saravanan/Prakash/SDD%20Framework/sdd-framework-org/server/src/services/orchestrator.service.js#L41-L102) to dynamically handle API requests to Google (via library client) and OpenAI / Anthropic / Custom endpoints (via direct REST API execution with Axios).
* **Dynamic Routing Integration**: Refactored `selectorNode` and `generatorNode` to execute model routing choices from the registry, displaying the selected model tags seamlessly on the client viewport.
