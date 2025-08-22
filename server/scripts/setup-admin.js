const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'starkpay',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const checkResult = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      ['admin@starkpay.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const password = 'admin123'; // Default password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, role) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, role`,
      ['admin@starkpay.com', '$2a$12$HoG2tLDSx/FO.AkrzNl2KOqTd2TkC9/aLdJPUgfSYZpJ8pGxj6gPa', 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@starkpay.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
