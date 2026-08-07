import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem('taskflow_user');
    const token = localStorage.getItem('taskflow_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  const login = async (credentials) => {
    const res = await loginUser(credentials);
    const { token, _id, name, email } = res.data;
    const userData = {
      _id,
      name,
      email,
    };
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };
  const register = async (payload) => {
    const res = await registerUser(payload);
    const { token, _id, name, email } = res.data;
    const userData = {
      _id,
      name,
      email,
    };
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };
  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}