/**
 * UserMenu.jsx
 * User dropdown menu component
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowLoginForm(true)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              background: 'transparent',
              border: '1px solid #2a2a4a',
              borderRadius: 6,
              color: '#a0a0b0',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setShowRegisterForm(true)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              background: '#6a3aff',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sign Up
          </button>
        </div>

        {showLoginForm && (
          <LoginForm
            onClose={() => setShowLoginForm(false)}
            onSwitchToRegister={() => {
              setShowLoginForm(false);
              setShowRegisterForm(true);
            }}
          />
        )}

        {showRegisterForm && (
          <RegisterForm
            onClose={() => setShowRegisterForm(false)}
            onSwitchToLogin={() => {
              setShowRegisterForm(false);
              setShowLoginForm(true);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          fontSize: 12,
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: 6,
          color: '#a0a0b0',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#6a3aff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#fff',
          fontWeight: 600,
        }}>
          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <span>{user?.displayName || user?.email?.split('@')[0]}</span>
        <span style={{ fontSize: 10 }}>▼</span>
      </button>

      {showDropdown && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
            onClick={() => setShowDropdown(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: 6,
              padding: 8,
              minWidth: 200,
              zIndex: 999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid #2a2a4a',
              marginBottom: 4,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                {user?.displayName || 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#6a6a8a' }}>
                {user?.email}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 12,
                background: 'transparent',
                border: 'none',
                borderRadius: 4,
                color: '#e94560',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
