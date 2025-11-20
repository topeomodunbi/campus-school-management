import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(async () => {
  const user = await User.create({
    email: 'topeomodunbi@gmail.com',
    password: 'password123',
    role: 'admin'
  });
  console.log('Admin created:', user);
  process.exit();
})
.catch(err => console.log(err));
