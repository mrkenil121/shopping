import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ProductDetailPage = ({ product }) => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);

  // If no product is passed, show loading state
  if (!product) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
      
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover mb-4"
          />
        </div>

        <div className="w-full md:w-1/2 md:pl-8">
          <p className="text-lg font-semibold mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => alert(`Added ${product.name} to cart!`)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const response = await axios.get(`/api/products/${id}`); // Assuming you have an endpoint to fetch a product by ID
    const product = response.data;

    return { props: { product } };
  } catch (error) {
    console.error('Error fetching product details:', error);
    return { props: { product: null } }; // Handle error if product is not found
  }
}

export default ProductDetailPage;
