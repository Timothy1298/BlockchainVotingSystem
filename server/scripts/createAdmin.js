const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const config = require('../src/config');

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    const adminData = {
      fullName: 'System Administrator',
      email: 'admin@voting.com',
      password: 'admin123',
      role: 'admin'
    };

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create the admin user
    const admin = new User({
      fullName: adminData.fullName,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role:', adminData.role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Run the script
createAdmin().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
