/* ============================================================
   js/chatbot.js  —  Abusive word filter / chatbot guard
   Restricts students from using bad language in feedback & doubts
   ============================================================ */

const BAD_WORDS = [
  // Common abusive English words (kept mild for demo)
  "idiot","stupid","moron","dumb","fool","useless","trash","garbage",
  "hate","ugly","loser","worst","terrible","awful","horrible",
  "damn","hell","crap","shit","ass","bastard","bitch","jerk",
  "pathetic","incompetent","disgusting","retard","freak",
  // Hindi transliterations
  "gandu","madarchod","bhen*","sala","saala","haramkhor","bevakoof",
  "chutiya","bakwas","harami","gadha","kamina","bewakoof"
];

const ChatbotFilter = {

  /**
   * Check text for abusive content
   * @param {string} text
   * @returns {{ clean: boolean, word: string|null, sanitized: string }}
   */
  check(text) {
    const lower = text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ");
    const words = lower.split(/\s+/);
    for (const w of words) {
      if (BAD_WORDS.includes(w)) {
        return { clean: false, word: w, sanitized: text };
      }
    }
    // Also check for partial bad words (e.g. "stupidd")
    for (const bad of BAD_WORDS) {
      if (lower.includes(bad)) {
        return { clean: false, word: bad, sanitized: text };
      }
    }
    return { clean: true, word: null, sanitized: text };
  },

  /**
   * Returns a user-friendly warning message
   * @param {string} word - the detected word
   */
  getWarning(word) {
    return `⚠️ Please keep feedback respectful. Detected inappropriate language. This helps professors improve — constructive feedback is more effective!`;
  },

  /**
   * Validate feedback textarea in real-time
   * @param {string} text
   * @param {HTMLElement} warnEl - element to show/hide warning
   * @returns {boolean} isClean
   */
  validateInput(text, warnEl) {
    if (!text.trim()) {
      if (warnEl) warnEl.textContent = "";
      return true;
    }
    const result = this.check(text);
    if (!result.clean && warnEl) {
      warnEl.textContent = this.getWarning(result.word);
    } else if (warnEl) {
      warnEl.textContent = "";
    }
    return result.clean;
  }
};
