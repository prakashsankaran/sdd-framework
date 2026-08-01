const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const tokenTracker = require('./tokenTracker.service');

const TEXT_MODEL = 'gemini-3.1-flash-lite';

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Reverse-engineers a baseline v1 specification from attached brownfield context
 */
async function generateBaselineSpec(brownfieldContext, specName = 'legacy-baseline') {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: TEXT_MODEL });

    const snippetsText = (brownfieldContext.codeSnippets || [])
      .map(s => `--- FILE: ${s.fileName} ---\n${s.content}`)
      .join('\n\n');

    const schemaText = brownfieldContext.dbSchema || 'No SQL schema attached.';
    const docsText = (brownfieldContext.documents || [])
      .map(d => `--- DOC: ${d.title} ---\n${d.content}`)
      .join('\n\n');

    const guardrailsText = JSON.stringify(brownfieldContext.legacyGuardrails || {});

    const prompt = `You are a Senior Principal Software Architect and Reverse-Engineering Agent.
Analyze the following legacy codebase snippets, database DDL schema, and documentation context to construct a comprehensive Baseline Specification (v1) of the existing application.

INPUT CONTEXT:
Code Snippets:
${snippetsText || 'No code snippets provided.'}

Database DDL Schema:
${schemaText}

Legacy Documentation:
${docsText || 'No extra docs provided.'}

Guardrails & Tech Stack:
${guardrailsText}

REQUIREMENTS:
Generate a structured Markdown specification document ("Baseline Specification v1.0.0").
It must include:
1. Executive Summary & Existing System Scope.
2. Architecture Overview & Core Modules Discovered.
3. Inferred API Schemas & Endpoint Contracts (HTTP verb, path, request/response structures).
4. Data Models & Entity Relationships (Table DDL breakdown, columns, keys).
5. Identified Business Logic Rules & Constraints.
6. Legacy Tech Debt, Risk Areas, & Assumptions.

Return ONLY the markdown document.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const usage = result.response.usageMetadata || {};

    tokenTracker.recordUsage({
      model: TEXT_MODEL,
      agentName: 'CodeToSpec: Baseline Reverse Engineering',
      promptTokens: usage.promptTokenCount || 0,
      completionTokens: usage.candidatesTokenCount || 0,
      totalTokens: usage.totalTokenCount || 0,
      promptText: prompt,
      responseText: responseText
    });

    return {
      success: true,
      baselineSpec: responseText
    };
  } catch (err) {
    console.error('[CodeToSpec] Failed generating baseline spec:', err);
    throw err;
  }
}

/**
 * Merges auto-generated baseline spec with existing manual spec
 */
async function mergeBaselineWithManualSpec(baselineSpec, existingSpec) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: TEXT_MODEL });

    const prompt = `You are an Expert Specification Merger Agent.
Merge the auto-generated Code-to-Spec Baseline with the manually defined Specification into a single, unified "Current State Source of Truth Specification".

AUTO-GENERATED BASELINE SPEC (Reverse-Engineered Code Context):
${baselineSpec}

MANUALLY DEFINED SPECIFICATION (Human Intent & Requirements):
${existingSpec || 'No existing manual spec found.'}

REQUIREMENTS:
1. Retain all technical precision from the reverse-engineered baseline (API schemas, DB DDLs, file paths).
2. Retain all functional goals, user personas, and high-level requirements from the manual specification.
3. Resolve any conflicts by favoring explicit manual business requirements while preserving legacy technical constraints.
4. Add a "Unified Status" section at the top indicating this is the Phase 1 Baseline Source of Truth.

Return ONLY the final unified markdown specification.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const usage = result.response.usageMetadata || {};

    tokenTracker.recordUsage({
      model: TEXT_MODEL,
      agentName: 'CodeToSpec: Merge Baseline',
      promptTokens: usage.promptTokenCount || 0,
      completionTokens: usage.candidatesTokenCount || 0,
      totalTokens: usage.totalTokenCount || 0,
      promptText: prompt,
      responseText: responseText
    });

    return {
      success: true,
      mergedSpec: responseText
    };
  } catch (err) {
    console.error('[CodeToSpec] Failed merging specs:', err);
    throw err;
  }
}

module.exports = {
  generateBaselineSpec,
  mergeBaselineWithManualSpec
};
