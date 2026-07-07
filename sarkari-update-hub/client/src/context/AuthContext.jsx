import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sarkari_admin_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sarkari_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sarkari_admin_token');
    localStorage.removeItem('sarkari_admin_user');
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!res.ok) {
            logout();
          }
        } catch (e) {
          console.warn("Auth verify check failed:", e);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = (jwtToken, adminUser) => {
    setToken(jwtToken);
    setUser(adminUser);
    localStorage.setItem('sarkari_admin_token', jwtToken);
    localStorage.setItem('sarkari_admin_user', JSON.stringify(adminUser));
  };

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers
    });
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout, authenticatedFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
