/* ============================================================
   js/rating-trend.js  —  Rating Trend Graph Viewer
   Displays line chart of average rating per day for a professor
   ============================================================ */

const currentUser = AuthService.getSession();
if (!currentUser) { 
  window.location.href = "login.html"; 
}

let trendChart = null;

// Get professor ID from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const professorId = urlParams.get('id');

if (!professorId) {
  window.location.href = "dashboard.html";
}

// ─────────────────────────────────────────────────────────
//  Load and display trend data
// ─────────────────────────────────────────────────────────
async function loadTrendData() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    // Fetch trend data from API
    const response = await fetch(`/api/professor/${professorId}/trend`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "login.html";
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      displayTrend(result.data);
    } else if (result.data && result.data.length === 0) {
      showError('No rating data available yet for this professor.');
    } else {
      throw new Error('Invalid response format');
    }

  } catch (error) {
    console.error('Error fetching trend data:', error);
    showError('Failed to load rating trend data. Please try again.');
  }
}

// ─────────────────────────────────────────────────────────
//  Display trend chart and statistics
// ─────────────────────────────────────────────────────────
function displayTrend(data) {
  if (!data || data.length === 0) {
    showError('No rating data available.');
    return;
  }

  // Extract dates and ratings
  const dates = data.map(d => formatDate(d.date));
  const ratings = data.map(d => parseFloat(d.avgRating));

  // Calculate statistics
  const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
  const totalRatings = data.reduce((sum, d) => sum + d.count, 0);
  const highestAvg = Math.max(...ratings).toFixed(2);
  
  // Determine trend direction
  const firstHalf = ratings.slice(0, Math.floor(ratings.length / 2));
  const secondHalf = ratings.slice(Math.floor(ratings.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trendDiff = secondAvg - firstAvg;
  const trendDirection = trendDiff > 0.2 ? '📈 Improving' : trendDiff < -0.2 ? '📉 Declining' : '➡️ Stable';

  // Update statistics
  document.getElementById('avgRating').textContent = avgRating;
  document.getElementById('totalRatings').textContent = totalRatings;
  document.getElementById('highestAvg').textContent = highestAvg;
  document.getElementById('trendDirection').textContent = trendDirection;

  // Create chart
  renderChart(dates, ratings);

  // Show content
  document.getElementById('loadingContainer').style.display = 'none';
  document.getElementById('trendContent').style.display = 'block';
}

// ─────────────────────────────────────────────────────────
//  Render Chart.js line chart
// ─────────────────────────────────────────────────────────
function renderChart(dates, ratings) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  // Destroy existing chart if any
  if (trendChart) {
    trendChart.destroy();
  }

  // Create gradient
  const canvasGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
  canvasGradient.addColorStop(0, 'rgba(192, 132, 252, 0.4)');
  canvasGradient.addColorStop(1, 'rgba(192, 132, 252, 0.0)');

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Average Rating per Day',
        data: ratings,
        borderColor: '#c084fc',
        backgroundColor: canvasGradient,
        borderWidth: 3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#c084fc',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        tension: 0.4,
        yAxisID: 'y'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#dde1f0',
            font: {
              size: 14,
              weight: '600'
            },
            boxWidth: 15,
            boxHeight: 15,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 13, 26, 0.9)',
          titleColor: '#c084fc',
          bodyColor: '#dde1f0',
          borderColor: 'rgba(192, 132, 252, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          displayColors: false,
          callbacks: {
            label: function(context) {
              return 'Rating: ' + context.parsed.y.toFixed(2) + ' / 5.0';
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 0,
          max: 5,
          ticks: {
            color: '#999',
            font: { size: 12 },
            stepSize: 1
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Average Rating',
            color: '#c084fc'
          }
        },
        x: {
          ticks: {
            color: '#999',
            font: { size: 12 }
          },
          grid: {
            display: false,
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Date',
            color: '#c084fc'
          }
        }
      }
    }
  });
}

// ─────────────────────────────────────────────────────────
//  Format date for display
// ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// ─────────────────────────────────────────────────────────
//  Show error message
// ─────────────────────────────────────────────────────────
function showError(message) {
  const errorDiv = document.getElementById('errorContainer');
  const loadingDiv = document.getElementById('loadingContainer');
  
  errorDiv.innerHTML = `<div class="error">⚠️ ${message}</div>`;
  loadingDiv.style.display = 'none';
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadTrendData);
