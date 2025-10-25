require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('./config/supabase');

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Generate password hash for 'admin123'
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Generated password hash:', passwordHash);
    console.log('Hash length:', passwordHash.length);
    
    // Create admin user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: 'admin@portfolio.com',
        password_hash: passwordHash,
        name: 'Admin User',
        role: 'admin',
        is_active: true
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }
    
    console.log('✅ Admin user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active
    });
    
    // Test password verification
    console.log('\n🧪 Testing password verification...');
    const isValid = await bcrypt.compare('admin123', user.password_hash);
    console.log('Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
    
    console.log('\n🎉 Admin user setup complete!');
    console.log('Login credentials:');
    console.log('Email: admin@portfolio.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error in createAdminUser:', error);
  }
}

createAdminUser();
