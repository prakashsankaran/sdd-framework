const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { aisrbGraph } = require('../services/aisrbGraph.service');

async function test() {
  const specsDir = path.resolve(__dirname, '../../../specs');
  if (!fs.existsSync(specsDir)) {
    console.error(`Specs directory not found at: ${specsDir}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(specsDir).filter(f => {
    return fs.statSync(path.join(specsDir, f)).isDirectory() && !f.startsWith('.');
  });

  if (folders.length === 0) {
    console.error('No spec folders found in specs/ to test with.');
    process.exit(1);
  }

  folders.sort();
  const folderToTest = folders[0];
  console.log(`Found spec folders: ${folders.join(', ')}`);
  console.log(`Starting AI-SRB LangGraph Subgraph test on folder: ${folderToTest}\n`);

  try {
    const threadId = `test-session-${Date.now()}`;
    const subgraphInitialState = {
      session_id: threadId,
      activeSpec: folderToTest,
      logs: [`[Test] Initializing test run for ${folderToTest}...`]
    };

    const config = { configurable: { thread_id: threadId } };
    
    console.log('[Test] Phase 1: Invoking LangGraph subgraph (will pause at human approval gate)...');
    const result1 = await aisrbGraph.invoke(subgraphInitialState, config);

    console.log('\n==================================================');
    console.log('AI-SRB Phase 1 execution completed (interrupted at human gate).');
    console.log(`Human Approval Status (Expected PENDING): ${result1.human_approval_status}`);
    console.log(`CEO Approval Result: ${JSON.stringify(result1.approval_result)}`);
    console.log('==================================================\n');

    if (result1.human_approval_status !== 'PENDING') {
      throw new Error(`Expected graph state human_approval_status to be PENDING, got: ${result1.human_approval_status}`);
    }

    // Verify intermediate files exist
    const targetDir = path.join(specsDir, folderToTest);
    const hasSpecV2 = fs.existsSync(path.join(targetDir, 'spec_v2.md'));
    const hasValidationReport = fs.existsSync(path.join(targetDir, 'validation_report.md'));
    const hasValidationStatus = fs.existsSync(path.join(targetDir, 'validation_status.json'));
    console.log(`Intermediate File Checks:\n- spec_v2.md: ${hasSpecV2}\n- validation_report.md: ${hasValidationReport}\n- validation_status.json: ${hasValidationStatus}`);

    console.log('\n[Test] Phase 2: Updating thread checkpoint state with human APPROVED decision...');
    await aisrbGraph.updateState(config, {
      human_approval_status: 'APPROVED',
      human_approval_details: {
        approved_by: 'Test Governance Administrator',
        decision: 'APPROVED',
        comments: 'Test approval: Stack architectures and presigned storage validated successfully.',
        timestamp: new Date().toISOString()
      }
    });

    console.log('[Test] Phase 2: Resuming LangGraph execution...');
    const result2 = await aisrbGraph.invoke(null, config);

    console.log('\n==================================================');
    console.log('AI-SRB LangGraph Subgraph resume completed successfully!');
    console.log(`Final Human Approval Status (Expected APPROVED): ${result2.human_approval_status}`);
    console.log(`Final Human Approval Details: ${JSON.stringify(result2.human_approval_details)}`);
    console.log('==================================================\n');

    if (result2.human_approval_status !== 'APPROVED') {
      throw new Error(`Expected human_approval_status to be APPROVED after resume, got: ${result2.human_approval_status}`);
    }

    // Verify final human gate report exists on disk
    const hasHumanReport = fs.existsSync(path.join(targetDir, 'review', 'human_approval_report.md'));
    console.log(`Final File Verification:\n- review/human_approval_report.md created: ${hasHumanReport}`);

    if (hasHumanReport) {
      console.log('\nAI-SRB LangGraph Human Architecture Approval Gate test PASSED.');
    } else {
      console.error('\nHuman gate report not found on disk. Integration test FAILED.');
      process.exit(1);
    }
  } catch (err) {
    console.error('\nLangGraph Subgraph Human Gate test failed with error:', err);
    process.exit(1);
  }
}

test();
