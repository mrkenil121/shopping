// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { SignUpForm } from '../components/auth/AuthForms';

const SignupPage = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (values) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to verification page with email as query parameter
        router.push(`/verify?email=${encodeURIComponent(values.email)}`);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignUpForm 
      onSubmit={handleSignUp} 
      error={error} 
      isLoading={isLoading}
    />
  );
};

export default SignupPage;