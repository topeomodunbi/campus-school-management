import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

const Queue = mongoose.models.Queue || mongoose.model('Queue', queueSchema);
export default Queue;
