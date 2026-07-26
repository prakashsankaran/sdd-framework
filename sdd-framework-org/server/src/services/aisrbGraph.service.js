const { StateGraph, Annotation, START, END, MemorySaver } = require('@langchain/langgraph');
const fs = require('fs');
const path = require('path');
const {
  getGenAI,
  generateWithRetryAndFallback,
  selectReviewers,
  generateSimpleDiff
} = require('./aisrb.service');
const { getModelsConfig } = require('../config/modelsHelper');

// Define the Graph State Schema using LangGraph Annotation
const DebateStateAnnotation = Annotation.Root({
  session_id: Annotation(),
  activeSpec: Annotation(),
  specification: Annotation(),
  project_context: Annotation(),
  organizational_memory: Annotation(),
  
  // Spec Alignments
  agent_reviews: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  debate_history: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  
  // Backward compatibility fields
  reviewer_outputs: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  debate_rounds: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  
  conflicts: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  opinion_changes: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  
  moderator_decision: Annotation(),
  revised_specification: Annotation(),
  validation_result: Annotation(),
  approval_result: Annotation(),
  logs: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  
  metrics: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),

  // Human Governance Gate
  human_approval_required: Annotation(),
  human_approval_status: Annotation(),
  human_approval_details: Annotation()
});

// Helper for unified progress and active run console logs
function logMsg(folder, msg) {
  console.log(`[AI-SRB Subgraph] ${msg}`);
  if (global.updateActiveRun) {
    global.updateActiveRun(folder, msg);
  }
}

// Helper to track token usage and latencies during LLM calls
async function callAgent(ai, prompt, agentName, state, logCallback) {
  const agentStartTime = Date.now();
  const responseText = await generateWithRetryAndFallback(ai, prompt, agentName, logCallback);
  const latency = Date.now() - agentStartTime;
  
  // Estimate tokens
  const promptTokens = Math.ceil(prompt.length / 4);
  const completionTokens = Math.ceil(responseText.length / 4);
  const totalTokens = promptTokens + completionTokens;
  
  if (!state.metrics) state.metrics = {};
  if (!state.metrics.tokens) {
    state.metrics.tokens = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  }
  state.metrics.tokens.promptTokens += promptTokens;
  state.metrics.tokens.completionTokens += completionTokens;
  state.metrics.tokens.totalTokens += totalTokens;
  
  if (!state.metrics.agentLatencies) {
    state.metrics.agentLatencies = {};
  }
  state.metrics.agentLatencies[agentName] = (state.metrics.agentLatencies[agentName] || 0) + latency;
  
  return responseText;
}

// Parse confidence score from agent report text
function parseConfidence(text) {
  const match = text.match(/Confidence(?:\s+Score)?\s*:\s*(\d{1,3})%/i);
  if (match) return parseInt(match[1], 10);
  const matchPercent = text.match(/(\d{1,3})%/);
  if (matchPercent) return parseInt(matchPercent[1], 10);
  return 85; // default fallback
}

// Parse vote from agent report text
function parseVote(text) {
  const reportText = (text || '').toUpperCase();
  if (reportText.includes('REVISIONS REQUIRED') || reportText.includes('REVISION REQUIRED')) {
    return 'REVISIONS REQUIRED';
  } else if (reportText.includes('APPROVED WITH CONDITIONS') || reportText.includes('APPROVE WITH CONDITIONS')) {
    return 'APPROVED WITH CONDITIONS';
  } else if (reportText.includes('NEEDS CLARIFICATION') || reportText.includes('NEED CLARIFICATION')) {
    return 'NEEDS CLARIFICATION';
  } else if (reportText.includes('REJECTED') || reportText.includes('REJECT')) {
    return 'REJECTED';
  }
  return 'APPROVED';
}

/**
 * Isolated routing logic to determine targeted agents based on human feedback comments.
 * This can easily be upgraded to AI-based intent classification in the future.
 */
function determineTargetedAgents(comments) {
  const targeted = new Set(['architect']); // always include architect baseline
  const lower = (comments || '').toLowerCase();

  if (lower.includes('cost') || lower.includes('budget') || lower.includes('price') || lower.includes('finops') || lower.includes('spend')) {
    targeted.add('cost');
  }
  if (lower.includes('security') || lower.includes('auth') || lower.includes('login') || lower.includes('permission') || lower.includes('token') || lower.includes('jwt')) {
    targeted.add('security');
  }
  if (lower.includes('perform') || lower.includes('scale') || lower.includes('latency') || lower.includes('cache') || lower.includes('speed') || lower.includes('slow')) {
    targeted.add('performance');
  }
  if (lower.includes('database') || lower.includes('schema') || lower.includes('sql') || lower.includes('postgres') || lower.includes('table')) {
    targeted.add('data_architect');
  }
  if (lower.includes('deploy') || lower.includes('infra') || lower.includes('kubernetes') || lower.includes('docker') || lower.includes('pipeline') || lower.includes('keda')) {
    targeted.add('devops');
  }
  if (lower.includes('comply') || lower.includes('compliance') || lower.includes('gdpr') || lower.includes('privacy') || lower.includes('legal') || lower.includes('audit')) {
    targeted.add('compliance');
  }
  if (lower.includes('product') || lower.includes('owner') || lower.includes('require') || lower.includes('story') || lower.includes('flow')) {
    targeted.add('product_owner');
  }

  return Array.from(targeted);
}

