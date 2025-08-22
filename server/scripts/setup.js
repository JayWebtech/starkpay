#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');

async function createAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Check if admin user already exists
    const existingUser = await query(
      'SELECT id FROM admin_users WHERE email = $1',
      ['admin@starkpay.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await query(
      `INSERT INTO admin_users (email, password_hash, role) 
       VALUES ($1, $2, $3)`,
      ['admin@starkpay.com', hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@starkpay.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Remember to change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

async function setupDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    
    // Initialize database tables
    const { initDatabase } = require('../src/config/database');
    await initDatabase();
    
    console.log('✅ Database initialized successfully');
    
    // Create admin user
    await createAdminUser();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase, createAdminUser };
