/* ============================================================
   js/performance-predictor.js  —  Student Performance Predictor
   with Linear & Weighted Regression Analysis
   Predicts next exam performance based on past scores + trend
   ============================================================ */

const PERF_HISTORY_KEY = "edurate:perfHistory";

const PerformancePredictor = {

  /* ─────────────────────────────────────────────────────────
     LINEAR REGRESSION ANALYSIS
     ─────────────────────────────────────────────────────────── */
  
  /* ── Simple Linear Regression (y = mx + b) ───────────── */
  _linearRegression(dataPoints) {
    if (!dataPoints || dataPoints.length < 2) return null;
    
    const n = dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    dataPoints.forEach(function(p, idx) {
      const x = idx + 1; // exam index (1, 2, 3, ...)
      const y = p.score;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });
    
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    
    return { slope: m, intercept: b, n: n };
  },

  /* ── Weighted Regression (recent exams have more weight) ─ */
  _weightedRegression(dataPoints) {
    if (!dataPoints || dataPoints.length < 2) return null;
    
    const n = dataPoints.length;
    let sumWX = 0, sumWY = 0, sumWXY = 0, sumWX2 = 0, sumW = 0;
    
    dataPoints.forEach(function(p, idx) {
      const x = idx + 1;
      const y = p.score;
      const weight = idx + 1; // Linear weight: recent exams weighted more
      
      sumW += weight;
      sumWX += weight * x;
      sumWY += weight * y;
      sumWXY += weight * x * y;
      sumWX2 += weight * x * x;
    });
    
    const denom = sumW * sumWX2 - sumWX * sumWX;
    if (denom === 0) return null;
    
    const m = (sumW * sumWXY - sumWX * sumWY) / denom;
    const b = (sumWY - m * sumWX) / sumW;
    
    return { slope: m, intercept: b, n: n };
  },

  /* ── Calculate R-squared (goodness of fit) ────────────── */
  _calculateRSquared(dataPoints, reg) {
    if (!reg || !dataPoints || dataPoints.length < 2) return 0;
    
    const avgY = dataPoints.reduce((sum, p) => sum + p.score, 0) / dataPoints.length;
    let ssRes = 0, ssTot = 0;
    
    dataPoints.forEach(function(p, idx) {
      const x = idx + 1;
      const yPred = reg.slope * x + reg.intercept;
      const yActual = p.score;
      
      ssRes += Math.pow(yActual - yPred, 2);
      ssTot += Math.pow(yActual - avgY, 2);
    });
    
    if (ssTot === 0) return 1;
    return 1 - (ssRes / ssTot);
  },

  /* ── Get next X prediction from regression ──────────── */
  _regressionPrediction(reg) {
    if (!reg) return null;
    const nextX = reg.n + 1;
    return reg.slope * nextX + reg.intercept;
  },

  /* ── Load student performance history ──────────────────── */
  _loadHistory(studentEmail) {
    try {
      const all = JSON.parse(localStorage.getItem(PERF_HISTORY_KEY)) || {};
      return all[studentEmail] || [];
    } catch (e) {
      return [];
    }
  },

  /* ── Save student performance history ──────────────────── */
  _saveHistory(studentEmail, history) {
    try {
      const all = JSON.parse(localStorage.getItem(PERF_HISTORY_KEY)) || {};
      all[studentEmail] = history;
      localStorage.setItem(PERF_HISTORY_KEY, JSON.stringify(all));
    } catch (e) {
      console.error("Error saving performance history:", e);
    }
  },

  /* ── Add exam score (0-10 scale) ──────────────────────── */
  /* ── Add exam score with variable max marks (e.g., 75/100, 18/25) ────────── */
  addExamScore(studentEmail, semesterName, marksObtained, marksTotal) {
    // Validate inputs
    if (!marksObtained || !marksTotal) {
      return { success: false, message: "❌ Enter both marks and max marks" };
    }
    
    const obtained = parseFloat(marksObtained);
    const total = parseFloat(marksTotal);
    
    if (obtained < 0 || total <= 0 || obtained > total) {
      return { success: false, message: "❌ Marks obtained must be 0-" + total };
    }
    
    // Normalize to 0-10 scale
    const normalizedScore = (obtained / total) * 10;
    
    const history = this._loadHistory(studentEmail);
    const existingIdx = history.findIndex(h => h.semesterName === semesterName);
    
    if (existingIdx !== -1) {
      history[existingIdx].marksObtained = obtained;
      history[existingIdx].marksTotal = total;
      history[existingIdx].score = Math.round(normalizedScore * 10) / 10;
      history[existingIdx].date = new Date().toISOString();
    } else {
      history.push({
        semesterName: semesterName,
        marksObtained: obtained,
        marksTotal: total,
        score: Math.round(normalizedScore * 10) / 10,
        date: new Date().toISOString()
      });
    }
    
    // Keep only last 10 semesters
    if (history.length > 10) history.shift();
    
    this._saveHistory(studentEmail, history);
    return { 
      success: true, 
      message: "✅ Score added successfully (" + obtained + "/" + total + " = " + Math.round(normalizedScore * 10) / 10 + "/10)"
    };
  },

  /* ── Get all exam scores for a student ──────────────── */
  getHistory(studentEmail) {
    return this._loadHistory(studentEmail);
  },

  /* ─────────────────────────────────────────────────────
     FAVORITE PROFESSOR MANAGEMENT
     ─────────────────────────────────────────────────────*/
  
  /* ── Get favorite professor for student ────────────── */
  getFavoriteProfessor(studentEmail) {
    try {
      const fav = JSON.parse(localStorage.getItem("edurate:favProf")) || {};
      return fav[studentEmail] || null;
    } catch (e) {
      return null;
    }
  },

  /* ── Set favorite professor ─────────────────────────── */
  setFavoriteProfessor(studentEmail, professorId, professorName) {
    try {
      const fav = JSON.parse(localStorage.getItem("edurate:favProf")) || {};
      if (!professorId) {
        delete fav[studentEmail];
      } else {
        fav[studentEmail] = { id: professorId, name: professorName, date: new Date().toISOString() };
      }
      localStorage.setItem("edurate:favProf", JSON.stringify(fav));
      return true;
    } catch (e) {
      return false;
    }
  },

  /* ── Remove favorite professor ──────────────────────── */
  removeFavoriteProfessor(studentEmail) {
    return this.setFavoriteProfessor(studentEmail, null);
  },

  /* ── Calculate average of last N exams ────────────────── */
  getAverageScore(studentEmail, last = 5) {
    const history = this._loadHistory(studentEmail);
    if (!history.length) return 0;
    
    const recentScores = history.slice(-last);
    const sum = recentScores.reduce((a, b) => a + b.score, 0);
    return Math.round(sum / recentScores.length * 10) / 10;
  },

  /* ── Calculate trend (improving/declining) ────────────── */
  calculateTrend(studentEmail) {
    const history = this._loadHistory(studentEmail);
    if (history.length < 2) return 0;
    
    const scores = history.map(h => h.score);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Trend adjustment: +0.5 per point improvement, -0.3 per point decline
    return (avg2 - avg1) > 0 
      ? Math.min((avg2 - avg1) * 0.5, 1.0)  // max +1 point boost
      : (avg2 - avg1) * 0.3;                 // decline penalty
  },

  /* ── Get average professor rating (quality indicator) ────┬─ */
  getProfessorQualityBonus(studentName) {
    if (typeof RatingService === 'undefined' || typeof PROFESSORS_DATA === 'undefined') {
      return 0;
    }
    
    // Get average rating of all professors this student has rated
    const ratings = JSON.parse(localStorage.getItem("edurate:ratings")) || {};
    const ratedProfIds = Object.keys(ratings).map(id => parseInt(id));
    
    if (!ratedProfIds.length) return 0;
    
    const profRatings = ratedProfIds
      .map(pid => {
        const prof = PROFESSORS_DATA.find(p => p.id === pid);
        return prof ? prof.rating : 0;
      })
      .filter(r => r > 0);
    
    if (!profRatings.length) return 0;
    
    // If studied with high-quality professors, small bonus
    const avgProffQuality = profRatings.reduce((a, b) => a + b, 0) / profRatings.length;
    return (avgProffQuality - 3.5) * 0.2; // max +0.3 bonus for 5-star professors
  },

  /* ── MAIN: Predict next exam performance (0-10) WITH REGRESSION ────────── */
  predictNextPerformance(studentEmail, studentName) {
    const history = this._loadHistory(studentEmail);
    
    // Not enough data
    if (!history.length) {
      return {
        prediction: null,
        message: "📚 Add exam scores to get a prediction!",
        dataPoints: 0,
        confidence: 0,
        breakdown: null,
        regression: null
      };
    }
    
    // Minimum 2 exams for regression
    if (history.length < 2) {
      return {
        prediction: null,
        message: "📚 Add at least 2 exam scores for better prediction!",
        dataPoints: history.length,
        confidence: 0,
        breakdown: null,
        regression: null
      };
    }
    
    // Get components for traditional method
    const averageScore = this.getAverageScore(studentEmail, 5);
    const trend = this.calculateTrend(studentEmail);
    const qualityBonus = this.getProfessorQualityBonus(studentName);
    
    // REGRESSION ANALYSIS
    const simpleReg = this._linearRegression(history);
    const weightedReg = this._weightedRegression(history);
    const rSquaredSimple = this._calculateRSquared(history, simpleReg);
    const rSquaredWeighted = this._calculateRSquared(history, weightedReg);
    
    // Use weighted regression if better fit, else simple
    const reg = rSquaredWeighted >= rSquaredSimple ? weightedReg : simpleReg;
    const rSquared = rSquaredWeighted >= rSquaredSimple ? rSquaredWeighted : rSquaredSimple;
    
    // Get regression prediction
    const regressionPrediction = this._regressionPrediction(reg);
    
    // Combine methods: 60% regression + 25% traditional average + 15% quality bonus
    const combinedPrediction = 
      (regressionPrediction * 0.6) + (averageScore * 0.25) + (qualityBonus * 10 * 0.15);
    
    // Add small random variance
    const variance = (Math.random() - 0.5) * 0.4;
    let prediction = Math.round((combinedPrediction + variance) * 10) / 10;
    
    // Clamp to 0-10
    prediction = Math.max(0, Math.min(10, prediction));
    
    // Confidence based on number of data points and R-squared
    const dataConfidence = Math.min(70, 25 + (history.length * 8));
    const regressionConfidence = Math.round(rSquared * 100);
    let confidence = Math.round((dataConfidence * 0.6 + regressionConfidence * 0.4));
    confidence = Math.min(95, Math.max(30, confidence)); // Clamp 30-95
    
    // Message
    let message = "";
    if (prediction >= 8) message = "🌟 Excellent performance expected!";
    else if (prediction >= 7) message = "😊 Good performance expected!";
    else if (prediction >= 6) message = "📈 Average performance expected";
    else if (prediction >= 5) message = "⚠️  Below average. Need improvement!";
    else message = "🆘 Critical! Extra study needed.";
    
    return {
      prediction: prediction,
      message: message,
      dataPoints: history.length,
      confidence: confidence,
      breakdown: {
        pastAverage: averageScore,
        trend: trend,
        qualityBonus: qualityBonus,
        lastScore: history[history.length - 1].score,
        lastSemester: history[history.length - 1].semesterName
      },
      regression: {
        regressionPrediction: Math.round(regressionPrediction * 10) / 10,
        slope: Math.round(reg.slope * 100) / 100,
        intercept: Math.round(reg.intercept * 10) / 10,
        rSquared: Math.round(rSquared * 1000) / 1000,
        rSquaredPercent: Math.round(rSquared * 100),
        modelType: rSquaredWeighted >= rSquaredSimple ? "Weighted Regression" : "Simple Linear Regression",
        dataPointsForReg: history.length
      }
    };
  },

  /* ── Get prediction with recommendations and regression analysis ────── */
  getPredictionWithRecommendations(studentEmail, studentName) {
    const prediction = this.predictNextPerformance(studentEmail, studentName);
    
    if (!prediction.prediction) {
      return prediction;
    }
    
    const recommendations = [];
    
    // Traditional trend recommendations
    if (prediction.breakdown.trend < -0.3) {
      recommendations.push("📉 Your scores are declining. Consider extra study sessions!");
    }
    if (prediction.breakdown.trend > 0.5) {
      recommendations.push("📈 Great! Your performance is improving. Keep it up!");
    }
    
    // Regression-based recommendations
    if (prediction.regression) {
      const reg = prediction.regression;
      
      // If regression shows improving trend (positive slope)
      if (reg.slope > 0.1) {
        recommendations.push("📊 Regression shows positive trend! Your efforts are paying off.");
      } else if (reg.slope < -0.1) {
        recommendations.push("📊 Regression indicates declining performance. Review your study plan.");
      }
      
      // R-squared interpretation
      if (reg.rSquaredPercent >= 80) {
        recommendations.push("✨ Strong pattern detected! Prediction is highly reliable.");
      } else if (reg.rSquaredPercent >= 50) {
        recommendations.push("📈 Moderate pattern detected. Prediction is reasonably reliable.");
      } else if (reg.rSquaredPercent < 30) {
        recommendations.push("⚠️  Prediction has high variability. Keep adding more exam scores.");
      }
    }
    
    // Performance-based recommendations
    if (prediction.prediction < 5) {
      recommendations.push("🎯 Focus on weak areas. Seek help from professors!");
    }
    if (prediction.prediction >= 8) {
      recommendations.push("🚀 You're on track for excellent results!");
    }
    if (!prediction.breakdown.qualityBonus || prediction.breakdown.qualityBonus < 0) {
      recommendations.push("👨‍🏫 Rate professors to improve your study quality estimate!");
    }
    
    return {
      ...prediction,
      recommendations: recommendations.length ? recommendations : ["✅ You're doing well! Continue your current study approach."]
    };
  }

};
