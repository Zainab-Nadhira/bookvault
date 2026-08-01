import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bookvault-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('bookvault-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
        localStorage.setItem('bookvault-user', JSON.stringify(res.data.data));
      } catch {
        localStorage.removeItem('bookvault-token');
        localStorage.removeItem('bookvault-user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('bookvault-token', data.token);
    const { token, ...userData } = data;
    localStorage.setItem('bookvault-user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persistSession(res.data.data);
    toast.success(`Welcome back, ${res.data.data.username}!`);
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    persistSession(res.data.data);
    toast.success(`Welcome to BookVault, ${res.data.data.username}!`);
  };

  const logout = () => {
    localStorage.removeItem('bookvault-token');
    localStorage.removeItem('bookvault-user');
    setUser(null);
    toast.success('Logged out. See you soon!');
  };

  const updateUser = (data) => {
    setUser((prev) => {
      const next = { ...prev, ...data };
      localStorage.setItem('bookvault-user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
