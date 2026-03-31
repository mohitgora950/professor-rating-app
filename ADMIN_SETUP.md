# 📧 EduRate - Admin Performance & Email System

## 🎯 New Features Added

This document explains the new administrator dashboard and email notification system for the EduRate Professor Rating App.

### ✨ Features Implemented

1. **📊 Admin Dashboard**
   - Overview statistics (total teachers, avg rating, top performer)
   - Complete teacher management interface
   - Top performers ranking view
   - Analytics and insights

2. **📧 Email System**
   - Send performance reports to individual teachers
   - Bulk email sending to all teachers at once
   - Email history tracking
   - HTML-formatted performance emails with detailed stats

3. **👨‍🏫 Teacher Performance Tracking**
   - Live rating calculations
   - Doubt-solving metrics
   - Department-wise performance comparison
   - Search and filter capabilities

4. **🔐 Admin Authentication**
   - Secure admin login
   - Session management
   - Role-based access control

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL (v5.7 or higher)
- Gmail account (for email notifications)

### Step 1: Install Backend Dependencies

```bash
cd professor-rating-app
npm install
```

**Required packages:**
- `express` - Web server framework
- `cors` - Cross-origin requests
- `mysql2` - MySQL client
- `nodemailer` - Email service
- `jsonwebtoken` - Authentication
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables

### Step 2: Setup Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=professor_rating_app

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRY=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Admin Email
ADMIN_EMAIL=admin@iiitmanipul.ac.in
ADMIN_NAME=Administrator
```

### Step 3: Setup Gmail for Email Sending

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password to your `.env` file as `EMAIL_PASSWORD`

3. **Test Email Configuration**
   - Run the server and check console for "✅ Email service ready"

### Step 4: Setup Database

Run the admin schema SQL file:

```bash
mysql -u root -p professor_rating_app < sql/admin-schema.sql
```

This will:
- Create `admin_email_logs` table
- Create admin user account
- Create `teacher_performance_summary` view

### Step 5: Start the Backend Server

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

---

## 🔐 Admin Login Credentials

**Default Admin Account:**
- Email: `admin@iiitmanipul.ac.in`
- Password: `admin123`

⚠️ **Important:** Change this password immediately after first login!

---

## 📱 Using the Admin Dashboard

### Access the Dashboard

1. Navigate to: `http://localhost:3000/html/login.html`
2. Login with admin credentials
3. Click on admin dashboard link (or open `/html/admin-dashboard.html`)

### Dashboard Sections

#### 📊 Overview
- Quick statistics of the system
- Top 5 performing teachers
- System health indicators

#### 👨‍🏫 All Teachers
- Complete list of all teachers
- Search by name or email
- Filter by department
- Sort by rating or name
- View detailed profiles
- Quick email actions

#### 🌟 Top Performers
- Rankings of best performing teachers
- Medal indicators (🥇🥈🥉)
- Detailed performance metrics
- Perfect for motivating teachers

#### 📧 Email Center
- **Send to All Teachers**: Bulk email to notify all teachers of their performance
- **Send to Individual**: Select a specific teacher
- Email history tracking
- Success/failure notifications

#### 📈 Analytics
- Rating distribution charts
- Department performance comparison
- Recent activity feed
- Email statistics

---

## 📧 Email Features

### Performance Email Contents

When you send a performance email, teachers receive:

- Rating badge (⭐ stars)
- Total number of ratings received
- Breakdown of ratings (5⭐, 4⭐, 3⭐, <2⭐)
- Number of doubts answered
- Department and subject information
- Tips to improve teaching quality
- Professional HTML formatting

### Sending Emails

#### Bulk Email
```javascript
// Sends to all teachers
POST /api/teachers/send-bulk-performance-emails
```

#### Individual Email
```javascript
// Send to specific teacher
POST /api/teachers/{teacherId}/send-performance-email
```

### Email History

All emails are:
- Logged in the browser's localStorage
- Tracked with timestamp
- Marked as success/failed
- Accessible in Email Center

---

## 🔌 API Endpoints

### For Admins Only

```
GET  /api/admin/top-performers
     - Get top 10 performing teachers
     - Returns: ranking, ratings, stats

GET  /api/admin/all-teachers
     - Get all teachers with performance data
     - Returns: complete teacher list with metrics

POST /api/teachers/send-bulk-performance-emails
     - Send performance emails to all teachers
     - Returns: success/failure count

POST /api/teachers/{teacherId}/send-performance-email
     - Send email to specific teacher
     - Returns: email send status

GET  /api/teachers/performance
     - Get teacher performance statistics
```

