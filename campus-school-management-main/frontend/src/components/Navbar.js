import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation(); // To highlight active links
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token'); // Check if user is logged in

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkStyle = (path) => ({
    marginRight: '15px',
    color: location.pathname === path ? '#FFD700' : 'white', // Highlight active link
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 'bold' : 'normal'
  });

  return (
    <nav style={{
      padding: '15px 30px',
      backgroundColor: '#1E40AF',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h1 style={{ fontSize: '24px' }}>Campus Queue System</h1>
      <div>
        <Link style={linkStyle('/')} to="/">Home</Link>
        {!isLoggedIn && <Link style={linkStyle('/login')} to="/login">Login</Link>}
        {!isLoggedIn && <Link style={linkStyle('/register')} to="/register">Register</Link>}
        {isLoggedIn && <Link style={linkStyle('/dashboard')} to="/dashboard">Dashboard</Link>}
        {isLoggedIn && <Link style={linkStyle('/admin')} to="/admin">Admin</Link>}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#DC2626',
              color: 'white',
              border: 'none',
              padding: '7px 15px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginLeft: '10px',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
