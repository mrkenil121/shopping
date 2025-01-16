import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import "../app/globals.css";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (values) => {
    const { email, password } = values;

    // Reset any previous error message
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Only call json() once

      if (response.ok) {
        // Decode the JWT token to get user info (including role)
        const decodedToken = jwtDecode(data.token);

      const userData = {
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name,
        role: decodedToken.role,
        decodedToken,
      };

      localStorage.setItem('user', JSON.stringify(data.token)); // Store the user data in localStorage
      // setUser(userData); // Update user state

        // Redirect to profile or dashboard after successful login
        router.push('/');
      } else {
        // Set error message only if the login failed
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleLoginSubmit} errorMessage={errorMessage} />
    </div>
  );
};

export default LoginPage;