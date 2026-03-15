/**
 * liveService.js
 * Handles live multiplayer room management (codes, sharing, QR).
 * Supabase real-time integration is a placeholder for future implementation.
 */

/**
 * Generate a random 4-character uppercase room code.
 * @returns {string} A room code like "AXRF".
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate and join a room by its code.
 * @param {string} code - The room code entered by the user.
 * @returns {{ success: boolean, code?: string, error?: string }}
 */
export function joinRoom(code) {
  const cleaned = (code || '').trim().toUpperCase();

  if (cleaned.length !== 4) {
    return { success: false, error: 'Code a 4 lettres' };
  }

  if (!/^[A-Z]{4}$/.test(cleaned)) {
    return { success: false, error: 'Le code doit contenir uniquement des lettres' };
  }

  // TODO: Supabase - verify room exists on the server
  return { success: true, code: cleaned };
}

/**
 * Copy the room code to the clipboard.
 * @param {string} code - The room code to copy.
 * @returns {Promise<boolean>} True if copy succeeded.
 */
export async function copyRoomCode(code) {
  if (!code) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (e) {
    // Clipboard API may fail in insecure contexts
    return false;
  }
}

/**
 * Share the room via WhatsApp.
 * @param {string} code - The room code.
 * @param {string} playerName - The name of the player sharing the room.
 */
export function shareRoom(code, playerName) {
  if (!code) return;

  const name = playerName || 'Quelqu\'un';
  const message = `⚔️ ${name} te defie sur Debat Intense ! Code : ${code} 🔥`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/**
 * Show a QR code modal for the room code.
 * Requires the QRCode library to be loaded on the page.
 * @param {string} code - The room code.
 * @param {object} [options] - DOM element IDs for the QR display.
 * @param {string} [options.valueEl] - ID of element to display the code text.
 * @param {string} [options.canvasEl] - ID of the canvas/container for the QR code.
 * @returns {boolean} True if QR code was generated successfully.
 */
export function showQR(code, options = {}) {
  if (!code) return false;

  const valueElId = options.valueEl || 'qr-code-val';
  const canvasElId = options.canvasEl || 'qr-canvas';

  const valueEl = document.getElementById(valueElId);
  if (valueEl) {
    valueEl.textContent = code;
  }

  if (typeof QRCode !== 'undefined') {
    const canvasEl = document.getElementById(canvasElId);
    if (canvasEl) {
      canvasEl.innerHTML = '';
      new QRCode(canvasEl, {
        text: 'DEBAT:' + code,
        width: 148,
        height: 148,
        colorDark: '#09080F',
        colorLight: '#FFFFFF'
      });
      return true;
    }
  }

  return false;
}

// ── Supabase Integration Placeholder ──
// Future: real-time room sync via Supabase Realtime channels
//
// export async function initSupabase(supabaseUrl, supabaseKey) { ... }
// export async function createRoom(code, hostPlayer) { ... }
// export async function syncQuestion(roomCode, questionObj) { ... }
// export function onRoomUpdate(roomCode, callback) { ... }
