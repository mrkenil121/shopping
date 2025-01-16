import React from "react";
import Link from "next/link"; // Use next/link for navigation
import PropTypes from "prop-types";

const ProductCard = ({ product, onDelete }) => {
  const {
    id = "",
    image = "/images/default-image.jpg", // Fallback image
    name = "Unnamed Product",
    description = "No description available",
    price = "0.00",
  } = product || {};

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-md bg-white transition-shadow duration-300 hover:shadow-lg">
      {/* Product Image */}
      <img
        className="w-full h-48 object-cover"
        src={image}
        alt={name}
        loading="lazy"
      />

      {/* Product Details */}
      <div className="p-4">
        {/* Product Name */}
        <h2 className="text-xl font-semibold truncate" title={name}>
          {name}
        </h2>
        {/* Product Description */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {description}
        </p>
        {/* Product Price */}
        <p className="text-lg font-bold text-blue-600 mt-4">${price}</p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex justify-between items-center border-t">
        {/* Edit Button */}
        <Link
          href={`/admin/products/${id}/edit`}
          passHref
        >
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            aria-label={`Edit ${name}`}
          >
            Edit
          </span>
        </Link>

        {/* Delete Button */}
        <button
          // onClick={() => onDelete?.(id)}
          className="text-red-500 hover:underline"
          aria-label={`Delete ${name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onDelete: PropTypes.func,
};

ProductCard.defaultProps = {
  product: {
    id: "",
    image: "/images/default-image.jpg",
    name: "Unnamed Product",
    description: "No description available",
    price: "0.00",
  },
  onDelete: null,
};

export default ProductCard;