// Node 1: Specification Intake Node (Debate Session Manager)
async function specIntakeNode(state) {
  const folderName = state.activeSpec;
  const specsDir = path.resolve(__dirname, '../../../specs', folderName);
  
  const readFile = (name) => {
    const p = path.join(specsDir, name);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };

  const spec = readFile('spec.md') || 'No spec.md found.';
  const requirements = readFile('requirements.md') || '';
  const constitution = readFile('constitution.md') || '';
  const plan = readFile('plan.md') || '';
  const research = readFile('research.md') || '';

  const sessionId = state.session_id || ('session-' + Date.now());
  const startTime = Date.now();

  logMsg(folderName, `Debate Session Manager: Created session ${sessionId}. Loaded spec and requirements context.`);

  const modelsConfig = getModelsConfig();
  const humanApprovalRequired = modelsConfig.debate_policy?.human_approval_required !== false;

  return {
    session_id: sessionId,
    specification: spec,
    project_context: JSON.stringify({ requirements, constitution, plan, research }),
    metrics: { startTime, nodeLatencies: {}, tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, agentLatencies: {} },
    logs: [`[AI-SRB Subgraph] Debate Session Manager: Created session ${sessionId}.`],
    human_approval_required: humanApprovalRequired,
    human_approval_status: 'PENDING',
    human_approval_details: {}
  };
}

// Node 2: Context Enrichment Node
async function contextEnrichmentNode(state) {
  const folderName = state.activeSpec;
  const startTime = Date.now();
  logMsg(folderName, 'Context Enrichment Node: Enriching project specifications...');
  
  return {
    logs: [`[AI-SRB Subgraph] Context Enrichment Node: Prepared spec metadata context.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        contextEnrichment: Date.now() - startTime
      }
    }
  };
}

// Node 3: Memory Retrieval Node
async function memoryRetrievalNode(state) {
  const folderName = state.activeSpec;
  const startTime = Date.now();
  logMsg(folderName, 'Loading organizational lessons learned memory...');

  let orgMemoryText = 'No previous organizational memory records found.';
  try {
    const memPath = path.resolve(__dirname, '../storage/organizational_memory.json');
    if (fs.existsSync(memPath)) {
      const records = JSON.parse(fs.readFileSync(memPath, 'utf8'));
      orgMemoryText = records.map(r => {
        return `- **Project:** ${r.project}\n  **Decision:** ${r.decision}\n  **Outcome/Incident:** ${r.outcome}\n  **Lesson Learned:** ${r.lesson}`;
      }).join('\n\n');
    }
  } catch (err) {
    console.error('Failed to load organizational memory in subgraph:', err.message);
  }

  return {
    organizational_memory: orgMemoryText,
    logs: [`[AI-SRB Subgraph] Memory Retrieval Node: Extracted lessons learned memory context.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        memoryRetrieval: Date.now() - startTime
      }
    }
  };
}

