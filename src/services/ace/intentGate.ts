/**
 * ace Lightweight Intent Gate
 * 
 * Classifies user copilot messages into three discrete operational intents:
 * - CASUAL: Greetings, small talk, jokes, acknowledgements, normal non-business conversation.
 *   -> Strict Constraint: Do NOT query HydraDB, do NOT inject account/deal context.
 * 
 * - COMMERCIAL: General sales strategy, pricing, negotiation tactics, concessions, Give-Get rules, objections.
 *   -> Strict Constraint: Query HydraDB only for general commercial/concession rules if relevant.
 * 
 * - CONTEXT_REQUIRED: Explicitly references an account, customer, stakeholder, deal, or commercial entity.
 *   -> Strict Constraint: Query HydraDB specifically for that entity and its graph relationships.
 */

import { HydraDBEngine } from '../hydradb/engine';

export type CopilotIntent = 'CASUAL' | 'COMMERCIAL' | 'CONTEXT_REQUIRED';

export interface IntentClassificationResult {
  intent: CopilotIntent;
  reason: string;
  extractedEntities: string[];
  targetQueryText?: string;
}

// Generic stakeholder roles for intent classification
const GENERIC_STAKEHOLDER_ROLES = [
  'cfo',
  'vp of engineering',
  'vp engineering',
  'cco',
  'chief commercial officer',
  'economic buyer',
  'technical champion',
  'procurement lead',
  'procurement',
  'ciso',
  'champion',
  'decision maker',
];

// Commercial / Sales Strategy keywords (without named entity references)
const COMMERCIAL_KEYWORDS = [
  'pricing',
  'price',
  'discount',
  'discounting',
  'margin',
  'gross margin',
  'margin floor',
  '78%',
  'concession',
  'give-get',
  'give get',
  'give/get',
  'negotiation',
  'negotiat',
  'renewal',
  'renew',
  'procurement',
  'closing strategy',
  'how to close',
  'objection',
  'objections',
  'talk track',
  'talk-track',
  'proposal',
  'quote',
  'tier',
  'battlecard',
  'revenue',
  'upsell',
  'cross-sell',
  'expansion',
  'churn',
  'multi-year',
  'multiyear',
  'upfront billing',
  'annual advance',
  'payment terms',
  'invoicing',
  'acv',
  'arr target',
  'elasticity',
  'dossier',
  'quota',
  'forecast',
  'gatekeeper',
  'budget freeze',
  'commercial policy',
  'contract clause',
  'sla guarantee',
];

// Explicit casual phrases and conversational markers
const CASUAL_EXACT_PHRASES = new Set([
  'hi', 'hey', 'hello', 'howdy', 'yo', 'sup', 'greetings', 'hola',
  'good morning', 'good afternoon', 'good evening', 'good day', 'good night',
  'how are you', 'how are you doing', 'how is it going', 'hows it going', 'how are things',
  'whats up', 'what is up', 'sup ace', 'hey ace', 'hello ace', 'hi ace',
  'who are you', 'what are you', 'what can you do', 'what do you do', 'help', 'help me',
  'thanks', 'thank you', 'thx', 'thank you very much', 'thanks a lot', 'appreciate it',
  'ok', 'okay', 'cool', 'awesome', 'great', 'nice', 'sounds good', 'understood', 'got it',
  'perfect', 'fine', 'sure', 'alright', 'all right',
  'bye', 'goodbye', 'see you', 'see ya', 'test', 'ping', 'are you there',
  'tell me a joke', 'tell a joke', 'make me laugh', 'who made you', 'how old are you',
]);

/**
 * Lightweight Intent Gate function
 */
export function classifyCopilotIntent(prompt: string): IntentClassificationResult {
  if (!prompt || !prompt.trim()) {
    return {
      intent: 'CASUAL',
      reason: 'Empty prompt defaults to casual intent',
      extractedEntities: [],
    };
  }

  const pLower = prompt.toLowerCase().trim();
  const clean = pLower.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

  // 1. Check for exact casual phrase match
  if (CASUAL_EXACT_PHRASES.has(clean)) {
    return {
      intent: 'CASUAL',
      reason: 'Matched explicit casual greeting / pleasantry phrase',
      extractedEntities: [],
    };
  }

  // 2. Check for explicit CONTEXT_REQUIRED entities
  const extractedEntities: string[] = [];

  // Check entities currently in HydraDB
  try {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = hydra.getGraphSnapshot();
    for (const node of snapshot.nodes || []) {
      const labelLower = (node.label || '').toLowerCase();
      if (labelLower && labelLower.length >= 3 && pLower.includes(labelLower)) {
        if (!extractedEntities.includes(labelLower)) {
          extractedEntities.push(labelLower);
        }
      }
      if (node.id && pLower.includes(node.id.toLowerCase())) {
        if (!extractedEntities.includes(node.id)) {
          extractedEntities.push(node.id);
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // Check generic stakeholder roles
  for (const role of GENERIC_STAKEHOLDER_ROLES) {
    if (pLower.includes(role)) {
      extractedEntities.push(role);
    }
  }

  // Check structural regex patterns indicating specific accounts/deals
  // e.g. "the [X] account", "contract with [X]", "deal for [X]", "[X] renewal"
  const accountPattern = /\b(?:account|customer|client|deal|renewal|contract|stakeholder|buyer)\s+(?:for|with|of|at|named)?\s*([a-zA-Z0-9_-]+)/i;
  const match = pLower.match(accountPattern);
  if (match && match[1]) {
    const candidate = match[1].toLowerCase();
    const stopWords = ['the', 'our', 'a', 'an', 'this', 'that', 'any', 'all', 'new', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'wants', 'needs', 'asking', 'says', 'will', 'to', 'in', 'on', 'for', 'about'];
    if (!stopWords.includes(candidate)) {
      if (!extractedEntities.includes(candidate)) {
        extractedEntities.push(candidate);
      }
    }
  }

  if (extractedEntities.length > 0) {
    return {
      intent: 'CONTEXT_REQUIRED',
      reason: `User explicitly referenced entities: ${extractedEntities.join(', ')}`,
      extractedEntities,
      targetQueryText: extractedEntities.join(' '),
    };
  }

  // 3. Check for general COMMERCIAL intent (sales, pricing, negotiation, concessions)
  const matchedCommercialTerms = COMMERCIAL_KEYWORDS.filter(term => pLower.includes(term));
  if (matchedCommercialTerms.length > 0) {
    return {
      intent: 'COMMERCIAL',
      reason: `Commercial inquiry matching terms: ${matchedCommercialTerms.slice(0, 3).join(', ')}`,
      extractedEntities: [],
      targetQueryText: matchedCommercialTerms.join(' '),
    };
  }

  // 4. Check for casual conversational questions / short phrases
  const words = clean.split(' ').filter(Boolean);
  if (
    words.length <= 3 ||
    clean.startsWith('what is') ||
    clean.startsWith('who is') ||
    clean.startsWith('can you') ||
    clean.startsWith('how do you') ||
    clean.startsWith('tell me')
  ) {
    // If it mentions no commercial terms or entities, classify as CASUAL
    return {
      intent: 'CASUAL',
      reason: 'General conversational query with no commercial or entity references',
      extractedEntities: [],
    };
  }

  // Default fallback for general inquiries without commercial keywords: CASUAL
  return {
    intent: 'CASUAL',
    reason: 'Non-commercial general interaction',
    extractedEntities: [],
  };
}
