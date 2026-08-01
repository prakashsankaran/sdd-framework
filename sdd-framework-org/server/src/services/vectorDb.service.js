const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { getModelsConfig } = require('../config/modelsHelper');

const COLLECTION_NAME = 'agent_documents';
const EMBEDDING_MODEL = 'gemini-embedding-001';
const LOCAL_STORE_FILE = path.join(__dirname, '../storage/vector_store.json');

// Initialize clients
let qdrantClient = null;
let genAI = null;
let useLocalFallback = false; // Flag to switch to JSON file fallback if Qdrant is offline

function getQdrantClient() {
  if (!qdrantClient) {
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    const qdrantApiKey = process.env.QDRANT_API_KEY || undefined;
    qdrantClient = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
      checkCompatibility: false // Skip server version check to avoid connection delays
    });
  }
  return qdrantClient;
}

function getGenAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// Cosine Similarity Calculations for local fallback
function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(vecA, vecB) / (magA * magB);
}

/**
 * Ensures the Qdrant collection exists and is configured for 3072-dimensional Gemini embeddings.
 * Fallback to local store if Qdrant is offline.
 */
async function initQdrantCollection() {
  if (useLocalFallback) return;
  try {
    const client = getQdrantClient();
    const result = await client.getCollections();
    const exists = result.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      console.log(`[Qdrant] Collection '${COLLECTION_NAME}' does not exist. Creating it...`);
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 3072, // gemini-embedding-001 uses 3072 dimensions
          distance: 'Cosine'
        }
      });
      console.log(`[Qdrant] Collection '${COLLECTION_NAME}' created successfully.`);
    }
  } catch (err) {
    console.warn(`[Qdrant] Offline: Qdrant client failed to initialize (${err.message}). Activating local file-based vector store fallback.`);
    useLocalFallback = true;
  }
}

/**
 * Generates vector embeddings for a given text string using Gemini API.
 */
async function generateEmbedding(text) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    if (!result || !result.embedding || !result.embedding.values) {
      throw new Error('Invalid embedding response from Gemini API');
    }
    return result.embedding.values;
  } catch (err) {
    console.error('[Gemini API] Embedding generation failed:', err.message);
    throw err;
  }
}

/**
 * Chunks text content into smaller overlapping blocks to fit vector context windows.
 */
function chunkText(text, maxChars = 800, overlap = 150) {
  if (!text) return [];
  const chunks = [];
  let index = 0;
  
  while (index < text.length) {
    let end = index + maxChars;
    if (end > text.length) {
      end = text.length;
    } else {
      const nextSpace = text.indexOf(' ', end);
      if (nextSpace !== -1 && nextSpace - end < 50) {
        end = nextSpace;
      }
    }
    chunks.push(text.substring(index, end).trim());
    index = end - overlap;
    
    if (overlap >= maxChars || index >= text.length - overlap) {
      break;
    }
  }
  return chunks.filter(c => c.length > 10);
}

/**
 * Strips HTML tags to extract raw text content (helpful for indexing compiled specifications and HTML wireframes).
 */