// Node 4: Reviewer Agents Node
async function parallelReviewerNode(state) {
  const folderName = state.activeSpec;
  const spec = state.specification;
  const context = JSON.parse(state.project_context || '{}');
  const orgMemoryText = state.organizational_memory;
  const ai = getGenAI();
  const startTime = Date.now();

  const activeReviewerKeys = selectReviewers(context.requirements, spec);
  logMsg(folderName, `Dynamic Reviewer Selection: Active Board Members selected: ${activeReviewerKeys.join(', ')}`);
  logMsg(folderName, 'AI-SRB Round 1: Running Independent Review Panel...');

  const contextBlock = `
ORIGINAL REQUIREMENTS:
"""
${context.requirements}
"""

DRAFT SPECIFICATION (spec.md):
"""
${spec}
"""

PROJECT CONSTITUTION:
"""
${context.constitution}
"""

IMPLEMENTATION PLAN:
"""
${context.plan}
"""

RESEARCH NOTES:
"""
${context.research}
"""

ORGANIZATIONAL LESSONS LEARNED & MEMORY:
"""
${orgMemoryText}
"""
`;

  const reviewerMeta = {
    architect: {
      name: 'Architect',
      role: 'Senior Principal Software Architect',
      prompt: `Evaluate the draft specification for architectural soundness, technology choices, database structure, and boundaries. Ensure compliance with the Project Constitution and historical Lessons Learned.
Your report MUST follow this structured format:
### Architectural Review Report
- **Assessment**: Detailed analysis of feasibility and structure.
- **Risk**: Specific architectural risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    security: {
      name: 'Security',
      role: 'Lead Security Architect',
      prompt: `Evaluate the draft specification for authorization, encryption, session controls, vulnerabilities, and OWASP compliance. Ensure RAG security boundaries are robust against BOLA/Relational bypasses.
Your report MUST follow this structured format:
### Security Review Report
- **Assessment**: Detailed analysis of security posture.
- **Risk**: Specific security risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    performance: {
      name: 'Performance',
      role: 'Principal Performance Engineer',
      prompt: `Evaluate the draft specification for scalability, responsiveness, latency, caching, database indexing, and bottlenecks. Ensure performance requirements match historical lessons.
Your report MUST follow this structured format:
### Performance Review Report
- **Assessment**: Detailed analysis of scalability and reliability.
- **Risk**: Specific performance/scaling risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    cost: {
      name: 'Cost',
      role: 'Cloud FinOps/Cost Optimizer',
      prompt: `Evaluate the draft specification for cost efficiency, API usage budgets, database storage classes, compute pricing, and optimizations.
Your report MUST follow this structured format:
### Cost Review Report
- **Assessment**: Detailed analysis of cost viability.
- **Risk**: Specific financial/operational cost risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    product_owner: {
      name: 'Product Owner',
      role: 'Principal Product Owner',
      prompt: `Evaluate the draft specification for coverage of the Original Requirements, user flows, missing functional requirements, and edge cases.
Your report MUST follow this structured format:
### Product Owner Review Report
- **Assessment**: Detailed analysis of requirements alignment.
- **Risk**: Specific product design or scope gap risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    devil_advocate: {
      name: "Devil's Advocate",
      role: "Devil's Advocate",
      prompt: `Challenge assumptions, raise hidden risks, expose logical gaps, and question viability with extreme skepticism. Where is this design likely to break? What has been over/under-engineered?
Your report MUST follow this structured format:
### Devil's Advocate Review Report
- **Assessment**: Skeptical analysis of the proposal.
- **Risk**: Significant risk/failure point.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    data_architect: {
      name: 'Data Architect',
      role: 'Principal Data Architect',
      prompt: `Evaluate the draft specification for data model consistency, schemas, normalization/denormalization trade-offs, transactional safety, database constraints, and vector index configurations.
Your report MUST follow this structured format:
### Data Architect Review Report
- **Assessment**: Detailed analysis of database models and data integrity.
- **Risk**: Specific database structure or consistency risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    devops: {
      name: 'DevOps',
      role: 'Lead DevOps Engineer',
      prompt: `Evaluate the draft specification for deployments, containerization (Docker, Kubernetes), auto-scaling boundaries (e.g., KEDA), CI/CD pipelines, and health monitoring interfaces.
Your report MUST follow this structured format:
### DevOps Review Report
- **Assessment**: Detailed analysis of infrastructure and deployment readiness.
- **Risk**: Specific deployment or runtime scalability risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    },
    compliance: {
      name: 'Compliance',
      role: 'Lead Compliance and Legal Auditor',
      prompt: `Evaluate the draft specification for data privacy policies (GDPR/CCPA/HIPAA), wiretapping and user recording consent workflows, PII sanitization, and audit logs auditability.
Your report MUST follow this structured format:
### Compliance Review Report
- **Assessment**: Detailed analysis of regulatory and legal compliance.
- **Risk**: Specific legal, privacy, or audit risk.
- **Recommendation**: Concrete recommendations.
- **Alternative**: Alternative option.
- **Confidence Score**: percentage (e.g., 85%)
- **Vote**: Choose one from [Approved, Approved with Revisions, Needs Clarification, Rejected]`
    }
  };

  const reviewerOutputs = {};

  const executeReview = async (key) => {
    const meta = reviewerMeta[key];
    logMsg(folderName, `Round 1: Running independent review for ${meta.name}...`);
    const prompt = `You are the ${meta.role} on the AI Specification Review Board.\n${contextBlock}\n${meta.prompt}`;
    const output = await callAgent(ai, prompt, `AI-SRB: ${meta.name}`, state, (m) => logMsg(folderName, m));
    const vote = parseVote(output);
    const confidence = parseConfidence(output);
    
    logMsg(folderName, `Round 1 review completed for ${meta.name}: ${vote} (Confidence: ${confidence}%)`);
    return { key, text: output, vote, confidence };
  };

  const modelsConfig = getModelsConfig();
  const debatePolicy = modelsConfig.debate_policy || {};
  const executionMode = (debatePolicy.execution_mode || 'development').toLowerCase();
  const maxConcurrency = debatePolicy.max_concurrency || 5;

  const results = [];
  if (executionMode === 'production') {
    // Parallel chunked execution (production)
    const chunks = [];
    for (let i = 0; i < activeReviewerKeys.length; i += maxConcurrency) {
      chunks.push(activeReviewerKeys.slice(i, i + maxConcurrency));
    }
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(key => executeReview(key)));
      results.push(...chunkResults);
    }
  } else {
    // Sequential execution (development)
    for (const key of activeReviewerKeys) {
      const res = await executeReview(key);
      results.push(res);
    }
  }

  for (const r of results) {
    reviewerOutputs[r.key] = { text: r.text, vote: r.vote, confidence: r.confidence };
  }

  return {
    agent_reviews: reviewerOutputs,
    reviewer_outputs: reviewerOutputs, // backward compatibility
    logs: [`[AI-SRB Subgraph] Reviewer Node: Completed independent reviews.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        parallelReviewer: Date.now() - startTime
      }
    }
  };
}

// Node 5: Debate Controller Node
async function debateControllerNode(state) {
  const folderName = state.activeSpec;
  const spec = state.specification;
  const context = JSON.parse(state.project_context || '{}');
  const orgMemoryText = state.organizational_memory;
  const reviewerOutputs = state.agent_reviews || state.reviewer_outputs || {};
  const activeReviewerKeys = Object.keys(reviewerOutputs);
  const ai = getGenAI();
  const startTime = Date.now();

  logMsg(folderName, 'AI-SRB Round 2: Running Cross-Agent Challenge Debate...');

  const reviewerMeta = {
    architect: { name: 'Architect', role: 'Senior Principal Software Architect' },
    security: { name: 'Security', role: 'Lead Security Architect' },
    performance: { name: 'Performance', role: 'Principal Performance Engineer' },
    cost: { name: 'Cost', role: 'Cloud FinOps/Cost Optimizer' },
    product_owner: { name: 'Product Owner', role: 'Principal Product Owner' },
    devil_advocate: { name: "Devil's Advocate", role: "Devil's Advocate" },
    data_architect: { name: 'Data Architect', role: 'Principal Data Architect' },
    devops: { name: 'DevOps', role: 'Lead DevOps Engineer' },
    compliance: { name: 'Compliance', role: 'Lead Compliance and Legal Auditor' }
  };

  let compiledIndependentText = '';
  for (const key of activeReviewerKeys) {
    const origText = reviewerOutputs[key]?.text || '';
    compiledIndependentText += `\n=========================================\n${reviewerMeta[key].name.toUpperCase()} INDEPENDENT REVIEW:\n${origText}\n`;
  }

  const debateRounds = {};
  const opinionChanges = [];

  const isHumanRevision = state.human_approval_details?.decision === 'CHANGES_REQUESTED';
  let keysToRun = activeReviewerKeys;
  if (isHumanRevision) {
    const comments = state.human_approval_details.comments || '';
    const targeted = determineTargetedAgents(comments);
    keysToRun = activeReviewerKeys.filter(k => targeted.includes(k));
    logMsg(folderName, `Human changes requested loopback. Routing to targeted agents: ${keysToRun.map(k => reviewerMeta[k].name).join(', ')}`);
  }

  const executeDebate = async (key) => {
    // If loopback is active and this key is not targeted, reuse previous result
    if (isHumanRevision && !keysToRun.includes(key)) {
      logMsg(folderName, `Reusing previous debate response for ${reviewerMeta[key].name} (not targeted by human feedback)`);
      return { key, text: state.debate_history?.[key] || state.debate_rounds?.[key] || reviewerOutputs[key]?.text || '' };
    }

    const meta = reviewerMeta[key];
    logMsg(folderName, `Round 2: Running debate feedback for ${meta.name}...`);
    
    const humanFeedbackPrompt = isHumanRevision
      ? `\n\nADDITIONAL HUMAN ARCHITECTURE BOARD FEEDBACK:\n"""\n${state.human_approval_details.comments}\n"""\nPlease explicitly address this feedback in your assessment.`
      : '';

    const debatePrompt = `You are the ${meta.role} on the AI Specification Review Board.
You have completed your independent review. Now, review the findings of your fellow board members:

${compiledIndependentText}
${humanFeedbackPrompt}

Compare their assessments with your own. Challenge assumptions, defend recommendations with evidence, or identify areas where you wish to adjust your position.
Provide a short debate response (max 300 words) containing:
1. **Challenges/Support**: Critique of others' arguments.
2. **Revised Position**: If you want to change your vote or confidence, state it. Otherwise, explain why you stand by your original review.
3. **Final Vote & Confidence**: Your final vote and confidence score.`;

    const debateOutput = await callAgent(ai, debatePrompt, `Debate: ${meta.name}`, state, (m) => logMsg(folderName, m));
    logMsg(folderName, `Round 2 debate completed for ${meta.name}`);

    // Parse revised vote and confidence
    const finalVote = parseVote(debateOutput);
    const finalConfidence = parseConfidence(debateOutput);
    const initialVote = reviewerOutputs[key]?.vote || 'APPROVED';
    const initialConfidence = reviewerOutputs[key]?.confidence || 85;

    if (finalVote !== initialVote || finalConfidence !== initialConfidence) {
      opinionChanges.push({
        agent: meta.name,
        initial_position: `${initialVote} (${initialConfidence}%)`,
        revised_position: `${finalVote} (${finalConfidence}%)`,
        challenge: `Peer findings review in debate panel.`,
        reason: `Exposed to and incorporated concerns raised by other board members.`
      });
    }

    return { key, text: debateOutput };
  };

  const modelsConfig = getModelsConfig();
  const debatePolicy = modelsConfig.debate_policy || {};
  const executionMode = (debatePolicy.execution_mode || 'development').toLowerCase();
  const maxConcurrency = debatePolicy.max_concurrency || 5;

  const results = [];
  if (executionMode === 'production') {
    // Parallel chunked execution (production)
    const chunks = [];
    for (let i = 0; i < activeReviewerKeys.length; i += maxConcurrency) {
      chunks.push(activeReviewerKeys.slice(i, i + maxConcurrency));
    }
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(key => executeDebate(key)));
      results.push(...chunkResults);
    }
  } else {
    // Sequential execution (development)
    for (const key of activeReviewerKeys) {
      const res = await executeDebate(key);
      results.push(res);
    }
  }

  for (const r of results) {
    debateRounds[r.key] = r.text;
  }

  return {
    debate_history: debateRounds,
    debate_rounds: debateRounds, // backward compatibility
    opinion_changes: opinionChanges,
    logs: [`[AI-SRB Subgraph] Debate Controller: Cross-agent rebuttals finalized. Opinion changes recorded: ${opinionChanges.length}`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        debateController: Date.now() - startTime
      }
    }
  };
}

// Node 6: Moderator Node
async function moderatorNode(state) {
  const folderName = state.activeSpec;
  const spec = state.specification;
  const context = JSON.parse(state.project_context || '{}');
  const orgMemoryText = state.organizational_memory;
  const reviewerOutputs = state.agent_reviews || state.reviewer_outputs || {};
  const debateRounds = state.debate_history || state.debate_rounds || {};
  const activeReviewerKeys = Object.keys(reviewerOutputs);
  const ai = getGenAI();
  const startTime = Date.now();

  logMsg(folderName, 'AI-SRB Round 3: Running Debate Moderator consensus formation...');

  let compiledIndependentText = '';
  let compiledDebateText = '';
  const reviewerMeta = {
    architect: { name: 'Architect', role: 'Senior Principal Software Architect' },
    security: { name: 'Security', role: 'Lead Security Architect' },
    performance: { name: 'Performance', role: 'Principal Performance Engineer' },
    cost: { name: 'Cost', role: 'Cloud FinOps/Cost Optimizer' },
    product_owner: { name: 'Product Owner', role: 'Principal Product Owner' },
    devil_advocate: { name: "Devil's Advocate", role: "Devil's Advocate" },
    data_architect: { name: 'Data Architect', role: 'Principal Data Architect' },
    devops: { name: 'DevOps', role: 'Lead DevOps Engineer' },
    compliance: { name: 'Compliance', role: 'Lead Compliance and Legal Auditor' }
  };

  for (const key of activeReviewerKeys) {
    const origText = reviewerOutputs[key]?.text || '';
    const debateText = debateRounds[key] || '';
    compiledIndependentText += `\n=========================================\n${reviewerMeta[key].name.toUpperCase()} INDEPENDENT REVIEW:\n${origText}\n`;
    compiledDebateText += `\n=========================================\n${reviewerMeta[key].name.toUpperCase()} DEBATE RESPONSE:\n${debateText}\n`;
  }

  const contextBlock = `
ORIGINAL REQUIREMENTS:
"""
${context.requirements}
"""

DRAFT SPECIFICATION (spec.md):
"""
${spec}
"""

PROJECT CONSTITUTION:
"""
${context.constitution}
"""

IMPLEMENTATION PLAN:
"""
${context.plan}
"""

RESEARCH NOTES:
"""
${context.research}
"""

ORGANIZATIONAL LESSONS LEARNED & MEMORY:
"""
${orgMemoryText}
"""
`;

  const moderatorPrompt = `You are the Debate Moderator of the AI Specification Review Board (AI-SRB).
You must evaluate the discussion, compare viewpoints, resolve conflicts, and produce a unified list of required changes.
Evaluate the evidence-based arguments rather than a simple majority vote. Consider confidence scores, risk severities, and historical lessons learned.

${contextBlock}

INITIAL REVIEWS:
${compiledIndependentText}

DEBATE CONTRIBUTIONS:
${compiledDebateText}

Produce a structured Debate Moderator Report containing:
1. **Consensus Summary**: High-level overview of agreed-upon changes.
2. **Conflict Resolution Matrix**: List of conflicts and how they are resolved with evidence-based reasoning.
3. **Required Revisions**: A clear, numbered backlog of changes that MUST be applied to the spec.md.

Return ONLY this markdown report.`;

  const moderatorReport = await callAgent(ai, moderatorPrompt, 'AI-SRB: Moderator', state, (m) => logMsg(folderName, m));

  return {
    moderator_decision: moderatorReport,
    logs: [`[AI-SRB Subgraph] Moderator Node: Formulated consensus report and resolution matrix.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        moderator: Date.now() - startTime
      }
    }
  };
}

