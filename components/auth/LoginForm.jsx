// components/auth/LoginForm.jsx
import { Formik, Field, Form, ErrorMessage } from "formik";
import Link from "next/link";
import { login } from "../../utils/auth"; // Assuming you have an auth utility for login
import { loginValidationSchema } from "../../utils/validators"; // Import the centralized validation schema
import { handleError } from "../../utils/apiClient"; // Utility to handle errors

const LoginForm = ({ errorMessage }) => {
  // Handle the form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      await login(values.email, values.password); // Call the login function from auth.js
    } catch (error) {
      setSubmitting(false);
      handleError(error, setErrorMessage); // Handle errors from the login function
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl text-center">Login</h1>

      {/* Display error message if login fails */}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginValidationSchema} // Use centralized validation schema
        onSubmit={handleSubmit} // Handle form submission with the helper function
      >
        <Form className="space-y-4">
          <div>
            <label htmlFor="email" className="block">Email:</label>
            <Field
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="Enter your email"
            />
            <ErrorMessage name="email" component="div" className="text-red-500" />
          </div>

          <div>
            <label htmlFor="password" className="block">Password:</label>
            <Field
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="Enter your password"
            />
            <ErrorMessage name="password" component="div" className="text-red-500" />
          </div>

          <button type="submit" className="bg-blue-500 text-white p-2 w-full mt-4">
            Login
          </button>
        </Form>
      </Formik>

      <div className="mt-4 text-center">
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-500">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
