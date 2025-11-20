import express from 'express';
import Queue from '../models/Queue.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Function to calculate estimated time per user (assuming 5 min per user)
const calculateEstimatedTime = (queue) => {
  return queue.users.map((userId, index) => ({
    user: userId,
    estimatedTime: (index + 1) * 5, // 5 minutes per user
  }));
};

// GET all queues
router.get('/', protect, async (req, res) => {
  try {
    const queues = await Queue.find().populate('users', 'email role');
    const queuesWithTime = queues.map(queue => {
      const usersWithTime = calculateEstimatedTime(queue);
      return {
        ...queue.toObject(),
        users: usersWithTime.map((u, i) => ({
          _id: queue.users[i]._id,
          email: queue.users[i].email,
          role: queue.users[i].role,
          estimatedTime: u.estimatedTime
        })),
      };
    });
    res.json(queuesWithTime);
  } catch (err) {
    console.error('Fetch queues error:', err);
    res.status(500).json({ message: 'Failed to fetch queues', details: err.message });
  }
});

// GET specific queue
router.get('/:id', protect, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).populate('users', 'email role');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const usersWithTime = calculateEstimatedTime(queue);
    const queueWithTime = {
      ...queue.toObject(),
      users: usersWithTime.map((u, i) => ({
        _id: queue.users[i]._id,
        email: queue.users[i].email,
        role: queue.users[i].role,
        estimatedTime: u.estimatedTime
      })),
    };

    res.json(queueWithTime);
  } catch (err) {
    console.error('Fetch queue error:', err);
    res.status(500).json({ message: 'Failed to fetch queue', details: err.message });
  }
});

// Create queue (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { serviceName } = req.body;
    if (!serviceName) {
      return res.status(400).json({ message: 'Service name required' });
    }
    
    const newQueue = await Queue.create({ serviceName, users: [] });
    res.status(201).json(newQueue);
  } catch (err) {
    console.error('Create queue error:', err);
    res.status(500).json({ message: 'Failed to add queue', details: err.message });
  }
});

// Delete queue (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deleted = await Queue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Queue not found' });

    res.json({ message: 'Queue deleted' });
  } catch (err) {
    console.error('Delete queue error:', err);
    res.status(500).json({ message: 'Failed to delete queue', details: err.message });
  }
});

// Join queue - NOW CHECKS IF USER IS ALREADY IN ANY QUEUE
router.post('/join/:id', protect, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).populate('users', 'email role');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    // Check if user is already in this queue
    if (queue.users.some(u => u._id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already in queue' });
    }

    // *** NEW: Check if user is in ANY other queue ***
    const allQueues = await Queue.find();
    const isInAnyQueue = allQueues.some(q => 
      q.users.some(userId => userId.toString() === req.user._id.toString())
    );

    if (isInAnyQueue) {
      return res.status(400).json({ 
        message: 'You are already in another queue. Please leave that queue first.' 
      });
    }

    queue.users.push(req.user._id);
    await queue.save();

    // Re-populate after save
    await queue.populate('users', 'email role');

    // Return updated queue with estimated times
    const usersWithTime = calculateEstimatedTime(queue);
    const queueWithTime = {
      ...queue.toObject(),
      users: usersWithTime.map((u, i) => ({
        _id: queue.users[i]._id,
        email: queue.users[i].email,
        role: queue.users[i].role,
        estimatedTime: u.estimatedTime
      })),
    };

    res.json(queueWithTime);
  } catch (err) {
    console.error('Join queue error:', err);
    res.status(500).json({ message: 'Failed to join queue', details: err.message });
  }
});

// Leave queue
router.post('/leave/:id', protect, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).populate('users', 'email role');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    queue.users = queue.users.filter(u => u._id.toString() !== req.user._id.toString());
    await queue.save();

    // Re-populate after save to ensure we have user details
    await queue.populate('users', 'email role');

    // Return updated queue with estimated times
    const usersWithTime = calculateEstimatedTime(queue);
    const queueWithTime = {
      ...queue.toObject(),
      users: usersWithTime.map((u, i) => ({
        _id: queue.users[i]._id,
        email: queue.users[i].email,
        role: queue.users[i].role,
        estimatedTime: u.estimatedTime
      })),
    };

    res.json(queueWithTime);
  } catch (err) {
    console.error('Leave queue error:', err);
    res.status(500).json({ message: 'Failed to leave queue', details: err.message });
  }
});

export default router;