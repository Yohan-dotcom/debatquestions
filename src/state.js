// State management for Debat Intense
// Extracted from the global S object in the monolithic app.

const STORAGE_KEY = 'debat_intense_state';

const CATEGORY_KEYS = ['couple', 'sexualite', 'morale', 'jalousie', 'argent', 'religion'];

function makeDefaults() {
  return {
    // Game state
    players: [],
    gameMode: 'classic',        // classic | group | truth_dare
    curCat: 'couple',
    curQ: null,
    curQObj: null,
    sQ: 0,                      // session question count
    tQ: 0,                      // total questions asked (lifetime)
    sV: [],                     // session votes
    sH: [],                     // session history
    aV: {
      couple: [],
      sexualite: [],
      morale: [],
      jalousie: [],
      argent: [],
      religion: []
    },
    pts: 0,
    streak: 0,
    freezes: 2,
    sess: 0,

    // Collections
    favs: [],
    recent: [],

    // Premium / monetisation
    isPremium: false,
    weekVoted: false,
    apiKey: '',

    // Multiplayer
    roomCode: null,
    hotSeat: 0,
    roundVotes: {},
    curVoterIdx: 0,
    pendingVote: null,

    // Story / live modes
    storyMode: false,
    storyUsed: false,
    liveUsed: false,

    // Personalisation filters
    perso: { age: 'tous', evt: 'soiree', int: 'moyenne' },

    // Weekly question data
    lastSessionDate: null,
    wkVotesY: 0,
    wkVotesN: 0,
    wkYpct: 0,
    wkNpct: 0,
    wkTot: 0
  };
}

const State = Object.assign(Object.create(null), makeDefaults());

// ── Persistence ────────────────────────────────────────────────

/**
 * Persist current state to localStorage.
 * Only serialisable properties are saved (functions are excluded automatically).
 */
State.save = function save() {
  try {
    const snapshot = {};
    const defaults = makeDefaults();
    for (const key of Object.keys(defaults)) {
      snapshot[key] = State[key];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('[State] save failed:', e);
  }
};

/**
 * Load persisted state from localStorage.
 * Missing keys are filled with defaults so the shape is always complete.
 */
State.load = function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const defaults = makeDefaults();
    for (const key of Object.keys(defaults)) {
      if (key in data) {
        State[key] = data[key];
      }
    }
  } catch (e) {
    console.warn('[State] load failed:', e);
  }
};

/**
 * Reset state to factory defaults and clear persisted copy.
 */
State.reset = function reset() {
  const defaults = makeDefaults();
  for (const key of Object.keys(defaults)) {
    State[key] = defaults[key];
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {
    // ignore
  }
};

// ── Points & streak ────────────────────────────────────────────

/**
 * Add points and bump the streak counter.  Negative values are clamped to 0.
 * @param {number} n - points to add
 */
State.addPts = function addPts(n) {
  State.pts = Math.max(0, State.pts + n);
  if (n > 0) {
    State.streak += 1;
  } else {
    State.streak = 0;
  }
};

// ── Getters ────────────────────────────────────────────────────

/** Current player count. */
State.getPlayerCount = function getPlayerCount() {
  return State.players.length;
};

/** Name of the player currently in the hot-seat. */
State.getCurrentPlayer = function getCurrentPlayer() {
  if (State.players.length === 0) return null;
  return State.players[State.hotSeat % State.players.length];
};

/** Advance hot-seat to the next player and return their name. */
State.nextPlayer = function nextPlayer() {
  if (State.players.length === 0) return null;
  State.hotSeat = (State.hotSeat + 1) % State.players.length;
  return State.getCurrentPlayer();
};

/** Total votes cast across all categories (lifetime). */
State.getTotalVotes = function getTotalVotes() {
  let total = 0;
  for (const key of CATEGORY_KEYS) {
    total += (State.aV[key] || []).length;
  }
  return total;
};

/** Whether any favourite questions have been saved. */
State.hasFavourites = function hasFavourites() {
  return State.favs.length > 0;
};

/** Return a plain-object snapshot of the current state (useful for debugging). */
State.snapshot = function snapshot() {
  const out = {};
  const defaults = makeDefaults();
  for (const key of Object.keys(defaults)) {
    out[key] = State[key];
  }
  return out;
};

export default State;
export { CATEGORY_KEYS, STORAGE_KEY };
