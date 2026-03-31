/* ============================================================
   js/dashboard.js  —  Main dashboard controller
   ============================================================ */

const currentUser = AuthService.getSession();
if (!currentUser) { window.location.href = "login.html"; }

let professors     = (PROFESSORS_DATA && PROFESSORS_DATA.length > 0) ? PROFESSORS_DATA.map(p => ({ ...p })) : [];
let slideIdx       = 0;
let slideTimer     = null;
let selectedProfId = null;
let starController = null;
let currentStarVal = 0;

function $id(id) { return document.getElementById(id); }

/* ── Daily quotes WITH author names ─────────────────────── */
const DAILY_QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.", author: "Brad Henry" },
  { text: "Teaching is the one profession that creates all other professions.", author: "Unknown" },
  { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
  { text: "In learning you will teach, and in teaching you will learn.", author: "Phil Collins" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "The mediocre teacher tells. The good teacher explains. The great teacher inspires.", author: "William Arthur Ward" },
  { text: "It is the supreme art of the teacher to awaken joy in creative expression and knowledge.", author: "Albert Einstein" },
  { text: "One child, one teacher, one book, one pen can change the world.", author: "Malala Yousafzai" }
];

(function setDailyQuote() {
  var el = $id("quoteText");
  if (!el) return;
  var q = DAILY_QUOTES[new Date().getDay() % DAILY_QUOTES.length];
  el.innerHTML = '"' + q.text + '" &mdash; <strong style="color:#c084fc">' + q.author + '</strong>';
})();

/* ── Toast ───────────────────────────────────────────────── */
function toast(msg) {
  var el = $id("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(function(){ el.classList.remove("show"); }, 3000);
}

/* ── Tabs ────────────────────────────────────────────────── */
document.querySelectorAll(".tab-btn").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var t = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
    document.querySelectorAll(".tab-section").forEach(function(s){ s.classList.remove("active"); });
    btn.classList.add("active");
    var sec = $id("tab-" + t);
    if (sec) sec.classList.add("active");
    if (t === "doubts") buildDoubtsTab();
    if (t === "myfb")   buildMyFeedback();
    if (t === "perf")   buildPerfTab();
  });
});

/* ── Nav setup ───────────────────────────────────────────── */
$id("navName").textContent = currentUser.name;
var badge = $id("navBadge");
badge.textContent = currentUser.role.toUpperCase();
badge.className = "badge badge-" + (currentUser.role === "student" ? "student" : "prof");
if (currentUser.role === "professor") $id("myfbTab").style.display = "inline-block";
if (currentUser.role === "student") $id("perfTabBtn").style.display = "inline-block";

$id("logoutBtn").addEventListener("click", function(){
  AuthService.logout();
  window.location.href = "login.html";
});

/* ── Rating helpers ──────────────────────────────────────── */
function getProf(id) { return professors.find(function(p){ return p.id === id; }); }
function getLiveRating(prof) { 
  if (!prof) return { avg: 0, total: 0 };
  return RatingService.getAverageRating(prof.id, prof.rating, prof.totalRatings); 
}
function getSorted() {
  if (!professors || professors.length === 0) return [];
  return professors.slice().sort(function(a,b){ 
    var aRating = getLiveRating(a) || { avg: 0 };
    var bRating = getLiveRating(b) || { avg: 0 };
    return bRating.avg - aRating.avg; 
  });
}

function chip(text, cls) {
  return '<span class="chip ' + cls + '" style="font-size:10px;padding:3px 10px;font-weight:800;letter-spacing:0.04em">' + text + '</span>';
}
function deptChip(dept) { return chip(dept, "dept-" + dept); }

