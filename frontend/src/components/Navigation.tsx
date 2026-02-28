import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * Main navigation component
 */
export const Navigation: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">📝</span>
          AI Lab Notes
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>
            Blog
          </Link>

          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}

          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="nav-user">
                <span className="user-info">
                  {user && (
                    <>
                      <span className="username">{user.username}</span>
                      {isAdmin && <span className="admin-badge">Admin</span>}
                    </>
                  )}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
