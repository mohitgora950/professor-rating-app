/* ============================================================
   js/perf-predictor.js  —  3-Step Performance Predictor
   Simple step-based form with weighted regression algorithm
   ============================================================ */

const currentUser = AuthService.getSession();
if (!currentUser) { 
  window.location.href = "login.html"; 
}

let currentStep = 1;
const totalSteps = 3;

// State object to hold all form data
const formState = {
  semester: '',
  subject: '',
  examType: '',
  notesMade: true,
  studyBefore: 0,
  studyLastDay: 0,
  interest: 3,
  previousMarks: 0,
  totalMarks: 0,
  assignment: 50,
  attendance: 70
};

// ─────────────────────────────────────────────────────────
//  Update display values for range inputs
// ─────────────────────────────────────────────────────────
function updateInterestDisplay() {
  const val = document.getElementById('interest').value;
  document.getElementById('interestValue').textContent = val + '/5';
  formState.interest = parseInt(val);
}

function updateAssignmentDisplay() {
  const val = document.getElementById('assignment').value;
  document.getElementById('assignmentValue').textContent = val + '%';
  formState.assignment = parseInt(val);
}

function updateAttendanceDisplay() {
  const val = document.getElementById('attendance').value;
  document.getElementById('attendanceValue').textContent = val + '%';
  formState.attendance = parseInt(val);
}

// ─────────────────────────────────────────────────────────
//  Toggle notes Yes/No
// ─────────────────────────────────────────────────────────
function toggleNotes(value) {
  formState.notesMade = value;
  document.getElementById('notesMade').value = value.toString();
  
  const buttons = document.querySelectorAll('#step3 .toggle-group button');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ─────────────────────────────────────────────────────────
//  Show error message
// ─────────────────────────────────────────────────────────
function showError(message) {
  const errorDiv = document.getElementById('errorMsg');
  errorDiv.textContent = '⚠️ ' + message;
  errorDiv.classList.add('show');
}

function hideError() {
  const errorDiv = document.getElementById('errorMsg');
  errorDiv.classList.remove('show');
}

// ─────────────────────────────────────────────────────────
//  Validate current step
// ─────────────────────────────────────────────────────────
function validateCurrentStep() {
  hideError();
  
  if (currentStep === 1) {
    const semester = document.getElementById('semesterSelect').value;
    if (!semester) {
      showError('Please select a semester');
      return false;
    }
    formState.semester = semester;
  } 
  else if (currentStep === 2) {
    const subject = document.getElementById('subjectInput').value.trim();
    if (!subject) {
      showError('Please enter a subject name');
      return false;
    }
    formState.subject = subject;
  } 
  else if (currentStep === 3) {
    // Validate exam type
    const examTypeVal = document.getElementById('examType').value;
    if (!examTypeVal) {
      showError('Please select a type of exam');
      return false;
    }
    formState.examType = examTypeVal;
    
    // Validate exam marks
    const prevMarks = parseFloat(document.getElementById('previousMarks').value) || 0;
    const totalMarks = parseFloat(document.getElementById('totalMarks').value) || 0;
    
    if (totalMarks === 0) {
      showError('Please enter total marks');
      return false;
    }
    
    if (prevMarks < 0 || prevMarks > totalMarks) {
      showError('Obtained marks must be between 0 and total marks');
      return false;
    }
    
    // Update form state from inputs
    formState.previousMarks = prevMarks;
    formState.totalMarks = totalMarks;
    formState.studyBefore = parseFloat(document.getElementById('studyBefore').value) || 0;
    formState.studyLastDay = parseFloat(document.getElementById('studyLastDay').value) || 0;
  }
  
  return true;
}

// ─────────────────────────────────────────────────────────
//  Show specific step
// ─────────────────────────────────────────────────────────
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.step-container').forEach(s => s.classList.remove('active'));
  
  // Show current step
  const stepElement = document.getElementById(`step${step}`);
  if (stepElement) {
    stepElement.classList.add('active');
  }
  
  // Update progress bar
  const progress = (step / totalSteps) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  
  // Update buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (step === 1) {
    prevBtn.style.display = 'none';
    nextBtn.textContent = 'Next →';
    nextBtn.className = 'btn btn-next';
    nextBtn.onclick = nextStep;
  } else if (step === totalSteps) {
    prevBtn.style.display = 'block';
    nextBtn.textContent = 'Get Prediction →';
    nextBtn.className = 'btn btn-predict';
    nextBtn.onclick = calculateAndShowResult;
  } else {
    prevBtn.style.display = 'block';
    nextBtn.textContent = 'Next →';
    nextBtn.className = 'btn btn-next';
    nextBtn.onclick = nextStep;
  }
  
  currentStep = step;
}

// ─────────────────────────────────────────────────────────
//  Move to next step
// ─────────────────────────────────────────────────────────
function nextStep() {
  if (!validateCurrentStep()) {
    return;
  }
  
  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
}

// ─────────────────────────────────────────────────────────
//  Move to previous step
// ─────────────────────────────────────────────────────────
function previousStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