// Node 7: Specification Editor Node
async function specEditorNode(state) {
  const folderName = state.activeSpec;
  const spec = state.specification;
  const context = JSON.parse(state.project_context || '{}');
  const orgMemoryText = state.organizational_memory;
  const moderatorReport = state.moderator_decision;
  const ai = getGenAI();
  const startTime = Date.now();

  logMsg(folderName, 'AI-SRB: Running Specification Editor Agent to generate spec_v2.md...');

  const contextBlock = `
ORIGINAL REQUIREMENTS:
"""
${context.requirements}
"""

DRAFT SPECIFICATION (spec.md):
"""
${spec}
"""

PROJECT CONSTITUTION:
"""
${context.constitution}
"""

IMPLEMENTATION PLAN:
"""
${context.plan}
"""

RESEARCH NOTES:
"""
${context.research}
"""

ORGANIZATIONAL LESSONS LEARNED & MEMORY:
"""
${orgMemoryText}
"""
`;

  const editorPrompt = `You are the Specification Editor Agent. Your task is to rewrite the original Specification document (spec.md) to incorporate the Moderator's Required Revisions.

${contextBlock}

MODERATOR'S REQUIRED REVISIONS:
"""
${moderatorReport}
"""

Please rewrite the entire "spec.md" specification. Make sure to:
- Resolve all Required Revisions.
- Preserve the overall structure and format of the spec.md.
- Ensure all technical details, schemas, and endpoints are updated.
- Do NOT output any explanations or commentary. Output ONLY the complete, revised Markdown specification document.`;

  const specV2 = await callAgent(ai, editorPrompt, 'AI-SRB: Editor', state, (m) => logMsg(folderName, m));

  return {
    revised_specification: specV2,
    logs: [`[AI-SRB Subgraph] Editor Node: Completed spec_v2.md revision updates.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        specEditor: Date.now() - startTime
      }
    }
  };
}

// Node 8: Validation Node
async function validationNode(state) {
  const folderName = state.activeSpec;
  const context = JSON.parse(state.project_context || '{}');
  const moderatorReport = state.moderator_decision;
  const specV2 = state.revised_specification;
  const ai = getGenAI();
  const startTime = Date.now();

  logMsg(folderName, 'AI-SRB: Running Validation Agent audit...');

  const validationPrompt = `You are the Validation Agent. Verify that the revised specification (spec_v2.md) fully addresses the Moderator's Required Revisions.

ORIGINAL REQUIREMENTS:
"""
${context.requirements}
"""

MODERATOR'S REQUIRED REVISIONS:
"""
${moderatorReport}
"""

REVISED SPECIFICATION (spec_v2.md):
"""
${specV2}
"""

Evaluate the specification and provide a short validation report:
1. **Verification Status**: PASSED or REVIEW REQUIRED
2. **Checklist Audit**: List each Moderator Revision and state if it was implemented correctly (PASS / FAIL).
3. **Traceability**: Verify no original requirement was lost.

Return ONLY this markdown report.`;

  const validationReport = await callAgent(ai, validationPrompt, 'AI-SRB: Validation Agent', state, (m) => logMsg(folderName, m));

  return {
    validation_result: { text: validationReport },
    logs: [`[AI-SRB Subgraph] Validation Node: Completed validation integrity checks.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        validation: Date.now() - startTime
      }
    }
  };
}

