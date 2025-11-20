import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import queueRoutes from './routes/queues.js';
import authRoutes from './routes/auth.js';
import Queue from './models/Queue.js';

dotenv.config();

const app = express();

// CORS MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/queues', queueRoutes);
app.use('/api/users', authRoutes); // <-- Changed to /api/users

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { 
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Notify users when their turn is approaching
const notifyUsers = async () => {
  try {
    const queues = await Queue.find().populate('users', 'email role');
    queues.forEach(queue => {
      if (queue.users.length > 0) {
        const nextUser = queue.users[0];
        io.to(nextUser._id.toString()).emit('yourTurn', {
          serviceName: queue.serviceName,
          message: `It's almost your turn!`
        });
      }
    });
  } catch (err) {
    console.error('Notify users error:', err);
  }
};

// Poll every 30 seconds
setInterval(notifyUsers, 30000);

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