function profImgHTML(prof, size) {
  if (!prof || !prof.name) {
    return '<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPz88L3RleHQ+PC9zdmc+" '
      + 'alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" />';
  }
  
  var dc  = DEPT_COLORS[prof.dept] || "#c084fc";
  var ini = getInitials(prof.name);
  
  // Create placeholder SVG with initials as fallback
  var placeholderSvg = 'data:image/svg+xml;base64,' + btoa(
    '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" style="stop-color:' + dc + ';stop-opacity:0.8" />'
    + '<stop offset="100%" style="stop-color:' + dc + ';stop-opacity:0.4" />'
    + '</linearGradient></defs>'
    + '<circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + (size/2) + '" fill="url(#grad)"/>'
    + '<text x="50%" y="50%" font-size="' + Math.floor(size * 0.35) + '" fill="#fff" text-anchor="middle" dy=".3em" '
    + 'font-weight="800" letter-spacing="2">' + ini + '</text>'
    + '</svg>'
  );
  
  // Use actual image if available, fallback to SVG placeholder
  var imgSrc = prof.image || placeholderSvg;
  
  return '<img src="' + imgSrc + '" alt="' + prof.name + '" '
    + 'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" '
    + 'onerror="this.src=\'' + placeholderSvg.replace(/'/g, "\\'") + '\'" />';
}

function starsHTML(rating, size) {
  size = size || 14;
  var h = "";
  for (var i = 1; i <= 5; i++)
    h += '<span class="prof-star ' + (i <= Math.round(rating) ? "on" : "") + '" style="font-size:' + size + 'px">&#9733;</span>';
  return h;
}

/* ════════════════════════════════════════════════════════════
   SLIDESHOW — 3 slides, 2s timer
   ════════════════════════════════════════════════════════════ */
function buildSlideshow() {
  var track = $id("slideshowTrack");
  var dots  = $id("slideshowDots");
  if (!track) return;

  var sorted = getSorted();
  var slide1 = sorted[0];
  var slide2 = sorted[1] || sorted[0];

  var allDoubts = DoubtService.getAll().filter(function(d){ return d.answer && d.answeredBy; });
  var answerCounts = {};
  allDoubts.forEach(function(d){ answerCounts[d.answeredBy] = (answerCounts[d.answeredBy] || 0) + 1; });
  var slide3 = sorted[2] || sorted[0];
  var maxAns = 0;
  professors.forEach(function(p){
    var cnt = answerCounts[p.name] || 0;
    if (cnt > maxAns) { maxAns = cnt; slide3 = p; }
  });

  var slides = [slide1, slide2, slide3];
  var labels = [
    "&#127942; TOP PERFORMER &mdash; LAST SEMESTER",
    "&#129352; 2ND RANKED THIS SEMESTER",
    "&#10067; MOST DOUBTS SOLVED"
  ];
  var labelColors = ["#FBBF24", "#C0C0C0", "#38bdf8"];

  track.style.width = "300%";
  track.innerHTML = slides.map(function(p, i){
    var r = getLiveRating(p);
    var avg = r.avg, total = r.total;
    var borderC = labelColors[i];
    return '<div class="slide" style="width:33.333%;background:linear-gradient(120deg,rgba(192,132,252,0.08),rgba(56,189,248,0.05))">'
      + '<div style="position:relative">'
      + '<div class="slide-avatar ' + (i===0?"top":"") + '" style="border-color:' + borderC + ';box-shadow:0 0 24px ' + borderC + '55">'
      + profImgHTML(p, 108) + '</div>'
      + (i===0?'<div class="slide-trophy">&#127942;</div>':"")
      + (i===2?'<div class="slide-trophy">&#10067;</div>':"")
      + '</div>'
      + '<div class="slide-info">'
      + '<div class="slide-badge" style="background:' + borderC + '22;color:' + borderC + ';border:1px solid ' + borderC + '44">' + labels[i] + '</div>'
      + '<div class="slide-name">' + p.name + '</div>'
      + '<div class="slide-dept">' + p.dept + ' &middot; ' + p.subject + '</div>'
      + '<div style="display:flex;align-items:center;gap:10px;margin-top:8px">'
      + '<div class="stars">' + starsHTML(avg, 20) + '</div>'
      + '<span class="slide-rating-num">' + avg + '</span>'
      + '<span class="slide-rating-cnt">(' + total + ' ratings)</span>'
      + '</div>'
      + (i===2 && maxAns > 0 ? '<div style="font-size:12px;color:#38bdf8;margin-top:6px;font-weight:700">&#10003; ' + maxAns + ' doubt' + (maxAns>1?"s":"") + ' answered</div>' : "")
      + '</div>'
      + (currentUser.role === "student"
        ? '<div class="slide-btns"><button class="btn-sm" onclick="openRateModal(' + p.id + ')">&#11088; Rate</button></div>'
        : "")
      + '</div>';
  }).join("");

  dots.innerHTML = slides.map(function(_, i){
    return '<div class="dot ' + (i===0?"active":"") + '" onclick="goToSlide(' + i + ')"></div>';
  }).join("");

  clearInterval(slideTimer);
  slideTimer = setInterval(function(){
    goToSlide((slideIdx + 1) % 3);
  }, 3000);
}

window.goToSlide = function(i) {
  var track = $id("slideshowTrack");
  if (!track) return;
  track.style.transition = (slideIdx===2 && i===0)
    ? "transform 2s cubic-bezier(0.25,0.1,0.25,1)"
    : "transform 3s cubic-bezier(0.4,0,0.2,1)";
  slideIdx = i;
  track.style.transform = "translateX(-" + (slideIdx * 33.333) + "%)";
  document.querySelectorAll(".dot").forEach(function(d, idx){ d.classList.toggle("active", idx===slideIdx); });
};

/* ════════════════════════════════════════════════════════════
   STATS
   ════════════════════════════════════════════════════════════ */
function buildStats() {
  var el = $id("statsGrid");
  if (!el) return;
  var totalRatings = professors.reduce(function(a,p){ return a + getLiveRating(p).total; }, 0);
  var stats = [
    ["&#128104;&#8205;&#127979;", professors.length,                                             "Professors",    "#c084fc"],
    ["&#127891;",                 AuthService.getUsers().filter(function(u){ return u.role==="student"; }).length, "Students", "#38bdf8"],
    ["&#11088;",                  totalRatings,                                                  "Total Ratings", "#FBBF24"],
    ["&#10067;",                  DoubtService.getAll().filter(function(d){ return d.answer; }).length, "Doubts Solved", "#4ade80"]
  ];
  el.innerHTML = stats.map(function(s){
    return '<div class="stat-card"><div class="stat-icon">' + s[0] + '</div>'
      + '<div class="stat-val" style="color:' + s[3] + '">' + s[1] + '</div>'
      + '<div class="stat-lbl">' + s[2].toUpperCase() + '</div></div>';
  }).join("");
}

/* ════════════════════════════════════════════════════════════
   TOP PERFORMER CARD + red note
   ════════════════════════════════════════════════════════════ */
function buildTopPerformer() {
  var el = $id("topPerfCard");
  if (!el) return;
  
  var sorted = getSorted();
  if (!sorted || sorted.length === 0) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:#999">No professors available</div>';
    return;
  }
  
  var top = sorted[0];
  if (!top) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:#999">No data available</div>';
    return;
  }
  
  var r = getLiveRating(top);
  var avg = r.avg, total = r.total;

  el.innerHTML = '<div class="top-perf-avatar" onclick="openProfDetail(' + top.id + ')" style="cursor:pointer">'
    + profImgHTML(top, 118)
    + '<div style="position:absolute;top:-8px;right:-8px;font-size:22px">&#129351;</div></div>'
    + '<div style="flex:1">'
    + chip("BEST PROFESSOR OF THE SEMESTER", "badge-gold")
    + '<div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;margin:10px 0 4px">' + top.name + '</div>'
    + '<div style="color:#555;font-size:13px;margin-bottom:10px">' + top.dept + ' &middot; ' + top.subject + '</div>'
    + '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">'
    + '<div class="stars">' + starsHTML(avg, 22) + '</div>'
    + '<span style="color:#FBBF24;font-weight:800;font-size:22px">' + avg + '</span>'
    + '<span style="color:#fff;font-size:13px">(' + total + ' students rated)</span>'
    + '</div>'
    + '<div style="font-size:12px;color:#555;margin-bottom:14px">' + (top.achievements && top.achievements[0] ? top.achievements[0] : '') + '</div>'
    + (currentUser.role === "student"
      ? '<div style="display:flex;gap:10px;flex-wrap:wrap">'
        + '<button class="btn-sm" onclick="openRateModal(' + top.id + ')">&#11088; Rate</button>'
        + '<button class="btn-sm btn-red" onclick="openProfDetail(' + top.id + ')">View Profile</button>'
        + '</div>'
      : "")
    + '</div>';

  /* Update red note */
  var nameEl = $id("topPerfName");
  if (nameEl) nameEl.textContent = top.name + " (" + avg + "/5.0)";
}

/* ════════════════════════════════════════════════════════════
   TOP 3 CARDS
   ════════════════════════════════════════════════════════════ */
function buildTop3() {
  var el = $id("top3Grid");
  if (!el) return;
  var top3 = getSorted().slice(0, 3);
  el.innerHTML = top3.map(function(p, i){
    var r = getLiveRating(p), avg = r.avg, total = r.total;
    var dc = DEPT_COLORS[p.dept] || "#c084fc";
    var gold = RANK_COLORS[i];
    return '<div class="top3-card" style="border:1px solid ' + gold + '44;box-shadow:0 0 30px ' + RANK_GLOW[i] + '" onclick="openProfDetail(' + p.id + ')">'
      + '<div class="top3-rank-badge">' + RANK_MEDALS[i] + '</div>'
      + '<div class="top3-num-badge" style="background:' + gold + '22;color:' + gold + ';border:1px solid ' + gold + '44">#' + (i+1) + '</div>'
      + '<div class="top3-img-wrap" style="background:' + dc + '18">'
      + profImgHTML(p, 200)
      + '<div class="img-overlay"></div>'
      + '<div class="top3-rating-pill">&#9733; ' + avg + '</div>'
      + '</div>'
      + '<div class="top3-info">'
      + '<div class="top3-dept-row">' + deptChip(p.dept) + (p.topPerformer ? chip("&#127942; TOP","badge-top") : "") + '</div>'
      + '<div class="top3-name">' + p.name + '</div>'
      + '<div class="top3-sub">' + p.subject + '</div>'
      + '<div class="top3-stars-row"><div class="stars">' + starsHTML(avg,14) + '</div>'
      + '<span class="top3-score">' + avg + '</span><span class="top3-cnt">(' + total + ' ratings)</span></div>'
      + '<div class="top3-interests">&#128302; ' + p.interests + '</div>'
      + '</div></div>';
  }).join("");
}

