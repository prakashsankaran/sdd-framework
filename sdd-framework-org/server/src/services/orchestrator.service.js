const { StateGraph, Annotation, START, END, MemorySaver } = require('@langchain/langgraph');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Initialize Gemini Client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Load model registry configuration
const modelsConfigPath = path.resolve(__dirname, '../config/models.json');
let modelsConfig = {
  active_llm: process.env.ACTIVE_LLM || "gemini-2.0-flash",
  active_slm: process.env.ACTIVE_SLM || "gemini-2.0-flash",
  models: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", type: "LLM", apiKeyEnv: "GEMINI_API_KEY" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", type: "SLM", apiKeyEnv: "GEMINI_API_KEY" },
    { id: "gpt-4o", name: "GPT-4o", provider: "openai", type: "LLM", apiKeyEnv: "OPENAI_API_KEY" },
    { id: "gpt-4o-mini", name: "GPT-4o-Mini", provider: "openai", type: "SLM", apiKeyEnv: "OPENAI_API_KEY" },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", type: "LLM", apiKeyEnv: "ANTHROPIC_API_KEY" }
  ]
};

if (fs.existsSync(modelsConfigPath)) {
  try {
    modelsConfig = JSON.parse(fs.readFileSync(modelsConfigPath, 'utf8'));
  } catch (err) {
    console.error('Failed to load models.json, using defaults.', err);
  }
}

// Override active models from env if specified
modelsConfig.active_llm = process.env.ACTIVE_LLM || modelsConfig.active_llm;
modelsConfig.active_slm = process.env.ACTIVE_SLM || modelsConfig.active_slm;

// Find model helper
function getModelMeta(modelId) {
  return modelsConfig.models.find(m => m.id === modelId) || { id: modelId, name: modelId, provider: 'google' };
}

