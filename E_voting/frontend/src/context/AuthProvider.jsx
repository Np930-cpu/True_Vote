import { useState } from 'react';
import { AuthContext } from './authContext';

function getInitialUser() {
  try { return JSON.parse(localStorage.getItem('voter')); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('isAdmin'));

  const login = (userData, access, refresh) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('voter', JSON.stringify(userData));
    setUser(userData);
  };

  const loginAdmin = () => {
    localStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