/* ════════════════════════════════════════════════════════════
   ALL PROFESSORS GRID
   ════════════════════════════════════════════════════════════ */
function buildProfGrid(filter, search) {
  filter = filter || "All"; search = search || "";
  var el = $id("profGrid");
  if (!el) return;
  var sorted = getSorted();
  var top3ids = sorted.slice(0,3).map(function(p){ return p.id; });
  var filtered = sorted.filter(function(p){
    return (filter==="All"||p.dept===filter)
      && (p.name.toLowerCase().includes(search.toLowerCase())||p.subject.toLowerCase().includes(search.toLowerCase()));
  });
  $id("allProfTitle").textContent = "All Professors (" + filtered.length + ")";
  el.innerHTML = filtered.map(function(p, idx){
    var r = getLiveRating(p), avg = r.avg, total = r.total;
    var dc = DEPT_COLORS[p.dept] || "#c084fc";
    var rankIdx = top3ids.indexOf(p.id);
    var borderColor = p.topPerformer ? "rgba(251,191,36,0.35)" : rankIdx>=0 ? RANK_COLORS[rankIdx]+"44" : "rgba(255,255,255,0.07)";
    return '<div class="prof-card" style="border-color:' + borderColor + '" onclick="openProfDetail(' + p.id + ')">'
      + '<div class="prof-card-img" style="background:' + dc + '15">'
      + profImgHTML(p, 160)
      + '<div class="img-fade"></div>'
      + '<div class="rating-pill">&#9733; ' + avg + '</div></div>'
      + '<div class="prof-card-body">'
      + '<div class="prof-card-badges">' + deptChip(p.dept)
      + (p.topPerformer ? chip("&#127942; TOP","badge-top") : "")
      + (rankIdx>=0 ? RANK_MEDALS[rankIdx] : "")
      + '<span style="margin-left:auto;font-size:10px;color:#3a3a50;font-weight:700">#' + (idx+1) + '</span></div>'
      + '<div class="prof-card-name">' + p.name + '</div>'
      + '<div class="prof-card-sub">' + p.subject + '</div>'
      + '<div class="prof-card-stars"><div class="stars">' + starsHTML(avg,13) + '</div>'
      + '<span style="color:#3a3a50;font-size:11px">(' + total + ')</span></div>'
      + '<div class="prof-card-social">'
      + '<a href="' + p.linkedin + '" target="_blank" class="social-icon" onclick="event.stopPropagation()">&#128188;</a>'
      + '<a href="' + p.instagram + '" target="_blank" class="social-icon" onclick="event.stopPropagation()">&#128247;</a>'
      + '<a href="' + p.facebook + '" target="_blank" class="social-icon" onclick="event.stopPropagation()">&#128216;</a>'
      + '<span class="prof-email">&#128231; ' + p.email.split("@")[0] + '@iiit...</span></div>'
      + '<div class="prof-card-interests">&#128302; ' + p.interests + '</div>'
      + (currentUser.role==="student"
        ? '<div class="prof-card-btns" onclick="event.stopPropagation()"><button class="btn-sm" onclick="openRateModal(' + p.id + ')">&#11088; Rate</button></div>'
        : "")
      + '</div></div>';
  }).join("");
}

var searchInput = $id("searchInput");
var deptFilter  = $id("deptFilter");
if (searchInput) searchInput.addEventListener("input",  function(e){ buildProfGrid(deptFilter?deptFilter.value:"All", e.target.value); });
if (deptFilter)  deptFilter.addEventListener("change",  function(e){ buildProfGrid(e.target.value, searchInput?searchInput.value:""); });

/* ════════════════════════════════════════════════════════════
   TOP 10 / ALL RANKED LIST
   ════════════════════════════════════════════════════════════ */
function buildTop10() {
  var el = $id("top10List");
  if (!el) return;
  var sorted = getSorted();
  el.innerHTML = sorted.map(function(p, i){
    var r = getLiveRating(p), avg = r.avg, total = r.total;
    var dc = DEPT_COLORS[p.dept] || "#c084fc";
    var rankDisp = i===0?"&#129351;":i===1?"&#129352;":i===2?"&#129353;":'<span style="font-size:15px;font-weight:800;color:#555;min-width:40px;text-align:center;display:inline-block">#'+(i+1)+'</span>';
    return '<div class="top10-item" onclick="openProfDetail(' + p.id + ')">'
      + '<div class="top10-rank">' + rankDisp + '</div>'
      + '<div class="top10-avatar" style="border-color:' + (i<3?RANK_COLORS[i]:dc) + '">' + profImgHTML(p,56) + '</div>'
      + '<div class="top10-info">'
      + '<div class="top10-name">' + p.name + '</div>'
      + '<div class="top10-dept">' + p.dept + ' &middot; ' + p.subject + '</div>'
      + '<div class="top10-rating"><div class="stars">' + starsHTML(avg,13) + '</div>'
      + '<span class="top10-score">' + avg + '</span><span class="top10-cnt">(' + total + ' ratings)</span></div>'
      + '</div>'
      + '<div style="width:120px"><div class="top10-bar-wrap"><div class="top10-bar" style="width:' + (avg/5*100) + '%"></div></div>'
      + '<div style="font-size:10px;color:#3a3a50;text-align:right;margin-top:3px">' + avg + '/5.0</div></div>'
      + '</div>';
  }).join("");
}

/* ════════════════════════════════════════════════════════════
   RATE MODAL — With Professor Dropdown Selection
   ════════════════════════════════════════════════════════════ */
window.openRateModal = function(profId) {
  if (currentUser.role !== "student") return;
  currentStarVal = 0;
  
  // Populate teacher dropdown
  var teacherSelect = $id("rateTeacher");
  if (teacherSelect) {
    teacherSelect.innerHTML = '<option value="">-- Select Professor --</option>';
    PROFESSORS_DATA.forEach(function(p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name + " (" + p.dept + " • " + p.subject + ")";
      teacherSelect.appendChild(opt);
    });
  }
  
  // If profId passed, pre-select it
  if (profId) {
    var prof = getProf(profId);
    if (prof) {
      selectedProfId = profId;
      teacherSelect.value = profId;
      updateRateModalHeader(profId);
    }
  } else {
    selectedProfId = null;
    $id("rateHeader").style.display = "none";
  }
  
  $id("rateFeedback").value = "";
  $id("badWordWarn").textContent = "";
  $id("starInput").innerHTML = "";
  starController = buildStarInput("starInput", function(val){ currentStarVal = val; });
  $id("rateFeedback").oninput = function(){ ChatbotFilter.validateInput(this.value, $id("badWordWarn")); };
  $id("rateOverlay").classList.add("open");
};