// Unified client dispatcher supporting Google, OpenAI, Anthropic, and custom backends
async function callGenerativeModel(modelId, promptText) {
  const meta = getModelMeta(modelId);
  const apiKey = process.env[meta.apiKeyEnv] || '';

  if (meta.provider === 'google') {
    const model = ai.getGenerativeModel({ model: meta.id });
    const response = await model.generateContent(promptText);
    return response.response.text().trim();
  }

  if (meta.provider === 'openai') {
    const url = meta.endpoint || 'https://api.openai.com/v1/chat/completions';
    const res = await axios.post(url, {
      model: meta.id,
      messages: [{ role: 'user', content: promptText }]
    }, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data.choices[0].message.content.trim();
  }

  if (meta.provider === 'anthropic') {
    const url = meta.endpoint || 'https://api.anthropic.com/v1/messages';
    const res = await axios.post(url, {
      model: meta.id,
      max_tokens: 4000,
      messages: [{ role: 'user', content: promptText }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });
    return res.data.content[0].text.trim();
  }

  if (meta.provider === 'custom') {
    const url = meta.endpoint;
    const res = await axios.post(url, {
      model: meta.id,
      prompt: promptText
    }, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data.text || res.data.choices[0].text || res.data.response;
  }

  // Fallback default
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const response = await model.generateContent(promptText);
  return response.response.text().trim();
}

// Define the Graph State Schema using LangGraph Annotation
const StateAnnotation = Annotation.Root({
  activeSpec: Annotation(),
  currentStage: Annotation(), // 'functional-spec', 'tech-architecture', etc.
  logs: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  results: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  modelDecision: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  approvalStatus: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  feedback: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  })
});

// Helper: Read active spec.md content
function getSpecContent(activeSpec) {
  try {
    const specPath = path.resolve(__dirname, '../../../specs', activeSpec, 'spec.md');
    if (fs.existsSync(specPath)) {
      return fs.readFileSync(specPath, 'utf8');
    }
  } catch (e) {
    console.error('Failed to read spec.md', e);
  }
  return '';
}

// Node 1: Selector / Validator Agent
// Evaluates the complexity of requirements and decides between active LLM and active SLM
async function selectorNode(state) {
  const currentStage = state.currentStage || 'functional-spec';
  const specText = getSpecContent(state.activeSpec) || 'No specification files enqueued.';
  
  const prompt = `You are the AI Model Selector Agent for a multi-agent framework.
Analyze the requirements specification and decide which active model to route the task to for the current stage: "${currentStage}".

Active Models Available:
- Active LLM: "${modelsConfig.active_llm}" (${getModelMeta(modelsConfig.active_llm).name})
- Active SLM: "${modelsConfig.active_slm}" (${getModelMeta(modelsConfig.active_slm).name})

Route Rules:
1. Select the Active LLM ("${modelsConfig.active_llm}") if:
   - The stage is 'tech-architecture' or 'database-design' (requiring deep layout/structural planning).
   - The requirements have high logic density (contain multiple logic gates, database relationships, or complex integrations).
2. Select the Active SLM ("${modelsConfig.active_slm}") if:
   - The stage is 'spec-to-story', 'user-stories', 'functional-spec', 'ux-wireframe', 'test-cases', or 'traceability-matrix'.
   - The requirements are straightforward CRUD actions.

Input Specification:
${specText}

Return your decision in JSON format:
{
  "model": "${modelsConfig.active_llm}" | "${modelsConfig.active_slm}",
  "reasoning": "A concise description of why this model was chosen based on task complexity."
}`;

  let decision = { model: modelsConfig.active_slm, reasoning: 'Default active SLM routed.' };
  try {
    const rawResult = await callGenerativeModel(modelsConfig.active_slm, prompt);
    const jsonText = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    decision = JSON.parse(jsonText);
  } catch (e) {
    console.error('[Selector Node] Failed parsing JSON model routing, using active SLM.', e);
  }

  const modelLabel = decision.model;
  const meta = getModelMeta(modelLabel);
  return {
    logs: [
      `[Selector] Analyzing stage complexity for: ${currentStage}...`,
      `[Selector] Routed task to ${meta.type} (${meta.name}).`,
      `[Selector] Routing reason: ${decision.reasoning}`
    ],
    modelDecision: { [currentStage]: decision }
  };
}

// Node 2: Generation / Compilation Node
async function generatorNode(state) {
  const currentStage = state.currentStage || 'functional-spec';
  const specText = getSpecContent(state.activeSpec);
  const decision = state.modelDecision[currentStage] || { model: 'gemini-3.1-flash-lite' };
  const stageFeedback = state.feedback[currentStage] || '';

  const logs = [
    `[Generator] Activating ${currentStage} agent...`,
    `[Generator] Processing draft output using ${decision.model}...`
  ];

  if (stageFeedback) {
    logs.push(`[Generator] Incorporating human review feedback: "${stageFeedback}"`);
  }

  function parseGeminiJson(responseText) {
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();
    return JSON.parse(cleanText);
  }

  let resultOutput = '';
  try {
    let generatorPrompt = '';

    if (currentStage === 'functional-spec') {
      generatorPrompt = `You are a Principal Business Analyst and Senior Technical Writer with deep enterprise documentation expertise.

Analyze the following specification document carefully:
${specText}

Your task is to generate a comprehensive, client-ready Functional Specification Document (FSD) as clean, premium-styled HTML.

CRITICAL RULES:
- Do NOT wrap your output in markdown code blocks. Start directly with raw HTML (e.g. <div> or <article>).
- Use an inline dark-mode style: dark background (#0f172a), light text, accent colors (#6366f1 indigo for headings, #22d3ee cyan for section badges).
- Be INTELLIGENT: If a section is clearly NOT applicable based on the specification (e.g. no notifications mentioned → skip Section 10), omit it entirely rather than generating placeholder/empty content.
- For every section that IS applicable, be thorough, specific, and derive content directly from the provided specification — do not hallucinate or fabricate details.
- Use real IDs: FR-001, FR-002, BR-001, etc. derived from actual requirements in the spec.

Generate ALL of the following sections that are applicable. Skip sections that are genuinely not applicable:

DOCUMENT INFORMATION (always include):
- Document Title, Project Name, Version, Status, Author, Reviewers, Approvers, Revision Log, Distribution List

TABLE OF CONTENTS (always include)

1. INTRODUCTION
   1.1 Purpose – Why this document exists
   1.2 Scope – Business scope and system boundaries
   1.3 Objectives – Business goals this system achieves
   1.4 Intended Audience – Business, Developers, QA, Architects, Product Owner
   1.5 References – BRD, Requirement docs, Wireframes, API docs, Compliance docs

2. BUSINESS CONTEXT
   - Current process (as-is)
   - Problems / pain points being solved
   - Future process (to-be)
   - Business benefits
   - Assumptions
   - Dependencies
   - Constraints

3. FUNCTIONAL OVERVIEW
   - High-level list of features / modules (e.g. User Login, Product Search, Checkout, etc.)

4. USER ROLES
   For every identified role provide:
   - Role Name, Responsibilities, Permissions
   - Access Matrix table (Role vs. Feature/Module → Allowed/Denied)

5. FUNCTIONAL REQUIREMENTS (LARGEST SECTION — be exhaustive)
   For every functional requirement extracted from the spec, include:
   - Requirement ID (FR-001, FR-002, ...)
   - Title
   - Description
   - Business Rule(s) (reference BR-xxx)
   - Priority (Critical / High / Medium / Low)
   - Actor
   - Trigger
   - Preconditions
   - Main Flow (numbered steps)
   - Alternate Flow (if any)
   - Exception Flow (if any)
   - Post Conditions
   - Acceptance Criteria
   - Dependencies
   - Related Screens
   - Related APIs
   - Related Database Tables
   - Traceability IDs

6. BUSINESS RULES
   For every rule (BR-001, BR-002, ...):
   - Rule ID, Title, Description, Enforcement Point, Priority

7. UI SPECIFICATION (include if UI/screens are mentioned)
   For every screen:
   - Screen ID, Purpose, Navigation path, Fields list, Validation rules, Buttons/Actions, Messages, Responsive behaviour, Accessibility notes, Wireframe reference

8. FIELD SPECIFICATIONS (include if forms/fields are mentioned)
   Table with columns: Field Name | Type | Mandatory | Validation | Editable | Default | Max Length | Allowed Values

9. WORKFLOW (include if processes/flows/approvals are mentioned)
   - Business workflows (narrative + state transitions)
   - Approval flow
   - Escalation flow

10. NOTIFICATIONS (include ONLY if notifications/emails/SMS/alerts are mentioned in the spec)
    - Channel (Email/SMS/Push), Event Trigger, Template, Recipients

11. REPORTS (include ONLY if reports/dashboards/exports are mentioned)
    - Report Name, Columns, Filters, Sorting, Export format, Frequency

12. SEARCH REQUIREMENTS (include if search/filter functionality is mentioned)
    - Search fields, Sorting options, Pagination, Filter criteria

13. ERROR HANDLING
    - Business errors, Validation errors, System errors (with error codes and messages)

14. NON-FUNCTIONAL REQUIREMENTS
    - Performance, Availability, Scalability, Security, Accessibility, Localization, Browser Support

15. ASSUMPTIONS (list all assumptions made during FSD authoring)

16. RISKS (list identified risks with likelihood and mitigation)

17. OPEN QUESTIONS (list any open items requiring stakeholder clarification)

18. APPENDIX
    - Glossary of terms
    - Abbreviations`;
      if (stageFeedback) {
        generatorPrompt += `\n\nHuman Review Feedback to apply: "${stageFeedback}"`;
      }

      resultOutput = await callGenerativeModel(decision.model, generatorPrompt);

    } else if (currentStage === 'ux-wireframe') {
      generatorPrompt = `You are an expert UI/UX Designer and Frontend Engineer.
Analyze the specification:
${specText}

Build a highly-interactive, responsive single-page HTML application mockup prototype.
Rules:
1. Use modern Tailwind CSS (via CDN: https://cdn.tailwindcss.com) for layout and styling. Create a premium dark-mode aesthetic (slate-950 background, glassmorphism cards, glowing active accents, smooth typography).
2. The prototype MUST be highly interactive: build actual mock data tables, interactive filter tabs, a fully functional input form (e.g. submit returns, create order, edit items), and a dynamic status drawer/details pane using pure vanilla JavaScript in a <script> tag.
3. Use a custom font (e.g. Plus Jakarta Sans or Inter via Google Fonts link) and FontAwesome icons (via CDN: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css).
4. Integrate details parsed directly from the spec: use the system title, specific user actions, API paths, and database fields to construct form fields and page context.
5. Do NOT enclose your output in markdown code blocks or write introduction/explanation sentences. Respond ONLY with the complete raw HTML code (beginning with <!DOCTYPE html>).`;
      if (stageFeedback) {
        generatorPrompt += `\n\nHuman Review Feedback to apply: "${stageFeedback}"`;
      }

      let wireframeHtml = await callGenerativeModel(decision.model, generatorPrompt);
      if (wireframeHtml.startsWith('```html')) {
        wireframeHtml = wireframeHtml.substring(7);
      } else if (wireframeHtml.startsWith('```')) {
        wireframeHtml = wireframeHtml.substring(3);
      }
      if (wireframeHtml.endsWith('```')) {
        wireframeHtml = wireframeHtml.substring(0, wireframeHtml.length - 3);
      }
      resultOutput = wireframeHtml.trim();

    } else if (currentStage === 'tech-architecture') {
      generatorPrompt = `You are a Principal Solutions Architect and Senior Technical Writer with deep cloud-native and enterprise architecture expertise.

Analyze the following specification document carefully:
${specText}

Your task is to generate a comprehensive, client-ready Technical Architecture / Technical Specification Document as a complete, beautifully styled HTML page AND a Mermaid architecture diagram.

Return ONLY valid JSON with exactly two keys:
{
  "html": "<complete self-contained HTML document as a single escaped string>",
  "blueprint": "<valid mermaid graph TD diagram as a string>"
}

HTML DOCUMENT RULES:
- The "html" value must be a complete <!DOCTYPE html> document with embedded CSS (no external CSS files).
- Use a premium dark-mode theme: body background #0f172a, text #e2e8f0, headings in indigo (#6366f1), section badges in cyan (#22d3ee).
- Include a sticky table of contents sidebar or top navigation for easy section jumping.
- Use card-style sections: background #1e293b, border 1px solid #334155, border-radius 12px, padding 24px.
- Render code blocks (SQL, JSON, shell) with a dark code background (#0d1117), monospace font, and colored syntax highlighting using <span> tags.
- Render tables with a styled dark header (#1e293b bg, #6366f1 text), alternating row colors, and borders.
- Do NOT wrap your output in markdown code blocks. Return only raw JSON.
- Be INTELLIGENT: Skip sections that are genuinely not applicable to the spec.
- Derive all content from the provided specification — do not fabricate details.

BLUEPRINT RULES:
- The "blueprint" must be a valid Mermaid.js graph TD flowchart of the system architecture.
- Include all major system components, databases, external services, and their connections.
- Use descriptive node labels.

Generate ALL applicable sections. Skip non-applicable ones:

DOCUMENT INFORMATION (always): Title, Project Name, Version, Status, Author, Reviewers, Approvers, Revision Log, Distribution List
TABLE OF CONTENTS (always)
1. Introduction (1.1 Purpose, 1.2 Scope, 1.3 Audience, 1.4 References)
2. Solution Overview (architecture summary, tech stack table, deployment model)
3. Architecture Diagrams (Context, Container, Component, Deployment, Sequence — as applicable)
4. Technology Stack (table: Layer | Technology | Version | Purpose | Justification)
5. Application Architecture (modules, responsibilities, dependencies, interaction patterns)
6. Component Design (per component: purpose, responsibilities, interfaces, dependencies, failure handling, logging, config)
7. API Specifications (per endpoint: path, method, headers, auth, request schema, response schema, error codes, retry, timeout, rate limits, examples)
8. Authentication & Authorization (JWT, OAuth/OIDC, SSO, MFA, session, RBAC — only what applies)
9. Authorization Matrix (Role vs Permission table)
10. Data Flow (sequence diagrams, request lifecycle, data movement)
11. Database Design Summary (entities, relationships, indexes, partitioning)
12. Integration Design (external systems, protocols, retries, circuit breaker, webhooks, queues — only if integrations exist)
13. Error Handling (exception hierarchy, retries, fallbacks, DLQ)
14. Logging (log levels, correlation IDs, sensitive data masking, aggregation)
15. Monitoring & Observability (metrics, health checks, alerts, dashboards — if applicable)
16. Performance Design (caching, pagination, compression, batching, async, load balancing)
17. Security Design (encryption, secrets, key vault, OWASP, CSRF, CORS, rate limiting)
18. Scalability (horizontal, vertical, auto-scaling)
19. Deployment (environment matrix Dev/QA/UAT/Prod, CI/CD, rollback, blue-green)
20. Infrastructure (cloud resources, networking, storage, compute — only what is relevant)
21. Disaster Recovery (backup, restore, RPO, RTO)
22. Risks (technical risks with likelihood, impact, mitigation)
23. Future Enhancements (roadmap, deferred decisions)`;

      if (stageFeedback) {
        generatorPrompt += `\n\nHuman Review Feedback to apply: "${stageFeedback}"`;
      }

      const rawTechResult = await callGenerativeModel(decision.model, generatorPrompt);
      try {
        resultOutput = parseGeminiJson(rawTechResult);
        // Normalize: support both { html, blueprint } and legacy { document, blueprint }
        if (resultOutput.document && !resultOutput.html) {
          resultOutput.html = resultOutput.document;
        }
      } catch (err) {
        logs.push(`[Generator] Warning: JSON parsing failed for tech-architecture (${err.message}). Wrapping raw text as html.`);
        resultOutput = {
          html: `<div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px">${rawTechResult.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div>`,
          blueprint: 'graph TD\n  Client[User Client] --> Gateway[API Gateway]\n  Gateway --> Services[Backend Services]\n  Services --> DB[(Database)]'
        };
      }

    } else {

      let stageSchemaInstructions = '';
      if (currentStage === 'database-design') {
        stageSchemaInstructions = `Return your design in JSON format with the following keys:
{
  "erd": "A valid Mermaid.js Entity-Relationship Diagram code (e.g. erDiagram...). Define the tables, primary/foreign keys, and relationships.",
  "sql": "A complete clean SQL DDL script creating all the required tables and constraints (e.g. CREATE TABLE...). Use PostgreSQL dialect.",
  "fsd": "A detailed field specifications description in Markdown table format mapping tables to business requirements."
}`;
      } else if (currentStage === 'test-cases') {
        stageSchemaInstructions = `Return your output as clean, premium-styled HTML (not JSON).
Do NOT wrap your output in markdown code blocks. Start directly with raw HTML.
Use dark-mode styling: background #0f172a, text #e2e8f0, indigo (#6366f1) headings, cyan (#22d3ee) section badges, cards with #1e293b background and #334155 borders.
Generate a comprehensive Test Strategy & Test Cases Document covering all applicable sections:
1. Test Strategy Summary (Scope, Objectives, Entry/Exit Criteria, Approach, Levels, Defect Mgmt, Risks)
2. Test Environment (per environment: name, build, database, dependencies)
3. Test Scenarios (high-level, grouped by module, with TS-IDs)
4. Detailed Test Cases — exhaustive table with: TC ID, Req ID, Module, Feature, Priority, Test Type, Objective, Preconditions, Test Data, Steps, Expected Result, Actual Result (TBD), Status (Not Run), Executed By (—), Execution Date (—), Automation Status, Defect ID (—), Comments
5. Negative Test Cases (if applicable)
6. Boundary Test Cases (if applicable)
7. Validation Test Cases (if applicable)
8. Security Test Cases (only if security is mentioned)
9. Performance Test Cases (only if performance/SLA is mentioned)
10. Regression Suite, Smoke Suite, Sanity Suite
11. UAT Test Cases (if business acceptance criteria are defined)
Skip sections that are not applicable based on the spec. Be thorough and specific.`;
      } else if (currentStage === 'traceability-matrix') {
        stageSchemaInstructions = `Return your output in JSON format with the following keys:
{
  "matrix": [
    {
      "reqId": "FSD-REQ-01",
      "userStoryId": "US-001",
      "techSpec": "Section 3.1: API Gateway",
      "dbTables": "returns_records",
      "testCases": "TC-001, TC-002"
    }
  ],
  "coverage": "String percentage representing requirement coverage (e.g. 98% Traceability Coverage)"
}`;
      } else if (currentStage === 'spec-to-story') {
        stageSchemaInstructions = `Return your design in JSON format with the following keys:
{
  "stories": [
    {
      "id": "US-SYS-01",
      "title": "Short descriptive title of user story",
      "asA": "User role",
      "iWantTo": "Action user wants to perform",
      "soThat": "Benefit of the action",
      "criteria": ["Acceptance criteria 1", "Acceptance criteria 2"],
      "priority": "High | Medium | Low",
      "points": 3,
      "techNotes": "Technical implementation notes"
    }
  ]
}`;
      } else if (currentStage === 'user-stories') {
        stageSchemaInstructions = `Return your output in JSON format with the following keys:
{
  "spreadsheet": [
    {
      "id": 1,
      "summary": "JIRA-001: Short summary of the task/story",
      "description": "Detailed description of requirements",
      "issueType": "Story | Task | Bug",
      "priority": "High | Medium | Low",
      "storyPoints": 5,
      "labels": "Label1, Label2"
    }
  ]
}`;
      } else if (currentStage === 'review-agent') {
        stageSchemaInstructions = `Return your output in JSON format with the following keys:
{
  "compliance": [
    {
      "id": "COMP-001",
      "checkpoint": "Data Encryption at Rest",
      "status": "Passed | Failed | Review Required",
      "details": "Explanation of the finding and recommendations"
    }
  ],
  "logs": [
    "[Info] Starting compliance scanner...",
    "[Audit] Database schemas scanned. TLS enforced.",
    "[Security] Audit logs enabled."
  ]
}`;
      } else {
        stageSchemaInstructions = `Return your output in JSON format: { "output": "standard markdown content" }`;
      }

      if (currentStage === 'test-cases') {
        // test-cases is self-contained: generates HTML, not JSON
        generatorPrompt = `You are a Principal QA Architect and Senior Test Engineer with deep enterprise software testing expertise.
Analyze the specification document:
${specText}

${stageSchemaInstructions}`;
        if (stageFeedback) {
          generatorPrompt += `\n\nHuman Review Feedback to apply: "${stageFeedback}"`;
        }
        let testHtml = await callGenerativeModel(decision.model, generatorPrompt);
        if (testHtml.startsWith('```html')) testHtml = testHtml.substring(7);
        else if (testHtml.startsWith('```')) testHtml = testHtml.substring(3);
        if (testHtml.endsWith('```')) testHtml = testHtml.substring(0, testHtml.length - 3);
        resultOutput = { html: testHtml.trim() };
      } else {
        // All other stages: set generatorPrompt based on stage, then call model
        if (currentStage === 'spec-to-story') {
          generatorPrompt = `You are a Senior Agile Product Owner. Analyze the specification document:
${specText}

Your task is to decompose the specification into a comprehensive backlog of Agile User Stories.
Requirements:
1. Decompose the specification document comprehensively to generate at least 5 to 7 detailed, distinct user stories.
2. Every story must follow the 'As a [role], I want to [action], So that [benefit]' format.
3. Cover all key functional areas described in the specification — do not fabricate details not present.

Format Instructions:
${stageSchemaInstructions}
Do not include any explanation or markdown outside the JSON block. Return ONLY valid JSON.`;
        } else if (currentStage === 'user-stories') {
          generatorPrompt = `You are an Agile Delivery Manager. Analyze the specification document:
${specText}

Your task is to create a complete JIRA project backlog spreadsheet.
Requirements:
1. Decompose the specification document comprehensively to create a backlog of at least 6 to 10 JIRA issues (mix of Stories, Tasks, and Bugs).
2. Make them specific to the product described in the specification — do not use generic placeholders.

Format Instructions:
${stageSchemaInstructions}
Do not include any explanation or markdown outside the JSON block. Return ONLY valid JSON.`;
        } else {
          generatorPrompt = `You are a professional software engineering agent. Build a high-quality document for stage: "${currentStage}".
Requirements:
${specText}

Instructions:
${stageSchemaInstructions}
Do not include any explanation or markdown outside the JSON block. Return ONLY valid JSON.`;
        }

        if (stageFeedback) {
          generatorPrompt += `\n\nHuman Review Feedback to apply: "${stageFeedback}"`;
        }

        const cleanJsonText = await callGenerativeModel(decision.model, generatorPrompt);
        try {
          resultOutput = parseGeminiJson(cleanJsonText);
        } catch (err) {
          logs.push(`[Generator] Warning: JSON parsing failed (${err.message}). Attempting to recover from raw text.`);
          resultOutput = {
            document: cleanJsonText,
            blueprint: 'graph TD\n  Error[JSON Generation Failed]',
            erd: 'erDiagram\n  Error',
            sql: '-- Generation failed',
            fsd: cleanJsonText,
            suite: [],
            gherkin: '# Failed to generate',
            matrix: [],
            coverage: '0%',
            compliance: [],
            logs: ['[Error] JSON parsing failed']
          };
        }
      }
    }

    logs.push(`[Generator] Generation completed successfully.`);
  } catch (e) {
    logs.push(`[Generator] Execution failed: ${e.message}`);
    resultOutput = typeof resultOutput === 'object' ? { error: e.message } : `Failed: ${e.message}`;
  }

  // Save generated draft to disk immediately so it appears on individual agent workspaces
  if (resultOutput && typeof resultOutput === 'object' && !resultOutput.error) {
    try {
      await saveAndIndexStageOutput(currentStage, resultOutput, state.activeSpec);
    } catch (err) {
      console.error(`[Orchestrator] Error saving draft output for ${currentStage}:`, err);
    }
  } else if (resultOutput && typeof resultOutput === 'string' && !resultOutput.startsWith('Failed:')) {
    try {
      await saveAndIndexStageOutput(currentStage, resultOutput, state.activeSpec);
    } catch (err) {
      console.error(`[Orchestrator] Error saving draft output for ${currentStage}:`, err);
    }
  }

  return {
    logs,
    results: { [currentStage]: resultOutput }
  };
}

// Helper: Save output to disk and index in Qdrant DB
async function saveAndIndexStageOutput(stage, result, activeSpec) {
  let filename = '';
  let format = '';
  let text = '';

  switch (stage) {
    case 'spec-to-story':
      filename = 'User_Stories.md';
      format = 'md';
      text = '# Agile User Stories Backlog\n\n';
      if (result.stories && Array.isArray(result.stories)) {
        result.stories.forEach(s => {
          text += `## ${s.id}: ${s.title}\n`;
          text += `* **As a:** ${s.asA}\n`;
          text += `* **I want to:** ${s.iWantTo}\n`;
          text += `* **So that:** ${s.soThat}\n\n`;
          text += `### Acceptance Criteria\n`;
          if (Array.isArray(s.criteria)) {
            s.criteria.forEach(c => { text += `- ${c}\n`; });
          }
          text += `\n* **Priority:** ${s.priority}\n`;
          text += `* **Story Points:** ${s.points}\n`;
          text += `* **Technical Notes:** ${s.techNotes}\n\n---\n\n`;
        });
      }
      break;
    case 'user-stories':
      filename = 'JIRA_Backlog.md';
      format = 'md';
      text = '# JIRA Backlog Export\n\n';
      text += '| Summary | Description | Issue Type | Priority | Story Points | Labels |\n';
      text += '| --- | --- | --- | --- | --- | --- |\n';
      if (result.spreadsheet && Array.isArray(result.spreadsheet)) {
        result.spreadsheet.forEach(row => {
          text += `| ${row.summary} | ${row.description} | ${row.issueType} | ${row.priority} | ${row.storyPoints} | ${row.labels} |\n`;
        });
      }
      break;
    case 'functional-spec':
      filename = 'Functional_Specification_Document.html';
      format = 'html';
      text = typeof result === 'string' ? result : result.html || '';
      break;
    case 'ux-wireframe':
      filename = 'wireframe_prototype.html';
      format = 'html';
      text = typeof result === 'string' ? result : result.html || '';
      break;
    case 'tech-architecture':
      filename = 'Technical_Specification.html';
      format = 'html';
      text = result.html || result.document || '';
      break;

    case 'database-design':
      filename = 'Database_Design_Document.html';
      format = 'html';
      text = typeof result === 'string' ? result : (result.fsd || '');
      break;
    case 'test-cases':
      filename = 'Test_Cases_Document.html';
      format = 'html';
      text = typeof result === 'string' ? result : (result.html || '');
      break;
    case 'traceability-matrix':
      filename = 'Traceability_Matrix.md';
      format = 'md';
      text = `# Requirements Traceability Matrix\n\n`;
      text += `Status: **${result.coverage || 'Unknown'} Traceability Coverage Achieved**\n\n`;
      text += '| Requirement ID (FSD) | User Story ID (JIRA) | Tech Spec Section | Database Tables | Test Case IDs |\n';
      text += '| --- | --- | --- | --- | --- |\n';
      if (result.matrix && Array.isArray(result.matrix)) {
        result.matrix.forEach(row => {
          text += `| ${row.reqId} | ${row.userStoryId} | ${row.techSpec} | ${row.dbTables} | ${row.testCases} |\n`;
        });
      }
      break;
    case 'review-agent':
      filename = 'Compliance_Report.md';
      format = 'md';
      text = '# Compliance Audit & Review Report\n\n';
      text += '| Checkpoint ID | Checkpoint | Status | Details |\n';
      text += '| --- | --- | --- | --- |\n';
      if (result.compliance && Array.isArray(result.compliance)) {
        result.compliance.forEach(row => {
          text += `| ${row.id} | ${row.checkpoint} | ${row.status} | ${row.details} |\n`;
        });
      }
      if (result.logs && Array.isArray(result.logs)) {
        text += '\n\n## Compliance Audit Execution Logs\n\n```\n';
        result.logs.forEach(l => { text += l + '\n'; });
        text += '```\n';
      }
      break;
    default:
      return;
  }

  // 1. Index the compiled Markdown/HTML document in Qdrant (which also saves it to disk as file)
  const { indexDocument } = require('./vectorDb.service');
  await indexDocument(stage, filename, format, text, activeSpec);

  // 2. Also save the raw JSON output to disk as a .json file, so that the frontend can read the exact state on load!
  const storageDir = path.join(__dirname, '../storage');
  const jsonFilename = filename.replace(/\.(html|md)$/, '.json');
  const jsonFilePath = path.join(storageDir, jsonFilename);
  const jsonContent = typeof result === 'string' ? { html: result } : result;
  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2), 'utf8');
  console.log(`[Orchestrator] Saved raw JSON state to: ${jsonFilePath}`);

  // Agent-generated artifacts are NOT mirrored to the specs workspace folder.
  // Only core spec files (spec.md, constitution.md, plan.md, tasks.md, research.md) belong there.
  // Agent outputs live in server/src/storage/ and are indexed into the vector DB.
}

