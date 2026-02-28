import React, { useState } from 'react';
import { useAuth } from '../hooks/useApi';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Login form component
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      await login(username, password);
      setUsername('');
      setPassword('');
      onSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username"
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
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="form-footer">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </form>
  );
};
