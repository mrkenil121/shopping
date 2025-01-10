import React from "react";
import Link from "next/link"; // Use next/link for navigation

const ProductCard = ({ product, onDelete }) => {
  // Fallback image or empty string if no image is provided
  const imageUrl = product?.image || "/images/default-image.jpg"; 

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
      {/* Conditional rendering of the image */}
      <img
        className="w-full h-48 object-cover"
        src={imageUrl}
        alt={product?.name || "Product image"} // Fallback alt text
      />
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold">{product?.name}</h2>
        <p className="text-gray-700 text-base mt-2">{product?.description}</p>
        <p className="text-lg font-bold text-blue-600 mt-4">${product?.price}</p>
      </div>
      <div className="px-6 py-4 flex justify-between" >
        <Link href={`/admin/products/${product?.id}/edit`} className="text-blue-500 hover:underline">
          Edit
        </Link>
        <button
          onClick={() => onDelete(product?.id)}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
