import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student','staff','admin'], default: 'student' }
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(password){
  return await bcrypt.compare(password, this.password);
}

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