function updateRateModalHeader(profId) {
  var p = getProf(profId);
  if (!p) {
    $id("rateHeader").style.display = "none";
    selectedProfId = null;
    return;
  }
  selectedProfId = profId;
  var dc = DEPT_COLORS[p.dept] || "#c084fc";
  $id("rateHeader").innerHTML = '<div class="modal-prof-avatar"><div style="width:100%;height:100%;background:' + dc + '22;display:flex;align-items:center;justify-content:center">' + profImgHTML(p,58) + '</div></div>'
    + '<div><div class="modal-prof-name">' + p.name + '</div><div class="modal-prof-sub">' + p.dept + ' &middot; ' + p.subject + '</div></div>';
  $id("rateHeader").style.display = "flex";
}

// Dropdown change handler
$id("rateTeacher") && $id("rateTeacher").addEventListener("change", function(){
  var profId = parseInt(this.value);
  if (profId) {
    updateRateModalHeader(profId);
    currentStarVal = 0;
    $id("starInput").innerHTML = "";
    starController = buildStarInput("starInput", function(val){ currentStarVal = val; });
  } else {
    $id("rateHeader").style.display = "none";
    selectedProfId = null;
  }
});

$id("submitRateBtn") && $id("submitRateBtn").addEventListener("click", function(){
  if (!selectedProfId) { toast("Please select a professor!"); return; }
  if (!currentStarVal) { toast("Please select a star rating!"); return; }
  var feedback = $id("rateFeedback").value;
  if (feedback && !ChatbotFilter.check(feedback).clean) { toast("Please remove inappropriate language!"); return; }
  RatingService.submitRating(selectedProfId, currentUser.name, currentStarVal, feedback);
  $id("rateOverlay").classList.remove("open");
  toast("Rating submitted! Thank you.");
  rebuildAll();
});

$id("closeRateBtn")  && $id("closeRateBtn").addEventListener("click",  function(){ $id("rateOverlay").classList.remove("open"); });
$id("rateOverlay")   && $id("rateOverlay").addEventListener("click",   function(e){ if(e.target===$id("rateOverlay")) $id("rateOverlay").classList.remove("open"); });

/* ════════════════════════════════════════════════════════════
   DOUBTS
   ════════════════════════════════════════════════════════════ */
function buildDoubtsTab() {
  var listEl=$id("doubtsList"), noteEl=$id("doubtLimitNote"), postBtn=$id("postDoubtBtn");
  if (!listEl) return;
  
  if (currentUser.role==="professor") {
    // PROFESSOR VIEW
    postBtn.style.display="none";
    var profDoubts = DoubtService.getForProfessor(currentUser.name);
    var answeredDoubts = DoubtService.getAnsweredByProfessor(currentUser.name);
    
    noteEl.innerHTML = '<div style="background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(192,132,252,0.1));border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:14px;margin-bottom:16px">' +
      '<div style="display:flex;justify-content:space-around;gap:20px">' +
      '<div style="text-align:center"><div style="font-size:28px;font-weight:800;color:#38bdf8">' + profDoubts.length + '</div><div style="font-size:12px;color:#555">Pending Doubts</div></div>' +
      '<div style="text-align:center"><div style="font-size:28px;font-weight:800;color:#c084fc">' + answeredDoubts.length + '</div><div style="font-size:12px;color:#555">Answered</div></div>' +
      '</div></div>';
    
    if (profDoubts.length === 0 && answeredDoubts.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:60px;color:#555;font-size:14px">' +
        '<div style="font-size:40px;margin-bottom:12px">✓</div>' +
        '<div style="font-weight:700;margin-bottom:6px">No doubts assigned to you yet</div>' +
        '<div style="font-size:12px">Doubts will appear here when students ask you directly</div></div>';
      return;
    }
    
    // Pending doubts
    var pendinHTML = '<h3 style="font-size:16px;color:#38bdf8;margin:24px 0 12px;font-weight:700">📋 Pending Doubts (' + profDoubts.length + ')</h3>';
    if (profDoubts.length > 0) {
      pendinHTML += profDoubts.map(function(d) {
        return '<div class="doubt-card" id="doubt-'+d.id+'" style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2)">' +
          '<div class="doubt-top"><span class="doubt-student">&#128100; '+d.studentName+'</span>' +
          '<span class="doubt-date">'+new Date(d.createdAt).toLocaleDateString("en-IN")+'</span></div>' +
          '<div style="font-size:12px;color:#aaa;margin-bottom:8px">Email: ' + d.studentEmail + '</div>' +
          '<div class="doubt-q">'+d.question+'</div>' +
          '<div class="answer-form"><textarea id="ans-'+d.id+'" placeholder="Write your answer..." style="margin-bottom:10px;width:100%;padding:12px;background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.09);border-radius:12px;color:#dde1f0;font-size:13px;font-family:Syne,sans-serif;outline:none;resize:vertical;min-height:90px"></textarea>' +
          '<button class="btn-sm" onclick="submitAnswer('+d.id+')">✓ Submit Answer</button></div>' +
          '</div>';
      }).join("");
    } else {
      pendinHTML += '<div style="text-align:center;padding:20px;color:#555;font-size:12px">No pending doubts</div>';
    }
    
    // Answered doubts
    var answeredHTML = '<h3 style="font-size:16px;color:#c084fc;margin:24px 0 12px;font-weight:700">✓ Answered Doubts (' + answeredDoubts.length + ')</h3>';
    if (answeredDoubts.length > 0) {
      answeredHTML += answeredDoubts.map(function(d) {
        return '<div class="doubt-card" id="doubt-'+d.id+'" style="background:rgba(192,132,252,0.06);border:1px solid rgba(192,132,252,0.2)">' +
          '<div class="doubt-top"><span class="doubt-student">&#128100; '+d.studentName+'</span>' +
          '<span class="doubt-date">'+new Date(d.createdAt).toLocaleDateString("en-IN")+'</span></div>' +
          '<div class="doubt-q" style="color:#aaa">'+d.question+'</div>' +
          '<div class="doubt-ans-box"><div class="doubt-ans-label">&#9679; Your Answer ('+new Date(d.answeredAt).toLocaleDateString("en-IN")+')</div><div class="doubt-ans-text">'+d.answer+'</div></div>' +
          '</div>';
      }).join("");
    } else {
      answeredHTML += '<div style="text-align:center;padding:20px;color:#555;font-size:12px">No answered doubts yet</div>';
    }
    
    listEl.innerHTML = pendinHTML + answeredHTML;
  } else {
    // STUDENT VIEW
    postBtn.style.display="inline-block";
    var rem=DoubtService.getRemaining(currentUser.email);
    noteEl.textContent="You can post "+rem+" more doubt"+(rem!==1?"s":"")+" today (limit: 2/day)";
    
    // Show doubt history
    var historyEl = document.createElement("div");
    historyEl.style.cssText = "margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)";
    var history = (typeof DoubtHistoryService !== 'undefined') ? DoubtHistoryService.getStudentHistory(currentUser.email) : [];
    if (history.length > 0) {
      historyEl.innerHTML = '<h3 style="font-size:16px;margin-bottom:12px">📋 Your Doubt History</h3>' + 
        history.map(function(h) {
          return '<div style="background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);border-radius:12px;padding:12px;margin-bottom:8px;font-size:13px">' +
            '<div style="color:#c084fc;font-weight:700;margin-bottom:4px">📧 To: ' + (h.teacherName || 'All Teachers') + '</div>' +
            '<div style="color:#aaa;line-height:1.5">' + h.question + '</div>' +
            '<div style="color:#555;font-size:11px;margin-top:6px">' + new Date(h.createdAt).toLocaleDateString("en-IN") + (h.answered ? ' ✓ Answered' : ' ⏳ Awaiting Answer') + '</div>' +
            '</div>';
        }).join("") + 
        '<p style="font-size:11px;color:#555;margin-top:12px">Showing your recent doubt history</p>';
      listEl.parentNode.insertBefore(historyEl, listEl.nextSibling);
    }
    
    var doubts=DoubtService.getAll();
    if (!doubts.length){ listEl.innerHTML='<div style="text-align:center;padding:60px;color:#333;font-size:14px">No doubts yet.</div>'; return; }
    listEl.innerHTML=doubts.map(function(d){
      return '<div class="doubt-card" id="doubt-'+d.id+'">'
        +'<div class="doubt-top"><span class="doubt-student">&#127891; '+d.studentName+'</span>'
        +'<span class="doubt-date">'+new Date(d.createdAt).toLocaleDateString("en-IN")+'</span></div>'
        +'<div style="font-size:12px;color:#38bdf8;margin-bottom:8px">📧 For: <strong>' + (d.teacherName || 'All Teachers') + '</strong></div>'
        +'<div class="doubt-q">'+d.question+'</div>'
        +(d.answer
          ?'<div class="doubt-ans-box"><div class="doubt-ans-label">&#128104;&#8205;&#127979; '+d.answeredBy+'\'s ANSWER</div><div class="doubt-ans-text">'+d.answer+'</div></div>'
          :'<span class="badge-awaiting">AWAITING ANSWER</span>')
        +'</div>';
    }).join("");
  }
}

