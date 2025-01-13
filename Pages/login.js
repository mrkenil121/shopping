import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import { useRouter } from 'next/router';
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

      if (response.ok) {
        const data = await response.json();

        // Store user data in localStorage after successful login
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        }));

        // Redirect to profile or dashboard after successful login
        router.push('/');
      } else {
        const data = await response.json();
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
