import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('janashakti_token'));
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    // Load demo accounts for quick role-based inspection
    api.getDemoAccounts()
      .then(res => {
        if (res.success) setDemoAccounts(res.demoAccounts);
      })
      .catch(() => {});

    // Check existing stored session
    if (token) {
      api.getMe()
        .then(res => {
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('janashakti_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.fullName}! Logged in as ${res.user.role}.`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Server communication error during login.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('janashakti_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Account registered successfully as ${res.user.role}! Welcome to Janashakti.`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Server communication error during registration.' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.forgotPassword(email);
      return res;
    } catch (err) {
      return { success: false, message: 'Password recovery request failed.' };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.resetPassword(email, otp, newPassword);
      if (res.success) {
        showToast('Password reset successful. Please sign in with your new credentials.', 'success');
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Password reset request failed.' };
    }
  };

  const switchDemoRole = async (roleKey) => {
    const demo = demoAccounts.find(a => a.role === roleKey);
    if (demo) {
      const res = await login(demo.email, demo.password);
      if (res.success) {
        showToast(`Switched active test persona to ${demo.name} (${roleKey})`, 'info');
      }
      return res;
    }
    return { success: false, message: 'Role demo not found' };
  };

  const logout = () => {
    localStorage.removeItem('janashakti_token');
    setToken(null);
    setUser(null);
    showToast('Signed out of JANASHAKTI session.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        switchDemoRole,
        demoAccounts,
        toast,
        showToast,
        setToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
