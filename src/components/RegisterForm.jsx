/**
 * RegisterForm.jsx
 * User registration component
 */

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../client-graphql/canon-operations';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      login(data.register.token, data.register.user);
      onClose();
    },
    onError: (err) => {
      setError(err.message.replace('GraphQL error: ', ''));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    registerMutation({
      variables: {
        input: { 
          email, 
          password,
          displayName: displayName || undefined,
        },
      },
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: 12,
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{ color: '#fff', marginBottom: 8, fontSize: 24 }}>🔥 Join CanonKiln</h2>
        <p style={{ color: '#6a6a8a', marginBottom: 24, fontSize: 14 }}>
          Create your account to start building your canon
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#a0a0b0', marginBottom: 6, fontSize: 12 }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#12122a',
                border: '1px solid #2a2a4a',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#a0a0b0', marginBottom: 6, fontSize: 12 }}>
              Display Name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Creator name"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#12122a',
                border: '1px solid #2a2a4a',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#a0a0b0', marginBottom: 6, fontSize: 12 }}>
              Password * (min 8 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#12122a',
                border: '1px solid #2a2a4a',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              background: '#4a1a1a',
              border: '1px solid #8a3a3a',
              borderRadius: 6,
              color: '#e94560',
              fontSize: 12,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? '#4a4a6a' : '#6a3aff',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid #2a2a4a',
                borderRadius: 6,
                color: '#a0a0b0',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#6a6a8a' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#6a3aff',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
