const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../storage/traceability_log.json');

function logGeneration(agentId, filename, format, activeSpec, activeProject = 'sdd-enterprise-dev') {
  try {
    const storageDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, 'utf8');
      if (content.trim()) {
        logs = JSON.parse(content);
      }
    }
    
    logs.push({
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      agentId: agentId || 'Unknown Agent',
      filename: filename || 'Unknown Document',
      format: format || 'unknown',
      activeSpec: activeSpec || 'Global',
      activeProject: activeProject || 'sdd-enterprise-dev'
    });
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
    console.log(`[Traceability] Logged document generation: ${filename} by ${agentId}`);
  } catch (err) {
    console.error('[Traceability] Failed to write log:', err.message);
  }
}

function getLogs(projectFilter) {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, 'utf8');
      if (content.trim()) {
        logs = JSON.parse(content);
      }
    }
    
    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (projectFilter) {
      return logs.filter(log => log.activeProject === projectFilter);
    }
    return logs;
  } catch (err) {
    console.error('[Traceability] Failed to read logs:', err.message);
    return [];
  }
}

module.exports = {
  logGeneration,
  getLogs
};
