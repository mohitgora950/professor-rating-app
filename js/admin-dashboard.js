/* ============================================================
   js/admin-dashboard.js  —  Admin Dashboard Controller
   ============================================================ */

// API Base URL for v1 endpoints - Use absolute URL
const API_v1_BASE = 'http://localhost:3000/api';

// Check authentication
const currentUser = AuthService.getSession();
if (!currentUser || currentUser.role !== 'admin') {
  window.location.href = 'login.html';
}

// State
let allTeachers = [];
let allTeachersFiltered = [];
let emailHistory = [];
let currentView = 'overview';

// Helper
function $id(id) { return document.getElementById(id); }
function $query(selector) { return document.querySelector(selector); }
function $queryAll(selector) { return document.querySelectorAll(selector); }

/* ────────────────────────────────────────────────────────── */
/* INITIALIZATION */
/* ────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  // Set user info
  $id('navName').textContent = currentUser.name;

  // Setup sidebar menu
  $queryAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const view = this.dataset.view;
      switchView(view);
    });
  });

  // Setup logout
  $id('logoutBtn').addEventListener('click', function() {
    AuthService.logout();
    window.location.href = 'login.html';
  });

  // Setup email buttons
  $id('sendBulkBtn').addEventListener('click', sendBulkEmails);
  $id('sendIndividualBtn').addEventListener('click', sendIndividualEmail);

  // Load initial data
  loadAllTeachers();
  loadTopPerformers();
  loadOverviewStats();
});

/* ────────────────────────────────────────────────────────── */
/* VIEW SWITCHING */
/* ────────────────────────────────────────────────────────── */

function switchView(viewName) {
  currentView = viewName;

  // Update active button
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

  // Hide all sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const sectionId = `${viewName}-view`;
  const section = $id(sectionId);
  if (section) {
    section.classList.add('active');
    
    // Trigger view specific loading if needed
    if (viewName === 'all-teachers') {
      setupTeacherFilters();
    } else if (viewName === 'analytics') {
      loadAnalytics();
    }
  }
}

/* ────────────────────────────────────────────────────────── */
/* LOAD ALL TEACHERS */
/* ────────────────────────────────────────────────────────── */

async function loadAllTeachers() {
  try {
    const response = await fetch(`${API_v1_BASE}/admin/all-teachers`, {
      headers: AuthService.getHeaders()
    });

    const data = await response.json();
    allTeachers = data;
    allTeachersFiltered = [...data];

    renderAllTeachers();
    populateTeacherSelect();
  } catch (error) {
    console.error('Error loading teachers:', error);
    toast('Failed to load teachers');
  }
}

function renderAllTeachers() {
  const tbody = $id('allTeachersBody');
  if (allTeachersFiltered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No teachers found</td></tr>';
    return;
  }

  tbody.innerHTML = allTeachersFiltered.map(prof => `
    <tr>
      <td>${prof.name}</td>
      <td>${prof.email}</td>
      <td><span class="badge badge-dept">${prof.dept}</span></td>
      <td>${prof.subject || 'N/A'}</td>
      <td><span class="rating-badge">${parseFloat(prof.average_rating || 0).toFixed(1)} ⭐</span></td>
      <td>${prof.total_ratings || 0}</td>
      <td>${prof.doubts_answered || 0}</td>
      <td>
        <button class="action-btn btn-send" onclick="sendEmailToTeacher(${prof.id}, '${prof.name}')">📧 Email</button>
        <button class="action-btn btn-view" onclick="viewTeacherDetails(${prof.id})">👁️ View</button>
      </td>
    </tr>
  `).join('');
}

function setupTeacherFilters() {
  const searchInput = $id('searchTeacher');
  const deptFilter = $id('departmentFilter');
  const sortBy = $id('sortBy');

  searchInput?.addEventListener('input', applyFilters);
  deptFilter?.addEventListener('change', applyFilters);
  sortBy?.addEventListener('change', applyFilters);
}

function applyFilters() {
  let filtered = [...allTeachers];

  // Search filter
  const search = $id('searchTeacher')?.value.toLowerCase() || '';
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.email.toLowerCase().includes(search)
    );
  }

  // Department filter
  const dept = $id('departmentFilter')?.value || '';
  if (dept) {
    filtered = filtered.filter(p => p.dept === dept);
  }

  // Sort
  const sort = $id('sortBy')?.value || 'rating-desc';
  switch(sort) {
    case 'rating-asc':
      filtered.sort((a, b) => (a.average_rating || 0) - (b.average_rating || 0));
      break;
    case 'rating-desc':
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  allTeachersFiltered = filtered;
  renderAllTeachers();
}

/* ────────────────────────────────────────────────────────── */
/* LOAD TOP PERFORMERS */
/* ────────────────────────────────────────────────────────── */

async function loadTopPerformers() {
  try {
    const response = await fetch(`${API_v1_BASE}/admin/top-performers`, {
      headers: AuthService.getHeaders()
    });

    const data = await response.json();
    renderTopPerformers(data);
    renderRankingList(data);
  } catch (error) {
    console.error('Error loading top performers:', error);
  }
}

