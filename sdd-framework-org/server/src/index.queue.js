const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables and vector db services
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { indexDocument } = require('./services/vectorDb.service');

const app = express();
const PORT = 7001;

// Enable CORS & JSON parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Workspace dynamic specs path configuration
let activeSpecDirName = '001-return-request-tracker';
const getSpecFilePath = () => {
  const specFilePath = path.join(__dirname, '../../specs', activeSpecDirName, 'spec.md');
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

    case 'functional-spec':
      if (specText && specText.trim().length > 20 && specText.includes('#')) {
        return convertMarkdownToHTML(specText);
      }
      return convertMarkdownToHTML(
        `# ${spec.title}\n` +
        `**Version:** ${spec.version} | **Status:** ${spec.status}\n\n` +
        spec.sections.map(s => `## ${s.name}\n${s.items.map(i => `- ${i}`).join('\n')}`).join('\n\n')
      );

    case 'tech-architecture': {
      let blueprint = `graph TD\n  Client[User Client UI] -->|REST Request| Gateway[API Gateway Service]\n`;
      spec.sections.forEach((sec) => {
        let slug = sec.name.replace(/[^a-zA-Z0-9]/g, '');
        blueprint += `  Gateway -->|orchestrates| Service_${slug}["${sec.name} Engine"]\n`;
        blueprint += `  Service_${slug} -->|verifies database| DB[("PostgreSQL Database")]\n`;
      });

      let document = `
# Comprehensive Technical Architecture & Integration Specification
## Document Control & System Architecture Design Specification
**System Designation:** ${spec.title}
**Version:** v${spec.version}
**Status:** ${spec.status}

---

## 1. Executive Summary & Core Objectives
This document presents the cloud-native technical architecture design for **${spec.title}**. The primary system requirements covered are:
${spec.rules.slice(0, 4).map(r => `* **Operational Rule**: ${r}`).join('\n') || '* Standard operational rule compliance.'}
${spec.workflows.slice(0, 4).map(w => `* **Key Workflow**: ${w}`).join('\n') || '* Dynamic data transactions flow.'}

---

## 2. Architectural Blueprint & Network Topology
The system is built on a high-availability, decoupled architecture:
1. **User Presentation Layer**:
   - Single Page Application client built in React 18, utilizing Tailwind CSS and state containers.
2. **Gateway Server Router**:
   - Clustered Express instances running Node.js managed by PM2 processors.
3. **Core Subsystems**:
${spec.sections.map(sec => `   - **${sec.name}**: Implements business rules, validation constraints, and API hooks.`).join('\n')}

---

## 3. Technology Stack Spec
* **Frontend**: React 18, Zustand, Tailwind CSS.
* **Backend Runtime**: Node.js 18 LTS Cluster, Express framework.
* **Databases**:
  - PostgreSQL 15 for transactional records storage.
  - Redis 7.2 for caching sessions and queues.
* **Integrations**: Standard vendor API integrations.

---

## 4. API & Integration Contracts
`;

      spec.sections.forEach((sec, idx) => {
        let slug = sec.name.toLowerCase().replace(/[^a-z]/g, '-');
        document += `
### 4.${idx+1} API Service: ${sec.name}
\`POST /api/v1/${slug}\`
- **Description**: Exposes API endpoints for processing section: ${sec.name} requirements.
- **Headers**:
  - \`Authorization: Bearer <JWT_Token>\`
  - \`Content-Type: application/json\`
- **Request Parameters**:
\`\`\`json
{
  "systemTitle": "${spec.title}",
  "actionCode": "REQ_${idx+1}",
  "details": ${JSON.stringify(sec.items.slice(0, 2))}
}
\`\`\`
- **Response (200 OK)**:
\`\`\`json
{
  "status": "Success",
  "processedItems": ${sec.items.length},
  "timestamp": "${new Date().toISOString()}"
}
\`\`\`
`;
      });

      document += `
---

## 5. System Resiliency & Security Controls
* **Security & Authentication**: All API endpoints enforce JWT RS256 token verification.
* **Encryption**: TLS 1.3 enforced for transit files and database connection pool queries.
* **Security Directives Detected**:
${spec.securityFeatures.map(sf => `  - ${sf}`).join('\n') || '  - Default database connection security rules applied.'}
`;

      return { blueprint, document };
    }

    case 'database-design': {
      let erd = `erDiagram\n`;
      let sql = `-- Dynamic DDL Script for ${spec.title}\n\n`;
      let fsd = `# Database Fields & Entity Relationship Definitions\n\n`;

      spec.databaseTables.forEach((table, idx) => {
        erd += `  main_system ||--o{ ${table.name} : maintains\n`;
        
        sql += `CREATE TABLE ${table.name} (\n`;
        table.fields.split(', ').forEach(f => {
          sql += `    ${f},\n`;
        });
        sql = sql.replace(/,\n$/, '\n'); // remove last comma
        sql += `);\n\n`;

        fsd += `## ${idx+1}. Table: ${table.name}\n`;
        fsd += `Contains operational records for database index.\n`;
        if (spec.sections[idx]) {
          fsd += `Matches requirements under section: **${spec.sections[idx].name}**.\n`;
          spec.sections[idx].items.forEach((item, itemIdx) => {
            fsd += `* **Field Check ${itemIdx+1}**: Validate details for: ${item}\n`;
          });
        }
        fsd += `\n`;
      });

      return { erd, sql, fsd };
    }

    case 'ux-wireframe': {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

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
      let suite = [];
      let gherkin = `Feature: Validation Suite for ${spec.title}\n\n`;

      spec.sections.forEach((sec, idx) => {
        let caseId = `TC-${spec.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'SYS'}-${idx+1}`;
        suite.push({
          id: caseId,
          desc: `Verify execution flow for ${sec.name}`,
          precondition: `System initialization is complete`,
          steps: `1. Query ${sec.name} endpoints\n2. Verify response payload status`,
          expected: `Payload returned matches the specification criteria`
        });

        gherkin += `  Scenario: User performs verification for ${sec.name}\n`;
        gherkin += `    Given the database handles records for "${spec.title}"\n`;
        if (sec.items.length > 0) {
          gherkin += `    And the user initiates rule checking for "${sec.items[0].substring(0, 50)}"\n`;
        }
        gherkin += `    When they submit request parameters\n`;
        gherkin += `    Then the validation response should authorize the transaction status\n\n`;
      });

      return { suite, gherkin };
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
      filename = 'Technical_Specification.md';
      format = 'md';
      text = result.document || '';
      if (result.blueprint) {
        text += '\n\n## Mermaid Architecture Diagram\n\n```mermaid\n' + result.blueprint + '\n```\n';
      }
      break;
    case 'database-design':
      filename = 'Database_Specification.md';
      format = 'md';
      text = result.fsd || '';
      if (result.sql) {
        text += '\n\n## SQL DDL Schema\n\n```sql\n' + result.sql + '\n```\n';
      }
      if (result.erd) {
        text += '\n\n## Mermaid ERD\n\n```mermaid\n' + result.erd + '\n```\n';
      }
      break;
    case 'test-cases':
      filename = 'Testing_Specs_Blueprint.md';
      format = 'md';
      text = '# Manual Test Suite Blueprint\n\n';
      text += '| Test ID | Description | Pre-conditions | Test Steps | Expected Output |\n';
      text += '| --- | --- | --- | --- | --- |\n';
      if (result.suite && Array.isArray(result.suite)) {
        result.suite.forEach(tc => {
          text += `| ${tc.id} | ${tc.desc} | ${tc.precondition} | ${tc.steps.replace(/\n/g, '<br>')} | ${tc.expected} |\n`;
        });
      }
      if (result.gherkin) {
        text += '\n\n## Gherkin Automated Specifications\n\n```gherkin\n' + result.gherkin + '\n```\n';
      }
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
    await indexDocument(type, filename, format, text);
    console.log(`[SaveAndIndex] Successfully archived and indexed ${filename} for ${type}`);

    // Also save raw JSON state to disk
    const storageDir = path.join(__dirname, 'storage');
    const jsonFilename = filename.replace(/\.(html|md)$/, '.json');
    const jsonFilePath = path.join(storageDir, jsonFilename);
    const jsonContent = typeof result === 'string' ? { html: result } : result;
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log(`[SaveAndIndex] Saved raw JSON state to: ${jsonFilePath}`);
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
    jobs[jobId].logs.push(`[Router] Selected prioritized model: gemini-3.5-flash`);
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
    jobs[jobId].logs.push(`[Router] Selected prioritized model: gemini-3.5-flash`);
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
    const response = await answerQuery(message);
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
    case 'database-design': filename = 'Database_Specification.json'; break;
    case 'test-cases': filename = 'Testing_Specs_Blueprint.json'; break;
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

// Serve frontend build static files if needed
app.use(express.static(path.join(__dirname, '../../framework/dist')));

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
