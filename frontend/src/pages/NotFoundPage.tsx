import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found page
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="error-code">404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for doesn't exist or has been moved.</p>

        <div className="suggestions">
          <h3>Did you mean to go to:</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </div>

        <Link to="/" className="btn btn-primary btn-lg">
          Go Home
        </Link>
      </div>
    </div>
  );
};
