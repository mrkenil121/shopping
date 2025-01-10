'use client'

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router'; // Correct import for Next.js router

const AuthContext = createContext({ user: null, loading: false, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Flag to indicate client-side rendering

  const router = useRouter(); // Safe to use now

  // This useEffect ensures the component is mounted before checking authentication
  useEffect(() => {
    setMounted(true); // Set mounted flag to true after client-side rendering
  }, []);

  // This useEffect is responsible for fetching the user data when the component is mounted
  useEffect(() => {
    if (mounted) {
      const checkUserAuthentication = async () => {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched user data:', data); // Add logging for debugging
            setUser(data.user); // Update user state if the user is authenticated
          } else {
            setUser(null); // Set user as null if authentication fails
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setUser(null); // Set user as null if there's an error in fetching
        } finally {
          setLoading(false); // Set loading to false once the process completes
        }
      };

      checkUserAuthentication(); // Call the function to check authentication
    }
  }, [mounted]); // Trigger the effect when mounted changes to true

  // Login and logout functions
  const login = (userData) => {
    setUser(userData);
    router.push('/profile');
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
