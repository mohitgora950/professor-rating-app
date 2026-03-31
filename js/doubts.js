/* ============================================================
   js/doubts.js  —  Doubt system (max 2 per student per day)
   ============================================================ */

const DOUBTS_KEY = "edurate:doubts";

const DoubtService = {

  _load() {
    try { return JSON.parse(localStorage.getItem(DOUBTS_KEY)) || []; }
    catch { return []; }
  },
  _save(data) { localStorage.setItem(DOUBTS_KEY, JSON.stringify(data)); },

  /** Get all doubts */
  getAll() { return this._load(); },

  /** Get doubts assigned to a specific professor */
  getForProfessor(professorName) {
    const doubts = this._load();
    return doubts.filter(d => !d.answer && (d.teacherName === professorName || d.teacherName === "All Teachers"));
  },

  /** Get answered doubts by a professor */
  getAnsweredByProfessor(professorName) {
    const doubts = this._load();
    return doubts.filter(d => d.answer && d.answeredBy === professorName);
  },

  /** Count how many doubts a student has posted today */
  getTodayCount(studentEmail) {
    const today  = new Date().toDateString();
    const doubts = this._load();
    return doubts.filter(d => d.studentEmail === studentEmail && new Date(d.createdAt).toDateString() === today).length;
  },

  /** Post a new doubt with teacher assignment — returns { success, message, doubt } */
  post(studentName, studentEmail, questionText, teacherName) {
    const todayCount = this.getTodayCount(studentEmail);
    if (todayCount >= 2) {
      return { success: false, message: "❌ You have reached the limit of 2 doubts per day. Try again tomorrow!" };
    }

    const doubts = this._load();
    const doubt = {
      id:           Date.now(),
      studentName,
      studentEmail,
      question:     questionText,
      teacherName:  teacherName || "All Teachers",
      answer:       null,
      answeredBy:   null,
      answeredAt:   null,
      createdAt:    new Date().toISOString()
    };
    doubts.unshift(doubt);   // newest first
    this._save(doubts);
    
    // Add to history
    if (typeof DoubtHistoryService !== 'undefined') {
      DoubtHistoryService.addHistory(doubt.id, studentName, studentEmail, questionText, teacherName);
    }
    
    return { success: true, doubt };
  },

  /** Answer a doubt (professor only) */
  answer(doubtId, professorName, answerText) {
    const doubts = this._load();
    const idx = doubts.findIndex(d => d.id === doubtId);
    if (idx === -1) return false;
    doubts[idx].answer     = answerText;
    doubts[idx].answeredBy = professorName;
    doubts[idx].answeredAt = new Date().toISOString();
    this._save(doubts);
    
    // Mark as answered in history
    if (typeof DoubtHistoryService !== 'undefined') {
      DoubtHistoryService.markAnswered(doubtId);
    }
    
    return true;
  },

  /** Remaining doubts for today */
  getRemaining(studentEmail) {
    return Math.max(0, 2 - this.getTodayCount(studentEmail));
  }
};
