/**
 * storageService.js
 * Handles persistence of game state to localStorage.
 */

const STORAGE_KEY = 'di_v14';

/**
 * Save the current game state to localStorage.
 * @param {object} state - The game state object to persist.
 */
export function save(state) {
  try {
    const data = {
      pts: state.pts,
      streak: state.streak,
      freezes: state.freezes,
      tQ: state.tQ,
      sess: state.sess,
      favs: state.favs,
      isPremium: state.isPremium,
      weekVoted: state.weekVoted,
      wkYpct: state.wkYpct,
      wkNpct: state.wkNpct,
      wkTot: state.wkTot,
      wkVotesY: state.wkVotesY || 0,
      wkVotesN: state.wkVotesN || 0,
      apiKey: state.apiKey,
      lastSessionDate: state.lastSessionDate,
      lastPlayed: new Date().toDateString()
    };

    // Save per-player profiles (name, emoji, answer history)
    if (state.players && state.players.length) {
      data.playerProfiles = state.players.map(p => ({
        name: p.name,
        emoji: p.emoji,
        aV: p.aV || {
          couple: [],
          sexualite: [],
          morale: [],
          jalousie: [],
          argent: [],
          religion: []
        }
      }));
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[storageService] Failed to save state:', e);
  }
}

/**
 * Load the saved game state from localStorage.
 * @returns {object|null} The parsed state object, or null if nothing is saved.
 */
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    return data;
  } catch (e) {
    console.warn('[storageService] Failed to load state:', e);
    return null;
  }
}

/**
 * Apply loaded data onto the active game state object.
 * Restores all persisted fields without overwriting transient session data.
 * @param {object} state - The active game state to mutate.
 * @param {object} data - The data object returned by load().
 */
export function applyToState(state, data) {
  if (!data) return;

  if (data.pts != null) state.pts = data.pts;
  if (data.streak) state.streak = data.streak;
  if (data.freezes != null) state.freezes = data.freezes;
  if (data.tQ) state.tQ = data.tQ;
  if (data.sess) state.sess = data.sess;
  if (data.favs) state.favs = data.favs;
  if (data.isPremium) state.isPremium = data.isPremium;
  if (data.weekVoted) state.weekVoted = data.weekVoted;
  if (data.wkYpct) state.wkYpct = data.wkYpct;
  if (data.wkNpct) state.wkNpct = data.wkNpct;
  if (data.wkTot) state.wkTot = data.wkTot;
  if (data.wkVotesY) state.wkVotesY = data.wkVotesY;
  if (data.wkVotesN) state.wkVotesN = data.wkVotesN;
  if (data.apiKey) state.apiKey = data.apiKey;
  if (data.lastSessionDate) state.lastSessionDate = data.lastSessionDate;

  // Restore player profiles
  if (data.playerProfiles && state.players) {
    data.playerProfiles.forEach((profile, i) => {
      if (state.players[i]) {
        state.players[i].name = profile.name;
        state.players[i].emoji = profile.emoji;
        state.players[i].aV = profile.aV || {
          couple: [],
          sexualite: [],
          morale: [],
          jalousie: [],
          argent: [],
          religion: []
        };
      }
    });
  }
}

/**
 * Clear all saved state from localStorage.
 */
export function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[storageService] Failed to clear state:', e);
  }
}
