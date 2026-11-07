const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const Admin = require('../models/admin-models/Admin');

async function seedSuperAdmin() {
  try {
    await mongoose.connect(env.MONGO_URI);
    const email = 'super@gmail.com';
    const passwordHash = await bcrypt.hash('123', 10);

    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        name: 'Super Admin',
        email,
        passwordHash,
        role_admin: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Super admin ready: ${admin.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Super admin seed error:', err.message);
    process.exit(1);
  }
}

seedSuperAdmin();
