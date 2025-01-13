// components/auth/LoginForm.jsx
import { Formik, Field, Form, ErrorMessage } from "formik";
import Link from "next/link";
import * as Yup from "yup";

const LoginForm = ({ onSubmit, errorMessage }) => {
  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl text-center">Login</h1>

      {/* Display error message if login fails */}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={onSubmit} // Use centralized handleSubmit
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
