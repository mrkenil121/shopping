// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { LoginForm } from '../components/auth/AuthForms';

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (values) => {
    const { email, password } = values;
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const decodedToken = jwtDecode(data.token);
        localStorage.setItem('user', data.token);

        // Redirect based on user role
        if (decodedToken.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return <LoginForm onSubmit={handleLoginSubmit} errorMessage={errorMessage} />;
};

export default LoginPage;