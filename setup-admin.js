/* ============================================================
   setup-admin.js — Create/Reset Admin User
   Run this ONCE to add admin user to your database
   Usage: node setup-admin.js
   ============================================================ */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupAdmin() {
  try {
    console.log('🔧 Starting admin user setup...');

    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'professor_rating_app'
    });

    console.log('✅ Connected to database');

    // Step 1: Update users table to add 'admin' role if it doesn't exist
    console.log('\n📋 Checking users table structure...');
    try {
      // Check current role enum values
      const [columns] = await connection.query(
        `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = ?`,
        [process.env.DB_NAME || 'professor_rating_app']
      );

      if (columns.length > 0) {
        const roleType = columns[0].COLUMN_TYPE;
        console.log('Current role enum:',roleType);

        if (!roleType.includes('admin')) {
          console.log('⚠️  Admin role not found. Adding it...');
          await connection.query(
            `ALTER TABLE users MODIFY role ENUM('student','professor','admin') DEFAULT 'student'`
          );
          console.log('✅ Admin role added to users table');
        } else {
          console.log('✅ Admin role already exists');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not check role enum:', error.message);
      console.log('Attempting to add admin role anyway...');
      try {
        await connection.query(
          `ALTER TABLE users MODIFY role ENUM('student','professor','admin') DEFAULT 'student'`
        );
        console.log('✅ Admin role added to users table');
      } catch (e) {
        console.log('Note: If role is already defined differently, thats okay');
      }
    }

    // Step 2: Hash the admin password
    console.log('\n🔐 Hashing admin password...');
    const adminEmail = 'admin@iiitmanipul.ac.in';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed');
    console.log('   Hash:', hashedPassword.substring(0, 30) + '...');

    // Step 3: Check if admin user exists
    console.log('\n👤 Checking for existing admin user...');
    const [existingAdmin] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists:', existingAdmin[0]);
      console.log('\n🔄 Updating admin user with new password...');

      await connection.query(
        'UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?',
        ['Administrator', hashedPassword, 'admin', adminEmail]
      );
      console.log('✅ Admin user updated');
    } else {
      console.log('ℹ️  Admin user does not exist. Creating it...');

      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Administrator', adminEmail, hashedPassword, 'admin']
      );
      console.log('✅ Admin user created');
    }

    // Step 4: Verify the admin user
    console.log('\n✔️  Verifying admin user...');
    const [admin] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [adminEmail]
    );

    if (admin.length > 0) {
      console.log('✅ Admin user verified:');
      console.log('   ID:', admin[0].id);
      console.log('   Name:', admin[0].name);
      console.log('   Email:', admin[0].email);
      console.log('   Role:', admin[0].role);
    }

    // Step 5: Test password verification
    console.log('\n🧪 Testing password verification...');
    const [testUser] = await connection.query(
      'SELECT password FROM users WHERE email = ?',
      [adminEmail]
    );

    if (testUser.length > 0) {
      const match = await bcrypt.compare(adminPassword, testUser[0].password);
      console.log('Password match test:', match ? '✅ PASS' : '❌ FAIL');
    }

    await connection.end();

    console.log('\n' + '='.repeat(50));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📝 Login Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n💡 Test your login at: http://localhost:3000/html/login.html');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupAdmin();
