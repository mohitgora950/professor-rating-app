# 🎓 EduRate — Professor Rating App
### IIIT Manipur | Complete Project with Admin Features

**Version 2.0** - Now with performance tracking & email notifications! 📧

---

## 📁 Project Folder Structure

```
professor-rating-app/
│
├── 📂 html/                    ← All HTML pages
│   ├── login.html              ← Login page (Email + Password)
│   ├── register.html           ← Create Account page
│   ├── dashboard.html          ← Main dashboard (students & teachers)
│   └── admin-dashboard.html    ← 🆕 Admin panel (performance & emails)
│
├── 📂 css/                     ← All stylesheets
│   ├── auth.css                ← Login & Register styles
│   ├── dashboard.css           ← Nav, tabs, stats, home
│   ├── professors.css          ← Professor cards, top 3, top 10
│   ├── modals.css              ← Rate, Gift, Doubt, Profile modals
│   └── admin-dashboard.css     ← 🆕 Admin panel styles
│
├── 📂 js/                      ← All JavaScript files
│   ├── data.js                 ← All 18 professor data + helpers
│   ├── auth.js                 ← Login, Register, Session (localStorage)
│   ├── chatbot.js              ← Abusive word filter / chatbot guard
│   ├── rating.js               ← Rating & gift system logic
│   ├── doubts.js               ← Doubt system (max 2 per day)
│   ├── dashboard.js            ← Main controller (render + events)
│   └── admin-dashboard.js      ← 🆕 Admin panel logic & API calls
│
├── 📂 sql/                     ← Database (for backend version)
│   ├── schema.sql              ← Full MySQL schema + seed data
│   └── admin-schema.sql        ← 🆕 Admin tables & views
│
├── 📂 assets/                  ← Images, icons (add professor photos here)
│
├── server.js                   ← 🆕 Node.js/Express backend server
├── package.json                ← 🆕 Node.js dependencies
├── .env                        ← 🆕 Environment configuration (create from .env.example)
├── .env.example                ← 🆕 Example .env template
├── .gitignore                  ← 🆕 Git ignore file
├── ADMIN_SETUP.md              ← 🆕 Complete admin system documentation
├── QUICK_START.md              ← 🆕 5-minute quick start guide
└── README.md                   ← This file
```

---

## 🚀 How to Run

### Option 1 — Frontend Only (Simple)
```bash
# Just open in browser
html/login.html
# Everything runs using localStorage — no server needed!
```

### Option 2 — Full Stack with Admin Features (Recommended)
```bash
# 1. Install dependencies
npm install

# 2. Setup .env file (see QUICK_START.md)
cp .env.example .env
# Edit .env with your Gmail credentials

# 3. Setup database
mysql -u root -p professor_rating_app < sql/admin-schema.sql

# 4. Start backend server
npm run dev

# 5. Open in browser
http://localhost:3000/html/login.html
```

**See [QUICK_START.md](QUICK_START.md) for 5-minute setup!**

---

## 🔐 Demo Accounts
| Role      | Email                          | Password |
|-----------|-------------------------------|----------|
| Student   | ravi@student.edu              | ravi123  |
| Professor | director@iiitmanipur.ac.in    | prof123  |
| 👨‍💼 **Admin** | **admin@iiitmanipul.ac.in**    | **admin123** |

Create your own account via **Register** page — it saves permanently!

---

## ✨ What's New in v2.0

### 🆕 Admin Dashboard Features
- **📊 Performance Overview** — Real-time stats on all teachers
- **📧 Email System** — Send performance reports to teachers
- **🌟 Rankings** — View top-performing teachers with medals
- **👨‍🏫 Teacher Management** — Search, filter, and manage all teachers
- **📈 Analytics** — Visualize performance data and trends

### 🆕 Email Notifications
- Teachers receive performance reports via email
- HTML-formatted with detailed statistics
- Bulk email or individual teacher sending
- Email history tracking

