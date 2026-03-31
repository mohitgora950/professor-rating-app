/* ============================================================
   js/doubt-history.js  —  Doubt History & Teacher Assignment
   ============================================================ */

const DOUBT_HISTORY_KEY = "edurate:doubt_history";

const DoubtHistoryService = {

  _load() {
    try { return JSON.parse(localStorage.getItem(DOUBT_HISTORY_KEY)) || []; }
    catch { return []; }
  },
  _save(data) { localStorage.setItem(DOUBT_HISTORY_KEY, JSON.stringify(data)); },

  /** Get doubt history for a student */
  getStudentHistory(studentEmail) {
    const history = this._load();
    return history.filter(h => h.studentEmail === studentEmail).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /** Get all history */
  getAll() { return this._load(); },

  /** Add history entry when doubt is posted */
  addHistory(doubtId, studentName, studentEmail, question, teacherName) {
    const history = this._load();
    const entry = {
      id: Date.now(),
      doubtId,
      studentName,
      studentEmail,
      question,
      teacherName,
      createdAt: new Date().toISOString(),
      answered: false,
      answeredAt: null
    };
    history.unshift(entry);
    this._save(history);
  },

  /** Mark doubt as answered in history */
  markAnswered(doubtId) {
    const history = this._load();
    const entry = history.find(h => h.doubtId === doubtId);
    if (entry) {
      entry.answered = true;
      entry.answeredAt = new Date().toISOString();
      this._save(history);
    }
  }
};
