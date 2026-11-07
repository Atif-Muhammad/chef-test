import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/shared/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection Cart state for client menu selection
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pcm_cart');
      return saved ? JSON.parse(saved) : { dishes: [], guests: 2, visitDate: '', notes: '' };
    } catch {
      return { dishes: [], guests: 2, visitDate: '', notes: '' };
    }
  });

  useEffect(() => {
    localStorage.setItem('pcm_cart', JSON.stringify(cart));
  }, [cart]);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginClient = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const registerClient = async (name, email, password, allergies = []) => {
    const res = await api.post('/auth/register', { name, email, password, allergies });
    setUser(res.data.user);
    return res.data.user;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/admin-login', { email, password });
    setUser(res.data.admin);
    return res.data.admin;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const addToCart = (dish) => {
    setCart((prev) => {
      const exists = prev.dishes.some((d) => d._id === dish._id);
      if (exists) return prev;
      return {
        ...prev,
        dishes: [...prev.dishes, dish],
      };
    });
  };

  const removeFromCart = (dishId) => {
    setCart((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((d) => d._id !== dishId),
    }));
  };

  const updateCartDetails = (details) => {
    setCart((prev) => ({
      ...prev,
      ...details,
    }));
  };

  const clearCart = () => {
    setCart({ dishes: [], guests: 2, visitDate: '', notes: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        loginClient,
        registerClient,
        loginAdmin,
        logout,
        checkAuth,
        cart,
        addToCart,
        removeFromCart,
        updateCartDetails,
        clearCart,
        isAdmin: user?.role === 'admin',
        isClient: user?.role === 'client',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
