import React from 'react'
import { useRouter } from "next/navigation"; // Use this for the correct Next.js version
import { useEffect } from "react";

const Refresh = () => {

    const router = useRouter();

    useEffect(() => {
      router.push("/products");
    }, [router]);
  

  return (
    <div>Loading</div>
  )
}

export default Refresh;