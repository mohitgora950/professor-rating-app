# 🚀 Quick Start Guide - EduRate Admin System

## Installation (5 Minutes)

### 1️⃣ Install Node.js Dependencies
```bash
npm install
```

### 2️⃣ Setup Gmail Email Service

**Option A: Using Your Personal Gmail**
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password

**Option B: Using a School Gmail (Recommended)**
1. Ask IT admin to enable "Less secure app access"
2. Use school email for EMAIL_USER

### 3️⃣ Create `.env` File

Copy from `.env.example` and fill in:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password (16 chars from step 2)
JWT_SECRET=make_this_very_random_string
```

### 4️⃣ Setup Database

```bash
mysql -u root -p professor_rating_app < sql/admin-schema.sql
```

### 5️⃣ Start the Server

```bash
npm run dev
```

✅ Server running on `http://localhost:3000`

---

## 📧 First Email Send (1 Minute)

1. Go to: `http://localhost:3000/html/login.html`
2. Login: 
   - Email: `admin@iiitmanipul.ac.in`
   - Password: `admin123`
3. Click "Admin Dashboard"
4. Go to "📧 Email Center"
5. Click "Send Bulk Email" or select a teacher

---

## 🎯 Key Features

| Feature | Purpose | Where |
|---------|---------|-------|
| 📊 Overview | See all stats at a glance | Dashboard Home |
| 👨‍🏫 All Teachers | Manage & search teachers | "All Teachers" tab |
| 🌟 Rankings | See top performers | "Top Performers" tab |
| 📧 Email | Send performance reports | "Email Center" tab |
| 📈 Analytics | View insights & metrics | "Analytics" tab |

---

## ⚠️ Common Issues & Fixes

### "Email service error"
- ❌ App password is wrong
- ✅ Regenerate from https://myaccount.google.com/apppasswords

### "Cannot connect to MySQL"
- ❌ MySQL not running
- ✅ Start MySQL service

### "Table doesn't exist"
- ❌ SQL schema not imported
- ✅ Run: `mysql -u root -p professor_rating_app < sql/admin-schema.sql`

### "401 Unauthorized"
- ❌ Token invalid or expired
- ✅ Login again

---

## 📁 File Changes

New files created:
- `server.js` - Backend API
- `html/admin-dashboard.html` - Admin interface
- `js/admin-dashboard.js` - Admin logic
- `css/admin-dashboard.css` - Admin styling
- `sql/admin-schema.sql` - Database tables
- `ADMIN_SETUP.md` - Full documentation
- `.env` - Configuration (create from .env.example)
- `package.json` - Dependencies

---

## 🔄 Update Process

If updating from old version:
```bash
git pull
npm install                    # New dependencies
sql/admin-schema.sql          # New database tables
npm run dev                    # Start server
```

---

## 📞 Need Help?

1. Check console for error messages
2. Read ADMIN_SETUP.md for detailed docs
3. Verify .env file has all required fields
4. Check MySQL is running
5. Ensure port 3000 is not in use

---

**You're all set! 🎉**

The admin system is now ready to:
- ✅ Track teacher performance
- ✅ Send performance emails
- ✅ View rankings & analytics
- ✅ Manage user data
