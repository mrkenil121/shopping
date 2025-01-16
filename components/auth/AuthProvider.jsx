'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/compat/router';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext({ user: null, loading: false, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAuthentication = () => {
      const userData = localStorage.getItem('user'); // Retrieve user info from localStorage

      if (userData) {

        const decodedToken = jwtDecode(userData);

        setUser({
          id: decodedToken.id,
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role,
          userData,
        });
      } else {
        setUser(null); // No user data found in localStorage
      }

      setLoading(false); // Stop loading after checking
    };

    checkUserAuthentication();
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data in localStorage
    setUser(userData); // Update the state with the user data
    router.push('/profile'); // Redirect to the profile page after login
  };

  const logout = () => {
    localStorage.removeItem('user'); // Clear user data from localStorage
    setUser(null); // Reset user state
    router.push('/login'); // Redirect to the login page after logout
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading state until the user info is checked
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);