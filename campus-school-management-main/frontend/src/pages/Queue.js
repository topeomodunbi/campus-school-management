import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Queue = () => {
  const { serviceId } = useParams();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`/queues/${serviceId}`);
      setQueue(res.data);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [serviceId]);

  const joinQueue = async () => {
    try {
      await axios.post(`/queues/join/${serviceId}`);
      toast.success('Joined the queue!');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join queue');
    }
  };

  const leaveQueue = async () => {
    try {
      await axios.post(`/queues/leave/${serviceId}`);
      toast.success('Left the queue!');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave queue');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  if (!queue) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Queue not found</p>;

  const userIndex = queue.users.findIndex(u => u === localStorage.getItem('userId'));
  const position = userIndex !== -1 ? userIndex + 1 : null;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f4f7f8' }}>
      <h2 style={{ textAlign: 'center', color: '#1E40AF', marginBottom: '20px' }}>{queue.serviceName} Queue</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>Current Users in Queue: {queue.users.length}</p>
      {position && <p style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: '#DC2626' }}>Your Position: {position}</p>}
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {!position ? (
          <button
            onClick={joinQueue}
            style={{
              backgroundColor: '#1E40AF',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Join Queue
          </button>
        ) : (
          <button
            onClick={leaveQueue}
            style={{
              backgroundColor: '#DC2626',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Leave Queue
          </button>
        )}
      </div>
    </div>
  );
};

export default Queue;
