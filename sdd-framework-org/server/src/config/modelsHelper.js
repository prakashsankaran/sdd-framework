const fs = require('fs');
const path = require('path');

/**
 * Loads models.json dynamically from disk.
 * Allows changes to the file to take effect instantly without restarting the server.
 */
function getModelsConfig() {
  const modelsConfigPath = path.resolve(__dirname, 'models.json');
  let config = {
    active_llm: "gemini-3.5-flash",
    active_slm: "gemini-3.1-flash-lite",
    models: [
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "google", type: "LLM", apiKeyEnv: "GEMINI_API_KEY" },
      { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", provider: "google", type: "SLM", apiKeyEnv: "GEMINI_API_KEY" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", type: "LLM", apiKeyEnv: "GEMINI_API_KEY" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", type: "SLM", apiKeyEnv: "GEMINI_API_KEY" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", type: "SLM", apiKeyEnv: "GEMINI_API_KEY" },
      { id: "gpt-4o", name: "GPT-4o", provider: "openai", type: "LLM", apiKeyEnv: "OPENAI_API_KEY" },
      { id: "gpt-4o-mini", name: "GPT-4o-Mini", provider: "openai", type: "SLM", apiKeyEnv: "OPENAI_API_KEY" },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", type: "LLM", apiKeyEnv: "ANTHROPIC_API_KEY" }
    ]
  };

  if (fs.existsSync(modelsConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(modelsConfigPath, 'utf8'));
    } catch (err) {
      console.error('[ModelsHelper] Failed to load models.json, using defaults:', err.message);
    }
  }

  // Override active models from env if specified
  if (process.env.ACTIVE_LLM) {
    config.active_llm = process.env.ACTIVE_LLM;
  }
  if (process.env.ACTIVE_SLM) {
    config.active_slm = process.env.ACTIVE_SLM;
  }

  return config;
}

module.exports = {
  getModelsConfig
};
