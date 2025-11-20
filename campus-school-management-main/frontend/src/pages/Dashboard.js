import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifiedPositionsRef = useRef(new Map()); // Track notifications by queue and position
  const userId = localStorage.getItem('userId');

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const fetchQueues = async () => {
    try {
      const res = await api.get('/queues');
      setQueues(res.data);

      // Check notifications for current user
      res.data.forEach(queue => {
        const userIndex = queue.users.findIndex(u => {
          if (!u) return false;
          return (u.user?._id || u._id || u.toString()) === userId;
        });

        if (userIndex !== -1) {
          const userData = queue.users[userIndex];
          const estimatedTime = userData.estimatedTime || 0;
          const position = userIndex + 1;
          
          // Get or create notification tracking for this queue
          if (!notifiedPositionsRef.current.has(queue._id)) {
            notifiedPositionsRef.current.set(queue._id, new Set());
          }
          const notifiedPositions = notifiedPositionsRef.current.get(queue._id);
          
          // Notify at specific milestones: position 3 (15min), position 2 (10min), position 1 (5min)
          if ([1, 2, 3].includes(position) && !notifiedPositions.has(position)) {
            sendNotification(queue.serviceName, estimatedTime, position);
            notifiedPositions.add(position);
          }
        }
      });

    } catch (err) {
      toast.error('Failed to load queues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const joinQueue = async (queueId) => {
    try {
      await api.post(`/queues/join/${queueId}`);
      toast.success('You joined the queue');
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join queue');
    }
  };

  const leaveQueue = async (queueId) => {
    try {
      await api.post(`/queues/leave/${queueId}`);
      toast.success('You left the queue');
      
      // Clear all notifications for this queue
      notifiedPositionsRef.current.delete(queueId);
      
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave queue');
    }
  };

  // Browser notification with position-specific messages
  const sendNotification = (serviceName, estimatedTime, position) => {
    let message;
    let urgency;
    
    switch(position) {
      case 1:
        message = `🔥 You're NEXT! Your turn for ${serviceName} is now. Est. wait: ${estimatedTime} min`;
        urgency = 'high';
        break;
      case 2:
        message = `⚡ Almost there! You're #2 for ${serviceName}. Est. wait: ${estimatedTime} min`;
        urgency = 'medium';
        break;
      case 3:
        message = `📍 Getting close! You're #3 for ${serviceName}. Est. wait: ${estimatedTime} min`;
        urgency = 'low';
        break;
      default:
        message = `You're #${position} for ${serviceName}. Est. wait: ${estimatedTime} min`;
        urgency = 'low';
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Queue Alert 🔔', {
        body: message,
        icon: '/logo192.png',
        tag: `${serviceName}-${position}`,
        requireInteraction: position === 1 // Only require interaction when you're next
      });
      
      // Different toast colors based on urgency
      const toastType = position === 1 ? toast.warning : position === 2 ? toast.info : toast.info;
      toastType(`⏰ ${message}`, {
        autoClose: position === 1 ? false : 10000, // Position 1 stays until dismissed
        position: 'top-center'
      });
    } else {
      // Fallback to toast if notifications are blocked
      const toastType = position === 1 ? toast.warning : toast.info;
      toastType(`⏰ ${message}`, {
        autoClose: position === 1 ? false : 10000,
        position: 'top-center'
      });
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading queues...</p>;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#F5F6F7' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1E40AF' }}>
        Available Queues
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {queues.map((queue) => {
          // Defensive check: some items may be plain ObjectId if backend didn't populate
          const userIndex = queue.users.findIndex(u => {
            if (!u) return false;
            return (u.user?._id || u._id || u.toString()) === userId;
          });

          const inQueue = userIndex !== -1;
          const position = inQueue ? userIndex + 1 : null;

          // Estimated time may be undefined for some users, default to 0
          const estimatedTime = inQueue ? (queue.users[userIndex].estimatedTime || 0) : null;

          return (
            <div key={queue._id} style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ color: '#1E3A8A', marginBottom: '10px' }}>{queue.serviceName}</h3>
              <p>In Queue: <strong>{queue.users.length}</strong></p>
              {inQueue && <p style={{ color: '#DC2626', fontWeight: 'bold', marginBottom: '10px' }}>Your Position: {position}|Estimated Waiting Time: {estimatedTime} min</p>}
              {!inQueue ? (
                <button
                  onClick={() => joinQueue(queue._id)}
                  style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
                >
                  Join Queue
                </button>
              ) : (
                <button
                  onClick={() => leaveQueue(queue._id)}
                  style={{ backgroundColor: '#DC2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
                >
                  Leave Queue
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;