/* ============================================================
   js/performance-predictor-form.js  —  Multi-step Form for Performance Prediction
   Collects student data and predicts exam performance using regression
   ============================================================ */

const currentUser = AuthService.getSession();
if (!currentUser) { 
  window.location.href = "login.html"; 
}

let currentStep = 1;
const totalSteps = 5;

// ─────────────────────────────────────────────────────────
//  Form data object
// ─────────────────────────────────────────────────────────
const formData = {
  semester: '',
  subject: '',
  previousMarks: 0,
  totalMarks: 0,
  notesMade: true,
  studyBefore: 20,
  studyLastDay: 4,
  interest: 3,
  assignment: 50,
  attendance: 70
};

// ─────────────────────────────────────────────────────────
//  Toggle Notes Yes/No
// ─────────────────────────────────────────────────────────
function toggleNotes(value) {
  formData.notesMade = value;
  document.getElementById('notesMade').value = value.toString();
  
  const buttons = document.querySelectorAll('.toggle-group button');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ─────────────────────────────────────────────────────────
//  Update range input display value
// ─────────────────────────────────────────────────────────
function updateRangeValue(input, displayId) {
  const value = input.value;
  const fieldName = input.id;
  
  // Update form data
  formData[fieldName] = parseFloat(value);
  
  // Update display
  let displayText = value;
  if (displayId === 'beforeValue' || displayId === 'lastDayValue') {
    displayText = value + 'h';
  } else if (displayId === 'interestValue') {
    displayText = value + '/5';
  } else if (displayId === 'assignmentValue' || displayId === 'attendanceValue') {
    displayText = value + '%';
  }
  
  document.getElementById(displayId).textContent = displayText;
}

// ─────────────────────────────────────────────────────────
//  Show specific step
// ─────────────────────────────────────────────────────────
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  
  // Show current step
  document.getElementById(`step${step}`).classList.add('active');
  
  // Update progress bar
  const progress = (step / totalSteps) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  
  // Update button visibility
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (step === 1) {
    prevBtn.style.display = 'none';
    nextBtn.textContent = 'Next →';
    nextBtn.onclick = nextStep;
  } else if (step === totalSteps) {
    prevBtn.style.display = 'block';
    nextBtn.textContent = 'Predict →';
    nextBtn.className = 'btn btn-predict';
    nextBtn.onclick = predictScore;
  } else {
    prevBtn.style.display = 'block';
    nextBtn.textContent = 'Next →';
    nextBtn.className = 'btn btn-next';
    nextBtn.onclick = nextStep;
  }
  
  currentStep = step;
}

// ─────────────────────────────────────────────────────────
//  Validate current step
// ─────────────────────────────────────────────────────────
function validateStep() {
  const errorElement = document.getElementById(`step${currentStep}Error`);
  
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  switch(currentStep) {
    case 1:
      if (!document.getElementById('semester').value) {
        showStepError('Please select a semester');
        return false;
      }
      formData.semester = document.getElementById('semester').value;
      break;
      
    case 2:
      if (!document.getElementById('subject').value.trim()) {
        showStepError('Please enter a subject name', 2);
        return false;
      }
      formData.subject = document.getElementById('subject').value.trim();
      break;
      
    case 3:
      const marks = parseFloat(document.getElementById('previousMarks').value);
      const total = parseFloat(document.getElementById('totalMarks').value);
      
      if (!marks || !total || marks < 0 || total <= 0 || marks > total) {
        showStepError('Please enter valid marks (Obtained must be 0 to Total)', 3);
        return false;
      }
      
      formData.previousMarks = marks;
      formData.totalMarks = total;
      break;
      
    case 4:
      formData.studyBefore = parseFloat(document.getElementById('studyBefore').value);
      formData.studyLastDay = parseFloat(document.getElementById('studyLastDay').value);
      formData.interest = parseFloat(document.getElementById('interest').value);
      break;
      
    case 5:
      formData.assignment = parseFloat(document.getElementById('assignment').value);
      formData.attendance = parseFloat(document.getElementById('attendance').value);
      break;
  }
  
  return true;
}

// ─────────────────────────────────────────────────────────
//  Show step error
// ─────────────────────────────────────────────────────────
function showStepError(message, step) {
  const errorElement = document.getElementById(`step${step}Error`);
  if (errorElement) {
    errorElement.textContent = '⚠️ ' + message;
    errorElement.style.display = 'block';
  }
}

// ─────────────────────────────────────────────────────────
//  Go to next step
// ─────────────────────────────────────────────────────────
function nextStep() {
  if (!validateStep()) {
    return;
  }
  
  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
}

// ─────────────────────────────────────────────────────────
//  Go to previous step
// ─────────────────────────────────────────────────────────
function previousStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