### 🆕 Backend Server
- Node.js/Express API
- Secure authentication with JWT
- MySQL database integration
- RESTful endpoints for all operations

---

## 📋 Features (from notebook)

### 1. Login / Register
- Email + Password based auth
- Account saved to localStorage (no need to re-register)
- Auto-redirect if already logged in

### 2. Dashboard — 3 Tabs
- **🏠 Home** — Slideshow of all professors ranked by rating, Top Performer card
- **👨‍🏫 Professors** — Top 3 (🥇🥈🥉 with photos), All professors grid, Search + Filter
- **🏆 Top 10** — Ranked list with rating bar
- **❓ Doubts** — Student doubt board
- **📊 My Feedback** — Professor-only tab to see their feedback

### 3. Rating Changes Every 2 Months
- Note shown on Home tab
- Ratings computed live from submitted data

### 4. Give Rating (Students only)
- ⭐ 1–5 star rating
- Suggestion/feedback text box
- **Chatbot guard** — blocks abusive/inappropriate words in real-time
- Constructive feedback encouraged

### 5. Every Teacher Profile
- Photo / avatar
- LinkedIn, Instagram, Facebook links
- Email, Phone contact
- Research Interests
- Achievements

### 6. Doubts Section
- Students can post doubts
- **Max 2 doubts per day** (enforced)
- Professors can answer doubts
- Chatbot guard on doubt text too

---

## 🆕 v2.0: Admin Dashboard Features

### 📊 Dashboard Overview
- **Statistics Cards** — Total teachers, average rating, top performer, emails sent
- **Top 5 Rankings** — Quick view of best performing teachers
- **Performance Metrics** — Real-time calculation from student ratings

### 👨‍🏫 Teacher Management
- **Complete Teacher List** — View all teachers with performance data
- **Advanced Search** — Search by name or email
- **Department Filter** — Filter by CSE, ECE, or HBS
- **Smart Sorting** — Sort by rating or name
- **Individual Profiles** — Detailed view of each teacher's performance

### 📧 Email System
- **Bulk Email** — Send performance reports to all teachers at once
- **Individual Email** — Select and email specific teachers
- **Email History** — Track all emails sent with timestamps
- **Success/Failure Logs** — Monitor email delivery status
- **HTML Templates** — Beautiful, professional email formatting

### 🌟 Performance Rankings
- **Top 10 Performers** — Medal badges (🥇🥈🥉) for top 3
- **Detailed Metrics** — Rating, total reviews, doubts answered per teacher
- **Sortable Data** — Rank by average rating or engagement

### 📈 Analytics & Insights
- **Activity Feeds** — Recent system activities and email sends
- **Statistics** — Emails sent count, success rate, last send time
- **Department Comparison** — See performance across different departments

### 🔐 Admin Authentication
- Secure login system
- JWT token-based authentication  
- Session management
- Role-based access control

---

## 🗄️ Database (SQL — for backend use)

Tables: `users`, `professors`, `ratings`, `doubts`, `gifts`, `sessions`, `admin_email_logs`

Views:
- `professor_ratings` — computed avg rating per professor
- `top10_professors` — top 10 by rating
- `student_daily_doubts` — today's doubt count per student
- `teacher_performance_summary` — complete performance metrics per teacher

---

## 🛡️ Chatbot Guard (Abusive Word Filter)
File: `js/chatbot.js`

- Checks feedback & doubt text for inappropriate words
- Works in English + Hindi transliterations
- Shows warning in real-time as student types
- Blocks submission if bad words detected
- Encourages constructive feedback

---

## 🔮 Future Improvements
- [x] Backend with Node.js / Express + MySQL
- [x] Admin panel for institute
- [x] Email notifications for teachers
- [x] Performance tracking & analytics
- [ ] Email verification on register
- [ ] Rating reset every 2 months (cron job)
- [ ] Push notifications for doubt answers
- [ ] Export ratings as PDF report
- [ ] Automated performance alerts
