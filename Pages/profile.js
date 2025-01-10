import { useAuth } from '../components/auth/AuthProvider';
import CustomerLayout from '../components/layout/CustomerLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter(); // Initialize router here

  useEffect(() => {
    if (!user) {
      // Redirect to login if the user is not logged in
      router.push('/login');
    }
  }, [user, router]); // Dependencies: run effect when 'user' or 'router' changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    // You don't need this anymore as the redirect is now handled in useEffect
    return <p>You are not logged in. Please log in.</p>;
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Log Out
        </button>
      </div>
    </CustomerLayout>
  );
};

export default ProfilePage;
