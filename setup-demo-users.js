/* ============================================================
   setup-demo-users.js — Create Demo Student & Professor Users
   Run this ONCE to add demo users for testing
   Usage: node setup-demo-users.js
   ============================================================ */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDemoUsers() {
  try {
    console.log('🔧 Starting demo users setup...');

    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'professor_rating_app'
    });

    console.log('✅ Connected to database');

    // Demo users to create
    const demoUsers = [
      {
        name: 'Ravi Kumar',
        email: 'ravi@student.edu',
        password: 'ravi123',
        role: 'student',
        description: 'Demo Student'
      },
      {
        name: 'Prof. Krishnan Baskar',
        email: 'director@iiitmanipur.ac.in',
        password: 'prof123',
        role: 'professor',
        description: 'Demo Professor'
      }
    ];

    console.log('\n📝 Creating demo users...\n');

    for (const userConfig of demoUsers) {
      try {
        // Check if user exists
        const [existing] = await connection.query(
          'SELECT id, email FROM users WHERE email = ?',
          [userConfig.email]
        );

        if (existing.length > 0) {
          console.log(`⚠️  ${userConfig.description} already exists:`, userConfig.email);
          
          // Update password
          const hashedPassword = await bcrypt.hash(userConfig.password, 10);
          await connection.query(
            'UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?',
            [userConfig.name, hashedPassword, userConfig.role, userConfig.email]
          );
          console.log(`   ✅ Updated password\n`);
        } else {
          // Hash password
          const hashedPassword = await bcrypt.hash(userConfig.password, 10);

          // Insert user
          await connection.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [userConfig.name, userConfig.email, hashedPassword, userConfig.role]
          );
          console.log(`✅ ${userConfig.description} created:`);
          console.log(`   Email: ${userConfig.email}`);
          console.log(`   Password: ${userConfig.password}\n`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${userConfig.description}:`, error.message);
      }
    }

    // Verify users
    console.log('\n✔️  Verifying users...\n');
    const [users] = await connection.query('SELECT id, name, email, role FROM users WHERE role IN ("student", "professor")');
    
    users.forEach(user => {
      console.log(`✅ ${user.role.toUpperCase()}: ${user.name} (${user.email})`);
    });

    await connection.end();

    console.log('\n' + '='.repeat(50));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📝 Demo Login Credentials:\n');
    console.log('   STUDENT:');
    console.log('   ├─ Email: ravi@student.edu');
    console.log('   └─ Password: ravi123\n');
    console.log('   PROFESSOR:');
    console.log('   ├─ Email: director@iiitmanipur.ac.in');
    console.log('   └─ Password: prof123\n');
    console.log('   ADMIN:');
    console.log('   ├─ Email: admin@iiitmanipul.ac.in');
    console.log('   └─ Password: admin123\n');
    console.log('💡 Test your login at: http://localhost:3000/html/login.html');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDemoUsers();
