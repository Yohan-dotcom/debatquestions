/**
 * questionService.js
 * Handles question retrieval from the local bank and category management.
 */

import questions from '../data/questions.json';

// ── Constants ──

export const CATEGORY_EMOJIS = {
  couple: '💑',
  sexualite: '🌶️',
  morale: '⚖️',
  jalousie: '💚',
  argent: '💰',
  religion: '✨'
};

export const LOCKED_CATEGORIES = ['sexualite', 'religion'];

export const SESSION_LENGTH = 7;

export const CATEGORIES = Object.keys(CATEGORY_EMOJIS);

// ── Question Bank ──

export const questionBank = questions;

// ── Functions ──

/**
 * Get a random question from the local bank, avoiding recently shown ones.
 * @param {string} category - One of the valid categories.
 * @param {string[]} recent - Array of recently shown question texts.
 * @returns {object} A question object { q, type, choices?, discuss_starters?, story? }
 */
export function getQuestion(category, recent = []) {
  const pool = questionBank[category];
  if (!pool || pool.length === 0) {
    return { q: 'Aucune question disponible.', type: 'binary' };
  }

  // Filter out recently shown questions
  const fresh = pool.filter(q => recent.indexOf(q.q) < 0);
  const src = fresh.length ? fresh : pool;

  // Weighted random: prefer questions with stories for richer experience
  const withStory = src.filter(q => q.story);
  const useStoryPool = withStory.length >= 3 && Math.random() < 0.6;
  const finalPool = useStoryPool ? withStory : src;

  const qObj = finalPool[Math.floor(Math.random() * finalPool.length)];
  return qObj;
}

/**
 * Get a question from the Anthropic API.
 * Falls back to the local bank if the API call fails.
 * @param {string} apiKey - Anthropic API key.
 * @param {string} category - Question category.
 * @param {string[]} playerNames - Array of player names [p1, p2].
 * @param {string} intensity - Intensity level string.
 * @param {string[]} recent - Recently shown questions to avoid on fallback.
 * @returns {Promise<object>} A question object.
 */
export async function getQuestionFromAPI(apiKey, category, playerNames = [], intensity = 'intense', recent = []) {
  const categoryNames = {
    couple: 'couple',
    sexualite: 'sexualite',
    morale: 'morale',
    jalousie: 'jalousie',
    argent: 'argent',
    religion: 'religion'
  };

  const p1 = playerNames[0] || 'Joueur 1';
  const p2 = playerNames[1] || 'Joueur 2';

  const prompt = `Genere une question de debat originale en francais sur ${categoryNames[category] || category}. Les joueurs s'appellent ${p1} et ${p2}. Utilise leurs prenoms. Intensite : ${intensity}. Concrete, 1-2 phrases max. UNIQUEMENT la question.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      return {
        q: data.content[0].text.trim(),
        type: 'binary',
        story: null
      };
    }
  } catch (e) {
    // Fall through to local bank
  }

  // Fallback to local question bank
  return getQuestion(category, recent);
}