window.submitAnswer = function(doubtId) {
  var el=$id("ans-"+doubtId), ans=el?el.value.trim():"";
  if (!ans){ toast("Write your answer first!"); return; }
  DoubtService.answer(doubtId, currentUser.name, ans);
  toast("Doubt answered!");
  buildDoubtsTab(); buildStats();
};

$id("postDoubtBtn") && $id("postDoubtBtn").addEventListener("click", function(){
  if (DoubtService.getRemaining(currentUser.email)===0){ toast("You've reached your 2 doubts/day limit!"); return; }
  $id("doubtText").value=""; $id("doubtWarn").textContent=""; 
  
  // Populate teacher dropdown
  var teacherSelect = $id("doubtTeacher");
  if (teacherSelect) {
    teacherSelect.innerHTML = '<option value="">All Teachers</option>';
    PROFESSORS_DATA.forEach(function(p) {
      var opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name + " (" + p.dept + ")";
      teacherSelect.appendChild(opt);
    });
  }
  
  $id("doubtOverlay").classList.add("open");
});
$id("doubtText") && $id("doubtText").addEventListener("input", function(){ ChatbotFilter.validateInput(this.value, $id("doubtWarn")); });
$id("submitDoubtBtn") && $id("submitDoubtBtn").addEventListener("click", function(){
  var text=$id("doubtText").value.trim();
  if (!text){ toast("Write your doubt first!"); return; }
  if (!ChatbotFilter.check(text).clean){ toast("Please remove inappropriate language!"); return; }
  var teacher = $id("doubtTeacher") ? $id("doubtTeacher").value : "";
  var result=DoubtService.post(currentUser.name, currentUser.email, text, teacher);
  if (result.success){ $id("doubtOverlay").classList.remove("open"); toast("Doubt posted to " + (teacher || "All Teachers") + "!"); buildDoubtsTab(); }
  else toast(result.message);
});
$id("closeDoubtBtn") && $id("closeDoubtBtn").addEventListener("click", function(){ $id("doubtOverlay").classList.remove("open"); });
$id("doubtOverlay")  && $id("doubtOverlay").addEventListener("click",  function(e){ if(e.target===$id("doubtOverlay")) $id("doubtOverlay").classList.remove("open"); });

/* ════════════════════════════════════════════════════════════
   PROF DETAIL MODAL
   ════════════════════════════════════════════════════════════ */
