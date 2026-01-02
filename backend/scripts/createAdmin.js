import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-qa';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('\n❌ User already exists. Updating role to admin...');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ User role updated to admin');
    } else {
      const user = new User({
        username,
        email,
        password,
        role: 'admin'
      });
      await user.save();
      console.log('\n✅ Admin user created successfully');
    }

    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