// ─────────────────────────────────────────────────────────
//  PREDICTION ALGORITHM - Weighted Regression
// ─────────────────────────────────────────────────────────
function calculateAndShowResult() {
  if (!validateCurrentStep()) {
    return;
  }

  // Calculate previous performance percentage
  const prevPercentage = formState.totalMarks > 0 
    ? (formState.previousMarks / formState.totalMarks) * 100 
    : 0;

  // Normalize all factors to 0-10 scale with weights
  const factors = {
    // Previous performance (40% weight)
    previousPerf: (prevPercentage / 10),
    
    // Study hours before exam (15% weight)
    studyHours: Math.min((formState.studyBefore / 100) * 10, 10),
    
    // Last day cramming (5% weight)
    lastDayBoost: Math.min((formState.studyLastDay / 24) * 10, 10) * 0.5,
    
    // Interest level (10% weight)
    interestScore: (formState.interest / 5) * 10,
    
    // Assignment completion (15% weight)
    assignmentScore: (formState.assignment / 100) * 10,
    
    // Attendance (15% weight)
    attendanceScore: (formState.attendance / 100) * 10
  };

  // Calculate weighted score
  let predictedScore = (
    (factors.previousPerf * 0.40) +
    (factors.studyHours * 0.15) +
    (factors.lastDayBoost * 0.05) +
    (factors.interestScore * 0.10) +
    (factors.assignmentScore * 0.15) +
    (factors.attendanceScore * 0.15)
  );

  // Apply confidence adjustments
  if (formState.attendance < 60) {
    predictedScore *= 0.95;
  }
  
  if (formState.notesMade && formState.interest >= 4) {
    predictedScore *= 1.05;
  }

  // Clamp to 0-10 scale
  predictedScore = Math.max(0, Math.min(10, predictedScore));

  // Display result
  displayResult(predictedScore);
}

// ─────────────────────────────────────────────────────────
//  Display prediction result
// ─────────────────────────────────────────────────────────
function displayResult(score) {
  const resultDisplay = document.getElementById('resultDisplay');
  const resultScore = document.getElementById('resultScore');
  const resultCategory = document.getElementById('resultCategory');
  const resultMessage = document.getElementById('resultMessage');
  const buttonGroup = document.getElementById('buttonGroup');
  
  // Format score to 1 decimal place
  const formattedScore = score.toFixed(1);
  resultScore.textContent = formattedScore + ' / 10';

  // Determine category and message based on score
  let category = '';
  let message = '';
  let emoji = '🎯';
  
  if (score >= 8.5) {
    category = '🌟 Excellent';
    message = "Outstanding! You're exceptionally well-prepared. Keep up your excellent preparation!";
  } else if (score >= 7.5) {
    category = '⭐ Great';
    message = "Fantastic! You're well-prepared. A little more focus could push you even higher!";
  } else if (score >= 6.5) {
    category = '✨ Good';
    message = "Good! You have a solid foundation. Consider increasing your study hours.";
  } else if (score >= 5) {
    category = '💪 Moderate';
    message = "Moderate. Increase your study time and boost your engagement with the material.";
  } else {
    category = '⚠️ Needs Work';
    message = "Below average. Significant improvement needed. Focus on increasing study time and attendance.";
  }

  resultCategory.textContent = category;
  resultMessage.textContent = message;

  // Save prediction using PerfFormSystem
  if (typeof PerfFormSystem !== 'undefined') {
    const formDataToSave = {
      semester: formState.semester,
      subject: formState.subject,
      examType: formState.examType,
      notesMade: formState.notesMade,
      studyBefore: formState.studyBefore,
      studyLastDay: formState.studyLastDay,
      interest: formState.interest,
      previousMarks: formState.previousMarks,
      totalMarks: formState.totalMarks,
      assignment: formState.assignment,
      attendance: formState.attendance,
      predictedScore: score,
      timestamp: new Date().toISOString()
    };
    
    PerfFormSystem.addFormEntry(currentUser.email, formDataToSave);
  }

  // Hide form buttons and show result
  buttonGroup.style.display = 'none';
  resultDisplay.classList.add('show');
}

// ─────────────────────────────────────────────────────────
//  Save prediction to localStorage history
// ─────────────────────────────────────────────────────────
function savePredictionToHistory(prediction) {
  try {
    const historyKey = 'edurate:predictions:' + currentUser.email;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    history.push(prediction);
    
    // Keep only last 20 predictions
    if (history.length > 20) history.shift();
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving prediction:', e);
  }
}

// ─────────────────────────────────────────────────────────
//  Restart form
// ─────────────────────────────────────────────────────────
function restartForm() {
  // Reset form state
  formState.semester = '';
  formState.subject = '';
  formState.examType = '';
  formState.notesMade = true;
  formState.studyBefore = 0;
  formState.studyLastDay = 0;
  formState.interest = 3;
  formState.previousMarks = 0;
  formState.totalMarks = 0;
  formState.assignment = 50;
  formState.attendance = 70;

  // Reset form inputs
  document.getElementById('semesterSelect').value = '';
  document.getElementById('subjectInput').value = '';
  document.getElementById('examType').value = '';
  document.getElementById('notesMade').value = 'true';
  document.getElementById('studyBefore').value = '0';
  document.getElementById('studyLastDay').value = '0';
  document.getElementById('interest').value = '3';
  document.getElementById('previousMarks').value = '0';
  document.getElementById('totalMarks').value = '0';
  document.getElementById('assignment').value = '50';
  document.getElementById('attendance').value = '70';

  // Update displays
  updateInterestDisplay();
  updateAssignmentDisplay();
  updateAttendanceDisplay();

  // Reset toggle buttons
  document.querySelectorAll('#step3 .toggle-group button').forEach((btn, idx) => {
    btn.classList.remove('active');
    if (idx === 0) btn.classList.add('active');
  });

  // Hide result and show form
  document.getElementById('resultDisplay').classList.remove('show');
  document.getElementById('buttonGroup').style.display = 'flex';
  
  // Go back to step 1
  showStep(1);
}

// ─────────────────────────────────────────────────────────
//  Initialize on page load
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  showStep(1);
});
