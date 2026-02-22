/**
 * AuthContext.jsx
 * Manages user authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { ME_QUERY } from '../client-graphql/canon-operations';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('canonkiln_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user if we have a token
  const [fetchMe, { data, error }] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (token) {
      fetchMe()
        .then(({ data }) => {
          if (data?.me) {
            setUser(data.me);
          } else {
            // Token invalid, clear it
            logout();
          }
        })
        .catch(() => {
          // Failed to fetch user, likely invalid token
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('canonkiln_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('canonkiln_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
