import ProductDetails from '@/components/layout/ProductDetails';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ProductDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/details/${id}`); // Updated API route
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'Product not found' 
            : 'Failed to fetch product'
          );
        }
        
        const data = await response.json();
        setProduct(data.product);
        setSimilarProducts(data.similarProducts);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Product Details</h1>
      <ProductDetails 
        product={product} 
        similarProducts={similarProducts}
      />
    </div>
  );
}