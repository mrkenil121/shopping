import "../app/globals.css"; // Import global styles
import { Inter } from "next/font/google";
import { AuthProvider } from "../components/auth/AuthProvider";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useRouter } from "next/router"; // Import useRouter

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }) {
  const router = useRouter(); // Initialize useRouter to access the current route

  // Define routes where Navbar should not appear
  const noNavbarRoutes = [
    "/admin/dashboard",
    "/admin/products",
    "/admin/orders",
    "/admin/users",
    "/login",
    "/signup"
  ];

  const shouldShowNavbar = !noNavbarRoutes.includes(router.pathname); // Use router.pathname to get the current route

  return (
    <AuthProvider>
      <div className={inter.className}>
        {shouldShowNavbar && <Navbar />}
        <Component {...pageProps} />
        {shouldShowNavbar && <Footer />}
      </div>
    </AuthProvider>
  );
}
