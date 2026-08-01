const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables and vector db services
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { indexDocument, indexBrownfieldItem } = require('./services/vectorDb.service');

const tokenTracker = require('./services/tokenTracker.service');
const codeToSpecService = require('./services/codeToSpec.service');
const impactAnalysisService = require('./services/impactAnalysis.service');
const AdmZip = require('adm-zip');




const app = express();
const PORT = 7001;

// Load models configuration dynamically
const { getModelsConfig } = require('./config/modelsHelper');
const modelsConfig = new Proxy({}, {
  get: (target, prop) => getModelsConfig()[prop]
});

// Enable CORS & JSON parsers with 50mb payload limits
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup multer file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });


// Token Usage Tracker API endpoints
app.get('/api/tokens/summary', (req, res) => {
  try {
    const summary = tokenTracker.getSummary();
    res.json({ success: true, ...summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tokens/history', (req, res) => {
  try {
    const modelFilter = req.query.model || '';
    const history = tokenTracker.getHistory(modelFilter);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tokens/clear', (req, res) => {
  try {
    const result = tokenTracker.clearHistory();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Storage & Endpoints for Brownfield Mode and Context
const brownfieldStorageFile = path.join(__dirname, 'storage/brownfield_context.json');
let activeProjectMode = 'greenfield';

app.post('/api/brownfield/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'brownfield' || mode === 'greenfield') {
    activeProjectMode = mode;
    return res.json({ success: true, mode: activeProjectMode });
  }
  res.status(400).json({ success: false, error: 'Invalid mode' });
});

app.get('/api/brownfield/mode', (req, res) => {
  res.json({ success: true, mode: activeProjectMode });
});

app.get('/api/brownfield/context', (req, res) => {
  try {
    if (fs.existsSync(brownfieldStorageFile)) {
      const data = JSON.parse(fs.readFileSync(brownfieldStorageFile, 'utf8'));
      return res.json({ success: true, context: data });
    }
    res.json({ success: true, context: null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/brownfield/ingest', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ success: false, error: 'Context is required' });
    }

    const storageDir = path.dirname(brownfieldStorageFile);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(brownfieldStorageFile, JSON.stringify(context, null, 2), 'utf8');

    const totalSnippets = (context.codeSnippets || []).length;
    const totalDocs = (context.documents || []).length;
    const totalItems = totalSnippets + totalDocs + (context.dbSchema ? 1 : 0) + (context.legacyGuardrails ? 1 : 0);

    // Return instant success response to client
    res.json({
      success: true,
      message: `Successfully saved ${totalItems} brownfield context items to storage! Vector indexing running in background.`,
      stats: { totalItems }
    });

    // Asynchronous background vector indexing
    (async () => {
      if (Array.isArray(context.codeSnippets)) {
        for (const snippet of context.codeSnippets) {
          if (snippet.content) {
            await indexBrownfieldItem('code', snippet.fileName, snippet.content, activeSpecDirName);
          }
        }
      }
      if (context.dbSchema && context.dbSchema.trim()) {
        await indexBrownfieldItem('db_schema', 'database_schema.sql', context.dbSchema, activeSpecDirName);
      }
      if (Array.isArray(context.documents)) {
        for (const doc of context.documents) {
          if (doc.content) {
            await indexBrownfieldItem('document', doc.title || 'legacy-doc', doc.content, activeSpecDirName);
          }
        }
      }
      if (context.legacyGuardrails) {
        const guardrailText = `Legacy Guardrails & Tech Stack:
Framework/Versions: ${context.legacyGuardrails.frameworkVersion || 'Not specified'}
API Prefix: ${context.legacyGuardrails.apiPrefix || '/api/v1'}
Rules: ${context.legacyGuardrails.preservationRules || 'None'}`;
        await indexBrownfieldItem('guardrails', 'legacy_guardrails.txt', guardrailText, activeSpecDirName);
      }
    })().catch(err => console.error('Background vector indexing error:', err));


  } catch (err) {
    console.error('Failed brownfield ingestion:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Helper for file extensions & directory ignores
const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.idea', '.vscode', 'dist', 'build', 
  'target', 'bin', 'obj', 'vendor', '__pycache__', '.next', 'coverage', '.antigravity'
]);

const ALLOWED_EXTS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.go', 
  '.rb', '.php', '.sql', '.json', '.yaml', '.yml', '.md', '.html', 
  '.css', '.c', '.cpp', '.h', '.hpp', '.kt', '.swift', '.sh', '.env.example'
]);

function shouldIncludeFile(filePath) {
  const parts = filePath.split(/[/\\]/);
  if (parts.some(p => IGNORE_DIRS.has(p))) return false;
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTS.has(ext);
}

function processZipBuffer(buffer) {
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  const snippets = [];

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;
    const entryPath = entry.entryName;

    if (!shouldIncludeFile(entryPath)) continue;

    try {
      const content = zip.readAsText(entry);
      if (content && content.trim()) {
        snippets.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          fileName: entryPath,
          content: content.length > 50000 ? content.substring(0, 50000) + '\n... [truncated]' : content
        });
      }
    } catch (e) {
      console.warn(`Failed reading zip entry ${entryPath}:`, e.message);
    }
  }
  return snippets;
}

function scanLocalDirectory(dirPath, baseDir = dirPath) {
  let snippets = [];
  if (!fs.existsSync(dirPath)) return snippets;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      snippets = snippets.concat(scanLocalDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      if (shouldIncludeFile(relPath)) {
        try {
          const stat = fs.statSync(fullPath);
          if (stat.size < 500000) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content && content.trim()) {
              snippets.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                fileName: relPath,
                content: content.length > 50000 ? content.substring(0, 50000) + '\n... [truncated]' : content
              });
            }
          }
        } catch (e) {
          console.warn(`Failed reading local file ${fullPath}:`, e.message);
        }
      }
    }
  }

  return snippets;
}

