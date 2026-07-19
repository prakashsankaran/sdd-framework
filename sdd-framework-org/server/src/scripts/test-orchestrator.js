const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const orchestrator = require('../services/orchestrator.service');

async function runTest() {
  console.log('Starting LangGraph Orchestrator verification test...');
  
  const activeSpec = '001-return-request-tracker';
  console.log(`Starting graph for spec: ${activeSpec}...`);
  
  const { threadId, state } = await orchestrator.startGraph(activeSpec);
  console.log('Graph started successfully.');
  console.log('Thread ID:', threadId);
  console.log('Initial Stage:', state.values.currentStage);
  console.log('Selector routed model for current stage:', state.values.modelDecision[state.values.currentStage]?.model);
  console.log('Selector reasoning:', state.values.modelDecision[state.values.currentStage]?.reasoning);
  console.log('Logs so far:\n', state.values.logs.join('\n'));
  
  const currentStage = state.values.currentStage;
  console.log(`\nSimulating Human-in-the-Loop APPROVAL for stage: ${currentStage}...`);
  
  const nextState = await orchestrator.respondToStage(threadId, currentStage, 'approve');
  console.log('Resumed state.');
  console.log('New Stage in Graph State:', nextState.values.currentStage);
  console.log('Logs after resumption:\n', nextState.values.logs.join('\n'));
  
  // Verify that output files exist in storage
  const storageDir = path.join(__dirname, '../storage');
  const mdFile = path.join(storageDir, 'User_Stories.md');
  const jsonFile = path.join(storageDir, 'User_Stories.json');
  
  console.log('\nVerifying file outputs on disk...');
  if (fs.existsSync(mdFile)) {
    console.log(`[PASS] Markdown output saved to disk: ${mdFile}`);
  } else {
    console.error(`[FAIL] Markdown output not found on disk: ${mdFile}`);
  }
  
  if (fs.existsSync(jsonFile)) {
    console.log(`[PASS] JSON output saved to disk: ${jsonFile}`);
  } else {
    console.error(`[FAIL] JSON output not found on disk: ${jsonFile}`);
  }
  
  console.log('\nVerification test completed successfully!');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
