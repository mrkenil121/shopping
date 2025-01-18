'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({
  user: null,
  loading: false,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAuthentication = () => {
      try {
        const token = localStorage.getItem('user');

        if (token) {
          const decodedToken = jwtDecode(token);
          
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            localStorage.removeItem('user');
            setUser(null);
          } else {
            setUser({
              id: decodedToken.id,
              email: decodedToken.email,
              name: decodedToken.name,
              role: decodedToken.role,
              token,
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserAuthentication();

    window.addEventListener('storage', checkUserAuthentication);
    
    return () => {
      window.removeEventListener('storage', checkUserAuthentication);
    };
  }, []);

  const login = async (userData) => {
    try {
      setLoading(true);
      
      // Check if userData is a token string or an object containing a token
      let token;
      if (typeof userData === 'string') {
        token = userData;
      } else if (userData && userData.token) {
        token = userData.token;
      } else {
        throw new Error('Invalid token format');
      }

      // Validate token before storing
      const decodedToken = jwtDecode(token);
      if (!decodedToken.id || !decodedToken.email) {
        throw new Error('Invalid token data');
      }

      // Store token in localStorage
      localStorage.setItem('user', token);
      
      // Update user state
      const userState = {
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name,
        role: decodedToken.role,
        token,
      };
      
      // Set user state before navigation
      await setUser(userState);
      
      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to products page
      router.push('/products');
    } catch (error) {
      console.error('Error during login:', error);
      localStorage.removeItem('user');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      router.push('/products');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};