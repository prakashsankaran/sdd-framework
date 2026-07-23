const fs = require('fs');
const path = require('path');

const storageDir = path.join(__dirname, '../storage');
const historyFilePath = path.join(storageDir, 'token_history.json');

// Ensure storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Ensure token_history.json exists
if (!fs.existsSync(historyFilePath)) {
  fs.writeFileSync(historyFilePath, JSON.stringify([], null, 2), 'utf8');
}

/**
 * Reads token history from disk.
 */
function readHistory() {
  try {
    const data = fs.readFileSync(historyFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('[TokenTracker] Failed to read token_history.json:', err.message);
    return [];
  }
}

/**
 * Writes token history to disk.
 */
function writeHistory(history) {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('[TokenTracker] Failed to write token_history.json:', err.message);
  }
}

/**
 * Fallback token estimator if usageMetadata is absent.
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Records a token consumption entry.
 */
function recordUsage({
  model = 'unknown-model',
  agentName = 'General Agent',
  promptTokens = 0,
  completionTokens = 0,
  totalTokens = 0,
  promptText = '',
  responseText = ''
}) {
  const history = readHistory();

  // If tokens are not provided, estimate from text length
  const finalPromptTokens = promptTokens || estimateTokens(promptText);
  const finalCompletionTokens = completionTokens || estimateTokens(responseText);
  const finalTotalTokens = totalTokens || (finalPromptTokens + finalCompletionTokens);

  const entry = {
    id: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    model: model || 'gemini-3.5-flash',
    agentName: agentName || 'System Agent',
    promptTokens: finalPromptTokens,
    completionTokens: finalCompletionTokens,
    totalTokens: finalTotalTokens
  };

  history.unshift(entry); // Newest first

  // Cap history at 1000 entries to prevent uncontrolled growth
  if (history.length > 1000) {
    history.length = 1000;
  }

  writeHistory(history);
  return entry;
}

/**
 * Gets aggregated model-level token usage summary and totals.
 */
function getSummary() {
  const history = readHistory();
  const byModel = {};
  let grandTotalTokens = 0;
  let grandTotalPromptTokens = 0;
  let grandTotalCompletionTokens = 0;

  history.forEach(entry => {
    const modelKey = entry.model || 'unknown';
    if (!byModel[modelKey]) {
      byModel[modelKey] = {
        model: modelKey,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        callCount: 0
      };
    }

    byModel[modelKey].totalTokens += entry.totalTokens || 0;
    byModel[modelKey].promptTokens += entry.promptTokens || 0;
    byModel[modelKey].completionTokens += entry.completionTokens || 0;
    byModel[modelKey].callCount += 1;

    grandTotalTokens += entry.totalTokens || 0;
    grandTotalPromptTokens += entry.promptTokens || 0;
    grandTotalCompletionTokens += entry.completionTokens || 0;
  });

  return {
    byModel: Object.values(byModel),
    grandTotalTokens,
    grandTotalPromptTokens,
    grandTotalCompletionTokens,
    totalCalls: history.length
  };
}

/**
 * Gets full history with optional filtering.
 */
function getHistory(filterModel = '') {
  const history = readHistory();
  if (!filterModel) return history;
  return history.filter(item => item.model.toLowerCase() === filterModel.toLowerCase());
}

/**
 * Clears token usage history.
 */
function clearHistory() {
  writeHistory([]);
  return { success: true, message: 'Token history cleared' };
}

module.exports = {
  recordUsage,
  getSummary,
  getHistory,
  clearHistory,
  estimateTokens
};
