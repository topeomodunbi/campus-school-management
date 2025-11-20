import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Axios instance with baseURL
import { toast } from 'react-toastify';

const Admin = () => {
  const [queues, setQueues] = useState([]);
  const [serviceName, setServiceName] = useState('');

  // Fetch all queues
  const fetchQueues = async () => {
    try {
      const res = await api.get('/queues'); // baseURL already includes /api
      setQueues(res.data);
    } catch (err) {
      console.error('Fetch queues error:', err.response?.data || err.message);
      toast.error('Failed to load queues');
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // Add a new queue
  const handleAddQueue = async () => {
    if (!serviceName) return toast.error('Service name required');
    try {
      await api.post('/queues', { serviceName });
      toast.success('Queue added');
      setServiceName('');
      fetchQueues();
    } catch (err) {
      console.error('Add queue error:', err.response?.data || err.message);
      toast.error('Failed to add queue');
    }
  };

  // Delete a queue
  const handleDeleteQueue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this queue?')) return;
    try {
      await api.delete(`/queues/${id}`); // Correct path
      toast.success('Queue deleted');
      fetchQueues();
    } catch (err) {
      console.error('Delete queue error full:', err);
      console.error('Delete queue error response:', err.response?.data || err.message);
      toast.error('Failed to delete queue');
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ color: '#1E40AF', fontSize: '28px', fontWeight: 'bold' }}>Admin Panel</h2>

      {/* Add Queue */}
      <div style={{ marginTop: '20px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Queue Service Name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          style={{
            padding: '10px',
            marginRight: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '250px',
          }}
        />
        <button
          onClick={handleAddQueue}
          style={{
            padding: '10px 16px',
            backgroundColor: '#1E40AF',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Add Queue
        </button>
      </div>

      {/* Queue List */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {queues.map((queue) => (
          <div
            key={queue._id}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flex: '1 1 250px',
              position: 'relative',
            }}
          >
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
              {queue.serviceName}
            </h3>
            <button
              onClick={() => handleDeleteQueue(queue._id)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#DC2626',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