function stripHtmlTags(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Local JSON vector store helpers
 */
function readLocalStore() {
  if (!fs.existsSync(LOCAL_STORE_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('[Local Store] Failed to read vector_store.json:', e.message);
    return [];
  }
}

function writeLocalStore(data) {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[Local Store] Failed to write vector_store.json:', e.message);
  }
}

/**
 * Archives a generated document to physical disk storage and indexes its chunks into Qdrant or Local Store.
 */
async function indexDocument(agentId, filename, format, rawContent, activeSpec) {
  try {
    // 1. Save document to backend disk storage
    const storageDir = path.join(__dirname, '../storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    let stringContent = typeof rawContent === 'object' ? JSON.stringify(rawContent, null, 2) : String(rawContent);
    const filePath = path.join(storageDir, filename);
    fs.writeFileSync(filePath, stringContent, 'utf8');
    console.log(`[Storage] Saved file to disk: ${filePath}`);

    // NOTE: Agent-generated artifacts are NOT mirrored to the specs workspace folder.
    // The specs folder contains only core spec documents (spec.md, constitution.md, plan.md, tasks.md, research.md).
    // Agent outputs live in server/src/storage/ and are indexed into the vector DB.

    // Check/Ensure database collection connection (switches useLocalFallback if offline)
    await initQdrantCollection();

    // 2. Prepare text content for embedding
    let textToEmbed = stringContent;
    if (format === 'html' || stringContent.trim().startsWith('<')) {
      textToEmbed = stripHtmlTags(stringContent);
    }

    const chunks = chunkText(textToEmbed);
    if (chunks.length === 0) {
      console.log(`[Indexer] No indexable text found for ${filename}. Skipping index.`);
      return { success: true, chunksCount: 0 };
    }

    console.log(`[Indexer] Generating embeddings and indexing ${chunks.length} chunks for ${filename}...`);
    const points = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = await generateEmbedding(chunk);
      const id = crypto.randomUUID();

      points.push({
        id,
        vector,
        payload: {
          activeSpec: activeSpec || '',
          agentId,
          filename,
          format,
          chunkIndex: i,
          text: chunk,
          createdAt: new Date().toISOString()
        }
      });
    }

    // 3. Index to Qdrant or Local JSON Fallback
    if (!useLocalFallback) {
      try {
        const client = getQdrantClient();
        await client.upsert(COLLECTION_NAME, {
          wait: true,
          points
        });
        console.log(`[Qdrant] Successfully indexed ${chunks.length} chunks for ${filename}.`);
      } catch (err) {
        console.warn(`[Qdrant] Indexing failed (${err.message}). Saving to local vector store JSON fallback instead.`);
        useLocalFallback = true;
      }
    }

    if (useLocalFallback) {
      const localStore = readLocalStore();
      
      // Filter out previous chunks of the same filename to avoid duplication on re-generations
      const cleanedStore = localStore.filter(point => point.payload.filename !== filename);
      cleanedStore.push(...points);
      writeLocalStore(cleanedStore);
      console.log(`[Local Store] Successfully indexed ${chunks.length} chunks for ${filename} to local vector_store.json.`);
    }

    return { success: true, chunksCount: chunks.length };
  } catch (err) {
    console.error(`[Indexer] Failed to index document ${filename}:`, err.message);
    throw err;
  }
}

/**
 * Searches the indexed agent documents in Qdrant or Local Store by query similarity.
 */
async function searchDocuments(queryText, limit = 5, activeSpec) {
  try {
    // Ensure connection is checked
    await initQdrantCollection();

    console.log(`[Indexer] Querying vector space for: "${queryText}" (Filtered by Spec: ${activeSpec || 'None'})`);
    const queryVector = await generateEmbedding(queryText);

    if (!useLocalFallback) {
      try {
        const client = getQdrantClient();
        const filter = activeSpec ? {
          must: [
            {
              key: 'activeSpec',
              match: {
                value: activeSpec
              }
            }
          ]
        } : undefined;

        const searchResult = await client.search(COLLECTION_NAME, {
          vector: queryVector,
          limit,
          filter,
          with_payload: true
        });

        return searchResult.map(hit => ({
          score: hit.score,
          id: hit.id,
          payload: hit.payload
        }));
      } catch (err) {
        console.warn(`[Qdrant] Search query failed (${err.message}). Falling back to local vector store JSON query.`);
        useLocalFallback = true;
      }
    }

    if (useLocalFallback) {
      console.log('[Local Store] Querying local vector_store.json using cosine similarity...');
      const localStore = readLocalStore();
      
      let hits = localStore.map(point => {
        const score = cosineSimilarity(queryVector, point.vector);
        return {
          score,
          id: point.id,
          payload: point.payload
        };
      });

      if (activeSpec) {
        hits = hits.filter(h => h.payload.activeSpec === activeSpec);
      }

      // Sort by score descending and return top matches
      return hits
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
  } catch (err) {
    console.error('[Indexer] Document search failed:', err.message);
    throw err;
  }
}

async function answerQuery(userMessage, activeSpec) {
  try {
    // 1. Search semantic matches (using limit = 10 to fetch full context scope)
    const hits = await searchDocuments(userMessage, 10, activeSpec);
    
    // 2. Format context for prompt
    let context = '';
    const citations = [];
    
    if (hits && hits.length > 0) {
      hits.forEach((hit) => {
        const isDuplicate = citations.some(c => c.filename === hit.payload.filename);
        if (!isDuplicate) {
          citations.push({
            filename: hit.payload.filename,
            agentId: hit.payload.agentId,
            score: hit.score
          });
        }
        
        context += `\n[Document: ${hit.payload.filename} (Agent: ${hit.payload.agentId})]\n${hit.payload.text}\n`;
      });
    }

    // 3. Build workspace summary from storage/ JSON artifacts (not from specs/ folder)
    let workspaceSummary = '';
    if (activeSpec) {
      try {
        const storageDir = path.join(__dirname, '../storage');
        const readStorageJSON = (fname) => {
          const p = path.join(storageDir, fname);
          return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
        };

        const userStoriesJson = readStorageJSON('User_Stories.json');
        const jiraBacklogJson = readStorageJSON('JIRA_Backlog.json');
        const userStoriesCount = userStoriesJson?.stories?.length || 0;
        const jiraBacklogCount = jiraBacklogJson?.spreadsheet?.length || 0;

        workspaceSummary = `Active Workspace: ${activeSpec}\n` +
          `- User Stories: ${userStoriesCount} stories\n` +
          `- JIRA Backlog Items: ${jiraBacklogCount} items\n`;

        if (userStoriesJson?.stories?.length > 0) {
          workspaceSummary += `\nUser Stories:\n`;
          userStoriesJson.stories.forEach(s => {
            workspaceSummary += `- ${s.id}: ${s.title}\n`;
          });
        }
        if (jiraBacklogJson?.spreadsheet?.length > 0) {
          workspaceSummary += `\nJIRA Backlog Items:\n`;
          jiraBacklogJson.spreadsheet.forEach(row => {
            workspaceSummary += `- ${row.summary} | ${row.issueType} | ${row.priority}\n`;
          });
        }
      } catch (err) {
        console.warn('[RAG Summary Builder] Failed to read storage files:', err.message);
      }
    }

    // 4. Construct system prompt
    const systemPrompt = `You are "SDD AI Assistant", a helpful coding and requirements agent for the TCS SDD Framework.
Your goal is to answer the user's question based on the provided system specification context and active workspace details.

Instructions:
1. Try to answer the question using the context. Be direct, clear, and write in a professional, human-friendly style.
2. Format your response using markdown bullets, lists, bold text, or tables where appropriate.
3. If the context does not contain enough information to answer the query, tell the user that the workspace specifications do not state the answer directly, but provide a helpful developer response anyway.
4. Keep the response concise.

Active Workspace Metadata:
${workspaceSummary || 'No metadata for active workspace.'}

Retrieved Workspace Context:
${context || 'No specification documents found in workspace vector database yet.'}

User Question: ${userMessage}

Human-Friendly Answer:`;

    // 5. Call Gemini 2.0 Flash for intelligent RAG-based answers
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: getModelsConfig().active_llm });
    const result = await model.generateContent(systemPrompt);
    const answerText = result.response.text();

    return {
      answer: answerText,
      citations
    };
  } catch (err) {
    console.error('[RAG Engine] Failed to generate answer:', err.message);
    throw err;
  }
}

