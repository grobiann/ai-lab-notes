import React, { useState } from 'react';
import { useAuth } from '../hooks/useApi';

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Registration form component
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onError }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, loading } = useAuth();

  const validateForm = (): boolean => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register(username, email, password);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Choose a username"
          disabled={loading}
          minLength={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          minLength={8}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          disabled={loading}
          minLength={8}
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Creating account...' : 'Register'}
      </button>

      <p className="form-footer">
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </form>
  );
};
