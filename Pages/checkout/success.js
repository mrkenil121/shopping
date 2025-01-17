import { useRouter } from "next/router";
import { useEffect } from "react";
import "@/app/globals.css"

const CheckoutSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    // Optional: Redirect to homepage after 10 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition duration-300"
          >
            Go to Homepage
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          You will be redirected to the homepage shortly...
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