// ─────────────────────────────────────────────────────────
//  PREDICTION ALGORITHM - Multi-factor Weighted Model
// ─────────────────────────────────────────────────────────
function predictScore() {
  if (!validateStep()) {
    return;
  }

  // Extract previous exam percentage
  const prevPercentage = (formData.previousMarks / formData.totalMarks) * 100;
  
  // Normalize all inputs to 0-10 scale with weighted factors
  const factors = {
    // Previous performance (40% weight) - strong predictor
    previousPerf: (prevPercentage / 10),
    
    // Study hours (15% weight)
    studyHours: Math.min((formData.studyBefore / 100) * 10, 10),
    
    // Last day cramming (5% weight) - small boost
    lastDayBoost: Math.min((formData.studyLastDay / 24) * 10, 10) * 0.5,
    
    // Interest level (10% weight) - normalized from 1-5 to 0-10
    interestScore: (formData.interest / 5) * 10,
    
    // Assignment completion (15% weight)
    assignmentScore: (formData.assignment / 100) * 10,
    
    // Attendance (15% weight)
    attendanceScore: (formData.attendance / 100) * 10
  };

  // Calculate weighted score
  const predictedScore = (
    (factors.previousPerf * 0.40) +
    (factors.studyHours * 0.15) +
    (factors.lastDayBoost * 0.05) +
    (factors.interestScore * 0.10) +
    (factors.assignmentScore * 0.15) +
    (factors.attendanceScore * 0.15)
  );

  // Apply confidence boost/reduction based on factors
  let adjustedScore = predictedScore;
  
  // If attendance is low, reduce confidence
  if (formData.attendance < 60) {
    adjustedScore *= 0.95;
  }
  
  // If notes were made and interest is high, boost confidence
  if (formData.notesMade && formData.interest >= 4) {
    adjustedScore *= 1.05;
  }

  // Clamp to 0-10 scale
  adjustedScore = Math.max(0, Math.min(10, adjustedScore));

  // Display result
  displayResult(adjustedScore);
}

// ─────────────────────────────────────────────────────────
//  Display prediction result
// ─────────────────────────────────────────────────────────
function displayResult(score) {
  const resultBox = document.getElementById('resultBox');
  const resultScore = document.getElementById('resultScore');
  const resultText = document.getElementById('resultText');
  const resultMessage = document.getElementById('resultMessage');
  const buttonGroup = document.getElementById('buttonGroup');
  
  // Format score
  const formattedScore = score.toFixed(1);
  resultScore.textContent = formattedScore + ' / 10';

  // Determine performance category and message
  let message = '';
  let emoji = '🎯';
  
  if (score >= 8.5) {
    message = "Excellent! You're likely to score very well. Keep up your excellent preparation!";
    emoji = '🌟';
  } else if (score >= 7.5) {
    message = "Great! You're well-prepared. A little more focus could push you even higher!";
    emoji = '⭐';
  } else if (score >= 6.5) {
    message = "Good! You have a solid foundation. Consider improving your study hours.";
    emoji = '✨';
  } else if (score >= 5) {
    message = "Moderate. Increase your study time and focus more on the subject.";
    emoji = '💪';
  } else {
    message = "Below average. Significant improvement needed. Increase study time and attendance.";
    emoji = '⚠️';
  }

  resultText.innerHTML = emoji + ' ' + (score >= 8.5 ? 'Excellent' : score >= 7.5 ? 'Great' : score >= 6.5 ? 'Good' : score >= 5 ? 'Moderate' : 'Needs Work');
  resultMessage.textContent = message;

  // Save prediction to localStorage for history
  savePredictionHistory({
    semester: formData.semester,
    subject: formData.subject,
    predictedScore: score,
    timestamp: new Date().toISOString(),
    input: { ...formData }
  });

  // Hide form buttons and show result
  buttonGroup.style.display = 'none';
  resultBox.classList.add('show');
}

// ─────────────────────────────────────────────────────────
//  Save prediction history to localStorage
// ─────────────────────────────────────────────────────────
function savePredictionHistory(prediction) {
  try {
    const historyKey = 'edurate:predictions:' + currentUser.email;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    history.push(prediction);
    // Keep only last 20 predictions
    if (history.length > 20) history.shift();
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving prediction history:', e);
  }
}

// ─────────────────────────────────────────────────────────
//  Restart prediction form
// ─────────────────────────────────────────────────────────
function restartPrediction() {
  // Reset form
  document.getElementById('semester').value = '';
  document.getElementById('subject').value = '';
  document.getElementById('previousMarks').value = '';
  document.getElementById('totalMarks').value = '';
  document.getElementById('studyBefore').value = 20;
  document.getElementById('studyLastDay').value = 4;
  document.getElementById('interest').value = 3;
  document.getElementById('assignment').value = 50;
  document.getElementById('attendance').value = 70;
  
  updateRangeValue(document.getElementById('studyBefore'), 'beforeValue');
  updateRangeValue(document.getElementById('studyLastDay'), 'lastDayValue');
  updateRangeValue(document.getElementById('interest'), 'interestValue');
  updateRangeValue(document.getElementById('assignment'), 'assignmentValue');
  updateRangeValue(document.getElementById('attendance'), 'attendanceValue');
  
  // Hide result and show form
  document.getElementById('resultBox').classList.remove('show');
  document.getElementById('buttonGroup').style.display = 'flex';
  
  // Go back to step 1
  showStep(1);
}

// ─────────────────────────────────────────────────────────
//  Initialize on page load
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  showStep(1);
  
  // Initialize range displays
  updateRangeValue(document.getElementById('studyBefore'), 'beforeValue');
  updateRangeValue(document.getElementById('studyLastDay'), 'lastDayValue');
  updateRangeValue(document.getElementById('interest'), 'interestValue');
  updateRangeValue(document.getElementById('assignment'), 'assignmentValue');
  updateRangeValue(document.getElementById('attendance'), 'attendanceValue');
});