// Node 9: CEO Approval Node (with file writes & memory records)
async function ceoApprovalNode(state) {
  const folderName = state.activeSpec;
  const spec = state.specification;
  const context = JSON.parse(state.project_context || '{}');
  const orgMemoryText = state.organizational_memory;
  const reviewerOutputs = state.agent_reviews || state.reviewer_outputs || {};
  const debateRounds = state.debate_history || state.debate_rounds || {};
  const moderatorReport = state.moderator_decision;
  const specV2 = state.revised_specification;
  const validationReport = state.validation_result.text;
  const activeReviewerKeys = Object.keys(reviewerOutputs);
  const ai = getGenAI();
  const startTime = Date.now();

  logMsg(folderName, 'AI-SRB: Running CEO Approval Agent final checkpoint...');

  const ceoPrompt = `You are the CEO Approval Agent of the enterprise. Your task is to review the validation report and the updated specification to make a final business-level signoff decision.

REVISED SPECIFICATION (spec_v2.md) SUMMARY (First 2000 chars):
"""
${specV2.substring(0, 2000)}
"""

VALIDATION AGENT REPORT:
"""
${validationReport}
"""

Please compile a CEO Approval Report with:
1. **Decision**: APPROVE, REVISE, or REJECT
2. **Business Impact & Alignment**: Analysis of how this matches organizational goals.
3. **Risk Profile**: Evaluation of overall delivery/security risks.
4. **Financial Feasibility**: Final assessment of cost implications.

Return ONLY this markdown report.`;

  const ceoReport = await callAgent(ai, ceoPrompt, 'AI-SRB: CEO', state, (m) => logMsg(folderName, m));
  
  const finalDecision = ceoReport.includes('APPROVE') ? 'APPROVED' : (ceoReport.includes('REJECT') ? 'REJECTED' : 'REVISIONS REQUIRED');
  const isApproved = finalDecision === 'APPROVED';

  // Compute Spec Diff
  logMsg(folderName, 'AI-SRB: Compiling specification diff...');
  const specDiff = generateSimpleDiff(spec, specV2);

  // Build standalone review subfolder and write files
  logMsg(folderName, 'AI-SRB: Generating traceable review audit artifacts...');
  const targetDir = path.resolve(__dirname, '../../../specs', folderName);
  const reviewDir = path.join(targetDir, 'review');
  if (!fs.existsSync(reviewDir)) {
    fs.mkdirSync(reviewDir, { recursive: true });
  }

  // 1. debate_transcript.md
  let debateTranscriptMD = `# AI-SRB Debate Transcript\n**Workspace:** ${folderName}\n**Timestamp:** ${new Date().toISOString()}\n\n`;
  const reviewerMeta = {
    architect: { name: 'Architect', role: 'Senior Principal Software Architect' },
    security: { name: 'Security', role: 'Lead Security Architect' },
    performance: { name: 'Performance', role: 'Principal Performance Engineer' },
    cost: { name: 'Cost', role: 'Cloud FinOps/Cost Optimizer' },
    product_owner: { name: 'Product Owner', role: 'Principal Product Owner' },
    devil_advocate: { name: "Devil's Advocate", role: "Devil's Advocate" },
    data_architect: { name: 'Data Architect', role: 'Principal Data Architect' },
    devops: { name: 'DevOps', role: 'Lead DevOps Engineer' },
    compliance: { name: 'Compliance', role: 'Lead Compliance and Legal Auditor' }
  };

  for (const key of activeReviewerKeys) {
    const meta = reviewerMeta[key];
    const origText = reviewerOutputs[key]?.text || '';
    const debateText = debateRounds[key] || '';
    debateTranscriptMD += `## ${meta.name} - Independent Review\n${origText}\n\n`;
    debateTranscriptMD += `## ${meta.name} - Debate Contribution\n${debateText}\n\n---\n\n`;
  }
  fs.writeFileSync(path.join(reviewDir, 'debate_transcript.md'), debateTranscriptMD, 'utf8');

  // 2. conflict_matrix.md
  logMsg(folderName, 'Extracting conflict matrix...');
  const conflictMatrixPrompt = `Extract the Conflict Resolution Matrix from the Moderator report and write a clean standalone conflict_matrix.md document containing ONLY the markdown table.

MODERATOR REPORT:
"""
${moderatorReport}
"""

Return only the markdown table.`;
  const conflictMatrixMD = await callAgent(ai, conflictMatrixPrompt, 'AI-SRB: Conflict Matrix Compiler', state, (m) => logMsg(folderName, m));
  fs.writeFileSync(path.join(reviewDir, 'conflict_matrix.md'), `# Conflict Resolution Matrix\n\n${conflictMatrixMD}`, 'utf8');

  // 3. decision_log.md
  logMsg(folderName, 'Extracting decision log...');
  const decisionLogPrompt = `Extract the final decisions made from this moderator report and CEO approval. Produce a clean standalone decision_log.md document.

MODERATOR REPORT:
"""
${moderatorReport}
"""

CEO APPROVAL:
"""
${ceoReport}
"""

For each decision, format as:
### Decision: [Decision Title]
- **Reason**: [Detailed explanation]
- **Approved By**: [Agents who signed off]
- **Confidence**: [Score]

Return only the markdown document.`;
  const decisionLogMD = await callAgent(ai, decisionLogPrompt, 'AI-SRB: Decision Log Compiler', state, (m) => logMsg(folderName, m));
  
  // Append opinion changes to decision log if present
  let finalDecisionLog = `# Decision Log\n\n${decisionLogMD}`;
  if (state.opinion_changes && state.opinion_changes.length > 0) {
    finalDecisionLog += `\n\n## Tracked Agent Opinion Changes\n\n| Agent | Initial Position | Revised Position | Reason |\n| --- | --- | --- | --- |\n`;
    for (const change of state.opinion_changes) {
      finalDecisionLog += `| ${change.agent} | ${change.initial_position} | ${change.revised_position} | ${change.reason} |\n`;
    }
  }
  fs.writeFileSync(path.join(reviewDir, 'decision_log.md'), finalDecisionLog, 'utf8');

  // 4. spec_diff.md
  fs.writeFileSync(path.join(reviewDir, 'spec_diff.md'), `# Specification Changes Diff\n\n${specDiff}`, 'utf8');

  // 5. approval_report.md
  const approvalReportMD = `# Executive Approval Report\n\n**Sign-off Status:** ${finalDecision}\n\n${ceoReport}\n\n## Validation Summary\n${validationReport}`;
  fs.writeFileSync(path.join(reviewDir, 'approval_report.md'), approvalReportMD, 'utf8');

  // 6. spec_v2.md
  fs.writeFileSync(path.join(reviewDir, 'spec_v2.md'), specV2, 'utf8');

  // Primary spec_v2.md
  fs.writeFileSync(path.join(targetDir, 'spec_v2.md'), specV2, 'utf8');

  const totalTime = Date.now() - (state.metrics?.startTime || Date.now());
  const tokenMetrics = state.metrics?.tokens || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  // Compile master review trail report
  let reviewTrail = `# AI Specification Review Board (AI-SRB) - Audit Trail
**Workspace Spec:** ${folderName}
**Session ID:** ${state.session_id}
**Timestamp:** ${new Date().toISOString()}

---

## 1. Executive Sign-off Decision: ${finalDecision}

### 1.1 CEO Approval Report
${ceoReport}

---

## 2. Validation Agent Audit Report
${validationReport}

---

## 3. Moderator Synthesis & Required Revisions
${moderatorReport}

---

## 4. Conflict Resolution Matrix
${conflictMatrixMD}

---

## 5. Tracked Agent Opinion Changes
`;

  if (state.opinion_changes && state.opinion_changes.length > 0) {
    for (const change of state.opinion_changes) {
      reviewTrail += `### ${change.agent}\n- **Initial Position:** ${change.initial_position}\n- **Revised Position:** ${change.revised_position}\n- **Reason:** ${change.reason}\n\n`;
    }
  } else {
    reviewTrail += `No agent revised their position during this debate session.\n\n`;
  }

  reviewTrail += `
---

## 6. Execution Metrics & Observability
- **Rounds of Debate:** ${Object.keys(debateRounds).length > 0 ? 2 : 1}
- **Conflicts Resolved:** ${state.conflicts?.length || 0}
- **Opinion Revisions:** ${state.opinion_changes?.length || 0}
- **Estimated Token Consumption:** ${tokenMetrics.totalTokens} (Prompt: ${tokenMetrics.promptTokens}, Completion: ${tokenMetrics.completionTokens})
- **Total Session Execution Duration:** ${(totalTime / 1000).toFixed(2)}s

### Node Latencies:
- **Spec Intake / Initialization:** ${((state.metrics?.nodeLatencies?.specIntake || 0) / 1000).toFixed(2)}s
- **Context Enrichment:** ${((state.metrics?.nodeLatencies?.contextEnrichment || 0) / 1000).toFixed(2)}s
- **Memory Retrieval:** ${((state.metrics?.nodeLatencies?.memoryRetrieval || 0) / 1000).toFixed(2)}s
- **Reviewer Agents Panel:** ${((state.metrics?.nodeLatencies?.parallelReviewer || 0) / 1000).toFixed(2)}s
- **Debate Rebuttals Controller:** ${((state.metrics?.nodeLatencies?.debateController || 0) / 1000).toFixed(2)}s
- **Debate Moderator Consensus:** ${((state.metrics?.nodeLatencies?.moderator || 0) / 1000).toFixed(2)}s
- **Specification Editor:** ${((state.metrics?.nodeLatencies?.specEditor || 0) / 1000).toFixed(2)}s
- **Validation Agent Audit:** ${((state.metrics?.nodeLatencies?.validation || 0) / 1000).toFixed(2)}s
- **CEO Approval Gating:** ${((Date.now() - startTime) / 1000).toFixed(2)}s

---

## 7. Standalone Review Log Links
- [Debate Transcript](file://${path.join(reviewDir, 'debate_transcript.md')})
- [Conflict Matrix](file://${path.join(reviewDir, 'conflict_matrix.md')})
- [Decision Log](file://${path.join(reviewDir, 'decision_log.md')})
- [Specification Changes Diff](file://${path.join(reviewDir, 'spec_diff.md')})
- [Executive Approval Report](file://${path.join(reviewDir, 'approval_report.md')})
- [Refined Specification (v2)](file://${path.join(reviewDir, 'spec_v2.md')})

---

## 8. Debate Round Discussion
${debateTranscriptMD.substring(debateTranscriptMD.indexOf('##'))}
`;

  fs.writeFileSync(path.join(targetDir, 'validation_report.md'), reviewTrail, 'utf8');
  
  // Calculate final latencies metrics map
  const updatedLatencies = {
    ...state.metrics?.nodeLatencies,
    ceoApproval: Date.now() - startTime
  };

  const humanApprovalRequired = state.human_approval_required !== false;
  const initialApprovedState = humanApprovalRequired ? false : isApproved;

  fs.writeFileSync(
    path.join(targetDir, 'validation_status.json'),
    JSON.stringify({ 
      approved: initialApprovedState, 
      report: reviewTrail,
      session_id: state.session_id,
      opinion_changes: state.opinion_changes,
      human_approval_status: humanApprovalRequired ? 'PENDING' : 'APPROVED',
      metrics: {
        ...state.metrics,
        nodeLatencies: updatedLatencies,
        totalTime,
        tokenMetrics
      }
    }, null, 2),
    'utf8'
  );

  // Save approved decisions to memory
  if (isApproved) {
    logMsg(folderName, 'Recording approved decisions into dynamic decision memory storage...');
    try {
      const decisionMemoryPrompt = `Analyze the decision log and extract the decisions into a JSON list of objects matching the schema:
[
  {
    "project": "${folderName}",
    "decision": "string (the decision title)",
    "alternatives_rejected": ["string"],
    "reason": "string (the primary business/engineering reason)",
    "risks": ["string"],
    "outcome": "Approved"
  }
]

Decision Log content to analyze:
${decisionLogMD}

Return ONLY a valid JSON block. Do not add any introductory or formatting code outside the JSON array.`;
      
      const jsonText = await callAgent(ai, decisionMemoryPrompt, 'AI-SRB: Decision Storage Extractor', state, (m) => logMsg(folderName, m));
      
      let cleanedJson = jsonText.trim();
      if (cleanedJson.includes('```json')) {
        cleanedJson = cleanedJson.split('```json')[1].split('```')[0].trim();
      } else if (cleanedJson.includes('```')) {
        cleanedJson = cleanedJson.split('```')[1].split('```')[0].trim();
      }
      const startBracket = cleanedJson.indexOf('[');
      const endBracket = cleanedJson.lastIndexOf(']');
      if (startBracket !== -1 && endBracket !== -1 && endBracket > startBracket) {
        cleanedJson = cleanedJson.substring(startBracket, endBracket + 1);
      }

      const newDecisions = JSON.parse(cleanedJson);
      const decPath = path.resolve(__dirname, '../storage/decision_memory.json');
      let currentDecisions = [];
      if (fs.existsSync(decPath)) {
        currentDecisions = JSON.parse(fs.readFileSync(decPath, 'utf8'));
      }
      currentDecisions.push(...newDecisions);
      fs.writeFileSync(decPath, JSON.stringify(currentDecisions, null, 2), 'utf8');
      logMsg(folderName, `Successfully recorded ${newDecisions.length} new decisions into decision_memory.json.`);
    } catch (err) {
      console.error('Failed to write decision memory records in subgraph:', err.message);
    }
  }

  logMsg(folderName, 'AI Specification Review Board pipeline finished successfully!');

  return {
    approval_result: { decision: finalDecision, report: ceoReport },
    logs: [`[AI-SRB Subgraph] CEO Approval Node: sign-off resolved as ${finalDecision}.`],
    metrics: {
      ...state.metrics,
      nodeLatencies: updatedLatencies,
      totalTime
    }
  };
}