/**
 * Indexes brownfield context items (code snippet, DB DDL, document, guardrail) into Qdrant or Local Store.
 */

async function indexBrownfieldItem(category, filename, content, activeSpec = '') {
  try {
    if (!content || !content.trim()) return { success: true, chunksCount: 0 };
    await initQdrantCollection();

    const chunks = chunkText(content);
    if (chunks.length === 0) return { success: true, chunksCount: 0 };

    console.log(`[Brownfield Indexer] Embedding ${chunks.length} chunks for [${category}] ${filename}...`);
    const points = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = await generateEmbedding(chunk);
      const id = crypto.randomUUID();

      points.push({
        id,
        vector,
        payload: {
          activeSpec: activeSpec || '',
          agentId: `brownfield-${category}`,
          filename,
          category,
          format: 'text',
          chunkIndex: i,
          text: chunk,
          createdAt: new Date().toISOString()
        }
      });
    }

    if (!useLocalFallback) {
      try {
        const client = getQdrantClient();
        await client.upsert(COLLECTION_NAME, { wait: true, points });
        console.log(`[Qdrant] Successfully indexed ${chunks.length} chunks for ${filename}.`);
      } catch (err) {
        console.warn(`[Qdrant] Indexing failed (${err.message}). Saving to local vector store JSON fallback instead.`);
        useLocalFallback = true;
      }
    }

    if (useLocalFallback) {
      const localStore = readLocalStore();
      const cleanedStore = localStore.filter(point => point.payload.filename !== filename);
      cleanedStore.push(...points);
      writeLocalStore(cleanedStore);
      console.log(`[Local Store] Successfully indexed ${chunks.length} chunks for ${filename} into vector_store.json.`);
    }

    return { success: true, chunksCount: chunks.length };
  } catch (err) {
    console.error(`[Brownfield Indexer] Failed indexing ${filename}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  initQdrantCollection,
  generateEmbedding,
  indexDocument,
  indexBrownfieldItem,
  searchDocuments,
  answerQuery,
  getGenAI
};


