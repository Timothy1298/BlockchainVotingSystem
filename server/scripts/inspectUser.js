const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const config = require('../src/config');
const User = require('../src/models/User');

(async function(){
  try {
    const uri = process.env.MONGO_URI || config.mongoUri || 'mongodb://localhost:27017/voting';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const u = await User.findOne({ email: 'admin@example.com' }).lean();
    console.log('Found user:', JSON.stringify(u, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('inspectUser error', err);
    process.exit(1);
  }
})();
