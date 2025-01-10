// pages/login.js
import { useState } from "react";
import { signIn } from "next-auth/react"; // Import NextAuth for authentication
import { useRouter } from "next/router"; // For redirection after login
import * as Yup from "yup";
import LoginForm from "../components/auth/LoginForm";
import ProductCard from "../components/Products/ProductCard";
import ProductList from "../components/Products/ProductList";
import ProductForm from "../components/Products/ProductForm";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (res?.error) {
      setErrorMessage(res.error);
    } else {
      router.push("/"); // Redirect to the homepage after successful login
    }
  };

  return (
    <div className="container mx-auto p-6">
        <LoginForm />
        <ProductCard />
        <ProductList />
        <ProductForm />
    </div>
  );
};

export default LoginPage;