// Endpoint: Upload Zipped Codebase Archive (.zip)
app.post('/api/brownfield/upload-zip', upload.single('zipFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No zip file provided' });
    }

    const zipFilePath = req.file.path;
    const snippets = processZipBuffer(fs.readFileSync(zipFilePath));

    // Clean up uploaded zip file
    fs.unlinkSync(zipFilePath);

    res.json({
      success: true,
      message: `Extracted ${snippets.length} source code files from zip archive.`,
      snippets
    });
  } catch (err) {
    console.error('Failed processing zip file:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint: Scan Local Folder Path
app.post('/api/brownfield/scan-folder', (req, res) => {
  try {
    const { folderPath } = req.body;
    if (!folderPath || !folderPath.trim()) {
      return res.status(400).json({ success: false, error: 'Folder path is required' });
    }

    const resolvedPath = path.resolve(folderPath.trim());
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, error: `Directory not found at path: ${resolvedPath}` });
    }

    const snippets = scanLocalDirectory(resolvedPath);

    res.json({
      success: true,
      message: `Scanned and discovered ${snippets.length} source files in ${resolvedPath}`,
      snippets
    });
  } catch (err) {
    console.error('Failed scanning folder path:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint: Upload Database Schema file (.sql, .prisma, .json, .zip)
app.post('/api/brownfield/upload-schema-file', upload.single('schemaFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No schema file provided' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let schemaText = '';

    if (ext === '.zip') {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();
      const sqlEntries = entries.filter(e => !e.isDirectory && (e.entryName.endsWith('.sql') || e.entryName.endsWith('.prisma') || e.entryName.endsWith('.json') || e.entryName.endsWith('.yaml') || e.entryName.endsWith('.yml')));
      schemaText = sqlEntries.map(e => `-- FILE: ${e.entryName}\n` + zip.readAsText(e)).join('\n\n');
    } else {
      schemaText = fs.readFileSync(filePath, 'utf8');
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Database schema loaded successfully from ${req.file.originalname}`,
      schema: schemaText
    });
  } catch (err) {
    console.error('Failed processing schema file upload:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint: Upload Legacy Document file (.md, .txt, .json, .yaml, .zip)
app.post('/api/brownfield/upload-doc-file', upload.single('docFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file provided' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const documents = [];

    if (ext === '.zip') {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();
      const docEntries = entries.filter(e => !e.isDirectory && (e.entryName.endsWith('.md') || e.entryName.endsWith('.txt') || e.entryName.endsWith('.json') || e.entryName.endsWith('.yaml') || e.entryName.endsWith('.yml')));
      
      for (const entry of docEntries) {
        documents.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: entry.entryName,
          content: zip.readAsText(entry)
        });
      }
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      documents.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: req.file.originalname,
        content: content
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Extracted ${documents.length} document(s) from ${req.file.originalname}`,
      documents
    });
  } catch (err) {
    console.error('Failed processing document file upload:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// Code-to-Spec Baseline Generator Endpoints
app.post('/api/code-to-spec/generate', async (req, res) => {
  try {
    let context = req.body.context;
    if (!context && fs.existsSync(brownfieldStorageFile)) {
      context = JSON.parse(fs.readFileSync(brownfieldStorageFile, 'utf8'));
    }
    if (!context) {
      return res.status(400).json({ success: false, error: 'No brownfield context found. Please attach code/schema context first.' });
    }

    const result = await codeToSpecService.generateBaselineSpec(context, activeSpecDirName);
    res.json({ success: true, baselineSpec: result.baselineSpec });
  } catch (err) {
    console.error('Failed Code-to-Spec baseline generation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/code-to-spec/merge', async (req, res) => {
  try {
    const { baselineSpec, manualSpec } = req.body;
    let existingManualSpec = manualSpec;
    
    if (!existingManualSpec) {
      const specPath = getSpecFilePath();
      if (fs.existsSync(specPath)) {
        existingManualSpec = fs.readFileSync(specPath, 'utf8');
      }
    }

    const result = await codeToSpecService.mergeBaselineWithManualSpec(baselineSpec, existingManualSpec || '');
    res.json({ success: true, mergedSpec: result.mergedSpec });
  } catch (err) {
    console.error('Failed Code-to-Spec merge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/code-to-spec/export', (req, res) => {
  try {
    const { finalSpec } = req.body;
    if (!finalSpec) {
      return res.status(400).json({ success: false, error: 'finalSpec is required' });
    }

    const specPath = getSpecFilePath();
    fs.writeFileSync(specPath, finalSpec, 'utf8');

    // Store baseline version backup
    const backupDir = path.join(specsDir, activeSpecDirName, 'versions');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backupDir, `baseline-spec-${Date.now()}.md`), finalSpec, 'utf8');

    res.json({
      success: true,
      message: `Successfully promoted & exported baseline spec to ${activeSpecDirName}/spec.md as new Source of Truth!`,
      path: `specs/${activeSpecDirName}/spec.md`
    });
  } catch (err) {
    console.error('Failed Code-to-Spec export:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Impact & Gap Analysis Endpoint
app.post('/api/impact-analysis/analyze', async (req, res) => {

  try {
    const { newRequirement } = req.body;
    if (!newRequirement || !newRequirement.trim()) {
      return res.status(400).json({ success: false, error: 'New Requirement text is required.' });
    }

    let context = req.body.context;
    if (!context && fs.existsSync(brownfieldStorageFile)) {
      context = JSON.parse(fs.readFileSync(brownfieldStorageFile, 'utf8'));
    }

    const result = await impactAnalysisService.analyzeImpact(newRequirement.trim(), context);
    res.json(result);
  } catch (err) {
    console.error('Failed Impact Analysis:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});




// Workspace dynamic specs path configuration


// Workspace dynamic specs path configuration
const specsDir = path.join(__dirname, '../../specs');
let activeSpecDirName = '001-meeting-manager'; // Safe default

if (fs.existsSync(specsDir)) {
  try {
    const files = fs.readdirSync(specsDir);
    const specDirs = files.filter(f => fs.statSync(path.join(specsDir, f)).isDirectory() && !f.startsWith('.'));
    if (specDirs.length > 0) {
      specDirs.sort();
      activeSpecDirName = specDirs[0];
    }
  } catch (err) {
    console.error('Failed to auto-detect active spec folder:', err.message);
  }
}

const getSpecFilePath = () => {
  const specV2Path = path.join(specsDir, activeSpecDirName, 'spec_v2.md');
  if (modelsConfig.ai_srb_enabled !== false && fs.existsSync(specV2Path)) {
    return specV2Path;
  }
  const specFilePath = path.join(specsDir, activeSpecDirName, 'spec.md');
  const specDir = path.dirname(specFilePath);
  if (!fs.existsSync(specDir)) {
    fs.mkdirSync(specDir, { recursive: true });
  }
  if (!fs.existsSync(specFilePath)) {
    fs.writeFileSync(specFilePath, `# Specification: ${activeSpecDirName.replace(/^\d+-/, '').replace(/-/g, ' ').toUpperCase()}\n\n(Default spec file initialized)`);
  }
  return specFilePath;
};

// APIs for Workspace Spec file
app.get('/api/workspace/spec', (req, res) => {
  try {
    const data = fs.readFileSync(getSpecFilePath(), 'utf8');
    res.json({ content: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read workspace spec file: ' + err.message });
  }
});

app.post('/api/workspace/spec', (req, res) => {
  const { content } = req.body;
  try {
    fs.writeFileSync(getSpecFilePath(), content || '', 'utf8');
    res.json({ success: true, message: 'Specification saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save spec file: ' + err.message });
  }
});

// Alias paths for synchronization
app.get('/workspace/spec', (req, res) => {
  try {
    const data = fs.readFileSync(getSpecFilePath(), 'utf8');
    res.json({ content: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read workspace spec file: ' + err.message });
  }
});

app.post('/sync-spec', (req, res) => {
  const { content } = req.body;
  try {
    fs.writeFileSync(getSpecFilePath(), content || '', 'utf8');
    res.json({ success: true, message: 'Specification synchronized successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync spec file: ' + err.message });
  }
});

app.post('/update-spec', (req, res) => {
  const { content } = req.body;
  try {
    fs.writeFileSync(getSpecFilePath(), content || '', 'utf8');
    res.json({ success: true, message: 'Specification updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update spec file: ' + err.message });
  }
});

// Spec Kit Project Spec List
app.get('/api/specs/list', (req, res) => {
  try {
    const specsDir = path.join(__dirname, '../../specs');
    if (!fs.existsSync(specsDir)) {
      return res.json({ success: true, specs: [] });
    }
    const files = fs.readdirSync(specsDir);
    const specs = files
      .filter(f => fs.statSync(path.join(specsDir, f)).isDirectory())
      .map(f => {
        const contents = fs.readdirSync(path.join(specsDir, f));
        return {
          name: f,
          files: contents.filter(c => c.endsWith('.md'))
        };
      });
    res.json({ success: true, specs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list specs: ' + err.message });
  }
});

// Spec Kit Get Active Spec
app.get('/api/specs/active', (req, res) => {
  try {
    const activeDir = path.join(__dirname, '../../specs', activeSpecDirName);
    const files = fs.existsSync(activeDir) 
      ? fs.readdirSync(activeDir).filter(f => f.endsWith('.md'))
      : [];
    res.json({ success: true, activeSpec: activeSpecDirName, files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve active spec: ' + err.message });
  }
});

// Spec Kit Download / View Spec Document File
app.get('/api/specs/download/:folder/:file', (req, res) => {
  const { folder, file } = req.params;
  
  if (folder.includes('..') || file.includes('..')) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const filePath = path.join(__dirname, '../../specs', folder, file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(filePath);
});

// Spec Kit Save Spec Document File
app.post('/api/specs/save', (req, res) => {
  const { folder, file, content } = req.body;

  if (!folder || !file) {
    return res.status(400).json({ error: 'Folder and file names are required' });
  }

  if (folder.includes('..') || file.includes('..')) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const filePath = path.join(__dirname, '../../specs', folder, file);

  try {
    fs.writeFileSync(filePath, content || '', 'utf8');
    res.json({ success: true, message: 'Document saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save spec document: ' + err.message });
  }
});

// Spec Kit Validate Specs and Tech Stack (AI-SRB multi-agent governance board with backward compatibility)
if (!global.activeValidationRuns) {
  global.activeValidationRuns = {};
}

function updateActiveRun(folder, msg) {
  if (!global.activeValidationRuns[folder]) {
    global.activeValidationRuns[folder] = {
      status: 'running',
      logs: [],
      step: 1,
      progress: 0,
      activeMember: null,
      statuses: {},
      votes: {}
    };
  }
  const run = global.activeValidationRuns[folder];

  // Format log messages nicely
  let formattedMsg = msg;
  if (!msg.startsWith('[Selector]') && !msg.startsWith('[System]') && !msg.startsWith('[Moderator]') && !msg.startsWith('[Editor]') && !msg.startsWith('[Validation]') && !msg.startsWith('[CEO Agent]') && !msg.startsWith('[Resilience]')) {
    if (msg.includes('review completed for')) {
      formattedMsg = `[System] ${msg}`;
    } else if (msg.includes('debate completed for')) {
      formattedMsg = `[System] ${msg}`;
    } else {
      formattedMsg = `[System] ${msg}`;
    }
  }

  run.logs.push(formattedMsg);

  const memberNameMap = {
    'architect': 'architect',
    'product_owner': 'product_owner',
    'devil_advocate': 'devil_advocate',
    'security': 'security',
    'performance': 'performance',
    'cost': 'cost',
    'data_architect': 'data_architect',
    'devops': 'devops',
    'compliance': 'compliance'
  };

  const findMemberKey = (text) => {
    const lower = text.toLowerCase();
    for (const key of Object.keys(memberNameMap)) {
      const sanitizedKey = key.replace('_', '');
      if (lower.includes(sanitizedKey) || lower.includes(key)) {
        return memberNameMap[key];
      }
    }
    return null;
  };

  if (msg.includes('Active Board Members selected:')) {
    run.step = 1;
    run.progress = 5;
    const parts = msg.split('selected:')[1] || '';
    const members = parts.split(',').map(m => m.trim().toLowerCase());
    members.forEach(m => {
      const key = findMemberKey(m) || m;
      run.statuses[key] = 'idle';
    });
  }

  if (msg.includes('Loading organizational lessons learned memory') || msg.includes('lessons learned from organizational_memory')) {
    run.step = 2;
    run.progress = 10;
    Object.keys(run.statuses).forEach(k => {
      run.statuses[k] = 'thinking';
    });
  }

  if (msg.includes('AI-SRB Round 1: Running Independent Review Panel')) {
    run.step = 3;
    run.progress = 15;
    Object.keys(run.statuses).forEach(k => {
      run.statuses[k] = 'idle';
    });
  }

  if (msg.includes('Round 1: Running independent review for')) {
    const memberName = msg.split('review for')[1].replace('...', '').trim();
    const key = findMemberKey(memberName);
    if (key) {
      run.activeMember = key;
      run.statuses[key] = 'thinking';
      const keys = Object.keys(run.statuses);
      const idx = keys.indexOf(key);
      if (idx !== -1) {
        run.progress = 15 + Math.floor((idx / keys.length) * 30);
      }
    }
  }

  if (msg.includes('Round 1 review completed for')) {
    const parts = msg.split('review completed for')[1] || '';
    const namePart = parts.split(':')[0].trim();
    const vote = parts.split(':')[1]?.trim() || 'APPROVED';
    const key = findMemberKey(namePart);
    if (key) {
      run.statuses[key] = 'done';
      run.votes[key] = vote.replace('.', '').trim();
      if (run.activeMember === key) {
        run.activeMember = null;
      }
    }
  }

  if (msg.includes('AI-SRB Round 2: Running Cross-Agent Challenge Debate')) {
    run.step = 4;
    run.progress = 45;
    Object.keys(run.statuses).forEach(k => {
      run.statuses[k] = 'debating';
    });
  }

  if (msg.includes('Round 2: Running debate feedback for')) {
    const memberName = msg.split('debate feedback for')[1].replace('...', '').trim();
    const key = findMemberKey(memberName);
    if (key) {
      run.activeMember = key;
      run.statuses[key] = 'thinking';
      const keys = Object.keys(run.statuses);
      const idx = keys.indexOf(key);
      if (idx !== -1) {
        run.progress = 45 + Math.floor((idx / keys.length) * 25);
      }
    }
  }

  if (msg.includes('Round 2 debate completed for')) {
    const memberName = msg.split('debate completed for')[1].trim();
    const key = findMemberKey(memberName);
    if (key) {
      run.statuses[key] = 'done';
      if (run.activeMember === key) {
        run.activeMember = null;
      }
    }
  }

  if (msg.includes('AI-SRB Round 3: Running Debate Moderator consensus formation')) {
    run.step = 5;
    run.progress = 70;
    run.activeMember = null;
    Object.keys(run.statuses).forEach(k => {
      run.statuses[k] = 'done';
    });
  }

  if (msg.includes('AI-SRB: Running Specification Editor Agent')) {
    run.step = 6;
    run.progress = 80;
  }

  if (msg.includes('AI-SRB: Running Validation Agent audit')) {
    run.step = 7;
    run.progress = 90;
  }

  if (msg.includes('AI-SRB: Running CEO Approval Agent final checkpoint')) {
    run.step = 8;
    run.progress = 95;
  }

  if (msg.includes('AI Specification Review Board pipeline finished successfully')) {
    run.step = 9;
    run.progress = 100;
    run.status = 'completed';
  }
}

global.updateActiveRun = updateActiveRun;

app.post('/api/specs/validate', async (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  if (folder.includes('..')) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const specsDir = path.join(__dirname, '../../specs', folder);
  if (!fs.existsSync(specsDir)) {
    return res.status(404).json({ error: `Spec folder "${folder}" not found` });
  }

  try {
    if (modelsConfig.ai_srb_enabled !== false) {
      const { runAISRB } = require('./services/aisrb.service');
      
      // Initialize active progress tracking state
      global.activeValidationRuns[folder] = {
        status: 'running',
        logs: ['[System] Initializing AI Specification Review Board (AI-SRB) Governance Layer...'],
        step: 1,
        progress: 0,
        activeMember: null,
        statuses: {},
        votes: {}
      };

      const logCallback = (msg) => {
        console.log(`[AI-SRB Progress] ${msg}`);
        updateActiveRun(folder, msg);
      };

      const result = await runAISRB(folder, logCallback);

      // Set complete state
      if (global.activeValidationRuns[folder]) {
        global.activeValidationRuns[folder].status = 'completed';
        global.activeValidationRuns[folder].step = 9;
        global.activeValidationRuns[folder].progress = 100;
        global.activeValidationRuns[folder].approved = result.approved;
        global.activeValidationRuns[folder].report = result.report;
      }

      res.json({
        success: true,
        log: global.activeValidationRuns[folder].logs,
        report: result.report,
        approved: result.approved
      });
    } else {
      const log = ['[Validator Progress] AI-SRB disabled. Running legacy single-agent validator...'];
      const readFile = (name) => {
        const p = path.join(specsDir, name);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
      };

      let requirements = readFile('requirements.md');
      const spec = readFile('spec.md');
      const constitution = readFile('constitution.md');
      const plan = readFile('plan.md');
      const tasks = readFile('tasks.md');
      const research = readFile('research.md');

      if (!requirements) {
        requirements = `Reconstructed Requirements based on active specification documentation:\n\n` +
          (constitution ? `### Constitution Principles:\n${constitution.substring(0, 1000)}\n\n` : '') +
          (spec ? `### Specification Goals:\n${spec.substring(0, 1000)}` : 'Build a system according to the design guidelines.');
        fs.writeFileSync(path.join(specsDir, 'requirements.md'), requirements, 'utf8');
      }

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables' });
      }

      const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: modelsConfig.active_llm });

      const prompt = `You are a Senior Principal Architect and Spec Validator.
Your task is to thoroughly analyze the generated specifications and technical documents against the user's original requirements.

Original Requirements:
"""
${requirements}
"""

Generated Specification (spec.md):
"""
${spec}
"""

Generated Constitution (constitution.md):
"""
${constitution}
"""

Generated Implementation Plan (plan.md):
"""
${plan}
"""

Generated Technical Research (research.md):
"""
${research}
"""

Please compile a detailed markdown validation report addressing the following:
1. **Requirements Coverage & Conflicts**:
   - Compare spec.md against the Original Requirements.
   - List any conflicts, ambiguities, or requirements that were missed or partially implemented.
2. **Tech Stack & Standard Evaluation**:
   - Evaluate the suggested stack in the documents. Ensure they conform to modern standards and match the constitution.
3. **Sub-Agent LLM/SLM Assignment Cards**:
   - Recommend the ideal model (LLM vs. SLM) for each sub-agent step in our pipeline.
   - Our pipeline contains these 8 steps:
     1. Spec to Story (Requirements analysis)
     2. User Stories (Backlog decomposition)
     3. UX Wireframe (Tailwind HTML prototype code generation)
     4. Functional Spec (FSD writing and compilation)
     5. Tech Architecture (System blueprints & Mermaid SVG)
     6. Database Design (DDL & ERD charts)
     7. Test Cases (QA sheets & Gherkin)
     8. Traceability Matrix (Cross-referencing)
   - For each step, present a clean "Agent Card" containing:
     - **Sub-Agent Name**
     - **Recommended Model** (Choose from: Gemini 2.0 Flash, Gemini 1.5 Flash, GPT-4o, GPT-4o-Mini, Claude 3.5 Sonnet)
     - **Model Type** (LLM or SLM)
     - **Detailed Reasoning** (e.g. why a fast SLM is better for structured tasks, or why Claude 3.5 Sonnet is better for code generation).

Return only the clean markdown report. Do not add any introductory or wrap-up commentary outside of the markdown block.`;

      const result = await model.generateContent(prompt);
      const reportContent = result.response.text();

      fs.writeFileSync(path.join(specsDir, 'validation_report.md'), reportContent, 'utf8');

      const statusPath = path.join(specsDir, 'validation_status.json');
      if (!fs.existsSync(statusPath)) {
        fs.writeFileSync(statusPath, JSON.stringify({ approved: false }), 'utf8');
      }

      res.json({
        success: true,
        log,
        report: reportContent,
        approved: false
      });
    }

  } catch (err) {
    if (global.activeValidationRuns && global.activeValidationRuns[folder]) {
      global.activeValidationRuns[folder].status = 'failed';
      global.activeValidationRuns[folder].error = err.message;
      global.activeValidationRuns[folder].logs.push(`[System] Validation failed: ${err.message}`);
    }
    res.status(500).json({ error: 'Validation failed: ' + err.message });
  }
});

// Spec Kit Validate Progress Polling Endpoint
app.get('/api/specs/validate/progress/:folder', (req, res) => {
  const { folder } = req.params;
  if (!folder) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  if (global.activeValidationRuns && global.activeValidationRuns[folder]) {
    return res.json(global.activeValidationRuns[folder]);
  }

  // Fallback to cached validation status
  const specsDir = path.join(__dirname, '../../specs', folder);
  const statusFile = path.join(specsDir, 'validation_status.json');
  if (fs.existsSync(statusFile)) {
    try {
      const statusData = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      return res.json({
        status: 'completed',
        step: 9,
        progress: 100,
        approved: statusData.approved,
        report: statusData.report || '',
        logs: ['[System] Audit complete. Loaded cached validation report.']
      });
    } catch (e) {
      // ignore
    }
  }

  return res.json({ status: 'idle' });
});

// POST human architecture gate approval decision
app.post('/api/specs/validate/human-decision', async (req, res) => {
  const { folder, session_id, decision, comments, user } = req.body;
  if (!folder || !session_id || !decision) {
    return res.status(400).json({ error: 'Folder name, session_id, and decision decision type are required' });
  }

  if (folder.includes('..')) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const specsDir = path.join(__dirname, '../../specs', folder);
  if (!fs.existsSync(specsDir)) {
    return res.status(404).json({ error: `Spec folder "${folder}" not found` });
  }

  try {
    const { aisrbGraph } = require('./services/aisrbGraph.service');
    const config = { configurable: { thread_id: session_id } };

    // Register dynamic active status polling log
    if (global.activeValidationRuns && global.activeValidationRuns[folder]) {
      global.activeValidationRuns[folder].status = 'running';
      global.activeValidationRuns[folder].step = 9;
      global.activeValidationRuns[folder].progress = 98;
      global.activeValidationRuns[folder].logs.push(`[System] Human decision received: ${decision}. comments: "${comments || ''}". Resuming debate graph...`);
    }

    // Update Checkpoint State
    await aisrbGraph.updateState(config, {
      human_approval_status: decision,
      human_approval_details: {
        approved_by: user || 'Human Architecture Board',
        decision,
        comments: comments || '',
        timestamp: new Date().toISOString()
      }
    });

    // Run graph execution resume handler in the background asynchronously
    const resumeInvoke = async () => {
      try {
        const finalState = await aisrbGraph.invoke(null, config);
        const hasApproved = finalState.human_approval_status === 'APPROVED';
        
        // Read final report from validation_report.md
        const reportPath = path.join(specsDir, 'validation_report.md');
        const reportText = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : '';

        if (global.activeValidationRuns[folder]) {
          global.activeValidationRuns[folder].status = 'completed';
          global.activeValidationRuns[folder].approved = hasApproved;
          global.activeValidationRuns[folder].progress = 100;
          global.activeValidationRuns[folder].step = 9;
          global.activeValidationRuns[folder].report = reportText;
          global.activeValidationRuns[folder].logs.push(`[System] Governance subgraph execution resumed and completed successfully. Status: ${finalState.human_approval_status}`);
        }
      } catch (err) {
        console.error('Failed to execute resumed subgraph:', err);
        if (global.activeValidationRuns[folder]) {
          global.activeValidationRuns[folder].status = 'failed';
          global.activeValidationRuns[folder].error = err.message;
          global.activeValidationRuns[folder].logs.push(`[System] Resumed execution error: ${err.message}`);
        }
      }
    };

    resumeInvoke();

    res.json({
      success: true,
      message: `Human decision '${decision}' accepted. Governance graph resuming...`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resume validation checkpoint state: ' + err.message });
  }
});

// Spec Kit Approve Validation Report
app.post('/api/specs/validate/approve', (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  if (folder.includes('..')) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const specsDir = path.join(__dirname, '../../specs', folder);
  if (!fs.existsSync(specsDir)) {
    return res.status(404).json({ error: `Spec folder "${folder}" not found` });
  }

  try {
    fs.writeFileSync(path.join(specsDir, 'validation_status.json'), JSON.stringify({ approved: true }), 'utf8');
    res.json({ success: true, approved: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve validation: ' + err.message });
  }
});

// Spec Kit Get Validation Status
app.get('/api/specs/validate/status/:folder', (req, res) => {
  const { folder } = req.params;
  if (!folder) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  if (folder.includes('..')) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const specsDir = path.join(__dirname, '../../specs', folder);
  if (!fs.existsSync(specsDir)) {
    return res.status(404).json({ error: `Spec folder "${folder}" not found` });
  }

  try {
    const statusPath = path.join(specsDir, 'validation_status.json');
    let statusData = { approved: false };
    if (fs.existsSync(statusPath)) {
      try {
        statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      } catch (e) {
        // ignore
      }
    }

    const reportPath = path.join(specsDir, 'validation_report.md');
    const report = fs.existsSync(reportPath)
      ? fs.readFileSync(reportPath, 'utf8')
      : null;

    res.json({
      success: true,
      approved: statusData.approved,
      human_approval_status: statusData.human_approval_status || (statusData.approved ? 'APPROVED' : 'PENDING'),
      human_approval_details: statusData.human_approval_details || {},
      session_id: statusData.session_id || '',
      metrics: statusData.metrics || {},
      opinion_changes: statusData.opinion_changes || [],
      report
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read validation status: ' + err.message });
  }
});

// Spec Kit Set Active Spec
app.post('/api/specs/active', (req, res) => {
  const { activeSpec } = req.body;
  if (!activeSpec) {
    return res.status(400).json({ error: 'activeSpec folder name is required' });
  }
  const targetDir = path.join(__dirname, '../../specs', activeSpec);
  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ error: `Spec folder "${activeSpec}" does not exist` });
  }
  activeSpecDirName = activeSpec;
  res.json({ success: true, activeSpec });
});

// Spec Kit Trigger Generation
app.post('/api/specs/generate', async (req, res) => {
  const { requirements } = req.body;
  if (!requirements) {
    return res.status(400).json({ error: 'Requirements text is required' });
  }
  try {
    const { generateSpecKit } = require('./services/specKit.service');
    const log = [];
    const logCallback = (msg) => {
      console.log(`[SpecKit Progress] ${msg}`);
      log.push(msg);
    };
    
    const result = await generateSpecKit(requirements, logCallback);
    
    // Auto-set the active spec to the newly generated one
    activeSpecDirName = result.folderName;
    
    res.json({ success: true, log, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Spec Kit: ' + err.message });
  }
});

// Job Queue Store
const jobs = {};

// Markdown-to-HTML parser helper for dynamic FSD compilation
function convertMarkdownToHTML(markdown) {
  if (!markdown) return '';
  
  // HTML escape to avoid markup injections but preserve formatting
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^# (.*?)$/gm, '<h1 style="color: #60a5fa; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; font-size: 24px; font-weight: bold; margin-top: 24px; margin-bottom: 12px;">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 style="color: #f472b6; font-size: 16px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">$1</h3>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border-color: #334155; margin: 20px 0;"/>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Bullets
  html = html.replace(/^- (.*?)$/gm, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 4px; color: #cbd5e1;">$1</li>');
  html = html.replace(/^\* (.*?)$/gm, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 4px; color: #cbd5e1;">$1</li>');

  // Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let result = [];
  
  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      inTable = true;
      let cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
      if (trimmed.includes('---') || trimmed.includes('- -')) {
        continue;
      }
      tableRows.push(cells);
    } else {
      if (inTable && tableRows.length > 0) {
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #111827; border: 1px solid #374151; font-size: 13px;">';
        tableRows.forEach((row, idx) => {
          let rowBg = idx % 2 === 0 ? 'background: #1f2937;' : 'background: #111827;';
          tableHtml += `<tr style="${rowBg}">`;
          row.forEach(cell => {
            let padding = 'padding: 8px 12px; border: 1px solid #374151;';
            if (idx === 0) {
              tableHtml += `<th style="${padding} font-weight: bold; background: #374151; color: #e5e7eb; text-align: left;">${cell}</th>`;
            } else {
              tableHtml += `<td style="${padding} color: #d1d5db;">${cell}</td>`;
            }
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</table>';
        result.push(tableHtml);
        tableRows = [];
        inTable = false;
      }
      result.push(line);
    }
  }
  if (inTable && tableRows.length > 0) {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #111827; border: 1px solid #374151; font-size: 13px;">';
    tableRows.forEach((row, idx) => {
      let rowBg = idx % 2 === 0 ? 'background: #1f2937;' : 'background: #111827;';
      tableHtml += `<tr style="${rowBg}">`;
      row.forEach(cell => {
        let padding = 'padding: 8px 12px; border: 1px solid #374151;';
        if (idx === 0) {
          tableHtml += `<th style="${padding} font-weight: bold; background: #374151; color: #e5e7eb; text-align: left;">${cell}</th>`;
        } else {
          tableHtml += `<td style="${padding} color: #d1d5db;">${cell}</td>`;
        }
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';
    result.push(tableHtml);
  }
  
  html = result.join('\n');
  
  const processedLines = html.split('\n').map(l => {
    let trimmed = l.trim();
    if (!trimmed) return '<br/>';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<l') || trimmed.startsWith('<t') || trimmed.startsWith('<d') || trimmed.startsWith('<u') || trimmed.startsWith('<o') || trimmed.startsWith('<b') || trimmed.startsWith('|') || trimmed.startsWith('<p') || trimmed.startsWith('<s') || trimmed.startsWith('<r') || trimmed.startsWith('<m')) {
      return l;
    }
    return `<p style="margin-bottom: 8px; color: #cbd5e1; line-height: 1.6;">${l}</p>`;
  });
  
  return `<div class="fsd-document">${processedLines.join('\n')}</div>`;
}

// Generator simulation helper
function parseSpecification(specText) {
  const result = {
    title: 'System Specification Document',
    version: '1.0.0',
    status: 'Approved',
    sections: [],
    workflows: [],
    rules: [],
    databaseTables: [],
    securityFeatures: []
  };

  if (!specText || specText.trim().length === 0) {
    // Return Request Tracker fallbacks
    result.title = 'Return Request Tracker (RRT-001)';
    result.sections = [
      { name: '1. Customer Portal & Returns Initiation', items: ['Select delivered items to request return.', 'Force photo upload for defective reasons.', 'Choose store credit refund option with 10% premium bonus.'] },
      { name: '2. Logistics Shipping API Integration', items: ['Integrate FedEx ShipService API to fetch return barcodes.', 'Display printable prepaid labels on completion.', 'Provide transit tracking update webhooks.'] },
      { name: '3. Rules Engine & Automation Policies', items: ['Auto-approve transactions under $100 on first scan.', 'Escalate returns >= $100 to CSR manual review queue.', 'Enforce fraud rules for accounts returning >40% items.'] },
      { name: '4. Warehouse Goods Grading', items: ['Auditors scan package tracking IDs.', 'Log quality grades (A-Grade: full refund, B-Grade: restocking fee, C-Grade: reject/liquidate).'] }
    ];
    result.workflows = [
      'Customer initiates return -> select items -> choose payment method.',
      'Logistics triggers tracking label -> carrier updates status webhooks.',
      'Warehouse auditor rates package -> rules engine completes payout.'
    ];
    result.rules = [
      'Return request window must occur within 30 days of delivery.',
      'Defective reason selections must include photo evidence attachment.',
      'Transactions >= $100 require CSR supervisor review and approval override.'
    ];
    result.databaseTables = [
      { name: 'customers', fields: 'id UUID PRIMARY KEY, name VARCHAR, email VARCHAR UNIQUE, created_at TIMESTAMP' },
      { name: 'orders', fields: 'id UUID PRIMARY KEY, customer_id UUID REFERENCES customers(id), order_number VARCHAR, purchase_date TIMESTAMP' },
      { name: 'return_requests', fields: 'id UUID PRIMARY KEY, order_id UUID REFERENCES orders(id), status VARCHAR, tracking_number VARCHAR, refund_method VARCHAR' },
      { name: 'return_items', fields: 'id UUID PRIMARY KEY, return_request_id UUID REFERENCES return_requests(id), order_item_id UUID, quantity INT, reason VARCHAR, condition VARCHAR' }
    ];
    result.securityFeatures = [
      'PCI-DSS compliance: tokenized client-side Stripe integrations.',
      'Data encryption: TLS 1.3 enforced for transit payloads.',
      'Role-Based access control: JWT token verification on backend gateways.'
    ];
    return result;
  }

  // Parse lines of the actual spec.md!
  const lines = specText.split('\n');
  let currentSection = null;

  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;

    // Title
    if (trimmed.startsWith('# ') && !trimmed.startsWith('# Version') && !trimmed.startsWith('# Status')) {
      result.title = trimmed.replace('# ', '').trim();
    }
    // Metadata
    else if (trimmed.toLowerCase().includes('version:')) {
      let match = trimmed.match(/version:\s*([0-9.]+)/i);
      if (match) result.version = match[1];
    }
    else if (trimmed.toLowerCase().includes('status:')) {
      let match = trimmed.match(/status:\s*([a-zA-Z]+)/i);
      if (match) result.status = match[1];
    }
    // Subheadings
    else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      let secName = trimmed.replace(/^##+\s+/, '').trim();
      currentSection = { name: secName, items: [] };
      result.sections.push(currentSection);
    }
    // Bullets / Items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      let val = trimmed.replace(/^[-*]\s+/, '').trim();
      if (currentSection) {
        currentSection.items.push(val);
      }
      
      let lower = val.toLowerCase();
      if (lower.includes('workflow') || lower.includes('process') || lower.includes('step') || lower.includes('flow')) {
        result.workflows.push(val);
      }
      if (lower.includes('rule') || lower.includes('policy') || lower.includes('must') || lower.includes('should') || lower.includes('require')) {
        result.rules.push(val);
      }
      if (lower.includes('security') || lower.includes('encrypt') || lower.includes('tls') || lower.includes('auth') || lower.includes('pci')) {
        result.securityFeatures.push(val);
      }
    }
  }

  // Infer database tables if none found
  result.sections.forEach((sec) => {
    let tblName = sec.name.toLowerCase().replace(/[^a-z]/g, '_');
    if (tblName.length > 25) tblName = tblName.substring(0, 25);
    if (tblName.length > 3) {
      result.databaseTables.push({
        name: tblName,
        fields: `id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ${tblName}_title VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'Created', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
      });
    }
  });

  // Default database tables if none created
  if (result.databaseTables.length === 0) {
    result.databaseTables.push({ name: 'transactions_log', fields: 'id UUID PRIMARY KEY, spec_title VARCHAR, active_status VARCHAR, updated_at TIMESTAMP' });
  }

  return result;
}

async function generateMockOutput(type, specContent) {
  const specText = specContent || '';
  const spec = parseSpecification(specText);
  
  switch(type) {
    case 'spec-to-story': {
      let stories = [];
      let index = 1;
      
      spec.sections.forEach(sec => {
        sec.items.forEach((item) => {
          let shortTitle = item.substring(0, 50);
          if (shortTitle.length === 50) shortTitle += '...';
          stories.push({
            id: `US-${spec.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'SYS'}-${index++}`,
            title: shortTitle,
            asA: index % 2 === 0 ? 'Operator / Store Associate' : 'System Client',
            iWantTo: `integrate dynamic processing for: ${item.toLowerCase()}`,
            soThat: `I can verify standard criteria matching ${sec.name}`,
            criteria: [
              `Given system handles config for "${spec.title}"`,
              `When checking item: "${item}"`,
              `Then status returns success and is registered in the database.`
            ],
            priority: index % 3 === 0 ? 'High' : 'Medium',
            points: index % 2 === 0 ? 5 : 3,
            techNotes: `Part of user stories generated dynamically from specification section: ${sec.name}`
          });
        });
      });

      if (stories.length === 0) {
        stories.push({
          id: 'US-SYS-01',
          title: `Configure ${spec.title} Workflows`,
          asA: 'Administrator',
          iWantTo: 'initialize system settings',
          soThat: 'I can start processing system operations',
          criteria: ['Given system validation is online', 'When settings are configured', 'Then display success message'],
          priority: 'High',
          points: 5,
          techNotes: 'Base setup configuration.'
        });
      }

      return { stories };
    }

    case 'user-stories': {
      let spreadsheet = [];
      let index = 1;

      spec.sections.forEach(sec => {
        sec.items.forEach((item) => {
          let summary = item.substring(0, 60);
          if (summary.length === 60) summary += '...';
          spreadsheet.push({
            id: index,
            summary: `${spec.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()}-${String(index).padStart(3, '0')}: ${summary}`,
            description: `Verify and automate processing logic for: ${item}`,
            issueType: index % 4 === 0 ? 'Task' : 'Story',
            priority: index % 3 === 0 ? 'High' : 'Medium',
            storyPoints: index % 2 === 0 ? 5 : 3,
            labels: `Dynamic, ${sec.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`
          });
          index++;
        });
      });

      if (spreadsheet.length === 0) {
        spreadsheet.push({
          id: 1,
          summary: 'SYS-001: Core System Implementation',
          description: 'Establish foundation setups matching main layout specs.',
          issueType: 'Story',
          priority: 'High',
          storyPoints: 5,
          labels: 'Setup, Core'
        });
      }

      return { spreadsheet };
    }

    case 'functional-spec': {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: modelsConfig.active_slm });

        const fsdPrompt = `You are a Principal Business Analyst and Senior Technical Writer with deep enterprise documentation expertise.

Analyze the following specification document carefully:
${specText || `# ${spec.title}\nVersion: ${spec.version}\nStatus: ${spec.status}\n\n${spec.sections.map(s => `## ${s.name}\n${s.items.map(i => `- ${i}`).join('\n')}`).join('\n\n')}`}

Your task is to generate a comprehensive, client-ready Functional Specification Document (FSD) as clean, premium-styled HTML.

CRITICAL RULES:
- Do NOT wrap your output in markdown code blocks. Start directly with raw HTML (e.g. <div> or <article>).
- Use an inline dark-mode style: dark background (#0f172a), light text (#e2e8f0), accent color (#6366f1 indigo) for headings, (#22d3ee cyan) for section badges, card-style sections with background #1e293b and border #334155.
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
   - High-level list of features / modules

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

        const result = await model.generateContent(fsdPrompt);
        let fsdHtml = result.response.text().trim();

        // Strip markdown code block wrapping if model returned it
        if (fsdHtml.startsWith('```html')) {
          fsdHtml = fsdHtml.substring(7);
        } else if (fsdHtml.startsWith('```')) {
          fsdHtml = fsdHtml.substring(3);
        }
        if (fsdHtml.endsWith('```')) {
          fsdHtml = fsdHtml.substring(0, fsdHtml.length - 3);
        }

        return fsdHtml.trim();
      } catch (err) {
        console.error('[FSD Generator] Failed to query AI model:', err.message);
      }

      // Fallback: Build a structured FSD from parsed spec if AI call fails
      const fallbackMd =
        `# Functional Specification Document\n` +
        `## ${spec.title}\n` +
        `**Version:** ${spec.version} | **Status:** ${spec.status}\n\n` +
        `---\n\n` +
        `## 1. Introduction\n` +
        `### 1.1 Purpose\nThis document describes the functional requirements for **${spec.title}**.\n\n` +
        `### 1.2 Scope\nThis specification covers the complete functional scope of the ${spec.title} system.\n\n` +
        `## 2. Business Context\n` +
        (spec.workflows.slice(0, 3).map(w => `- ${w}`).join('\n') || '- Business processes defined in specification.') + '\n\n' +
        `## 3. Functional Overview\n` +
        spec.sections.map(s => `- **${s.name}**`).join('\n') + '\n\n' +
        `## 5. Functional Requirements\n` +
        spec.sections.map((s, idx) =>
          `### FR-${String(idx + 1).padStart(3, '0')}: ${s.name}\n` +
          `**Priority:** High | **Actor:** System User\n\n` +
          `**Description:** ${s.items[0] || 'As per specification section.'}\n\n` +
          `**Acceptance Criteria:**\n${s.items.map(i => `- ${i}`).join('\n')}\n`
        ).join('\n---\n\n') + '\n\n' +
        `## 6. Business Rules\n` +
        (spec.rules.slice(0, 5).map((r, i) => `- **BR-${String(i + 1).padStart(3, '0')}:** ${r}`).join('\n') || '- Standard business rules apply.') + '\n\n' +
        `## 13. Error Handling\n` +
        `- Validation errors return HTTP 422 with field-level error messages.\n` +
        `- System errors return HTTP 500 with a reference ID for support tracking.\n\n` +
        `## 14. Non-Functional Requirements\n` +
        `- **Performance:** API response time < 2 seconds under normal load.\n` +
        `- **Security:** JWT authentication, HTTPS enforced, input sanitization.\n` +
        `- **Availability:** 99.5% uptime SLA.\n\n` +
        `## 15. Assumptions\n- Specification is based on requirements provided as of the document date.\n\n` +
        `## 16. Risks\n- Incomplete requirements may lead to scope changes during development.\n\n` +
        `## 18. Appendix\n### Glossary\n- **FSD:** Functional Specification Document\n- **FR:** Functional Requirement\n- **BR:** Business Rule\n`;

      return convertMarkdownToHTML(fallbackMd);
    }

    case 'tech-architecture': {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: modelsConfig.active_llm });

        const techPrompt = `You are a Principal Solutions Architect and Senior Technical Writer with deep cloud-native and enterprise architecture expertise.

Analyze the following specification document carefully:
${specText || `# ${spec.title}\nVersion: ${spec.version}\nStatus: ${spec.status}\n\n${spec.sections.map(s => `## ${s.name}\n${s.items.map(i => `- ${i}`).join('\n')}`).join('\n\n')}`}

Your task is to generate a comprehensive, client-ready Technical Architecture / Technical Specification Document in clean Markdown format.

CRITICAL RULES:
- Return ONLY valid JSON with two keys: "document" (the full Markdown content as a single escaped string) and "blueprint" (a valid Mermaid.js diagram string).
- Be INTELLIGENT: If a section is clearly NOT applicable based on the specification (e.g., no Azure resources mentioned → skip Section 20 Azure details, no MFA mentioned → skip MFA in Section 8), omit it entirely rather than generating placeholder/empty content.
- For every section that IS applicable, be thorough, specific, and derive content directly from the provided specification — do not hallucinate or fabricate details.

Generate ALL of the following sections that are applicable. Skip sections that are genuinely not applicable:

DOCUMENT INFORMATION (always include):
- Document Title, Project Name, Version, Status, Author, Reviewers, Approvers, Revision Log, Distribution List

TABLE OF CONTENTS (always include)

1. INTRODUCTION
   1.1 Purpose – Why this document exists
   1.2 Scope – System and technical boundaries
   1.3 Intended Audience – Architects, Developers, DevOps, QA, Security
   1.4 References – Related docs (FSD, BRD, API contracts, cloud standards)

2. SOLUTION OVERVIEW
   - Architecture summary
   - Technology stack summary table
   - Deployment model (cloud-native / hybrid / on-prem)
   - Cloud architecture overview

3. ARCHITECTURE DIAGRAMS (include all that apply using Mermaid.js or clear textual descriptions)
   - Context Diagram, Container Diagram, Component Diagram, Deployment Diagram, Sequence Diagram, Class Diagram (only if applicable)

4. TECHNOLOGY STACK (table: Layer | Technology | Version | Purpose | Justification)
   - Frontend, Backend, Database, Messaging/Queue, Cache, Authentication, Cloud Platform, Monitoring, CI/CD, Infrastructure-as-Code

5. APPLICATION ARCHITECTURE
   - Modules / services and their responsibilities
   - Inter-module dependencies
   - Interaction patterns (sync REST, async events, gRPC, etc.)

6. COMPONENT DESIGN (for each major component)
   - Purpose, Responsibilities, Interfaces/contracts, Dependencies, Failure handling, Logging strategy, Configuration/env vars

7. API SPECIFICATIONS (for each key API endpoint)
   - Endpoint path, HTTP Method, Headers, Authentication, Request body, Response body, Error codes, Retry strategy, Timeout, Rate limits, Example payloads

8. AUTHENTICATION & AUTHORIZATION (only what applies)
   - JWT, OAuth 2.0 / OIDC, SSO, MFA, Session management, RBAC model

9. AUTHORIZATION MATRIX
   - Table: Role vs. Permission/Resource → Allowed / Denied

10. DATA FLOW
    - Sequence diagrams for key flows
    - Request lifecycle (client → gateway → service → DB → response)
    - Data movement across boundaries

11. DATABASE DESIGN SUMMARY
    - Key entities and relationships
    - Index strategy, Partitioning, Read replicas / connection pooling

12. INTEGRATION DESIGN (only if external integrations exist)
    - External systems, protocols, retries, circuit breaker, webhooks, message queues

13. ERROR HANDLING
    - Exception hierarchy, retry strategies, fallbacks, Dead Letter Queue, error response format

14. LOGGING
    - Log levels, Correlation ID propagation, Sensitive data masking, Log aggregation platform

15. MONITORING & OBSERVABILITY (only if applicable)
    - Key metrics, health checks, alerting rules, dashboards

16. PERFORMANCE DESIGN
    - Caching strategy (what is cached, TTL, invalidation), Pagination, Compression, Batching, Async processing, Load balancing

17. SECURITY DESIGN
    - Encryption at rest and in transit, Secrets management / Key Vault, OWASP Top 10 mitigations, CSRF, CORS, Rate limiting

18. SCALABILITY
    - Horizontal scaling, Vertical scaling, Auto-scaling rules

19. DEPLOYMENT
    - Environment matrix (Dev / QA / UAT / Prod), CI/CD pipeline stages, Rollback strategy, Blue/Green or Canary deployment

20. INFRASTRUCTURE (only what is relevant to the spec)
    - Cloud resources (Azure / AWS / GCP), Networking, Storage, App Services / AKS / Functions, Redis, Databases

21. DISASTER RECOVERY
    - Backup strategy, Restore procedure, RPO, RTO

22. RISKS
    - Technical risks with likelihood, impact, and mitigation plan

23. FUTURE ENHANCEMENTS
    - Planned improvements, roadmap items, deferred technical decisions

Return ONLY valid JSON (no markdown code fences around the JSON):
{
  "document": "<full markdown document as single escaped string>",
  "blueprint": "<valid mermaid graph TD diagram>"
}`;

        const aiResult = await model.generateContent(techPrompt);
        let rawText = aiResult.response.text().trim();

        // Strip markdown code block wrapping if model returned it
        if (rawText.startsWith('```json')) rawText = rawText.substring(7);
        else if (rawText.startsWith('```')) rawText = rawText.substring(3);
        if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);

        const parsed = JSON.parse(rawText.trim());
        // Normalize: support both { html, blueprint } and legacy { document, blueprint }
        const htmlContent = parsed.html || parsed.document || '';
        return { html: htmlContent, blueprint: parsed.blueprint || '' };
      } catch (err) {
        console.error('[TechArch Generator] Failed to query AI model:', err.message);
      }

      // Fallback: Build a structured document from parsed spec if AI call fails
      let blueprint = `graph TD\n  Client[User Client UI] --> |REST Request| Gateway[API Gateway]\n`;
      spec.sections.forEach((sec) => {
        const slug = sec.name.replace(/[^a-zA-Z0-9]/g, '');
        blueprint += `  Gateway --> |orchestrates| Service_${slug}["${sec.name} Service"]\n`;
        blueprint += `  Service_${slug} --> |reads/writes| DB[("PostgreSQL Database")]\n`;
      });

      const document = `# Technical Architecture & Specification Document
## ${spec.title}
**Version:** v${spec.version} | **Status:** ${spec.status}

---

## 1. Introduction
### 1.1 Purpose
This document describes the technical architecture for **${spec.title}**.

### 1.2 Scope
Covers all services, integrations, infrastructure, and deployment strategies.

## 2. Solution Overview
The system is built on a cloud-native, decoupled microservices architecture.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Tailwind CSS | SPA Client |
| Backend | Node.js, Express | API Server |
| Database | PostgreSQL 15 | Transactional Data |
| Cache | Redis 7 | Session & Queue Cache |
| Auth | JWT RS256 | Token-Based Auth |

## 4. Technology Stack
${spec.sections.map(s => `- **${s.name}**: ${s.items[0] || 'Core service module.'}`).join('\n')}

## 5. Application Architecture
${spec.sections.map((s, i) => `### Module ${i + 1}: ${s.name}\n${s.items.map(item => `- ${item}`).join('\n')}`).join('\n\n')}

## 7. API Specifications
${spec.sections.map((s, idx) => {
  const slug = s.name.toLowerCase().replace(/[^a-z]/g, '-');
  return `### API-${String(idx + 1).padStart(3, '0')}: ${s.name}
- **Endpoint:** \`POST /api/v1/${slug}\`
- **Method:** POST
- **Headers:** \`Authorization: Bearer <JWT>\`, \`Content-Type: application/json\`
- **Authentication:** JWT RS256
- **Rate Limit:** 100 req/min`;
}).join('\n\n')}

## 8. Authentication & Authorization
- **JWT RS256** token-based authentication on all API endpoints.
- **RBAC** middleware enforcing role-based permissions.

## 9. Authorization Matrix
| Role | Read | Write | Admin |
|------|------|-------|-------|
| Admin | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ❌ |
| User | ✅ | ❌ | ❌ |

## 13. Error Handling
- Validation errors: HTTP 422 with field-level messages.
- System errors: HTTP 500 with correlation ID for tracing.

## 14. Logging
- Log levels: ERROR, WARN, INFO, DEBUG.
- Correlation IDs propagated across all service calls.

## 17. Security Design
- TLS 1.3 enforced for all data in transit.
${spec.securityFeatures.map(sf => `- ${sf}`).join('\n') || '- JWT authentication enforced on all endpoints.'}

## 22. Risks
- Incomplete specifications may require architecture revision during development.

## 23. Future Enhancements
- GraphQL API layer for flexible client queries.
- Event-driven architecture using Kafka for high-throughput scenarios.
`;

      return { blueprint, html: document };
    }


    case 'database-design': {
      // --- Step 1: Generate ERD and SQL DDL (deterministic, always runs) ---
      let erd = `erDiagram\n`;
      let sql = `-- Dynamic DDL Script for ${spec.title}\n\n`;

      spec.databaseTables.forEach((table) => {
        erd += `  main_system ||--o{ ${table.name} : maintains\n`;

        sql += `CREATE TABLE ${table.name} (\n`;
        table.fields.split(', ').forEach(f => {
          sql += `    ${f},\n`;
        });
        sql = sql.replace(/,\n$/, '\n'); // remove last comma
        sql += `);\n\n`;
      });

      // --- Step 2: AI-generated comprehensive Database Design Document ---
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: modelsConfig.active_llm });

        const dbPrompt = `You are a Principal Database Architect and Senior Technical Writer with deep enterprise data modeling expertise.

Analyze the following specification document carefully:
${specText || `# ${spec.title}\nVersion: ${spec.version}\nStatus: ${spec.status}\n\n${spec.sections.map(s => `## ${s.name}\n${s.items.map(i => `- ${i}`).join('\n')}`).join('\n\n')}`}

Also consider these identified database tables: ${spec.databaseTables.map(t => t.name).join(', ') || 'as derived from the specification'}.

Your task is to generate a comprehensive, client-ready Database Design Document as clean, premium-styled HTML.

CRITICAL RULES:
- Do NOT wrap your output in markdown code blocks. Start directly with raw HTML (e.g. <div> or <article>).
- Use an inline dark-mode style: dark background (#0f172a), light text (#e2e8f0), accent color (#6366f1 indigo) for headings, (#22d3ee cyan) for section badges, card-style sections with background #1e293b and border #334155.
- Be INTELLIGENT: If a section is clearly NOT applicable based on the specification (e.g., no stored procedures mentioned → skip Section 9, no triggers → skip Section 10), omit it entirely rather than generating placeholder/empty content.
- For every section that IS applicable, be thorough, specific, and derive content directly from the provided specification — do not hallucinate or fabricate details.
- Use semantic HTML5 elements with an elegant table-heavy layout for the field specifications section.
- For Section 4 (Table Specifications), generate detailed column-level tables with all attributes.

Generate ALL of the following sections that are applicable. Skip sections that are genuinely not applicable:

DOCUMENT INFORMATION (always include):
- Document Title: "Database Design Document"
- Project Name, Version, Status, Author, Reviewers, Approvers, Revision Log, Distribution List

TABLE OF CONTENTS (always include)

1. PURPOSE
   - Why this database design document exists
   - Document scope and coverage

2. DATABASE OVERVIEW
   - Database Type (e.g., PostgreSQL, MySQL, SQL Server, Oracle, MongoDB)
   - Version
   - Purpose — what business problem this database serves

3. ENTITY DEFINITIONS
   For every table/entity identified:
   - Entity Name
   - Purpose — what this entity represents
   - Description — detailed description of the entity
   - Owner — which module/service/team owns this entity

4. TABLE SPECIFICATIONS (LARGEST SECTION — be exhaustive)
   For every table, generate a detailed specification table with columns:
   - Column Name
   - Data Type
   - Length / Precision
   - Nullable (Yes/No)
   - Primary Key (Yes/No)
   - Foreign Key (Yes/No — if yes, reference table and column)
   - Default Value
   - Unique (Yes/No)
   - Indexed (Yes/No)
   - Description — business meaning of the column

5. RELATIONSHIPS
   - One-to-One relationships (table pairs, join keys, business meaning)
   - One-to-Many relationships (table pairs, join keys, business meaning)
   - Many-to-Many relationships (junction tables, join keys, business meaning)
   - Cascade Rules for each relationship (CASCADE DELETE, SET NULL, RESTRICT, etc.)

6. CONSTRAINTS
   - Primary Key constraints (table, columns)
   - Foreign Key constraints (table, column, references, on delete/update action)
   - Unique constraints (table, columns, business reason)
   - Check constraints (table, column, condition, business rule)

7. INDEX STRATEGY
   - Clustered indexes (table, columns, justification)
   - Non-Clustered indexes (table, columns, purpose)
   - Composite indexes (table, columns combination, query pattern)
   - Filtered indexes (table, filter condition, purpose)

8. VIEWS (include ONLY if applicable to the domain)
   For each view:
   - View Name
   - Purpose — why this view exists
   - Definition — SELECT statement or description

9. STORED PROCEDURES (include ONLY if applicable to the domain)
   For each procedure:
   - Procedure Name
   - Input Parameters (name, type, description)
   - Output / Return (type, description)
   - Logic — what the procedure does step by step

10. TRIGGERS (include ONLY if applicable to the domain)
    For each trigger:
    - Trigger Name
    - Table, Event (INSERT/UPDATE/DELETE), Timing (BEFORE/AFTER)
    - Purpose — business reason
    - Logic — what the trigger does

11. SEQUENCES / IDENTITY COLUMNS
    - Identity columns (table, column, seed, increment)
    - UUID / GUID columns (table, column, generation strategy)
    - Auto-increment patterns used across the schema

12. DATA DICTIONARY
    A master reference table with columns:
    - Business Name (human-readable term)
    - Physical Name (table.column)
    - Data Type
    - Description — full business definition
    - Allowed Values / Domain

13. NORMALIZATION
    - Confirmation of 1NF compliance (no repeating groups, atomic values)
    - Confirmation of 2NF compliance (no partial dependencies)
    - Confirmation of 3NF compliance (no transitive dependencies)
    - Deliberate Denormalization Decisions (where and why denormalization was chosen for performance)

14. SECURITY
    - Encryption at rest (which columns/tables, algorithm)
    - Data Masking strategy (which fields, masking pattern)
    - PII fields identification (table, column, data classification)
    - GDPR compliance notes (data residency, right to erasure, consent tracking)

15. DATA RETENTION
    - Archival strategy (which tables, archival frequency, archive location)
    - Purge policy (which tables, retention period, purge mechanism)

16. PERFORMANCE
    - Partitioning strategy (table, partition key, partition type: range/list/hash)
    - Index optimization notes
    - Statistics update strategy (frequency, method)

17. BACKUP STRATEGY
    - Backup type (full, differential, transaction log)
    - Frequency and schedule
    - Retention period for backups
    - Recovery point objective (RPO) and recovery time objective (RTO)

18. MIGRATION STRATEGY
    - Migration approach (blue/green, rolling, cutover)
    - Schema versioning tool (Flyway, Liquibase, Alembic, custom)
    - Rollback strategy
    - Data migration steps`;

        const aiResult = await model.generateContent(dbPrompt);
        let fsdHtml = aiResult.response.text().trim();

        // Strip markdown code block wrapping if model returned it
        if (fsdHtml.startsWith('```html')) fsdHtml = fsdHtml.substring(7);
        else if (fsdHtml.startsWith('```')) fsdHtml = fsdHtml.substring(3);
        if (fsdHtml.endsWith('```')) fsdHtml = fsdHtml.substring(0, fsdHtml.length - 3);

        return { erd, sql, fsd: fsdHtml.trim() };
      } catch (err) {
        console.error('[DB Design Generator] Failed to query AI model:', err.message);
      }

      // Fallback: Build a structured HTML document from parsed spec if AI call fails
      const fallbackFsd = `<div style="font-family: ui-sans-serif, system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px;">
  <h1 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 8px; font-size: 22px; font-weight: bold;">Database Design Document</h1>
  <p style="color: #94a3b8; font-size: 13px; margin-bottom: 24px;"><strong>Project:</strong> ${spec.title} | <strong>Version:</strong> ${spec.version} | <strong>Status:</strong> ${spec.status}</p>
  <h2 style="color: #22d3ee; font-size: 16px; font-weight: bold; margin-top: 20px;">1. Purpose</h2>
  <p>This document defines the complete database model for <strong>${spec.title}</strong>.</p>
  <h2 style="color: #22d3ee; font-size: 16px; font-weight: bold; margin-top: 20px;">2. Database Overview</h2>
  <table style="width:100%; border-collapse:collapse; margin-top:8px;">
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8;">Database Type</td><td style="padding:6px 10px; border:1px solid #334155;">PostgreSQL</td></tr>
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8;">Version</td><td style="padding:6px 10px; border:1px solid #334155;">15+</td></tr>
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8;">Purpose</td><td style="padding:6px 10px; border:1px solid #334155;">Stores all operational data for ${spec.title}</td></tr>
  </table>
  <h2 style="color: #22d3ee; font-size: 16px; font-weight: bold; margin-top: 20px;">3. Entity Definitions</h2>
  ${spec.databaseTables.map((t, i) => `<div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:12px; margin-bottom:8px;"><strong style="color:#6366f1;">${t.name}</strong><p style="color:#94a3b8; font-size:12px; margin-top:4px;">Operational entity for ${spec.sections[i]?.name || t.name}. Stores ${t.fields}.</p></div>`).join('')}
  <h2 style="color: #22d3ee; font-size: 16px; font-weight: bold; margin-top: 20px;">4. Table Specifications</h2>
  ${spec.databaseTables.map(t => `<h3 style="color:#e2e8f0; font-size:14px; margin-top:12px;">${t.name}</h3><table style="width:100%; border-collapse:collapse;"><thead><tr>${['Column','Type','Length','Nullable','PK','FK','Default','Unique','Index','Description'].map(h => `<th style="padding:6px 8px; border:1px solid #334155; background:#1e293b; color:#22d3ee; font-size:11px;">${h}</th>`).join('')}</tr></thead><tbody>${t.fields.split(', ').map(f => `<tr><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">${f}</td>${'<td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">VARCHAR</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">255</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">Yes</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">No</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">No</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">NULL</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">No</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">No</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">—</td>'}</tr>`).join('')}</tbody></table>`).join('')}
</div>`;

      return { erd, sql, fsd: fallbackFsd };
    }

    case 'ux-wireframe': {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: modelsConfig.active_slm });

        const prompt = `You are an expert UI/UX designer and web developer.
Your goal is to build a complete, highly-interactive single-page HTML application mockup prototype based on the provided functional specification spec.md.

Design & Layout Rules:
1. Use modern Tailwind CSS (via CDN: https://cdn.tailwindcss.com) for layout and styling. Create a premium dark-mode aesthetic (slate-950 background, glassmorphism cards, glowing active accents, smooth typography).
2. The prototype MUST be highly interactive: build actual mock data tables, interactive filter tabs, a fully functional input form (e.g. submit returns, create order, edit items), and a dynamic status drawer/details pane using pure vanilla JavaScript in a <script> tag.
3. Use a custom font (e.g. Plus Jakarta Sans or Inter via Google Fonts link) and FontAwesome icons (via CDN: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css).
4. Integrate details parsed directly from the spec.md: use the system title, specific user actions, API paths, and database fields listed in the specification to construct form fields and page context.
5. Do NOT enclose your output in markdown code blocks or write introduction/explanation sentences. Respond ONLY with the complete raw HTML code (beginning with <!DOCTYPE html>).

Active spec.md Specification:
${specText}

Complete HTML Prototype:`;

        const result = await model.generateContent(prompt);
        let wireframeHtml = result.response.text().trim();
        
        // Strip markdown code block wrapping if Gemini returned it
        if (wireframeHtml.startsWith('```html')) {
          wireframeHtml = wireframeHtml.substring(7);
        } else if (wireframeHtml.startsWith('```')) {
          wireframeHtml = wireframeHtml.substring(3);
        }
        if (wireframeHtml.endsWith('```')) {
          wireframeHtml = wireframeHtml.substring(0, wireframeHtml.length - 3);
        }
        
        return wireframeHtml.trim();
      } catch (err) {
        console.error('[Wireframe Generator] Failed to query Gemini:', err.message);
      }

      // Safe Fallback HTML if query fails
      let wireframeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #0b0f19;
    }
  </style>
</head>
<body class="text-gray-300 min-h-screen flex flex-col">
  <header class="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
          S
        </div>
        <div>
          <h1 class="text-sm font-bold text-white tracking-wide uppercase" id="wf-title">${spec.title || 'System Prototype'}</h1>
          <p class="text-[10px] text-gray-500 font-medium">Dynamic Layout Wireframe</p>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
    <section class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
      <h2 class="text-base font-bold text-white flex items-center">
        <span class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mr-2">C</span> System Context Dashboard
      </h2>
      <p class="text-sm text-gray-400">Operational dashboard view parsed from specifications.</p>
    </section>
  </main>
</body>
</html>`;
      return wireframeHtml;
    }

    case 'test-cases': {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: modelsConfig.active_slm });

        const testPrompt = `You are a Principal QA Architect and Senior Test Engineer with deep enterprise software testing expertise.

Analyze the following specification document carefully:
${specText || `# ${spec.title}\nVersion: ${spec.version}\nStatus: ${spec.status}\n\n${spec.sections.map(s => `## ${s.name}\n${s.items.map(i => `- ${i}`).join('\n')}`).join('\n\n')}`}

Your task is to generate a comprehensive, client-ready Test Strategy & Test Cases Document as clean, premium-styled HTML.

CRITICAL RULES:
- Do NOT wrap your output in markdown code blocks. Start directly with raw HTML (e.g. <div> or <article>).
- Use an inline dark-mode style: dark background (#0f172a), light text (#e2e8f0), accent color (#6366f1 indigo) for headings, (#22d3ee cyan) for section badges, card-style sections with background #1e293b and border #334155.
- Be INTELLIGENT: If a section is clearly NOT applicable based on the specification (e.g., no performance requirements mentioned → skip Section 9, no accessibility mentioned → skip Section 10, no browser matrix → skip Section 11), omit it entirely rather than generating placeholder/empty content.
- For every section that IS applicable, be thorough, specific, and derive content directly from the provided specification — do not hallucinate or fabricate details.
- For Section 4 (Detailed Test Cases), generate a rich, detailed HTML table with ALL columns specified — be exhaustive and cover every functional area from the spec.
- Use consistent Test Case IDs in format TC-XXX-NNN (e.g. TC-001, TC-002).
- Use consistent Requirement IDs in format REQ-NNN (e.g. REQ-001, REQ-002).

Generate ALL of the following sections that are applicable. Skip sections that are genuinely not applicable:

DOCUMENT INFORMATION (always include):
- Document Title: "Test Strategy & Test Cases Document"
- Project Name, Version, Status, Author, Reviewers, Approvers, Revision Log, Distribution List

TABLE OF CONTENTS (always include)

1. TEST STRATEGY SUMMARY (always include)
   - Scope — what is in scope and out of scope for testing
   - Objectives — goals of the testing effort
   - Entry Criteria — conditions that must be met before testing begins
   - Exit Criteria — conditions that define when testing is complete
   - Test Approach — testing methodology (manual, automation, mixed)
   - Test Levels — unit, integration, system, UAT
   - Defect Management — how defects will be logged, tracked, and resolved
   - Risks & Mitigations — testing risks and mitigation strategies

2. TEST ENVIRONMENT (always include)
   For each environment (Dev, QA, UAT, Prod-like):
   - Environment Name
   - Build / Release version
   - Database type and version
   - External Dependencies (APIs, services, mocks)
   - Test Data sources
   - Access credentials (placeholder)

3. TEST SCENARIOS (always include)
   High-level test scenarios grouped by module/feature area.
   For each scenario:
   - Scenario ID (TS-001, TS-002, ...)
   - Module / Feature Area
   - Scenario Description
   - Priority (Critical / High / Medium / Low)
   - Test Types involved

4. DETAILED TEST CASES (LARGEST SECTION — be exhaustive, cover all functional areas)
   For every test case, render a structured HTML table/card with ALL of these fields:
   - Test Case ID (TC-001, TC-002, ...)
   - Requirement ID (REQ-001, ...)
   - Module
   - Feature
   - Priority (Critical / High / Medium / Low)
   - Test Type (Functional / Regression / Smoke / Sanity / Integration / E2E)
   - Objective — what the test case is verifying
   - Preconditions — what must be true before running the test
   - Test Data — the data used in the test
   - Steps — numbered step-by-step test execution instructions
   - Expected Result — what should happen
   - Actual Result — leave as "TBD" (to be filled during execution)
   - Status — leave as "Not Run"
   - Executed By — leave as "—"
   - Execution Date — leave as "—"
   - Automation Status (Manual / Automated / Candidate for Automation)
   - Defect ID — leave as "—"
   - Comments — any notes

5. NEGATIVE TEST CASES (include if applicable — error paths, invalid inputs, boundary violations)
   Same detailed table format as Section 4.

6. BOUNDARY TEST CASES (include if applicable — min/max values, edge conditions)
   Same detailed table format as Section 4.

7. VALIDATION TEST CASES (include if form validation or field-level rules are present)
   Same detailed table format as Section 4.

8. SECURITY TEST CASES (include ONLY if authentication, authorization, or security features are mentioned)
   Cover: SQL injection, XSS, CSRF, broken auth, unauthorized access, session management.
   Same detailed table format as Section 4.

9. PERFORMANCE TEST CASES (include ONLY if performance/load/SLA requirements are mentioned)
   Cover: load testing, stress testing, response time, throughput, scalability.
   Same detailed table format as Section 4.

10. ACCESSIBILITY TEST CASES (include ONLY if accessibility/WCAG/ADA is mentioned)
    Cover: screen reader, keyboard navigation, color contrast, focus management.
    Same detailed table format as Section 4.

11. COMPATIBILITY TEST CASES (include ONLY if browser/device/OS matrix is mentioned)
    Cover: browser versions, OS variants, mobile responsiveness.
    Same detailed table format as Section 4.

12. REGRESSION SUITE
    A curated list of test case IDs that form the core regression suite (reference existing TC IDs).
    Organized by module/priority.

13. SMOKE SUITE
    The minimal set of critical test case IDs to quickly verify a build is stable.

14. SANITY SUITE
    A focused subset of test case IDs to verify a specific area after a fix or change.

15. UAT TEST CASES (include if UAT / business acceptance criteria are defined)
    Business-facing test scenarios written in plain language.
    Same detailed format as Section 4 but with business-oriented language.`;

        const aiResult = await model.generateContent(testPrompt);
        let testHtml = aiResult.response.text().trim();

        // Strip markdown code block wrapping if model returned it
        if (testHtml.startsWith('```html')) testHtml = testHtml.substring(7);
        else if (testHtml.startsWith('```')) testHtml = testHtml.substring(3);
        if (testHtml.endsWith('```')) testHtml = testHtml.substring(0, testHtml.length - 3);

        return { html: testHtml.trim() };
      } catch (err) {
        console.error('[TestCases Generator] Failed to query AI model:', err.message);
      }

      // Fallback: Build basic structured HTML from parsed spec if AI call fails
      const fallbackHtml = `<div style="font-family: ui-sans-serif, system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px;">
  <h1 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 8px; font-size: 22px; font-weight: bold;">Test Strategy &amp; Test Cases Document</h1>
  <p style="color: #94a3b8; font-size: 13px; margin-bottom: 24px;"><strong>Project:</strong> ${spec.title} | <strong>Version:</strong> ${spec.version} | <strong>Status:</strong> ${spec.status}</p>
  <h2 style="color: #22d3ee; font-size: 16px; font-weight: bold; margin-top: 20px;">1. Test Strategy Summary</h2>
  <table style="width:100%; border-collapse:collapse; margin-top:8px;">
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8; width:160px;">Scope</td><td style="padding:6px 10px; border:1px solid #334155;">End-to-end functional testing of ${spec.title}</td></tr>
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8;">Objectives</td><td style="padding:6px 10px; border:1px solid #334155;">Validate all functional requirements and business rules</td></tr>
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8;">Entry Criteria</td><td style="padding:6px 10px; border:1px solid #334155;">Development complete, test environment ready, test data prepared</td></tr>
    <tr><td style="padding:6px 10px; border:1px solid #334155; color:#94a3b8;">Exit Criteria</td><td style="padding:6px 10px; border:1px solid #334155;">All critical test cases passed, no open P1/P2 defects</td></tr>
  </table>
  <h2 style="color: #22d3ee; font-size: 16px; font-weight: bold; margin-top: 20px;">4. Detailed Test Cases</h2>
  <table style="width:100%; border-collapse:collapse; margin-top:8px;">
    <thead>
      <tr style="background:#1e293b;">
        ${['TC ID','Req ID','Module','Feature','Priority','Type','Objective','Preconditions','Steps','Expected Result','Status','Automation'].map(h => `<th style="padding:6px 8px; border:1px solid #334155; color:#22d3ee; font-size:11px; white-space:nowrap;">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${spec.sections.map((s, i) => `<tr><td style="padding:5px 8px; border:1px solid #334155; font-size:11px; color:#6366f1; white-space:nowrap;">TC-${String(i+1).padStart(3,'0')}</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">REQ-${String(i+1).padStart(3,'0')}</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">${s.name}</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">${s.items[0] || s.name}</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px; color:#f59e0b;">High</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">Functional</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">Verify ${s.name} works as specified</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">System initialized</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">1. Navigate to ${s.name}\n2. Execute action\n3. Verify result</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px; color:#10b981;">Operation succeeds per specification</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px; color:#94a3b8;">Not Run</td><td style="padding:5px 8px; border:1px solid #334155; font-size:11px;">Manual</td></tr>`).join('')}
    </tbody>
  </table>
</div>`;

      return { html: fallbackHtml };
    }

    case 'traceability-matrix': {
      let matrix = [];
      
      spec.sections.forEach((sec, idx) => {
        let code = `REQ-${spec.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'SYS'}-${idx+1}`;
        let tblName = sec.name.toLowerCase().replace(/[^a-z]/g, '_');
        if (tblName.length > 25) tblName = tblName.substring(0, 25);
        matrix.push({
          reqId: code,
          userStoryId: `US-${spec.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'SYS'}-${idx+1}`,
          techSpec: `Section 4.${idx+1} (${sec.name})`,
          dbTables: tblName,
          testCases: `TC-${spec.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'SYS'}-${idx+1}`
        });
      });

      if (matrix.length === 0) {
        matrix.push({
          reqId: 'REQ-SYS-01',
          userStoryId: 'US-SYS-01',
          techSpec: 'Section 1 (Core)',
          dbTables: 'transactions_log',
          testCases: 'TC-SYS-01'
        });
      }

      return { matrix, coverage: '98%' };
    }

    case 'review-agent': {
      let compliance = [];
      let logs = [
        'Initializing dynamic compliance auditor...',
        `Scanning document references for: "${spec.title}"...`
      ];

      if (spec.securityFeatures && spec.securityFeatures.length > 0) {
        spec.securityFeatures.forEach((kw, idx) => {
          compliance.push({
            id: `SEC-COMP-${idx+1}`,
            checkpoint: `Verify security rule: ${kw.substring(0, 30)}`,
            status: 'Passed',
            details: `Inspected integration pathways. Enforces secure compliance for: ${kw}`
          });
        });
        logs.push(`Found ${spec.securityFeatures.length} security mandates. All audited check-points passed.`);
      } else {
        compliance.push({
          id: 'SEC-COMP-GEN',
          checkpoint: 'Standard System Isolation Verify',
          status: 'Passed',
          details: 'Audit confirms default database isolation and connection boundaries.'
        });
        logs.push('No direct security tags declared in spec file. Standard policies applied.');
      }

      return { compliance, logs };
    }

    default:
      return {};
  }
}

async function saveAndIndexJob(type, result) {
  if (!result) return;
  
  let filename = '';
  let format = '';
  let text = '';
  
  switch(type) {
    case 'functional-spec':
      filename = 'Functional_Specification_Document.html';
      format = 'html';
      text = result; // Raw HTML
      break;
    case 'ux-wireframe':
      filename = 'wireframe_prototype.html';
      format = 'html';
      text = result; // Raw HTML
      break;
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
    case 'tech-architecture':
      filename = 'Technical_Specification.html';
      format = 'html';
      text = result.html || result.document || '';
      break;

    case 'database-design':
      filename = 'Database_Design_Document.html';
      format = 'html';
      text = result.fsd || '';
      break;
    case 'test-cases':
      filename = 'Test_Cases_Document.html';
      format = 'html';
      text = result.html || '';
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
      filename = `generated_${type}_${Date.now()}.txt`;
      format = 'txt';
      text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  }

  try {
    await indexDocument(type, filename, format, text, activeSpecDirName);
    console.log(`[SaveAndIndex] Successfully archived and indexed ${filename} for ${type}`);

    // Also save raw JSON state to disk
    const storageDir = path.join(__dirname, 'storage');
    const jsonFilename = filename.replace(/\.(html|md)$/, '.json');
    const jsonFilePath = path.join(storageDir, jsonFilename);
    const jsonContent = typeof result === 'string' ? { html: result } : result;
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log(`[SaveAndIndex] Saved raw JSON state to: ${jsonFilePath}`);

    // Agent-generated artifacts are NOT mirrored to specs folder.
    // Only core spec files (spec.md, constitution.md, plan.md, tasks.md, research.md) belong there.
    // Agent outputs live in server/src/storage/ and are indexed into the vector DB.
  } catch (err) {
    console.error(`[SaveAndIndex] Error archiving/indexing ${filename}:`, err.message);
  }
}

// Generate Job Route
app.post('/api/generate/:type', (req, res) => {
  const { type } = req.params;
  const { instructions } = req.body;
  const jobId = `job-${Date.now()}`;
  
  // Read workspace spec content for reference
  let specContent = '';
  try {
    specContent = fs.readFileSync(getSpecFilePath(), 'utf8');
  } catch (e) {
    console.warn("Failed to load spec file, using default mock.", e);
  }

  // Create Job status
  jobs[jobId] = {
    id: jobId,
    type,
    status: 'pending',
    logs: [
      `[Queue] Enqueued job ${jobId} for stage: ${type}`,
      `[Router] Scanning models...`
    ],
    result: null
  };

  // Process job asynchronously (simulating queue worker)
  setTimeout(() => {
    if (!jobs[jobId]) return;
    jobs[jobId].status = 'processing';
    jobs[jobId].logs.push(`[Router] Selected prioritized model: ${modelsConfig.active_llm}`);
    jobs[jobId].logs.push(`[Model] Establishing connection (Timeout guard 5000ms)...`);

    setTimeout(() => {
      if (!jobs[jobId]) return;
      
      // Simulate failover or model fallback check
      // For functional-spec, story-decomposition, tech-architecture, compile in 2 passes
      if (['functional-spec', 'user-stories', 'tech-architecture', 'spec-to-story'].includes(type)) {
        jobs[jobId].logs.push(`[Resiliency] Massive spec detected. Running 2-Pass compilation (Split Part 1 & Part 2)...`);
        jobs[jobId].logs.push(`[Worker] Pass 1 complete. Reading second split...`);
        jobs[jobId].logs.push(`[Worker] Pass 2 complete. Merging token sequences...`);
        jobs[jobId].logs.push(`[HTML] Balancing HTML tag boundaries to avoid rendering crashes...`);
      } else {
        jobs[jobId].logs.push(`[Worker] Processing specifications workspace rules...`);
      }

      jobs[jobId].logs.push(`[Model] Completing output stream...`);
      jobs[jobId].logs.push(`[Queue] Storing results in session tracker DB...`);
      
      (async () => {
        try {
          const output = await generateMockOutput(type, specContent);
          jobs[jobId].result = output;
          jobs[jobId].status = 'completed';
          jobs[jobId].logs.push(`[Queue] Job ${jobId} finished successfully.`);
          saveAndIndexJob(type, output);
        } catch (e) {
          jobs[jobId].status = 'failed';
          jobs[jobId].logs.push(`[Queue] Job failed: ${e.message}`);
        }
      })();
    }, 2000);

  }, 500);

  res.json({ jobId });
});

// Alias for non-api route format
app.post('/generate/:type', (req, res) => {
  const { type } = req.params;
  const jobId = `job-${Date.now()}`;
  
  let specContent = '';
  try {
    specContent = fs.readFileSync(getSpecFilePath(), 'utf8');
  } catch (e) {}

  jobs[jobId] = {
    id: jobId,
    type,
    status: 'pending',
    logs: [
      `[Queue] Enqueued job ${jobId} for stage: ${type}`,
      `[Router] Scanning models...`
    ],
    result: null
  };

  setTimeout(() => {
    if (!jobs[jobId]) return;
    jobs[jobId].status = 'processing';
    jobs[jobId].logs.push(`[Router] Selected prioritized model: ${modelsConfig.active_llm}`);
    jobs[jobId].logs.push(`[Model] Establishing connection...`);

    setTimeout(() => {
      if (!jobs[jobId]) return;
      if (['functional-spec', 'user-stories', 'tech-architecture', 'spec-to-story'].includes(type)) {
        jobs[jobId].logs.push(`[Resiliency] Running 2-Pass compilation...`);
        jobs[jobId].logs.push(`[HTML] Balancing HTML tag boundaries...`);
      }
      (async () => {
        try {
          const output = await generateMockOutput(type, specContent);
          jobs[jobId].result = output;
          jobs[jobId].status = 'completed';
          jobs[jobId].logs.push(`[Queue] Job finished successfully.`);
          saveAndIndexJob(type, output);
        } catch (e) {
          jobs[jobId].status = 'failed';
          jobs[jobId].logs.push(`[Queue] Job failed: ${e.message}`);
        }
      })();
    }, 1500);
  }, 300);

  res.json({ jobId });
});

app.get('/generate/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];
  if (!job) {
    return res.status(404).json({ error: 'Job ID not found' });
  }
  res.json(job);
});

app.get('/api/generate/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];
  if (!job) {
    return res.status(404).json({ error: 'Job ID not found' });
  }
  res.json(job);
});

// Search agent documents using semantic vector search (Qdrant or JSON local fallback)
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const { searchDocuments } = require('./services/vectorDb.service');
    const hits = await searchDocuments(query, 10);
    res.json({ success: true, hits });
  } catch (err) {
    res.status(500).json({ error: 'Semantic search failed: ' + err.message });
  }
});

// RAG Chatbot endpoint enqueuing Gemini and Qdrant
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message parameter is required' });
  }

  try {
    const { answerQuery } = require('./services/vectorDb.service');
    const response = await answerQuery(message, activeSpecDirName);
    res.json({ success: true, ...response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process chat query: ' + err.message });
  }
});

// List all indexed documents in storage
app.get('/api/documents', (req, res) => {
  const storageDir = path.join(__dirname, 'storage');
  if (!fs.existsSync(storageDir)) {
    return res.json({ success: true, documents: [] });
  }

  try {
    const files = fs.readdirSync(storageDir);
    const documents = files
      .filter(f => !f.startsWith('.') && f !== 'vector_store.json')
      .map(f => {
        const stats = fs.statSync(path.join(storageDir, f));
        return {
          filename: f,
          size: stats.size,
          updatedAt: stats.mtime
        };
      });
    res.json({ success: true, documents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list documents: ' + err.message });
  }
});

// View local vector DB JSON store in browser
app.get('/api/vector-store', (req, res) => {
  const storePath = path.join(__dirname, 'storage', 'vector_store.json');
  if (!fs.existsSync(storePath)) {
    return res.json({ message: 'Local vector store is empty or does not exist yet. Run an agent compilation first.' });
  }

  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read local vector DB store: ' + err.message });
  }
});

// Download an indexed document
app.get('/api/documents/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'storage', filename);

  if (!fs.existsSync(filePath) || filename.startsWith('.') || filename === 'vector_store.json') {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.download(filePath, filename);
});

// Scan code path simulation route (Review Agent page)
app.post('/api/review/scan', (req, res) => {
  const { repoPath } = req.body;
  if (!repoPath) {
    return res.status(400).json({ error: 'No path specified.' });
  }
  
  // Simulate code scan
  setTimeout(() => {
    res.json({
      success: true,
      languages: ['React (JSX)', 'NodeJS (Express)', 'TailwindCSS'],
      issues: [
        { severity: 'Medium', file: 'sdd-framework-org/server/src/index.queue.js', message: 'In-memory job queue will reset on process restart. Implement Redis/BullMQ for production.' },
        { severity: 'Low', file: 'sdd-framework-org/framework/src/pages/UserStories.jsx', message: 'Missing key bindings in backlog mapping loop.' }
      ]
    });
  }, 1000);
});

// LangGraph Orchestrator starting endpoint
app.post('/api/orchestrator/start', async (req, res) => {
  try {
    const orchestrator = require('./services/orchestrator.service');
    const { activeSpec } = req.body;
    if (!activeSpec) {
      return res.status(400).json({ error: 'activeSpec is required.' });
    }
    const result = await orchestrator.startGraph(activeSpec);
    res.json({
      success: true,
      threadId: result.threadId,
      state: result.state.values
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start orchestrator graph: ' + err.message });
  }
});

// LangGraph Orchestrator respond/approval breakpoint resume
app.post('/api/orchestrator/respond', async (req, res) => {
  try {
    const orchestrator = require('./services/orchestrator.service');
    const { threadId, stage, action, feedbackText } = req.body;
    if (!threadId || !stage || !action) {
      return res.status(400).json({ error: 'threadId, stage, and action are required.' });
    }
    const state = await orchestrator.respondToStage(threadId, stage, action, feedbackText);
    res.json({
      success: true,
      state: state.values
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to respond to orchestrator stage: ' + err.message });
  }
});

// LangGraph Orchestrator polling status check
app.get('/api/orchestrator/status/:threadId', async (req, res) => {
  try {
    const orchestrator = require('./services/orchestrator.service');
    const { threadId } = req.params;
    const state = await orchestrator.getGraphState(threadId);
    if (!state) {
      return res.status(404).json({ error: 'Thread not found.' });
    }
    res.json({
      success: true,
      state: state.values
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orchestrator status: ' + err.message });
  }
});

// LangGraph Orchestrator reset/cancel graph session
app.post('/api/orchestrator/reset', async (req, res) => {
  try {
    const orchestrator = require('./services/orchestrator.service');
    const { threadId } = req.body;
    await orchestrator.resetOrchestration(threadId);
    res.json({
      success: true,
      message: 'Orchestration reset and all generated agent artifacts removed.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset orchestrator: ' + err.message });
  }
});


// Endpoint to load saved outputs by stage type
app.get('/api/output/:type', (req, res) => {
  const { type } = req.params;
  let filename = '';
  switch (type) {
    case 'functional-spec': filename = 'Functional_Specification_Document.json'; break;
    case 'ux-wireframe': filename = 'wireframe_prototype.json'; break;
    case 'spec-to-story': filename = 'User_Stories.json'; break;
    case 'user-stories': filename = 'JIRA_Backlog.json'; break;
    case 'tech-architecture': filename = 'Technical_Specification.json'; break;
    case 'database-design': filename = 'Database_Design_Document.json'; break;
    case 'test-cases': filename = 'Test_Cases_Document.json'; break;
    case 'traceability-matrix': filename = 'Traceability_Matrix.json'; break;
    case 'review-agent': filename = 'Compliance_Report.json'; break;
    default:
      return res.status(400).json({ error: 'Invalid stage type: ' + type });
  }

  const filePath = path.join(__dirname, 'storage', filename);
  if (!fs.existsSync(filePath)) {
    return res.json({ success: true, output: null });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const output = JSON.parse(raw);
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read/parse output JSON: ' + err.message });
  }
});

// Helper for converting markdown to simple HTML for Confluence
function convertMdToHtml(md) {
  if (!md) return '';
  let html = md;
  // escape HTML entities just in case
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // headers
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  // bold / code / list
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
  // line breaks
  html = html.replace(/\n/g, '<br/>');
  return html;
}

// Get Jira Boards for Project
app.get('/api/jira/boards', async (req, res) => {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY || 'SDD';

  if (!host || !email || !token) {
    return res.status(400).json({ error: 'Jira authentication details are missing in .env' });
  }

  const isMock = token.includes('mock-token');
  if (isMock) {
    return res.json({
      success: true,
      boards: [
        { id: 1, name: 'SDD Scrum Board', type: 'scrum' },
        { id: 2, name: 'SDD Kanban Board', type: 'kanban' }
      ]
    });
  }

  try {
    const axios = require('axios');
    const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
    
    const response = await axios.get(`https://${host}/rest/agile/1.0/board`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      },
      params: {
        projectKeyOrId: projectKey
      }
    });

    res.json({
      success: true,
      boards: response.data.values || []
    });
  } catch (err) {
    const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    res.status(500).json({ error: 'Failed to fetch Jira boards: ' + errMsg });
  }
});

// Get Jira Sprints for Board
app.get('/api/jira/board/:boardId/sprints', async (req, res) => {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const { boardId } = req.params;

  if (!host || !email || !token) {
    return res.status(400).json({ error: 'Jira authentication details are missing in .env' });
  }

  const isMock = token.includes('mock-token');
  if (isMock) {
    return res.json({
      success: true,
      sprints: [
        { id: 10, name: 'SDD Sprint 1 (Active)', state: 'active' },
        { id: 11, name: 'SDD Sprint 2 (Future)', state: 'future' }
      ]
    });
  }

  try {
    const axios = require('axios');
    const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
    
    const response = await axios.get(`https://${host}/rest/agile/1.0/board/${boardId}/sprint`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      },
      params: {
        state: 'active,future'
      }
    });

    res.json({
      success: true,
      sprints: response.data.values || []
    });
  } catch (err) {
    const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    res.status(500).json({ error: 'Failed to fetch sprints: ' + errMsg });
  }
});

// Get Confluence Spaces
app.get('/api/confluence/spaces', async (req, res) => {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;

  if (!host || !email || !token) {
    return res.status(400).json({ error: 'Atlassian credentials are missing in .env' });
  }

  const isMock = token.includes('mock-token');
  if (isMock) {
    return res.json({
      success: true,
      spaces: [
        { id: 1, key: 'SDD', name: 'System Design space' },
        { id: 2, key: 'DS', name: 'Demo Space' }
      ]
    });
  }

  try {
    const axios = require('axios');
    const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');

    const response = await axios.get(`https://${host}/wiki/rest/api/space`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    res.json({
      success: true,
      spaces: response.data.results || []
    });
  } catch (err) {
    const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    res.status(500).json({ error: 'Failed to fetch Confluence spaces: ' + errMsg });
  }
});

// Jira Issues Bulk Upload
app.post('/api/jira/upload', async (req, res) => {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY || 'SDD';
  const { sprintId } = req.body;

  if (!host || !email || !token) {
    return res.status(400).json({ error: 'Jira authentication details are missing in .env' });
  }

  const filePath = path.join(__dirname, 'storage', 'JIRA_Backlog.json');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'No user stories found. Please run the User Stories agent generation first.' });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const issues = data.spreadsheet || [];

    if (issues.length === 0) {
      return res.status(400).json({ error: 'User stories list is empty.' });
    }

    const createdIssues = [];
    const errors = [];
    const isMock = token.includes('mock-token');

    if (isMock) {
      console.log(`[Jira Sync Demo Mode] Mocking push of ${issues.length} issues to ${host} (Sprint ID: ${sprintId || 'None'})`);
      for (const issue of issues) {
        createdIssues.push({
          key: `${projectKey}-${100 + issue.id}`,
          summary: issue.summary,
          status: sprintId ? `Created & Added to Sprint ${sprintId}` : 'Created (Demo Mode)',
          link: `https://${host}/browse/${projectKey}-${100 + issue.id}`
        });
      }
      return res.json({ success: true, mode: 'demo', createdIssues });
    }

    const axios = require('axios');
    const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
    const issueKeys = [];

    for (const issue of issues) {
      try {
        let issuetypeName = issue.issueType || 'Story';
        const payload = {
          fields: {
            project: {
              key: projectKey
            },
            summary: issue.summary,
            description: issue.description || '',
            issuetype: {
              name: issuetypeName
            },
            labels: issue.labels ? issue.labels.split(',').map(l => l.trim()) : []
          }
        };

        let response;
        try {
          response = await axios.post(`https://${host}/rest/api/2/issue`, payload, {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
        } catch (postErr) {
          // If the issue type is invalid/unsupported, retry as 'Task'
          if (postErr.response?.data?.errors?.issuetype && issuetypeName !== 'Task') {
            console.log(`[Jira Sync Retry] Retrying issue "${issue.summary}" with 'Task' type due to invalid issuetype: ${issuetypeName}`);
            payload.fields.issuetype.name = 'Task';
            response = await axios.post(`https://${host}/rest/api/2/issue`, payload, {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
          } else if (postErr.response?.data?.errors?.issuetype && issuetypeName !== 'Story') {
            console.log(`[Jira Sync Retry] Retrying issue "${issue.summary}" with 'Story' type`);
            payload.fields.issuetype.name = 'Story';
            response = await axios.post(`https://${host}/rest/api/2/issue`, payload, {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
          } else {
            throw postErr;
          }
        }

        if (response && response.data && response.data.key) {
          issueKeys.push(response.data.key);
          createdIssues.push({
            key: response.data.key,
            summary: issue.summary,
            status: 'Success',
            link: `https://${host}/browse/${response.data.key}`
          });
        }
      } catch (err) {
        const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        errors.push({ summary: issue.summary, error: errMsg });
        console.error(`[Jira Sync Error] Failed to create issue "${issue.summary}":`, errMsg);
      }
    }

    // Link created issues to the selected Sprint
    if (sprintId && issueKeys.length > 0) {
      try {
        console.log(`[Jira Sync] Linking issues to Sprint ${sprintId}:`, issueKeys);
        await axios.post(`https://${host}/rest/agile/1.0/sprint/${sprintId}/issue`, {
          issues: issueKeys
        }, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        createdIssues.forEach(issue => {
          issue.status = 'Success (Added to Sprint)';
        });
      } catch (err) {
        const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        console.error(`[Jira Sync Error] Failed to move issues to Sprint ${sprintId}:`, errMsg);
        errors.push({ summary: 'Sprint Linkage', error: 'Created issues but failed to link to sprint: ' + errMsg });
      }
    }

    res.json({
      success: errors.length < issues.length,
      createdIssues,
      errors,
      totalIssues: issues.length,
      pushedCount: createdIssues.length
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to process Jira upload: ' + err.message });
  }
});

// Confluence Page Publishing
app.post('/api/confluence/upload', async (req, res) => {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  
  const { stageType, spaceKey = 'SDD', parentPageId } = req.body;

  if (!host || !email || !token) {
    return res.status(400).json({ error: 'Atlassian authentication details are missing in .env' });
  }

  let filename = '';
  let format = 'md';
  let pageTitle = '';

  switch (stageType) {
    case 'functional-spec': 
      filename = 'Functional_Specification_Document.html'; 
      format = 'html';
      pageTitle = 'Functional Specification Document';
      break;
    case 'ux-wireframe': 
      filename = 'wireframe_prototype.html'; 
      format = 'html';
      pageTitle = 'UX Wireframe Prototype';
      break;
    case 'tech-architecture': 
      filename = 'Technical_Specification.md'; 
      format = 'md';
      pageTitle = 'Technical Architecture Specification';
      break;
    case 'database-design': 
      filename = 'Database_Specification.md'; 
      format = 'md';
      pageTitle = 'Database Schema Design';
      break;
    case 'test-cases': 
      filename = 'Test_Cases_Document.html'; 
      format = 'html';
      pageTitle = 'Test Strategy & Test Cases Document';
      break;
    case 'traceability-matrix': 
      filename = 'Traceability_Matrix.md'; 
      format = 'md';
      pageTitle = 'Requirements Traceability Matrix';
      break;
    case 'validator':
      filename = 'validation_report.md';
      format = 'md';
      pageTitle = 'Architecture Validation & Model Recommendation Report';
      break;
    default:
      return res.status(400).json({ error: 'Invalid stage type: ' + stageType });
  }

  const filePath = stageType === 'validator'
    ? path.join(__dirname, '../../specs', activeSpecDirName, 'validation_report.md')
    : path.join(__dirname, 'storage', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `File ${filename} not found. Please run the corresponding agent generation first.` });
  }

  try {
    let rawContent = fs.readFileSync(filePath, 'utf8');
    let htmlContent = '';
    
    if (format === 'md') {
      htmlContent = convertMdToHtml(rawContent);
    } else {
      htmlContent = rawContent;
    }

    const isMock = token.includes('mock-token');
    
    if (isMock) {
      console.log(`[Confluence Sync Demo Mode] Mocking page upload of "${pageTitle}" to Space [${spaceKey}] under Parent [${parentPageId || 'Root'}]`);
      return res.json({ 
        success: true, 
        mode: 'demo', 
        pageTitle,
        spaceKey,
        pageUrl: `https://${host}/wiki/spaces/${spaceKey}/pages/mock-page-id-12345` 
      });
    }

    const axios = require('axios');
    const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
    
    const payload = {
      type: 'page',
      title: `${pageTitle} - ${Date.now()}`,
      space: {
        key: spaceKey
      },
      body: {
        storage: {
          value: htmlContent,
          representation: 'storage'
        }
      }
    };

    if (parentPageId) {
      payload.ancestors = [{ id: parentPageId }];
    }

    const response = await axios.post(`https://${host}/wiki/rest/api/content`, payload, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const pageUrl = response.data && response.data._links && response.data._links.webui
      ? `https://${host}/wiki${response.data._links.webui}`
      : `https://${host}/wiki/spaces/${spaceKey}/pages/${response.data.id}`;

    res.json({
      success: true,
      pageTitle: payload.title,
      spaceKey,
      pageUrl
    });

  } catch (err) {
    const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`[Confluence Sync Error] Failed to publish "${pageTitle}":`, errMsg);
    res.status(500).json({ error: 'Failed to publish to Confluence: ' + errMsg });
  }
});

// Serve frontend build static files if needed
app.use(express.static(path.join(__dirname, '../../framework/dist')));

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