window.openProfDetail = function(profId) {
  var p=getProf(profId);
  if (!p) return;
  selectedProfId=profId;
  var r=getLiveRating(p), avg=r.avg, total=r.total;
  var dc=DEPT_COLORS[p.dept]||"#c084fc";
  var feedback=RatingService.getFeedback(profId);
  $id("profDetailContent").innerHTML =
    '<div class="prof-detail-center">'
    +'<div class="prof-detail-avatar" style="border-color:'+(p.topPerformer?"#FBBF24":dc)+'">'
    +profImgHTML(p,112)+'</div>'
    +'<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:8px">'
    +(p.topPerformer?chip("&#127942; TOP PERFORMER","badge-gold"):"")+deptChip(p.dept)+'</div>'
    +'<div class="prof-detail-name">'+p.name+'</div>'
    +'<div class="prof-detail-sub">'+p.subject+'</div>'
    +'<div style="display:flex;justify-content:center;gap:8px;align-items:center">'
    +'<div class="stars">'+starsHTML(avg,18)+'</div>'
    +'<span style="color:#FBBF24;font-weight:800;font-size:18px">'+avg+'</span>'
    +'<span style="color:#3a3a50;font-size:12px">('+total+' ratings)</span></div></div>'
    +'<div class="info-block"><div class="info-block-title" style="color:#c084fc">&#128222; CONTACT</div>'
    +'<div class="info-block-row">&#128231; '+p.email+'</div>'
    +'<div class="info-block-row">&#128241; '+p.phone+'</div>'
    +'<div class="social-links">'
    +'<a href="'+p.linkedin+'" target="_blank" class="social-link" style="background:rgba(10,102,194,0.18);color:#0a66c2;border:1px solid rgba(10,102,194,0.3)">&#128188; LinkedIn</a>'
    +'<a href="'+p.instagram+'" target="_blank" class="social-link" style="background:rgba(225,48,108,0.18);color:#e1306c;border:1px solid rgba(225,48,108,0.3)">&#128247; Instagram</a>'
    +'</div></div>'
    +'<div class="info-block" style="background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.14)">'
    +'<div class="info-block-title" style="color:#38bdf8">&#128302; RESEARCH INTERESTS</div>'
    +'<div style="font-size:13px;color:#fff;line-height:1.6">'+p.interests+'</div></div>'
    +'<div class="info-block" style="background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.14)">'
    +'<div class="info-block-title" style="color:#FBBF24">&#127941; ACHIEVEMENTS</div>'
    +p.achievements.map(function(a){ return '<div class="achievement-item">'+a+'</div>'; }).join("")
    +'</div>'
    +(feedback.length?'<div class="info-block" style="background:rgba(192,132,252,0.05);border:1px solid rgba(192,132,252,0.14)">'
      +'<div class="info-block-title" style="color:#c084fc">&#128172; STUDENT FEEDBACK ('+feedback.length+')</div>'
      +feedback.slice(-3).reverse().map(function(f){
        return '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05)">'
          +'<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          +'<span style="color:#c084fc;font-weight:700;font-size:12px">&#127891; '+f.studentName+'</span>'
          +'<span style="font-size:11px;color:#3a3a50">'+f.date+'</span></div>'
          +'<div class="stars" style="margin-bottom:4px">'+starsHTML(f.stars,12)+'</div>'
          +'<div style="color:#aaa;font-size:12px">'+f.text+'</div></div>';
      }).join("")+'</div>':'')
    +(currentUser.role==="student"
      ?'<div style="display:flex;gap:10px"><button class="btn" onclick="openRateModal('+p.id+');document.getElementById(\'profDetailOverlay\').classList.remove(\'open\')">&#11088; Rate Professor</button></div>':"");
  $id("profDetailOverlay").classList.add("open");
};

$id("profDetailOverlay") && $id("profDetailOverlay").addEventListener("click", function(e){
  if (e.target===$id("profDetailOverlay")) $id("profDetailOverlay").classList.remove("open");
});

/* ════════════════════════════════════════════════════════════
   MY FEEDBACK
   ════════════════════════════════════════════════════════════ */
function buildMyFeedback() {
  if (currentUser.role!=="professor") return;
  var mp=professors.find(function(p){ return p.id===currentUser.profId; });
  var el=$id("myfbContent");
  if (!el) return;
  if (!mp){ el.innerHTML='<div style="color:#444;padding:20px">Profile not linked yet.</div>'; return; }
  var r=getLiveRating(mp), avg=r.avg, total=r.total;
  var feedback=RatingService.getFeedback(mp.id);
  el.innerHTML='<div class="myfb-header"><div class="myfb-avatar">'+profImgHTML(mp,88)+'</div>'
    +'<div><div style="font-size:20px;font-weight:800">'+mp.name+'</div>'
    +'<div style="color:#555;font-size:13px;margin-bottom:10px">'+mp.dept+' &middot; '+mp.subject+'</div>'
    +'<div style="display:flex;align-items:center;gap:10px"><div class="stars">'+starsHTML(avg,20)+'</div>'
    +'<span style="color:#FBBF24;font-weight:800;font-size:20px">'+avg+'/5.0</span>'
    +'<span style="color:#3a3a50;font-size:13px">('+total+' ratings)</span></div></div></div>'
    +'<h3 style="font-size:17px;font-weight:800;margin-bottom:14px">Student Comments ('+feedback.length+')</h3>'
    +(!feedback.length?'<div style="color:#333;font-size:14px;padding:20px 0">No written feedback yet.</div>'
      :feedback.slice().reverse().map(function(f){
        return '<div class="feedback-item"><div class="feedback-top">'
          +'<span class="feedback-user">&#127891; '+f.studentName+'</span>'
          +'<div style="display:flex;gap:8px;align-items:center"><div class="stars">'+starsHTML(f.stars,13)+'</div>'
          +'<span style="font-size:11px;color:#3a3a50">'+f.date+'</span></div></div>'
          +'<div class="feedback-text">'+f.text+'</div></div>';
      }).join(""));
}

/* ════════════════════════════════════════════════════════════
   PERFORMANCE PREDICTOR TAB
   ════════════════════════════════════════════════════════════ */
