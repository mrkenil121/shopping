// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { SignUpForm } from '../components/auth/AuthForms';

const SignupPage = () => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSignUp = async (values) => {
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
        router.push('/login');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    }
  };

  return <SignUpForm onSubmit={handleSignUp} error={error} />;
};

export default SignupPage;