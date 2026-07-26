const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const tokenTracker = require('./tokenTracker.service');
const { getModelsConfig } = require('../config/modelsHelper');

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Wait helper for backoff
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates content using the configured active LLM, with exponential backoff retries and fallback models
 */
async function generateWithRetryAndFallback(ai, prompt, agentName, logCallback = () => {}) {
  const modelsConfig = getModelsConfig();
  const primaryModel = modelsConfig.active_llm || 'gemini-3.5-flash';
  
  const fallbackModels = [
    primaryModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.1-flash-lite'
  ].filter((value, index, self) => self.indexOf(value) === index); // unique values

  let lastError = null;

  for (const modelName of fallbackModels) {
    let attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const modelInstance = ai.getGenerativeModel({ model: modelName });
        const result = await modelInstance.generateContent(prompt);
        const responseText = result.response.text();
        const usage = result.response.usageMetadata || {};

        tokenTracker.recordUsage({
          model: modelName,
          agentName: agentName,
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
          promptText: prompt,
          responseText: responseText
        });

        if (modelName !== primaryModel) {
          logCallback(`[Resilience] Handled request for "${agentName}" using fallback model "${modelName}".`);
        }

        return responseText;
      } catch (err) {
        lastError = err;
        const status = err.status || (err.message && err.message.includes('503') ? 503 : null);
        const isRateLimitOrDemand = status === 503 || status === 429 || err.message.includes('high demand') || err.message.includes('Rate limit');

        if (isRateLimitOrDemand && attempt < attempts) {
          const backoffTime = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 1000);
          logCallback(`[Resilience] Model "${modelName}" failed for "${agentName}" (${err.message || '503/429'}). Retrying in ${backoffTime}ms (Attempt ${attempt}/${attempts})...`);
          await delay(backoffTime);
        } else {
          break;
        }
      }
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
}

/**
 * Dynamically selects reviewer agents based on specification context
 */
function selectReviewers(requirementsText, specText) {
  const text = (requirementsText + '\n' + specText).toLowerCase();
  
  // Base mandatory reviewers
  const selected = new Set(['architect', 'product_owner', 'devil_advocate']);
  
  // Security triggers
  if (text.includes('auth') || text.includes('login') || text.includes('security') || text.includes('token') || text.includes('encrypt') || text.includes('password') || text.includes('roles') || text.includes('permission') || text.includes('jwt') || text.includes('credentials') || text.includes('api key')) {
    selected.add('security');
  }
  // Performance triggers
  if (text.includes('scale') || text.includes('speed') || text.includes('performance') || text.includes('concurrent') || text.includes('latency') || text.includes('cache') || text.includes('slow') || text.includes('redis') || text.includes('bottleneck') || text.includes('load')) {
    selected.add('performance');
  }
  // Cost triggers
  if (text.includes('cost') || text.includes('finops') || text.includes('price') || text.includes('budget') || text.includes('spend') || text.includes('aws') || text.includes('azure') || text.includes('cloud') || text.includes('licensing')) {
    selected.add('cost');
  }
  // Data Architect triggers
  if (text.includes('database') || text.includes('sql') || text.includes('schema') || text.includes('migration') || text.includes('tables') || text.includes('postgres') || text.includes('model') || text.includes('query') || text.includes('entity') || text.includes('ddl')) {
    selected.add('data_architect');
  }
  // DevOps triggers
  if (text.includes('deploy') || text.includes('kubernetes') || text.includes('docker') || text.includes('ci/cd') || text.includes('pipeline') || text.includes('monitoring') || text.includes('infrastructure') || text.includes('keda') || text.includes('celery') || text.includes('redis streams')) {
    selected.add('devops');
  }
  // Compliance triggers
  if (text.includes('comply') || text.includes('compliance') || text.includes('audit') || text.includes('gdpr') || text.includes('hipaa') || text.includes('pci') || text.includes('legal') || text.includes('consent') || text.includes('privacy') || text.includes('redact')) {
    selected.add('compliance');
  }

  return Array.from(selected);
}

/**
 * Lightweight unified diff generator showing added/deleted lines
 */
function generateSimpleDiff(text1, text2) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  let i = 0, j = 0;
  let diff = '```diff\n';
  
  while (i < lines1.length || j < lines2.length) {
    if (i < lines1.length && j < lines2.length) {
      if (lines1[i] === lines2[j]) {
        i++;
        j++;
      } else {
        // Simple search heuristic
        let foundIndex = -1;
        for (let k = j; k < Math.min(j + 10, lines2.length); k++) {
          if (lines2[k] === lines1[i]) {
            foundIndex = k;
            break;
          }
        }
        if (foundIndex !== -1) {
          for (let k = j; k < foundIndex; k++) {
            diff += `+ ${lines2[k]}\n`;
          }
          j = foundIndex;
        } else {
          let foundIndexOrig = -1;
          for (let k = i; k < Math.min(i + 10, lines1.length); k++) {
            if (lines1[k] === lines2[j]) {
              foundIndexOrig = k;
              break;
            }
          }
          if (foundIndexOrig !== -1) {
            for (let k = i; k < foundIndexOrig; k++) {
              diff += `- ${lines1[k]}\n`;
            }
            i = foundIndexOrig;
          } else {
            diff += `- ${lines1[i]}\n`;
            diff += `+ ${lines2[j]}\n`;
            i++;
            j++;
          }
        }
      }
    } else if (i < lines1.length) {
      diff += `- ${lines1[i]}\n`;
      i++;
    } else if (j < lines2.length) {
      diff += `+ ${lines2[j]}\n`;
      j++;
    }
  }
  diff += '```';
  return diff;
}

/**
 * Executes the Upgraded Multi-Agent Specification Review Board (AI-SRB) Pipeline.
 */
async function runAISRB(folderName, logCallback = () => {}) {
  const { aisrbGraph } = require('./aisrbGraph.service');

  const sessionId = 'session-' + Date.now();
  const initialState = {
    session_id: sessionId,
    activeSpec: folderName,
    logs: [`[System] Initializing AI-SRB Debate Engine subgraph...`]
  };

  const config = { configurable: { thread_id: sessionId } };

  logCallback('Invoking AI-SRB Debate Engine LangGraph subgraph...');
  const finalState = await aisrbGraph.invoke(initialState, config);

  const isApproved = finalState.approval_result?.decision === 'APPROVED';

  // Read generated validation trail report from validation_report.md
  const specsDir = path.resolve(__dirname, '../../../specs');
  const targetDir = path.join(specsDir, folderName);
  const reportPath = path.join(targetDir, 'validation_report.md');
  const reviewTrail = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : '';
  const specV2 = finalState.revised_specification || '';

  return {
    success: true,
    approved: isApproved,
    report: reviewTrail,
    specV2
  };
}

module.exports = {
  runAISRB,
  getGenAI,
  generateWithRetryAndFallback,
  selectReviewers,
  generateSimpleDiff
};
