'use client'

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard"; // Import ProductCard component
import axios from "axios"; // Import Axios for API calls
// import { fetchProducts, deleteProduct } from "../api"; // Custom API calls for fetching and deleting products

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from the API when the component mounts
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        setProducts(response.data.products); // Assuming the API returns products as an array
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // Set loading state to false after the fetch
      }
    };

    fetchAllProducts(); // Fetch products when component is mounted
  }, []);

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId); // Custom API call to delete product by ID
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId) // Remove deleted product from the state
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return <p>Loading products...</p>; // Display loading message while products are being fetched
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={handleDelete} // Pass the handleDelete function to ProductCard
        />
      ))}
    </div>
  );
};

export default ProductList;
