import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [userType, setUserType] = useState(null); // 'group' | 'member'
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token    = localStorage.getItem('agms_token');
    const savedUser = localStorage.getItem('agms_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setUserType(parsed.userType);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem('agms_token', token);
    localStorage.setItem('agms_user', JSON.stringify(userData));
    setUser(userData);
    setUserType(userData.userType);
  };

  const groupLogin = async (credentials) => {
    const { data } = await authAPI.groupLogin(credentials);
    saveSession(data.token, { ...data.group, userType: 'group' });
    return data;
  };

  const memberLogin = async (credentials) => {
    const { data } = await authAPI.memberLogin(credentials);
    saveSession(data.token, { ...data.member, userType: 'member' });
    return data;
  };

  const createGroup = async (formData) => {
    const { data } = await authAPI.createGroup(formData);
    saveSession(data.token, { ...data.group, userType: 'group' });
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('agms_token');
    localStorage.removeItem('agms_user');
    setUser(null);
    setUserType(null);
  }, []);

  // Role helpers
  const isAdmin     = userType === 'group' || user?.role === 'admin';
  const isPresident = isAdmin || user?.role === 'president';
  const isSecretary = isAdmin || user?.role === 'secretary';
  const isTreasurer = isAdmin || user?.role === 'treasurer';
  const isExecutive = isAdmin || ['president','secretary','treasurer','executive'].includes(user?.role);

  return (
    <AuthContext.Provider value={{
      user, userType, loading,
      isAdmin, isPresident, isSecretary, isTreasurer, isExecutive,
      groupLogin, memberLogin, createGroup, logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
