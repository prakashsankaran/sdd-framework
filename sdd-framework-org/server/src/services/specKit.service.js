const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const SPECS_DIR = path.resolve(__dirname, '../../../specs');
const TEXT_MODEL = 'gemini-3.1-flash-lite';

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Clean requirement inputs and generate sequential folder index name
 */
async function getNextFolderIndex(requirementsText) {
  try {
    if (!fs.existsSync(SPECS_DIR)) {
      fs.mkdirSync(SPECS_DIR, { recursive: true });
    }

    // List existing folders
    const files = fs.readdirSync(SPECS_DIR);
    const specDirs = files.filter(f => fs.statSync(path.join(SPECS_DIR, f)).isDirectory());
    
    // Find next numeric prefix
    let nextNum = 1;
    specDirs.forEach(dir => {
      const parts = dir.split('-');
      const num = parseInt(parts[0], 10);
      if (!isNaN(num) && num >= nextNum) {
        nextNum = num + 1;
      }
    });

    const prefix = String(nextNum).padStart(3, '0');

    // Query Gemini to get a 2-3 word slug for the feature
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: TEXT_MODEL });
    const prompt = `Convert the following requirements description into a short 2-3 word lowercase feature slug, separated by hyphens. Only return the slug, no other text or explanation. E.g., "user authentication" -> "user-auth" or "SSO integration" -> "sso-integration".
Requirements: ${requirementsText.substring(0, 300)}`;

    const result = await model.generateContent(prompt);
    let slug = result.response.text().trim().toLowerCase();
    
    // Sanitize slug
    slug = slug.replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    if (!slug || slug.length < 2) {
      slug = 'generated-feature';
    }

    return `${prefix}-${slug}`;
  } catch (err) {
    console.error('[SpecKit] Failed to generate folder index:', err.message);
    // Safe fallback
    return '002-custom-spec';
  }
}

/**
 * Generate 5 Spec Kit documents from requirements
 */
async function generateSpecKit(requirementsText, logCallback = () => {}) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: TEXT_MODEL });

    // 1. Determine folder name
    logCallback('Analyzing requirements and generating feature slug...');
    const folderName = await getNextFolderIndex(requirementsText);
    const targetDir = path.join(SPECS_DIR, folderName);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    logCallback(`Scaffolding directory created: specs/${folderName}`);

    // 2. Generate Constitution
    logCallback('1/5: Generating Project Constitution (Guiding Principles)...');
    const constPrompt = `Analyze these requirement specifications:
"${requirementsText}"

Generate a Markdown document named "constitution.md" for the project. 
It must outline:
- Core high-level principles (e.g. user-first, secure-by-default, scalable).
- Tech stack guidelines (PostgreSQL relational backend, Node/Express queue/APIs, React/Vite/Tailwind frontend).
- Architectural boundaries and rules.
Keep it structured and clean. Return only the markdown document.`;
    const constRes = await model.generateContent(constPrompt);
    fs.writeFileSync(path.join(targetDir, 'constitution.md'), constRes.response.text(), 'utf8');

    // 3. Generate Specification (spec.md)
    logCallback('2/5: Compiling Feature Specification (spec.md)...');
    const specPrompt = `Analyze these requirement specifications:
"${requirementsText}"

Generate a Markdown document named "spec.md" containing the high-fidelity detailed product specifications.
It must include:
- Executive Summary & Goals.
- User Persona, Actors, and User Flows.
- Functional requirements list (detailed inputs, rules, logic gates, and outputs).
- Proposed API schema contract designs (Endpoint path, HTTP verb, Headers, Request JSON, Response JSON).
- Data model constraints (Database DDL column expectations).
- Compliance & security mandates (Role-based access checks, TLS, encryption).
Return only the markdown document.`;
    const specRes = await model.generateContent(specPrompt);
    fs.writeFileSync(path.join(targetDir, 'spec.md'), specRes.response.text(), 'utf8');

    // 4. Generate Technical Plan (plan.md)
    logCallback('3/5: Compiling Technical Implementation Plan (plan.md)...');
    const planPrompt = `Analyze these requirement specifications:
"${requirementsText}"

Generate a Markdown document named "plan.md" detailing the technical step-by-step implementation plan.
It must include:
- Summary of architecture.
- List of components, directories, and files to modify or newly create.
- Phased implementation schedule.
- Verification plan (automated scripts, test routes, and manual test validation flows).
Return only the markdown document.`;
    const planRes = await model.generateContent(planPrompt);
    fs.writeFileSync(path.join(targetDir, 'plan.md'), planRes.response.text(), 'utf8');

    // 5. Generate Task Checklist (tasks.md)
    logCallback('4/5: Compiling Actionable Task Checklist (tasks.md)...');
    const tasksPrompt = `Analyze these requirement specifications:
"${requirementsText}"

Generate a Markdown document named "tasks.md" outlining an ordered task checklist.
It must include:
- Core task categories (Setup, Backend database, Backend APIs, Frontend components, Frontend pages, Integration & QA).
- Standard checkbox format matching:
  - [ ] Task Title: details...
  - [ ] Sub-task...
Return only the markdown checklist.`;
    const tasksRes = await model.generateContent(tasksPrompt);
    fs.writeFileSync(path.join(targetDir, 'tasks.md'), tasksRes.response.text(), 'utf8');

    // 6. Generate Tech Research (research.md)
    logCallback('5/5: Compiling Technical Research Notes (research.md)...');
    const researchPrompt = `Analyze these requirement specifications:
"${requirementsText}"

Generate a Markdown document named "research.md" summarizing architectural research and technical options.
It must include:
- Summary of stack constraints.
- Evaluation of integration challenges (potential gotchas, edge cases, error state handling).
- Recommendations for scaling, caching, or third-party SDK choices.
Return only the markdown document.`;
    const researchRes = await model.generateContent(researchPrompt);
    fs.writeFileSync(path.join(targetDir, 'research.md'), researchRes.response.text(), 'utf8');

    logCallback('All Spec Kit documents generated successfully!');
    return {
      success: true,
      folderName,
      files: ['constitution.md', 'spec.md', 'plan.md', 'tasks.md', 'research.md']
    };
  } catch (err) {
    console.error('[SpecKit] Scaffolding generation failed:', err.message);
    throw err;
  }
}

module.exports = {
  generateSpecKit
};
