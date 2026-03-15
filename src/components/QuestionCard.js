// ── QuestionCard.js ── Question card UI rendering
const ge = (id) => document.getElementById(id);

/**
 * Tags and heat labels indexed by question number (0-based).
 */
const TAGS = ["WARM UP", "CHAUFFE", "CHAUFFE", "EN FEU", "EN FEU", "\u{1F4A5} BOMBE", "VERDICT"];
const TAG_CLASSES = ["w", "w", "w", "f", "f", "b", "b"];
const HEATS = [
  "\u{1F321}\uFE0F\u{1F321}\uFE0F",
  "\u{1F321}\uFE0F\u{1F321}\uFE0F\u{1F321}\uFE0F",
  "\u{1F321}\uFE0F\u{1F321}\uFE0F\u{1F321}\uFE0F",
  "\u{1F525}\u{1F525}",
  "\u{1F525}\u{1F525}",
  "\u{1F525}\u{1F525}\u{1F525}",
  "\u{1F4A5}\u{1F4A5}\u{1F4A5}"
];

const WIDGET_LABELS = {
  binary: "Ta position",
  scale: "Ton niveau (1=non \u00B7 5=oui total)",
  choice: "Ta reponse",
  discuss: "Ta conclusion apres debat"
};

const DISCUSS_SPARKS = [
  "Commencez par : 'Pour moi la question c'est surtout...'",
  "Regle : 30 secondes chacun sans interruption, puis debat libre",
  "Surprenez le groupe avec une position inattendue",
  "Posez la question : 'Et si tu etais dans la situation inverse ?'",
  "Commencez par la personne la plus en desaccord avec les autres"
];

/**
 * Display a question inside the question card.
 * @param {Object} qObj - Question object with q, type, category fields
 * @param {Object} state - Application state (S)
 */
export function displayQuestion(qObj, state) {
  const qt = ge("qtext");
  if (!qt) return;

  qt.className = "qtext";
  qt.textContent = state.curQ;

  // Category badge
  const CE = state._CE || {};
  const cat = state.curCat;
  const badge = ge("qcbadge");
  if (badge) {
    badge.textContent = (CE[cat] || "") + " " + cat.toUpperCase();
  }

  // Heat tag
  const idx = state.sQ - 1;
  const tag = ge("qtag");
  if (tag) {
    tag.textContent = TAGS[idx] || "EN FEU";
    tag.className = "qtag " + (TAG_CLASSES[idx] || "f");
  }

  // Heat indicator
  const heatEl = ge("qheat");
  if (heatEl) {
    heatEl.textContent = HEATS[idx] || "\u{1F525}\u{1F525}\u{1F525}";
  }
}

/**
 * Render the answer widget (binary / scale / choice / discuss).
 * @param {Object|null} qObj - Question object
 * @param {string} [widgetId='ans-widget'] - DOM id of the widget container
 * @param {string} [labelId='ans-label'] - DOM id of the label element
 */
export function renderWidget(qObj, widgetId, labelId) {
  const wid = widgetId || "ans-widget";
  const lid = labelId || "ans-label";
  const w = ge(wid);
  const l = ge(lid);

  const defaultBinary = '<div class="binary-row">'
    + '<button class="abt oui" onclick="castVote(\'oui\',\'\u2705 Oui\')">\u2705 Oui</button>'
    + '<button class="abt non" onclick="castVote(\'non\',\'\u274C Non\')">\u274C Non</button>'
    + '</div>';

  if (!qObj || !w) {
    if (w) w.innerHTML = defaultBinary;
    return;
  }

  if (l) l.textContent = WIDGET_LABELS[qObj.type] || "Ta reponse";

  if (qObj.type === "binary") {
    w.innerHTML = defaultBinary;

  } else if (qObj.type === "scale") {
    let html = '<div class="scale-row">';
    for (let n = 1; n <= 5; n++) {
      html += '<button class="sbt" onclick="castVote(\'' + n + "','" + n + "/5')\">" + n + "</button>";
    }
    html += "</div>";
    w.innerHTML = html;

  } else if (qObj.type === "choice") {
    const choices = qObj.choices || [];
    let html = '<div class="choices">';
    for (let i = 0; i < choices.length; i++) {
      html += '<button class="choice-btn" onclick="castVoteIdx(' + i + ')">' + choices[i] + "</button>";
    }
    html += "</div>";
    w.innerHTML = html;

  } else if (qObj.type === "discuss" || qObj.type === "open") {
    const starters = qObj.discuss_starters || [];
    const spark = DISCUSS_SPARKS[Math.floor(Math.random() * DISCUSS_SPARKS.length)];
    let sHtml = "";
    if (starters.length) {
      sHtml = '<div class="discuss-box"><div class="discuss-title">Pour alimenter le debat :</div>';
      for (let si = 0; si < Math.min(starters.length, 3); si++) {
        sHtml += '<div class="discuss-item">' + starters[si] + "</div>";
      }
      sHtml += '<div class="discuss-spark">' + spark + "</div></div>";
    }
    w.innerHTML = sHtml
      + '<div class="discuss-conclude">Ta conclusion :</div>'
      + '<div class="discuss-votes">'
      + '<button class="dvb oui" onclick="castVote(\'oui\',\'\u2705 Oui\')">\u2705 Oui</button>'
      + '<button class="dvb mid" onclick="castVote(\'mid\',\'\u{1F937} Mitige\')">\u{1F937}</button>'
      + '<button class="dvb non" onclick="castVote(\'non\',\'\u274C Non\')">\u274C Non</button>'
      + "</div>";

  } else {
    w.innerHTML = defaultBinary;
  }
}

/**
 * Update the question card CSS class based on progress.
 * @param {number} questionNumber - Current question number (1-based)
 * @param {number} sessionLength - Total questions in session
 */
export function updateCardStyle(questionNumber, sessionLength) {
  const card = ge("qcard");
  if (!card) return;

  if (questionNumber === sessionLength - 1) {
    card.className = "qcard bomb";
  } else if (questionNumber >= Math.ceil(sessionLength * 0.6)) {
    card.className = "qcard hot";
    // Shake animation for hot questions
    setTimeout(() => {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 440);
    }, 80);
  } else {
    card.className = "qcard";
  }
}
