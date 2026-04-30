/* ============================================================
   js/perf-form-system.js  —  Performance Form Data System
   Manages 3-step form storage and multi-variable regression
   Integrates with existing PerformancePredictor for combined analysis
   ============================================================ */

const PERF_FORM_KEY = "edurate:perfFormData";
const PERF_FORM_HISTORY_KEY = "edurate:perfFormHistory";

const PerfFormSystem = {

  /* ─────────────────────────────────────────────────────────
     FORM DATA STORAGE (per user, per subject/semester)
     ─────────────────────────────────────────────────────────── */

  /**
   * Get all form entries for a user
   */
  getAllEntries(studentEmail) {
    try {
      const data = JSON.parse(localStorage.getItem(PERF_FORM_KEY)) || {};
      return data[studentEmail] || [];
    } catch (e) {
      console.error("Error loading form entries:", e);
      return [];
    }
  },

  /**
   * Save all form entries for a user
   */
  _saveAllEntries(studentEmail, entries) {
    try {
      const data = JSON.parse(localStorage.getItem(PERF_FORM_KEY)) || {};
      data[studentEmail] = entries;
      localStorage.setItem(PERF_FORM_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving form entries:", e);
    }
  },

  /**
   * Get entries for a specific subject/semester
   */
  getEntriesForSubject(studentEmail, subject, semester) {
    const entries = this.getAllEntries(studentEmail);
    return entries.filter(e => 
      e.subject.toLowerCase() === subject.toLowerCase() &&
      e.semester === semester
    );
  },

  /**
   * Add a new form entry (ALWAYS APPEND, never replace)
   * Each submission creates a unique entry with its own timestamp
   */
  addFormEntry(studentEmail, formData) {
    const entries = this.getAllEntries(studentEmail);
    
    // Create new entry with unique timestamp and ID
    const entry = {
      semester: formData.semester,
      subject: formData.subject,
      examType: formData.examType || 'Other',
      notesMade: formData.notesMade || false,
      studyBefore: parseFloat(formData.studyBefore) || 0,
      studyLastDay: parseFloat(formData.studyLastDay) || 0,
      interest: parseInt(formData.interest) || 3,
      previousMarks: parseFloat(formData.previousMarks) || 0,
      totalMarks: parseFloat(formData.totalMarks) || 1,
      assignment: parseFloat(formData.assignment) || 50,
      attendance: parseFloat(formData.attendance) || 70,
      timestamp: new Date().toISOString(),
      predictedScore: formData.predictedScore || null,
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };

    // ALWAYS APPEND - never replace existing entries
    entries.push(entry);

    // Keep last 1000 entries (generous limit)
    if (entries.length > 1000) entries.shift();

    this._saveAllEntries(studentEmail, entries);
    return { success: true, message: "✅ Prediction saved!" };
  },

  /**
   * Calculate score based on form data using weighted formula
   */
  calculateScore(formData) {
    const prevPercentage = formData.totalMarks > 0 
      ? (formData.previousMarks / formData.totalMarks) * 100 
      : 0;

    const factors = {
      previousPerf: (prevPercentage / 10),
      studyHours: Math.min((formData.studyBefore / 100) * 10, 10),
      lastDayBoost: Math.min((formData.studyLastDay / 24) * 10, 10) * 0.5,
      interestScore: (formData.interest / 5) * 10,
      assignmentScore: (formData.assignment / 100) * 10,
      attendanceScore: (formData.attendance / 100) * 10
    };

    let score = (
      (factors.previousPerf * 0.40) +
      (factors.studyHours * 0.15) +
      (factors.lastDayBoost * 0.05) +
      (factors.interestScore * 0.10) +
      (factors.assignmentScore * 0.15) +
      (factors.attendanceScore * 0.15)
    );

    if (formData.attendance < 60) {
      score *= 0.95;
    }
    
    if (formData.notesMade && formData.interest >= 4) {
      score *= 1.05;
    }

    return Math.max(0, Math.min(10, score));
  },

  /* ─────────────────────────────────────────────────────────
     MULTI-VARIABLE REGRESSION
     Learns from historical form data to improve predictions
     ─────────────────────────────────────────────────────────── */

  /**
   * Multi-variable linear regression: y = w0 + w1*x1 + w2*x2 + ... + wn*xn
   * Using normal equation method
   */
  _multiVariableRegression(entries) {
    if (!entries || entries.length < 2) return null;

    const n = entries.length;
    
    // Features: [studyBefore, studyLastDay, interest, assignment, attendance, notesMade(0/1)]
    // Target: previousMarks percentage
    
    // Build X matrix (features) and y vector (target)
    const X = [];
    const y = [];
    
    entries.forEach(e => {
      X.push([
        e.studyBefore,
        e.studyLastDay,
        e.interest,
        e.assignment,
        e.attendance,
        e.notesMade ? 1 : 0
      ]);
      
      // Target: normalize marks to 0-100 scale
      const marksPercent = e.totalMarks > 0 
        ? (e.previousMarks / e.totalMarks) * 100 
        : 0;
      y.push(marksPercent);
    });

    // Add intercept column (column of 1s)
    const XWithIntercept = X.map(row => [1, ...row]);

    // Normal equation: w = (X^T * X)^-1 * X^T * y
    const XT = this._transpose(XWithIntercept);
    const XTX = this._matrixMultiply(XT, XWithIntercept);
    const XTy = this._matrixVectorMultiply(XT, y);
    
    const XTXInv = this._matrixInverse(XTX);
    if (!XTXInv) return null;
    
    const weights = this._matrixVectorMultiply(XTXInv, XTy);

    return {
      weights: weights,
      featureCount: 6,
      dataPoints: n
    };
  },

  /**
   * Predict using multi-variable regression model
   */
  _predictWithRegression(model, features) {
    if (!model || !features) return null;
    
    let prediction = model.weights[0]; // intercept
    for (let i = 0; i < features.length; i++) {
      prediction += model.weights[i + 1] * features[i];
    }
    
    // Normalize back to 0-10 scale
    return Math.max(0, Math.min(10, prediction / 10));
  },

  /**
   * Get prediction using regression on historical form data
   */
  predictWithRegressionModel(studentEmail, subject, semester) {
    const entries = this.getEntriesForSubject(studentEmail, subject, semester);
    
    if (entries.length < 2) {
      return {
        regressionScore: null,
        message: "Need at least 2 entries for regression",
        dataPoints: entries.length
      };
    }

    const model = this._multiVariableRegression(entries);
    if (!model) {
      return {
        regressionScore: null,
        message: "Could not build regression model",
        dataPoints: entries.length
      };
    }

    // Average features for prediction
    const avgFeatures = [
      entries.reduce((s, e) => s + e.studyBefore, 0) / entries.length,
      entries.reduce((s, e) => s + e.studyLastDay, 0) / entries.length,
      entries.reduce((s, e) => s + e.interest, 0) / entries.length,
      entries.reduce((s, e) => s + e.assignment, 0) / entries.length,
      entries.reduce((s, e) => s + e.attendance, 0) / entries.length,
      entries.filter(e => e.notesMade).length / entries.length > 0.5 ? 1 : 0
    ];

    const regressionScore = this._predictWithRegression(model, avgFeatures);
    
    return {
      regressionScore: Math.round(regressionScore * 10) / 10,
      message: "Predicted based on " + entries.length + " historical entries",
      dataPoints: entries.length,
      model: model,
      lastEntry: entries[entries.length - 1]
    };
  },

  /* ─────────────────────────────────────────────────────────
     MATRIX OPERATIONS (for regression)
     ─────────────────────────────────────────────────────────── */

  _transpose(matrix) {
    return matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx]));
  },

  _matrixMultiply(A, B) {
    const result = Array(A.length).fill(0).map(() => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < B[0].length; j++) {
        for (let k = 0; k < B.length; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return result;
  },

  _matrixVectorMultiply(matrix, vector) {
    return matrix.map(row => 
      row.reduce((sum, val, idx) => sum + val * vector[idx], 0)
    );
  },

  _matrixInverse(matrix) {
    const n = matrix.length;
    if (n !== matrix[0].length) return null;

    // Create augmented matrix [A | I]
    const aug = matrix.map((row, i) => [
      ...row,
      ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    ]);

    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

      // Check for singular matrix
      if (Math.abs(aug[i][i]) < 1e-10) return null;

      // Scale pivot row
      const pivot = aug[i][i];
      for (let j = 0; j < 2 * n; j++) {
        aug[i][j] /= pivot;
      }

      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aug[k][i];
          for (let j = 0; j < 2 * n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }
    }

    // Extract inverse matrix
    return aug.map(row => row.slice(n));
  },

  /* ─────────────────────────────────────────────────────────
     COMBINED PREDICTION
     Combines weighted formula + regression model
     ─────────────────────────────────────────────────────────── */

  getImprovedPrediction(studentEmail, formData) {
    // Calculate immediate weighted score
    const weightedScore = this.calculateScore(formData);

    // Get regression-based score if available
    const regressionResult = this.predictWithRegressionModel(
      studentEmail,
      formData.subject,
      formData.semester
    );

    // Combine predictions
    let finalScore = weightedScore;
    
    if (regressionResult.regressionScore !== null) {
      // If we have historical data, blend with regression
      // Weight recent performance more heavily (70% weighted, 30% regression)
      finalScore = (weightedScore * 0.7) + (regressionResult.regressionScore * 0.3);
    }

    // Round to 1 decimal
    finalScore = Math.round(finalScore * 10) / 10;

    // Determine category
    let category = '';
    let advice = '';
    
    if (finalScore >= 8.5) {
      category = '🌟 Excellent';
      advice = "Outstanding! You're exceptionally well-prepared. Keep up your excellent preparation!";
    } else if (finalScore >= 7.5) {
      category = '⭐ Great';
      advice = "Fantastic! You're well-prepared. A little more focus could push you even higher!";
    } else if (finalScore >= 6.5) {
      category = '✨ Good';
      advice = "Good! You have a solid foundation. Consider increasing your study hours.";
    } else if (finalScore >= 5) {
      category = '💪 Moderate';
      advice = "Moderate. Increase your study time and boost your engagement with the material.";
    } else {
      category = '⚠️ Needs Work';
      advice = "Below average. Significant improvement needed. Focus on increasing study time and attendance.";
    }

    return {
      finalScore: finalScore,
      category: category,
      advice: advice,
      components: {
        weightedScore: Math.round(weightedScore * 10) / 10,
        regressionScore: regressionResult.regressionScore,
        hasHistory: regressionResult.dataPoints >= 2
      },
      regressionData: regressionResult
    };
  }

};

// Auto-load when page loads
document.addEventListener("DOMContentLoaded", function() {
  // System is ready to use
  if (typeof console !== "undefined") {
    // console.log("PerfFormSystem loaded");
  }
});
