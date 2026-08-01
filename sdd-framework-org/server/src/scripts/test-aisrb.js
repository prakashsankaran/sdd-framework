const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { runAISRB } = require('../services/aisrb.service');

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

  // Sort folders to pick the first one, or pick a default if known
  folders.sort();
  const folderToTest = folders[0];
  console.log(`Found spec folders: ${folders.join(', ')}`);
  console.log(`Starting AI-SRB test on folder: ${folderToTest}\n`);

  try {
    const result = await runAISRB(folderToTest, (msg) => {
      console.log(`[LOG] ${msg}`);
    });

    console.log('\n==================================================');
    console.log('AI-SRB execution completed successfully!');
    console.log(`Status: ${result.approved ? 'PASSED' : 'REVIEW REQUIRED'}`);
    console.log(`Spec V2 Size: ${result.specV2.length} characters`);
    console.log(`Report Trail Size: ${result.report.length} characters`);
    console.log('==================================================\n');

    // Verify files exist on disk
    const targetDir = path.join(specsDir, folderToTest);
    const hasSpecV2 = fs.existsSync(path.join(targetDir, 'spec_v2.md'));
    const hasReviewTrail = fs.existsSync(path.join(targetDir, 'review_trail.md'));
    const hasValidationReport = fs.existsSync(path.join(targetDir, 'validation_report.md'));
    const hasValidationStatus = fs.existsSync(path.join(targetDir, 'validation_status.json'));

    // Part 3 Review Subfolder Artifacts
    const reviewDir = path.join(targetDir, 'review');
    const hasTranscript = fs.existsSync(path.join(reviewDir, 'debate_transcript.md'));
    const hasMatrix = fs.existsSync(path.join(reviewDir, 'conflict_matrix.md'));
    const hasDecisionsLog = fs.existsSync(path.join(reviewDir, 'decision_log.md'));
    const hasDiff = fs.existsSync(path.join(reviewDir, 'spec_diff.md'));
    const hasApprovalReport = fs.existsSync(path.join(reviewDir, 'approval_report.md'));
    const hasSpecV2InReview = fs.existsSync(path.join(reviewDir, 'spec_v2.md'));

    // Check decision memory storage
    const decPath = path.resolve(__dirname, '../storage/decision_memory.json');
    let hasDecisionsStored = false;
    if (fs.existsSync(decPath)) {
      const decs = JSON.parse(fs.readFileSync(decPath, 'utf8'));
      hasDecisionsStored = decs.length > 0;
    }

    console.log('File verification checks:');
    console.log(`- spec_v2.md created: ${hasSpecV2}`);
    console.log(`- review_trail.md created: ${hasReviewTrail}`);
    console.log(`- validation_report.md created: ${hasValidationReport}`);
    console.log(`- validation_status.json created: ${hasValidationStatus}`);
    console.log(`- review/debate_transcript.md created: ${hasTranscript}`);
    console.log(`- review/conflict_matrix.md created: ${hasMatrix}`);
    console.log(`- review/decision_log.md created: ${hasDecisionsLog}`);
    console.log(`- review/spec_diff.md created: ${hasDiff}`);
    console.log(`- review/approval_report.md created: ${hasApprovalReport}`);
    console.log(`- review/spec_v2.md created: ${hasSpecV2InReview}`);
    console.log(`- decision_memory.json updated with records: ${hasDecisionsStored}`);

    const allPassed = hasSpecV2 && hasReviewTrail && hasValidationReport && hasValidationStatus &&
                      hasTranscript && hasMatrix && hasDecisionsLog && hasDiff &&
                      hasApprovalReport && hasSpecV2InReview;

    if (allPassed) {
      console.log('\nAll Part 3 traceable artifacts and sign-offs verified! Test PASSED.');
    } else {
      console.error('\nSome traceable files were not found on disk. Test FAILED.');
      process.exit(1);
    }
  } catch (err) {
    console.error('\nTest failed with error:', err);
    process.exit(1);
  }
}

test();
