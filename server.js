/* ============================================================
   server.js  —  Node.js/Express Backend for Professor Rating App
   Features: Email notifications, Admin dashboard, Performance reports
   ============================================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// ─────────────────────────────────────────────────────────
//  DATABASE SETUP
// ─────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'professor_rating_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ─────────────────────────────────────────────────────────
//  EMAIL CONFIGURATION
// ─────────────────────────────────────────────────────────
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test email connection
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// ─────────────────────────────────────────────────────────
//  AUTHENTICATION MIDDLEWARE
// ─────────────────────────────────────────────────────────
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─────────────────────────────────────────────────────────
//  API: LOGIN (No auth required)
// ─────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('📧 Login attempt with email:', email);

    // Get connection from pool
    const connection = await pool.getConnection();
    
    try {
      // Fetch user from database by email
      const [users] = await connection.query(
        'SELECT id, name, email, password, role FROM users WHERE email = ?',
        [email]
      );

      // User not found
      if (users.length === 0) {
        console.log('❌ User not found for email:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = users[0];
      console.log('✅ User found in database:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash: user.password ? user.password.substring(0, 20) + '...' : 'null'
      });

      // Compare plaintext password with bcrypt hash
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match result:', passwordMatch);

      if (!passwordMatch) {
        console.log('❌ Password mismatch for email:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      console.log('✅ Login successful for email:', email);

      // Return success response
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─────────────────────────────────────────────────────────
//  API: REGISTER (No auth required)
// ─────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate role
    const validRoles = ['student', 'professor'];
    const userRole = role || 'student';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    console.log('📝 Registration attempt with email:', email, 'Role:', userRole);

    // Get connection from pool
    const connection = await pool.getConnection();
    
    try {
      // Check if email already exists
      const [existingUsers] = await connection.query(
        'SELECT id, email FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        console.log('❌ Email already registered:', email);
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, userRole]
      );

      const userId = result.insertId;
      console.log('✅ User registered successfully:', {
        id: userId,
        name: name,
        email: email,
        role: userRole
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: userId,
          email: email,
          name: name,
          role: userRole
        },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      // Return success response
      res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          name: name,
          email: email,
          role: userRole
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Registration error:', error.message, error.stack);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─────────────────────────────────────────────────────────
//  API: GET TEACHER PERFORMANCE STATS
// ─────────────────────────────────────────────────────────
app.get('/api/teachers/performance', authMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [professors] = await connection.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.dept,
        p.subject,
        COUNT(r.id) as total_ratings,
        AVG(r.stars) as average_rating,
        COUNT(d.id) as doubts_answered
      FROM professors p
      LEFT JOIN ratings r ON p.id = r.professor_id
      LEFT JOIN doubts d ON p.id = d.professor_id AND d.answered_at IS NOT NULL
      GROUP BY p.id
      ORDER BY average_rating DESC
    `);

    connection.release();
    res.json(professors);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// ─────────────────────────────────────────────────────────
//  API: SEND PERFORMANCE EMAIL TO TEACHER
// ─────────────────────────────────────────────────────────
app.post('/api/teachers/:teacherId/send-performance-email', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { teacherId } = req.params;
    const connection = await pool.getConnection();

    // Fetch teacher performance data
    const [profData] = await connection.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.dept,
        p.subject,
        COUNT(r.id) as total_ratings,
        AVG(r.stars) as average_rating,
        SUM(CASE WHEN r.stars = 5 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN r.stars = 4 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN r.stars = 3 THEN 1 ELSE 0 END) as average,
        SUM(CASE WHEN r.stars <= 2 THEN 1 ELSE 0 END) as poor,
        COUNT(d.id) as doubts_answered
      FROM professors p
      LEFT JOIN ratings r ON p.id = r.professor_id
      LEFT JOIN doubts d ON p.id = d.professor_id AND d.answered_at IS NOT NULL
      WHERE p.id = ?
      GROUP BY p.id
    `, [teacherId]);

    if (profData.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const prof = profData[0];

    // Generate performance email HTML
    const emailHTML = generatePerformanceEmailHTML(prof);

    // Send email
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: prof.email,
      subject: `📊 Your Performance Report - EduRate`,
      html: emailHTML
    });

    connection.release();
    res.json({ 
      success: true, 
      message: `Performance email sent to ${prof.name}`,
      data: prof 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ─────────────────────────────────────────────────────────
//  API: BULK SEND EMAILS TO ALL TEACHERS
// ─────────────────────────────────────────────────────────
app.post('/api/teachers/send-bulk-performance-emails', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const connection = await pool.getConnection();

    // Fetch all teacher performance data
    const [allProfs] = await connection.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.dept,
        p.subject,
        COUNT(r.id) as total_ratings,
        AVG(r.stars) as average_rating,
        SUM(CASE WHEN r.stars = 5 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN r.stars = 4 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN r.stars = 3 THEN 1 ELSE 0 END) as average,
        SUM(CASE WHEN r.stars <= 2 THEN 1 ELSE 0 END) as poor,
        COUNT(d.id) as doubts_answered
      FROM professors p
      LEFT JOIN ratings r ON p.id = r.professor_id
      LEFT JOIN doubts d ON p.id = d.professor_id AND d.answered_at IS NOT NULL
      GROUP BY p.id
      ORDER BY average_rating DESC
    `);

    let successCount = 0;
    let failureCount = 0;

    // Send email to each teacher
    for (const prof of allProfs) {
      try {
        const emailHTML = generatePerformanceEmailHTML(prof);
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: prof.email,
          subject: `📊 Your Performance Report - EduRate`,
          html: emailHTML
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send email to ${prof.email}:`, err);
        failureCount++;
      }
    }

    connection.release();
    res.json({ 
      success: true, 
      message: `Bulk emails sent: ${successCount} success, ${failureCount} failed`,
      data: { successCount, failureCount, totalTeachers: allProfs.length }
    });

  } catch (error) {
    console.error('Error in bulk email:', error);
    res.status(500).json({ error: 'Failed to send bulk emails' });
  }
});

// ─────────────────────────────────────────────────────────
//  API: GET TOP PERFORMERS (ADMIN VIEW)
// ─────────────────────────────────────────────────────────
app.get('/api/admin/top-performers', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const connection = await pool.getConnection();
    
    const [topProfs] = await connection.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.dept,
        p.subject,
        p.image_url as image,
        COUNT(r.id) as total_ratings,
        AVG(r.stars) as average_rating,
        COUNT(d.id) as doubts_answered,
        MAX(r.created_at) as last_rated
      FROM professors p
      LEFT JOIN ratings r ON p.id = r.professor_id
      LEFT JOIN doubts d ON p.id = d.professor_id AND d.answered_at IS NOT NULL
      GROUP BY p.id
      ORDER BY average_rating DESC, total_ratings DESC
      LIMIT 10
    `);

    connection.release();
    res.json(topProfs);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ─────────────────────────────────────────────────────────
//  API: GET ALL TEACHERS WITH PERFORMANCE (ADMIN DASHBOARD)
// ─────────────────────────────────────────────────────────
app.get('/api/admin/all-teachers', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const connection = await pool.getConnection();
    
    const [allProfs] = await connection.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.dept,
        p.subject,
        p.image_url as image,
        COUNT(r.id) as total_ratings,
        AVG(r.stars) as average_rating,
        COUNT(d.id) as doubts_answered,
        MAX(r.created_at) as last_rated
      FROM professors p
      LEFT JOIN ratings r ON p.id = r.professor_id
      LEFT JOIN doubts d ON p.id = d.professor_id AND d.answered_at IS NOT NULL
      GROUP BY p.id
      ORDER BY average_rating DESC
    `);

    connection.release();
    res.json(allProfs);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// ─────────────────────────────────────────────────────────
//  HELPER: Generate Performance Email HTML
// ─────────────────────────────────────────────────────────
function generatePerformanceEmailHTML(prof) {
  const avgRating = prof.average_rating ? parseFloat(prof.average_rating).toFixed(1) : 'N/A';
  const stars = '⭐'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
        .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .stat-value { font-weight: bold; color: #667eea; font-size: 18px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        .rating-badge { font-size: 32px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Performance Report</h1>
          <p>EduRate - Professor Rating System</p>
        </div>

        <div class="content">
          <h2>Hi ${prof.name},</h2>
          <p>Here is your performance summary on the EduRate platform:</p>

          <div class="rating-badge">${stars}<br><span style="font-size: 24px; color: #667eea;">${avgRating} / 5.0</span></div>

          <div class="stat">
            <span>Total Ratings Received</span>
            <span class="stat-value">${prof.total_ratings || 0}</span>
          </div>

          <div class="stat">
            <span>Excellent Ratings (5⭐)</span>
            <span class="stat-value">${prof.excellent || 0}</span>
          </div>

          <div class="stat">
            <span>Good Ratings (4⭐)</span>
            <span class="stat-value">${prof.good || 0}</span>
          </div>

          <div class="stat">
            <span>Average Ratings (3⭐)</span>
            <span class="stat-value">${prof.average || 0}</span>
          </div>

          <div class="stat">
            <span>Doubts Answered</span>
            <span class="stat-value">${prof.doubts_answered || 0}</span>
          </div>

          <div class="stat">
            <span>Department</span>
            <span class="stat-value">${prof.dept}</span>
          </div>

          <div class="stat" style="border: none;">
            <span>Subject</span>
            <span class="stat-value">${prof.subject}</span>
          </div>
        </div>

        <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #667eea; margin-top: 0;">💡 Tips to Improve</h3>
          <ul>
            <li>Engage more with students through the doubt-solving feature</li>
            <li>Regular interaction increases teaching credibility</li>
            <li>Maintain consistent quality of teaching materials</li>
            <li>Respond quickly to student questions</li>
          </ul>
        </div>

        <div class="footer">
          <p>This is an automated message from EduRate - Professor Rating System</p>
          <p>© 2026 IIIT Manipur. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📧 Email service configured');
  console.log('🔐 Database connected');
});

module.exports = app;
