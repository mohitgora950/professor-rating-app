/* ============================================================
   js/rating.js  —  Rating system logic
   Stores ratings in localStorage per professor
   ============================================================ */

const RATINGS_KEY = "edurate:ratings";
const GIFTS_KEY   = "edurate:gifts";

const RatingService = {

  /* ── Storage helpers ────────────────────────────────────── */
  _load() {
    try { return JSON.parse(localStorage.getItem(RATINGS_KEY)) || {}; }
    catch { return {}; }
  },
  _save(data) { localStorage.setItem(RATINGS_KEY, JSON.stringify(data)); },

  _loadGifts() {
    try { return JSON.parse(localStorage.getItem(GIFTS_KEY)) || []; }
    catch { return []; }
  },
  _saveGifts(data) { localStorage.setItem(GIFTS_KEY, JSON.stringify(data)); },

  /* ── Submit a rating ────────────────────────────────────── */
  submitRating(professorId, studentName, stars, feedbackText) {
    const data = this._load();
    if (!data[professorId]) data[professorId] = { ratings: [], feedback: [] };

    data[professorId].ratings.push({ studentName, stars, date: new Date().toLocaleDateString("en-IN") });
    if (feedbackText.trim()) {
      data[professorId].feedback.push({ studentName, text: feedbackText, stars, date: new Date().toLocaleDateString("en-IN") });
    }
    this._save(data);
  },

  /* ── Get computed average rating for a professor ─────────── */
  getAverageRating(professorId, baseRating, baseTotalRatings) {
    const data = this._load();
    const profData = data[professorId];
    if (!profData || !profData.ratings.length) return { avg: baseRating, total: baseTotalRatings };

    const allStars = profData.ratings.map(r => r.stars);
    const sumBase  = baseRating * baseTotalRatings;
    const sumNew   = allStars.reduce((a, b) => a + b, 0);
    const totalNew = baseTotalRatings + allStars.length;
    const avg      = Math.round(((sumBase + sumNew) / totalNew) * 10) / 10;
    return { avg: Math.min(avg, 5.0), total: totalNew };
  },

  /* ── Get feedback for a professor ────────────────────────── */
  getFeedback(professorId) {
    const data = this._load();
    return data[professorId]?.feedback || [];
  },

  /* ── Send gift ───────────────────────────────────────────── */
  sendGift(fromUser, toProfessorId, toProfessorName, amount) {
    const gifts = this._loadGifts();
    gifts.push({ from: fromUser, toId: toProfessorId, toName: toProfessorName, amount, date: new Date().toLocaleDateString("en-IN") });
    this._saveGifts(gifts);
  },

  /* ── Get total gift count ────────────────────────────────── */
  getTotalGifts() {
    return this._loadGifts().length;
  }
};

/* ── Star rating UI builder ─────────────────────────────── */
function buildStarInput(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  let selected = 0;

  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("span");
    s.className = "s";
    s.textContent = "★";
    s.dataset.val = i;

    s.addEventListener("mouseenter", () => {
      container.querySelectorAll(".s").forEach((el, idx) => {
        el.classList.toggle("on", idx < i);
      });
    });
    s.addEventListener("mouseleave", () => {
      container.querySelectorAll(".s").forEach((el, idx) => {
        el.classList.toggle("on", idx < selected);
      });
    });
    s.addEventListener("click", () => {
      selected = i;
      container.querySelectorAll(".s").forEach((el, idx) => {
        el.classList.toggle("on", idx < selected);
      });
      if (onChange) onChange(selected);
    });

    container.appendChild(s);
  }

  return { getSelected: () => selected };
}

/* ── Static star display ─────────────────────────────────── */
function renderStars(container, rating, size = 14) {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("span");
    s.textContent = "★";
    s.style.fontSize = size + "px";
    s.style.color = i <= Math.round(rating) ? "#FBBF24" : "#2a2a3a";
    if (i <= Math.round(rating)) {
      s.style.filter = "drop-shadow(0 0 3px rgba(251,191,36,0.4))";
    }
    container.appendChild(s);
  }
}