// Build and compile the Subgraph workflow
const checkpointer = new MemorySaver();

// Node 10: Human Architecture Approval Gate Node
async function humanApprovalNode(state) {
  const folderName = state.activeSpec;
  const startTime = Date.now();

  logMsg(folderName, 'Human Approval Node: Assessing governance validation checkpoints...');

  const required = state.human_approval_required !== false;
  if (!required) {
    logMsg(folderName, 'Human approval bypassed via configuration policy.');
    return {
      human_approval_status: 'APPROVED',
      human_approval_details: {
        approved_by: 'System Policy Config',
        decision: 'APPROVED',
        comments: 'Bypassed human approval configuration.',
        timestamp: new Date().toISOString()
      },
      metrics: {
        ...state.metrics,
        nodeLatencies: {
          ...state.metrics?.nodeLatencies,
          humanApproval: Date.now() - startTime
        }
      }
    };
  }

  const status = state.human_approval_status || 'PENDING';
  const details = state.human_approval_details || {};

  logMsg(folderName, `AI-SRB Decision Status: ${status === 'PENDING' ? 'WAITING FOR HUMAN APPROVAL' : status}`);

  // Create human approval report if decision is recorded
  if (status !== 'PENDING') {
    const targetDir = path.resolve(__dirname, '../../../specs', folderName);
    const reviewDir = path.join(targetDir, 'review');
    if (!fs.existsSync(reviewDir)) {
      fs.mkdirSync(reviewDir, { recursive: true });
    }

    const humanReportMD = `# Human Architecture Approval Gate Report

**Linked Debate Session ID:** ${state.session_id}
**Timestamp:** ${details.timestamp || new Date().toISOString()}
**Approver:** ${details.approved_by || 'System Administrator'}
**Decision:** ${details.decision || status}

## Human Approver Comments
${details.comments || 'No comments provided.'}

## Previous AI Recommendation & Context
- **AI CEO Recommendation:** ${state.approval_result?.decision || 'APPROVED'}
- **Validation Agent Checklist:** See validation_report.md
- **Rounds of Debate Completed:** 2
- **Tracked Risks:** ${state.conflicts?.length || 0}
`;
    fs.writeFileSync(path.join(reviewDir, 'human_approval_report.md'), humanReportMD, 'utf8');
    
    // Update validation_status.json
    const statusPath = path.join(targetDir, 'validation_status.json');
    if (fs.existsSync(statusPath)) {
      try {
        const cur = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        cur.human_approval_status = status;
        cur.human_approval_details = details;
        if (status === 'APPROVED') {
          cur.approved = true; // Finally approved!
        } else {
          cur.approved = false;
        }
        fs.writeFileSync(statusPath, JSON.stringify(cur, null, 2), 'utf8');
      } catch (e) {
        // ignore
      }
    }
  } else {
    // If pending, mark status accordingly on disk for UI short polling
    const targetDir = path.resolve(__dirname, '../../../specs', folderName);
    const statusPath = path.join(targetDir, 'validation_status.json');
    if (fs.existsSync(statusPath)) {
      try {
        const cur = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        cur.human_approval_status = 'PENDING';
        cur.approved = false;
        fs.writeFileSync(statusPath, JSON.stringify(cur, null, 2), 'utf8');
      } catch (e) {
        // ignore
      }
    }
  }

  return {
    human_approval_status: status,
    human_approval_details: details,
    metrics: {
      ...state.metrics,
      nodeLatencies: {
        ...state.metrics?.nodeLatencies,
        humanApproval: Date.now() - startTime
      }
    }
  };
}