function renderTopPerformers(performers) {
  const tbody = $id('topPerformersBody');
  if (!tbody) return;

  tbody.innerHTML = performers.slice(0, 5).map((prof, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${prof.name}</strong></td>
      <td>${prof.dept}</td>
      <td><span class="rating-badge">${parseFloat(prof.average_rating || 0).toFixed(1)} ⭐</span></td>
      <td>${prof.total_ratings || 0}</td>
      <td>${prof.doubts_answered || 0}</td>
      <td>
        <button class="action-btn btn-send" onclick="sendEmailToTeacher(${prof.id}, '${prof.name}')">📧 Email</button>
      </td>
    </tr>
  `).join('');
}

function renderRankingList(performers) {
  const container = $id('rankingList');
  if (!container) return;

  const medals = ['🥇', '🥈', '🥉'];
  
  container.innerHTML = performers.slice(0, 10).map((prof, idx) => `
    <div class="ranking-card">
      <div class="ranking-position">${medals[idx] || `#${idx + 1}`}</div>
      <div class="ranking-name">${prof.name}</div>
      <div class="ranking-detail">
        <span>Department:</span>
        <strong>${prof.dept}</strong>
      </div>
      <div class="ranking-detail">
        <span>Subject:</span>
        <strong>${prof.subject || 'N/A'}</strong>
      </div>
      <div class="ranking-detail">
        <span>Total Ratings:</span>
        <strong>${prof.total_ratings || 0}</strong>
      </div>
      <div class="ranking-detail">
        <span>Doubts Answered:</span>
        <strong>${prof.doubts_answered || 0}</strong>
      </div>
      <div class="ranking-rating">⭐ ${parseFloat(prof.average_rating || 0).toFixed(1)} / 5.0</div>
    </div>
  `).join('');
}

/* ────────────────────────────────────────────────────────── */
/* OVERVIEW STATS */
/* ────────────────────────────────────────────────────────── */

async function loadOverviewStats() {
  try {
    const response = await fetch(`${API_v1_BASE}/admin/all-teachers`, {
      headers: AuthService.getHeaders()
    });

    const data = await response.json();

    // Calculate stats
    const total = data.length;
    const avgRating = (data.reduce((sum, p) => sum + (p.average_rating || 0), 0) / total).toFixed(1);
    const topTeacher = data.length > 0 ? data[0].name : 'N/A';
    const emailsSent = localStorage.getItem('edurate:emailsSent') || '0';

    // Update UI
    $id('totalTeachers').textContent = total;
    $id('avgOverallRating').textContent = avgRating + ' ⭐';
    $id('topTeacher').textContent = topTeacher;
    $id('emailsSent').textContent = emailsSent;
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

/* ────────────────────────────────────────────────────────── */
/* EMAIL FUNCTIONS */
/* ────────────────────────────────────────────────────────── */

function populateTeacherSelect() {
  const select = $id('teacherSelect');
  if (!select) return;

  select.innerHTML = '<option value="">Select a teacher...</option>' + 
    allTeachers.map(prof => `<option value="${prof.id}">${prof.name} (${prof.dept})</option>`).join('');
}

async function sendBulkEmails() {
  if (!confirm('Send performance emails to ALL teachers? This cannot be undone.')) return;

  const btn = $id('sendBulkBtn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '📧 Sending...';

  try {
    const response = await fetch(`${API_v1_BASE}/teachers/send-bulk-performance-emails`, {
      method: 'POST',
      headers: AuthService.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      addEmailHistory('ALL TEACHERS', true, `${result.data.successCount} emails sent successfully`);
      toast(`✅ ${result.data.successCount} emails sent, ${result.data.failureCount} failed`);
      updateEmailStats(result.data.successCount);
    } else {
      toast('❌ Failed to send emails');
    }
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Error sending emails');
  }

  btn.disabled = false;
  btn.textContent = originalText;
}

async function sendIndividualEmail() {
  const select = $id('teacherSelect');
  const teacherId = select.value;

  if (!teacherId) {
    toast('Please select a teacher');
    return;
  }

  const teacher = allTeachers.find(p => p.id == teacherId);
  if (!teacher) return;

  const btn = $id('sendIndividualBtn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '📧 Sending...';

  try {
    const response = await fetch(`${API_v1_BASE}/teachers/${teacherId}/send-performance-email`, {
      method: 'POST',
      headers: AuthService.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      addEmailHistory(teacher.name, true, `Email sent to ${teacher.email}`);
      toast(`✅ Email sent to ${teacher.name}`);
      updateEmailStats(1);
      select.value = '';
    } else {
      toast('❌ Failed to send email');
    }
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Error sending email');
  }

  btn.disabled = false;
  btn.textContent = originalText;
}

async function sendEmailToTeacher(teacherId, teacherName) {
  const teacher = allTeachers.find(p => p.id === teacherId);
  if (!teacher) return;

  try {
    const response = await fetch(`${API_v1_BASE}/teachers/${teacherId}/send-performance-email`, {
      method: 'POST',
      headers: AuthService.getHeaders()
    });

    if (response.ok) {
      addEmailHistory(teacherName, true, `Email sent to ${teacher.email}`);
      updateEmailStats(1);
      toast(`✅ Email sent to ${teacherName}`);
    } else {
      toast('❌ Failed to send email');
    }
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Error sending email');
  }
}

function addEmailHistory(recipient, success, message) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-IN');
  
  emailHistory.unshift({
    recipient,
    success,
    message,
    time
  });

  renderEmailHistory();
}

function renderEmailHistory() {
  const container = $id('emailHistory');
  if (!container) return;

  if (emailHistory.length === 0) {
    container.innerHTML = '<p style="color: #999;">Email history will appear here</p>';
    return;
  }

  container.innerHTML = emailHistory.slice(0, 10).map(item => `
    <div class="email-item ${item.success ? 'success' : 'failed'}">
      <div>
        <div class="email-recipient">
          ${item.success ? '✅' : '❌'} ${item.recipient}
        </div>
        <div class="email-time">${item.time} - ${item.message}</div>
      </div>
    </div>
  `).join('');
}

function updateEmailStats(count) {
  const current = parseInt(localStorage.getItem('edurate:emailsSent') || '0');
  const newTotal = current + count;
  localStorage.setItem('edurate:emailsSent', newTotal.toString());
  localStorage.setItem('edurate:lastEmailSent', new Date().toLocaleString('en-IN'));
  
  $id('totalEmailsSent').textContent = newTotal;
  $id('lastEmailSent').textContent = new Date().toLocaleString('en-IN');
}

/* ────────────────────────────────────────────────────────── */
/* TEACHER DETAILS */
/* ────────────────────────────────────────────────────────── */

async function viewTeacherDetails(teacherId) {
  const teacher = allTeachers.find(p => p.id === teacherId);
  if (!teacher) return;

  const modal = $id('teacherModal');
  $id('modalTeacherName').textContent = teacher.name;

  const html = `
    <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <p><strong>Email:</strong> ${teacher.email}</p>
      <p><strong>Department:</strong> ${teacher.dept}</p>
      <p><strong>Subject:</strong> ${teacher.subject || 'N/A'}</p>
      <p><strong>Average Rating:</strong> <span class="rating-badge">${parseFloat(teacher.average_rating || 0).toFixed(1)} ⭐</span></p>
      <p><strong>Total Ratings:</strong> ${teacher.total_ratings || 0}</p>
      <p><strong>Doubts Answered:</strong> ${teacher.doubts_answered || 0}</p>
      <p><strong>Last Rated:</strong> ${teacher.last_rated ? new Date(teacher.last_rated).toLocaleDateString('en-IN') : 'Never'}</p>
    </div>
    <div style="margin-top: 20px;">
      <button class="btn btn-primary" onclick="sendEmailToTeacher(${teacher.id}, '${teacher.name}'); closeModal()">📧 Send Email to ${teacher.name}</button>
      <button class="btn btn-secondary" onclick="closeModal()" style="margin-left: 10px;">Close</button>
    </div>
  `;

  $id('modalTeacherInfo').innerHTML = html;
  modal.classList.add('show');
}

function closeModal() {
  $id('teacherModal').classList.remove('show');
}

// Close modal on X click
$query('.close')?.addEventListener('click', closeModal);

/* ────────────────────────────────────────────────────────── */
/* ANALYTICS */
/* ────────────────────────────────────────────────────────── */

async function loadAnalytics() {
  // Update email stats display
  const emailsSent = parseInt(localStorage.getItem('edurate:emailsSent') || '0');
  const lastSent = localStorage.getItem('edurate:lastEmailSent') || 'Never';

  $id('totalEmailsSent').textContent = emailsSent;
  $id('lastEmailSent').textContent = lastSent;
  $id('successEmails').textContent = emailsSent; // Assuming all sent were successful
  $id('failedEmails').textContent = '0';

  // Load and display activities
  loadActivities();
}

function loadActivities() {
  const activities = [
    { text: 'System initialized', time: 'Just now' },
    { text: 'Admin dashboard loaded', time: '1 minute ago' },
    ...emailHistory.slice(0, 5).map(item => ({
      text: `Email sent to ${item.recipient}`,
      time: item.time
    }))
  ];

  const container = $id('activitiesList');
  if (!container) return;

  container.innerHTML = activities.map(activity => `
    <div class="activity-item">
      ${activity.text}
      <div class="activity-time">${activity.time}</div>
    </div>
  `).join('');
}

/* ────────────────────────────────────────────────────────── */
/* TOAST NOTIFICATION */
/* ────────────────────────────────────────────────────────── */

function toast(msg) {
  const el = $id('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// Initialize email stats on load
updateEmailStats(0);
renderEmailHistory();