### Response Example

```json
[
  {
    "id": 1,
    "name": "Prof. John Doe",
    "email": "john@iiit.ac.in",
    "dept": "CSE",
    "subject": "Data Structures",
    "total_ratings": 45,
    "average_rating": 4.5,
    "excellent": 30,
    "good": 12,
    "average": 3,
    "poor": 0,
    "doubts_answered": 28,
    "last_rated": "2024-03-31T10:30:00Z"
  }
]
```

---

## 🛠️ Troubleshooting

### Email Not Sending

1. **Check .env file**
   - Verify EMAIL_USER and EMAIL_PASSWORD are correct
   - Check server console for errors

2. **Gmail App Password Issues**
   - Make sure 2FA is enabled
   - Regenerate app password if needed
   - App passwords don't work with 2FA disabled

3. **SMTP Connection Error**
   - Check internet connection
   - Verify Gmail hasn't blocked the connection
   - Allow less secure apps in Gmail settings

### Dashboard Not Loading

1. **Backend server not running**
   - Make sure `npm run dev` is executing

2. **CORS errors**
   - Check that API_BASE in admin-dashboard.js matches server URL
   - Verify CORS middleware is enabled in server.js

3. **Authentication failed**
   - Verify token is being sent correctly
   - Check JWT_SECRET in .env

### Database Connection Error

1. **MySQL not running**
   - Start MySQL service

2. **Wrong credentials**
   - Verify DB_USER, DB_PASSWORD, DB_HOST in .env
   - Confirm database exists

3. **Tables not created**
   - Run `sql/admin-schema.sql` again

---

## 📊 Performance Metrics

The system tracks:

| Metric | Description | Use Case |
|--------|-------------|----------|
| **Average Rating** | Mean of all student ratings (1-5) | Overall quality |
| **Total Ratings** | Number of ratings received | Popularity/Engagement |
| **Rating Distribution** | Count by star level | Category breakdown |
| **Doubts Answered** | Number of student questions resolved | Teacher engagement |
| **Excellent %** | Percentage of 5-star ratings | Excellence indicator |

---

## 🔒 Security Best Practices

1. **Change Default Password**
   - Immediately change admin password after setup

2. **Secure Environment Variables**
   - Never commit `.env` to version control
   - Use `.gitignore` to exclude it

3. **JWT Secrets**
   - Use a strong, random JWT_SECRET
   - Update it periodically

4. **Database Security**
   - Use strong MySQL password
   - Restrict user permissions appropriately

5. **Email Credentials**
   - Never share app passwords
   - Use app passwords (not real Gmail password)

---

## 📝 File Structure

```
professor-rating-app/
├── server.js                    ← Main backend server
├── package.json                 ← Dependencies
├── .env                        ← Configuration (don't commit!)
├── .env.example                ← Example configuration
├── html/
│   ├── admin-dashboard.html    ← Admin interface
│   ├── login.html              ← Login page
│   └── dashboard.html          ← Student/Teacher dashboard
├── js/
│   ├── admin-dashboard.js      ← Admin logic
│   ├── auth.js                 ← Authentication
│   └── ...other files
├── css/
│   ├── admin-dashboard.css     ← Admin styles
│   └── ...other stylesheets
└── sql/
    ├── schema.sql              ← Main database schema
    └── admin-schema.sql        ← Admin tables & views
```

---

## 🚀 Deployment

### For Production

1. **Set NODE_ENV**
   ```
   NODE_ENV=production
   ```

2. **Use a Process Manager**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "edurate-api"
   ```

3. **Setup Reverse Proxy**
   - Use Nginx/Apache to forward requests
   - Enable HTTPS with SSL certificate

4. **Database Backup**
   - Regular MySQL backups
   - Store offline copies

---

## 📞 Support

For issues or questions:
1. Check the log files
2. Review error messages in browser console
3. Verify all prerequisites are installed
4. Check database connectivity

---

## 📄 License

MIT License - IIIT Manipur (2026)

---

**Version:** 2.0.0  
**Last Updated:** March 31, 2026  
**Created by:** EduRate Development Team
