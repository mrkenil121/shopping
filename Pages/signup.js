import { useState } from 'react';
import { useRouter } from 'next/router';
import SignUpForm from '../components/auth/SignUpForm';

const Signup = () => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSignUp = async (values) => {
    const { name, email, password } = values;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/login'); // Redirect to login page on success
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-lg shadow-md">
      <SignUpForm onSubmit={handleSignUp} error={error} />
    </div>
  );
};

export default Signup;