// Node 3: Gating / Approval Node (Breakpoint Gating)
async function reviewNode(state) {
  const currentStage = state.currentStage || 'functional-spec';
  const status = state.approvalStatus[currentStage] || 'pending_review';

  return {
    logs: [`[Gating] Review status for "${currentStage}" is: ${status}.`],
    approvalStatus: { [currentStage]: status }
  };
}

// Conditional Routing Logic
function routeNext(state) {
  const currentStage = state.currentStage;
  if (currentStage === 'completed') {
    return 'end';
  }
  const approval = state.approvalStatus[currentStage];
  if (approval === 'rejected') {
    return 'selector';
  }
  return 'selector';
}

// Compile the state graph with a checkpointer and breakpoints
const checkpointer = new MemorySaver();

const workflow = new StateGraph(StateAnnotation)
  .addNode('selector', selectorNode)
  .addNode('generator', generatorNode)
  .addNode('review', reviewNode)
  .addEdge(START, 'selector')
  .addEdge('selector', 'generator')
  .addEdge('generator', 'review');

// Define conditional edges
workflow.addConditionalEdges('review', (state) => {
  const decision = routeNext(state);
  if (decision === 'end') return END;
  return 'selector';
});

// Compile with interrupts before the review node (Human-in-the-Loop gating)
const graphApp = workflow.compile({
  checkpointer,
  interruptBefore: ['review']
});

