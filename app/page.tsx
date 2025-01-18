'use client';

import ProductsPage from "@/Pages/products";
import { useRouter } from "next/navigation"; // Use this for the correct Next.js version
import React from "react";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // Redirect programmatically when the component is rendered
  useEffect(() => {
    router.push("/products");
  }, [router]);

  return (
    <div>
      {/* Optional: Add content if necessary */}
    </div>
  );
}