// Router function for Human Approval conditional edge
function routeHumanApproval(state) {
  const status = state.human_approval_status;
  if (status === 'APPROVED') return 'end';
  if (status === 'CHANGES_REQUESTED') return 'debateController';
  return 'end'; // for REJECTED, ESCALATED, or others, terminate execution
}

const aisrbWorkflow = new StateGraph(DebateStateAnnotation)
  .addNode('specIntake', specIntakeNode)
  .addNode('contextEnrichment', contextEnrichmentNode)
  .addNode('memoryRetrieval', memoryRetrievalNode)
  .addNode('parallelReviewer', parallelReviewerNode)
  .addNode('debateController', debateControllerNode)
  .addNode('moderator', moderatorNode)
  .addNode('specEditor', specEditorNode)
  .addNode('validation', validationNode)
  .addNode('ceoApproval', ceoApprovalNode)
  .addNode('humanApproval', humanApprovalNode)
  
  .addEdge(START, 'specIntake')
  .addEdge('specIntake', 'contextEnrichment')
  .addEdge('contextEnrichment', 'memoryRetrieval')
  .addEdge('memoryRetrieval', 'parallelReviewer')
  .addEdge('parallelReviewer', 'debateController')
  .addEdge('debateController', 'moderator')
  .addEdge('moderator', 'specEditor')
  .addEdge('specEditor', 'validation')
  .addEdge('validation', 'ceoApproval')
  .addEdge('ceoApproval', 'humanApproval')
  .addConditionalEdges('humanApproval', routeHumanApproval, {
    end: END,
    debateController: 'debateController'
  });

const compiledAisrbGraph = aisrbWorkflow.compile({
  checkpointer,
  interruptBefore: ['humanApproval']
});

module.exports = {
  aisrbGraph: compiledAisrbGraph
};