// Memory cache for active threads mapping
const threads = {};

// Exported Functions
module.exports = {
  // Start Graph Execution
  async startGraph(activeSpec) {
    const threadId = `thread-${Date.now()}`;
    const config = { configurable: { thread_id: threadId } };
    
    const initialState = {
      activeSpec,
      currentStage: 'spec-to-story',
      logs: [`[Queue] Initializing LangGraph multi-agent orchestrator for spec: ${activeSpec}...`],
      results: {},
      modelDecision: {},
      approvalStatus: {},
      feedback: {}
    };

    // Run graph until first interrupt
    await graphApp.invoke(initialState, config);
    threads[threadId] = config;

    return { threadId, state: await graphApp.getState(config) };
  },

  // Approve or Provide Feedback (HITL Response)
  async respondToStage(threadId, stage, action, feedbackText = '') {
    const config = threads[threadId];
    if (!config) {
      throw new Error(`Thread ID "${threadId}" not found in memory config.`);
    }

    const currentState = await graphApp.getState(config);
    const stateValues = currentState.values;

    if (action === 'approve') {
      // 1. Save and index stage output
      const resultOutput = stateValues.results[stage];
      if (resultOutput) {
        try {
          await saveAndIndexStageOutput(stage, resultOutput);
        } catch (err) {
          console.error(`[Orchestrator] Error saving approved stage output:`, err);
        }
      }

      // 2. Determine next stage
      const stagesOrder = [
        'spec-to-story',
        'user-stories',
        'ux-wireframe',
        'functional-spec',
        'tech-architecture',
        'database-design',
        'test-cases',
        'traceability-matrix'
      ];
      const currentIndex = stagesOrder.indexOf(stage);
      let nextStage = stage;
      let logMsg = '';
      if (currentIndex < stagesOrder.length - 1) {
        nextStage = stagesOrder[currentIndex + 1];
        logMsg = `[Gating] Approved! Transitioning to next stage: "${nextStage}"...`;
      } else {
        nextStage = 'completed';
        logMsg = `[Gating] Approved! All stages completed successfully.`;
      }

      // 3. Update state as review node
      await graphApp.updateState(config, {
        approvalStatus: { [stage]: 'approved' },
        currentStage: nextStage,
        logs: [`[Gating] Review status for "${stage}" is: approved.`, logMsg]
      }, 'review');

    } else {
      // Update state as review node
      await graphApp.updateState(config, {
        approvalStatus: { [stage]: 'rejected' },
        feedback: { [stage]: feedbackText },
        logs: [
          `[Gating] Review status for "${stage}" is: rejected.`,
          `[Gating] Feedback received: "${feedbackText}". Returning to Selector Node for refinement.`
        ]
      }, 'review');
    }

    // Resume execution
    await graphApp.invoke(null, config);

    return await graphApp.getState(config);
  },

  // Get active state of the thread
  async getGraphState(threadId) {
    const config = threads[threadId];
    if (!config) return null;
    return await graphApp.getState(config);
  },

  // Reset/Cancel graph session and clean artifacts
  async resetOrchestration(threadId) {
    // 1. Clear thread from active config
    if (threadId && threads[threadId]) {
      delete threads[threadId];
    }

    // 2. Delete all generated stage artifacts from disk
    const storageDir = path.join(__dirname, '../storage');
    const filesToClean = [
      'User_Stories.md', 'User_Stories.json',
      'JIRA_Backlog.md', 'JIRA_Backlog.json',
      'Functional_Specification_Document.html', 'Functional_Specification_Document.json',
      'Technical_Specification.md', 'Technical_Specification.json',
      'Database_Specification.md', 'Database_Specification.json',
      'wireframe_prototype.html', 'wireframe_prototype.json',
      'Testing_Specs_Blueprint.md', 'Testing_Specs_Blueprint.json',
      'Traceability_Matrix.md', 'Traceability_Matrix.json',
      'Compliance_Report.md', 'Compliance_Report.json'
    ];

    const fs = require('fs');
    for (const filename of filesToClean) {
      const filePath = path.join(storageDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[Orchestrator] Deleted artifact file on reset: ${filename}`);
        } catch (err) {
          console.error(`[Orchestrator] Failed to delete file ${filename}:`, err);
        }
      }
    }
  }
};