function buildPerfTab() {
  var el = $id("perfContent");
  if (!el) return;
  
  if (currentUser.role !== "student") {
    el.innerHTML = '<div style="color:#888;padding:20px;text-align:center">👨‍🏫 This feature is for students only.</div>';
    return;
  }
  
  if (typeof PerformancePredictor === "undefined") {
    el.innerHTML = '<div style="color:#f87171;padding:20px">Error: Performance Predictor not loaded.</div>';
    return;
  }
  
  var result = PerformancePredictor.getPredictionWithRecommendations(currentUser.email, currentUser.name);
  var history = PerformancePredictor.getHistory(currentUser.email);
  
  // Generate Performance Chart
  var chartHtml = '';
  if (history && history.length >= 2) {
    var scores = history.map(function(h) { return h.score; });
    var maxScore = Math.max.apply(null, scores);
    var minScore = Math.min.apply(null, scores);
    var range = maxScore - minScore || 1;
    var chartWidth = 400;
    var chartHeight = 200;
    var padding = 30;
    var chartInnerWidth = chartWidth - 2 * padding;
    var chartInnerHeight = chartHeight - 2 * padding;
    var pointSpacing = chartInnerWidth / (scores.length - 1);
    
    var pathData = '';
    scores.forEach(function(score, i) {
      var x = padding + i * pointSpacing;
      var y = chartHeight - padding - ((score - minScore) / range * chartInnerHeight);
      if (i === 0) pathData += 'M' + x + ',' + y;
      else pathData += 'L' + x + ',' + y;
    });
    
    chartHtml = '<div style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:16px;padding:20px;margin-bottom:30px">'
      + '<div style="font-size:14px;font-weight:600;color:#818cf8;margin-bottom:16px;">📈 Performance Trend Chart</div>'
      + '<svg width="100%" height="250" viewBox="0 0 ' + chartWidth + ' ' + chartHeight + '" style="min-height:250px">'
      + '<defs><linearGradient id="perfGrad" x1="0%" y1="0%" x2="0%" y2="100%">'
      + '<stop offset="0%" style="stop-color:#818cf8;stop-opacity:0.3" />'
      + '<stop offset="100%" style="stop-color:#818cf8;stop-opacity:0.01" />'
      + '</linearGradient></defs>'
      + '<rect x="' + padding + '" y="' + padding + '" width="' + chartInnerWidth + '" height="' + chartInnerHeight + '" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>';
    
    // Y-axis labels
    for (var yLabel = 0; yLabel <= 10; yLabel += 2) {
      var yPos = chartHeight - padding - ((yLabel - minScore) / range * chartInnerHeight);
      if (yPos >= padding && yPos <= chartHeight - padding) {
        chartHtml += '<text x="' + (padding - 10) + '" y="' + (yPos + 4) + '" font-size="10" fill="#888" text-anchor="end">' + yLabel + '</text>';
        chartHtml += '<line x1="' + (padding - 5) + '" y1="' + yPos + '" x2="' + (padding + chartInnerWidth) + '" y2="' + yPos + '" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="3,3"/>';
      }
    }
    
    // Plot line
    chartHtml += '<path d="' + pathData + '" stroke="#818cf8" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    
    // Plot points and labels
    scores.forEach(function(score, i) {
      var x = padding + i * pointSpacing;
      var y = chartHeight - padding - ((score - minScore) / range * chartInnerHeight);
      var semName = history[i].semesterName || "Exam " + (i + 1);
      chartHtml += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#818cf8"/>';
      chartHtml += '<text x="' + x + '" y="' + (chartHeight - padding + 18) + '" font-size="10" fill="#888" text-anchor="middle">' + semName.substring(0, 4) + '</text>';
    });
    
    chartHtml += '</svg>'
      + '<div style="font-size:12px;color:#888;margin-top:12px;padding-top:12px;border-top:1px solid rgba(99,102,241,0.1)">Tip: Your exam performance over time</div>'
      + '</div>';
  }
  
  var html = chartHtml + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">';
  
  // Prediction Card
  if (result.prediction) {
    var predColor = result.prediction >= 8 ? "#10b981" : result.prediction >= 7 ? "#3b82f6" : 
                    result.prediction >= 6 ? "#f59e0b" : result.prediction >= 5 ? "#ef4444" : "#7c2d12";
    html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;text-align:center">'
      + '<div style="font-size:13px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Next Exam Prediction</div>'
      + '<div style="font-size:52px;font-weight:900;color:' + predColor + ';margin-bottom:8px">' + Math.round(result.prediction * 10) / 10 + '/10</div>'
      + '<div style="font-size:14px;color:#dde1f0;margin-bottom:12px;font-weight:600">' + result.message + '</div>'
      + '<div style="font-size:11px;color:#555;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px">'
      + '✨ Confidence: ' + result.confidence + '%'
      + '</div></div>';
  } else {
    html += '<div style="background:rgba(96,165,250,0.05);border:1px solid rgba(96,165,250,0.2);border-radius:16px;padding:20px;text-align:center">'
      + '<div style="font-size:14px;color:#60a5fa;font-weight:600">' + result.message + '</div>'
      + '<div style="font-size:11px;color:#555;margin-top:10px">Add your past exam scores to start getting predictions!</div>'
      + '</div>';
  }
  
  // Statistics Card
  if (result.breakdown) {
    var trend = result.breakdown.trend;
    var trendIcon = trend > 0.3 ? "📈" : trend < -0.3 ? "📉" : "➡️";
    html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">'
      + '<div style="font-size:13px;color:#888;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.05em">Your Statistics</div>'
      + '<div style="display:flex;flex-direction:column;gap:12px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05)">'
      + '<span style="color:#888;font-size:13px">Past Average (Last 5):</span>'
      + '<span style="color:#FBBF24;font-weight:700;font-size:14px">' + (result.breakdown.pastAverage || 0) + '/10</span>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05)">'
      + '<span style="color:#888;font-size:13px">Last Exam Score:</span>'
      + '<span style="color:#3b82f6;font-weight:700;font-size:14px">' + result.breakdown.lastScore + '/10 (' + result.breakdown.lastSemester + ')</span>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<span style="color:#888;font-size:13px">Performance Trend:</span>'
      + '<span style="font-size:16px;margin-right:8px">' + trendIcon + '</span>'
      + '</div>'
      + '</div></div>';
  }
  
  // REGRESSION ANALYSIS CARD
  if (result.regression) {
    var reg = result.regression;
    var slopeIcon = reg.slope > 0.1 ? "📈" : reg.slope < -0.1 ? "📉" : "➡️";
    var rSquaredColor = reg.rSquaredPercent >= 80 ? "#10b981" : reg.rSquaredPercent >= 50 ? "#f59e0b" : "#ef4444";
    html += '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">'
      + '<div style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.2);border-radius:16px;padding:20px">'
      + '<div style="font-size:13px;color:#888;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.05em;display:flex;align-items:center;gap:8px">'
      + '<span>📊 Regression Analysis</span><span style="font-size:10px;background:rgba(168,85,247,0.3);padding:2px 8px;border-radius:4px;color:#c4b5fd">' + reg.modelType + '</span>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:12px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(168,85,247,0.1)">'
      + '<span style="color:#888;font-size:13px">Regression Prediction:</span>'
      + '<span style="color:#c084fc;font-weight:700;font-size:14px">' + reg.regressionPrediction + '/10</span>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(168,85,247,0.1)">'
      + '<span style="color:#888;font-size:13px">Trend (Slope):</span>'
      + '<span style="color:#c084fc;font-weight:700;font-size:14px">' + slopeIcon + ' ' + (reg.slope > 0 ? "+" : "") + reg.slope + '/exam</span>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(168,85,247,0.1)">'
      + '<span style="color:#888;font-size:13px">Goodness of Fit (R²):</span>'
      + '<span style="color:' + rSquaredColor + ';font-weight:700;font-size:14px">' + reg.rSquaredPercent + '% (' + Math.round(reg.rSquared * 1000) / 1000 + ')</span>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<span style="color:#888;font-size:13px">Data Points:</span>'
      + '<span style="color:#c084fc;font-weight:700;font-size:14px">' + reg.dataPointsForReg + ' exams</span>'
      + '</div>'
      + '</div></div>'
      + '<div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.2);border-radius:16px;padding:20px">'
      + '<div style="font-size:13px;color:#888;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em">What This Means</div>'
      + '<div style="font-size:12px;color:#dde1f0;line-height:1.6">'
      + '<div style="margin-bottom:8px"><strong style="color:#60a5fa">Regression Peak:</strong> This is your predicted score using a trend line fitted through all past exams.</div>'
      + '<div style="margin-bottom:8px"><strong style="color:#60a5fa">Trend (Slope):</strong> Shows how much your score changes per exam (' + (reg.slope > 0 ? "improving" : "declining") + ').</div>'
      + '<div><strong style="color:#60a5fa">R² Score:</strong> Shows how well the regression fits your data (0-100%, higher is better). ' + 
        (reg.rSquaredPercent >= 80 ? "✨ Excellent fit!" : reg.rSquaredPercent >= 50 ? "Good fit." : "Add more data for accuracy.") + '</div>'
      + '</div></div>';
  }
  
  html += '</div>';
  
  // Recommendations
  if (result.recommendations && result.recommendations.length) {
    html += '<div style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:16px;padding:20px;margin-bottom:20px">'
      + '<div style="font-size:14px;font-weight:600;color:#818cf8;margin-bottom:12px">💡 Recommendations for You</div>'
      + '<ul style="list-style:none;padding:0;margin:0">';
    result.recommendations.forEach(function(rec) {
      html += '<li style="padding:8px 0;color:#dde1f0;font-size:13px;border-bottom:1px solid rgba(99,102,241,0.1)">' + rec + '</li>';
    });
    html += '</ul></div>';
  }
  
  // Exam History
  if (history && history.length) {
    html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">'
      + '<div style="font-size:14px;font-weight:600;color:#dde1f0;margin-bottom:12px">📚 Your Exam History</div>'
      + '<table style="width:100%;border-collapse:collapse">'
      + '<thead><tr style="border-bottom:2px solid rgba(255,255,255,0.1)">'
      + '<th style="padding:10px;text-align:left;color:#888;font-size:12px;font-weight:600">Semester</th>'
      + '<th style="padding:10px;text-align:center;color:#888;font-size:12px;font-weight:600">Marks</th>'
      + '<th style="padding:10px;text-align:center;color:#888;font-size:12px;font-weight:600">Out of 10</th>'
      + '</tr></thead><tbody>';
    history.slice().reverse().forEach(function(h) {
      var scoreColor = h.score >= 8 ? "#10b981" : h.score >= 7 ? "#3b82f6" : h.score >= 6 ? "#f59e0b" : "#f87171";
      var marksDisplay = (h.marksObtained !== undefined && h.marksTotal !== undefined) 
        ? h.marksObtained + "/" + h.marksTotal 
        : h.score + "/10";
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">'
        + '<td style="padding:10px;color:#dde1f0;font-size:13px">' + h.semesterName + '</td>'
        + '<td style="padding:10px;text-align:center;color:#888;font-size:13px">' + marksDisplay + '</td>'
        + '<td style="padding:10px;text-align:center"><span style="background:rgba(' + 
          (h.score >= 8 ? "16,185,129" : h.score >= 7 ? "59,130,246" : h.score >= 6 ? "245,158,11" : "248,113,113") + 
          ',0.1);color:' + scoreColor + ';padding:4px 12px;border-radius:6px;font-weight:700;font-size:13px">' + h.score + '/10</span></td>'
        + '</tr>';
    });
    html += '</tbody></table>'
      + '<button class="btn-sm" style="margin-top:12px" onclick="addExamScoreModal()">+ Add New Exam Score</button>'
      + '</div>';
  } else {
    html += '<div style="background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.2);border-radius:16px;padding:20px;text-align:center">'
      + '<div style="font-size:14px;color:#f87171;font-weight:600;margin-bottom:8px">📊 No exam data yet</div>'
      + '<div style="font-size:12px;color:#888;margin-bottom:12px">Add your past exam scores to get predictions</div>'
      + '<button class="btn-sm" onclick="addExamScoreModal()">+ Add Exam Score</button>'
      + '</div>';
  }
  
  el.innerHTML = html;
}

