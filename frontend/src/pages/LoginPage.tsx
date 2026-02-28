import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

/**
 * Login page
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  const handleError = (error: Error) => {
    console.error('Login error:', error);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <LoginForm onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
};
