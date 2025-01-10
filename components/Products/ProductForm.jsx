import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Using Next.js router for navigation
// import { addProduct, updateProduct } from "../api"; // Custom API calls for adding and updating products

const ProductForm = ({ productId }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch product details if editing an existing product
  useEffect(() => {
    if (productId) {
      const fetchProductDetails = async () => {
        try {
          // Replace with your API call to fetch product by ID
          const response = await fetch(`/api/products/${productId}`);
          const data = await response.json();
          setProduct(data.product); // Set product details for editing
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };

      fetchProductDetails();
    }
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (productId) {
        // Update existing product
        await updateProduct(productId, product);
      } else {
        // Add new product
        await addProduct(product);
      }
      router.push("/products"); // Redirect to the products page
    } catch (error) {
      setError("Error saving product. Please try again.");
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-4">
        {productId ? "Edit Product" : "Add Product"}
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold" htmlFor="name">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold" htmlFor="description">
            Product Description
          </label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold" htmlFor="price">
            Product Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold" htmlFor="imageUrl">
            Product Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleInputChange}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? "Saving..." : productId ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
