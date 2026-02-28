import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

/**
 * Registration page
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  const handleError = (error: Error) => {
    console.error('Registration error:', error);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <RegisterForm onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
};