window.addExamScoreModal = function() {
  var semName = prompt("Enter semester/exam name (e.g., 'Midterm 1', 'Final 2024'):");
  if (!semName) return;
  
  var obtainedStr = prompt("Enter marks obtained (e.g., 75, 18, 90):");
  if (!obtainedStr) return;
  
  var maxStr = prompt("Enter max marks (e.g., 100, 25, 100):");
  if (!maxStr) return;
  
  var obtained = parseFloat(obtainedStr);
  var max = parseFloat(maxStr);
  
  if (isNaN(obtained) || isNaN(max)) {
    toast("Invalid marks!");
    return;
  }
  
  if (typeof PerformancePredictor !== "undefined") {
    var result = PerformancePredictor.addExamScore(currentUser.email, semName, obtained, max);
    toast(result.message);
    if (result.success) buildPerfTab();
  }
};

/* ════════════════════════════════════════════════════════════
   FAVORITE PROFESSOR MODAL
   ════════════════════════════════════════════════════════════ */
window.openFavoriteProfModal = function() {
  if (currentUser.role !== "student") return;
  
  var select = $id("favProfSelect");
  if (select) {
    select.innerHTML = '<option value="">-- No Favorite --</option>';
    PROFESSORS_DATA.forEach(function(p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name + " (" + p.dept + ")";
      select.appendChild(opt);
    });
    
    // Pre-select current favorite if exists
    if (typeof PerformancePredictor !== "undefined") {
      var favProf = PerformancePredictor.getFavoriteProfessor(currentUser.email);
      if (favProf && favProf.id) {
        select.value = favProf.id;
      }
    }
  }
  
  $id("favProfOverlay").classList.add("open");
};

$id("saveFavProfBtn") && $id("saveFavProfBtn").addEventListener("click", function(){
  var select = $id("favProfSelect");
  var profId = select.value;
  
  if (!profId) {
    // Remove favorite
    if (typeof PerformancePredictor !== "undefined") {
      PerformancePredictor.removeFavoriteProfessor(currentUser.email);
      toast("Favorite professor removed!");
      $id("favProfOverlay").classList.remove("open");
      buildPerfTab();
    }
    return;
  }
  
  // Set favorite
  var prof = getProf(parseInt(profId));
  if (prof && typeof PerformancePredictor !== "undefined") {
    PerformancePredictor.setFavoriteProfessor(currentUser.email, prof.id, prof.name);
    toast("✨ " + prof.name + " is now your favorite!");
    $id("favProfOverlay").classList.remove("open");
    buildPerfTab();
  }
});

$id("closeFavProfBtn") && $id("closeFavProfBtn").addEventListener("click", function(){
  $id("favProfOverlay").classList.remove("open");
});

$id("favProfOverlay") && $id("favProfOverlay").addEventListener("click", function(e){
  if (e.target === $id("favProfOverlay")) $id("favProfOverlay").classList.remove("open");
});

/* ── Rebuild all ─────────────────────────────────────────── */
function rebuildAll() {
  try { buildSlideshow(); } catch(e) { console.warn("buildSlideshow error:", e); }
  try { buildStats(); } catch(e) { console.warn("buildStats error:", e); }
  try { buildTopPerformer(); } catch(e) { console.warn("buildTopPerformer error:", e); }
  try { buildTop3(); } catch(e) { console.warn("buildTop3 error:", e); }
  try { buildProfGrid(); } catch(e) { console.warn("buildProfGrid error:", e); }
  try { buildTop10(); } catch(e) { console.warn("buildTop10 error:", e); }
  try { buildDoubtsTab(); } catch(e) { console.warn("buildDoubtsTab error:", e); }
  try { buildMyFeedback(); } catch(e) { console.warn("buildMyFeedback error:", e); }
  try { buildPerfTab(); } catch(e) { console.warn("buildPerfTab error:", e); }
}

rebuildAll();