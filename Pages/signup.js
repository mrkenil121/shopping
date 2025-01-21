import { useState } from 'react';
import { useRouter } from 'next/router';
import { SignUpForm } from '../components/auth/AuthForms';

// Password validation rules
const passwordValidators = {
  minLength: (password) => ({
    valid: password.length >= 8,
    message: 'Password must be at least 8 characters long'
  }),
  hasUppercase: (password) => ({
    valid: /[A-Z]/.test(password),
    message: 'Password must contain at least one uppercase letter'
  }),
  hasLowercase: (password) => ({
    valid: /[a-z]/.test(password),
    message: 'Password must contain at least one lowercase letter'
  }),
  hasNumber: (password) => ({
    valid: /\d/.test(password),
    message: 'Password must contain at least one number'
  }),
  hasSpecialChar: (password) => ({
    valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    message: 'Password must contain at least one special character'
  }),
  noCommonWords: (password) => ({
    valid: !['password', '123456', 'qwerty'].includes(password.toLowerCase()),
    message: 'Password cannot be a commonly used password'
  })
};

const SignupPage = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const validatePassword = (password) => {
    const errors = [];
    
    // Run all validators
    Object.values(passwordValidators).forEach(validator => {
      const result = validator(password);
      if (!result.valid) {
        errors.push(result.message);
      }
    });

    return errors;
  };

  const handleSignUp = async (values) => {
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);

    // Validate password before making API call
    const passwordErrors = validatePassword(values.password);
    
    if (passwordErrors.length > 0) {
      setValidationErrors(passwordErrors);
      setIsLoading(false);
      return;
    }

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
      validationErrors={validationErrors}
      isLoading={isLoading}
    />
  );
};

export default SignupPage;