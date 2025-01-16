import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import "@/app/globals.css";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <div className="relative w-full h-48 mb-4">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    previousImage();
                  }}
                  className="bg-black/50 text-white p-2 rounded-l hover:bg-black/70"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage();
                  }}
                  className="bg-black/50 text-white p-2 rounded-r hover:bg-black/70"
                >
                  →
                </button>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
            No Image
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
      <div className="text-gray-600 mb-4">
        <p>Price: ₹{product.salesPrice}</p>
        <p>MRP: ₹{product.mrp}</p>
        <p>Category: {product.category}</p>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};


const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [newProduct, setNewProduct] = useState({
    name: "",
    wsCode: "",
    salesPrice: "",
    mrp: "",
    packageSize: "",
    tags: "",
    category: "",
    images: [],
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);
  const router = useRouter();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);
  
    // Store the files in the form state
    setNewProduct(prev => ({
      ...prev,
      images: files
    }));
  
    console.log("Selected files:", files);
  };

 const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(`/api/admin/products?page=${page}&pageSize=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-gray-100 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }


  const createProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      // Validate that we have images
      if (!newProduct.images || newProduct.images.length === 0) {
        setError("Please select at least one image");
        setLoading(false);
        return;
      }

      // Create FormData object
      const formData = new FormData();
      
      // Log the data being sent
      console.log("Sending product data:", newProduct);

      formData.append("name", newProduct.name);
      formData.append("wsCode", newProduct.wsCode.toString());
      formData.append("salesPrice", newProduct.salesPrice.toString());
      formData.append("mrp", newProduct.mrp.toString());
      formData.append("packageSize", newProduct.packageSize.toString());
      formData.append("tags", JSON.stringify(newProduct.tags.split(",").map(tag => tag.trim())));
      formData.append("category", newProduct.category);

      // Append each image file
      newProduct.images.forEach((file, index) => {
        console.log("Appending file:", file.name);
        formData.append('images', file);
      });

      // Log the FormData (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post("/api/admin/products", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.status === 201) {
        // Reset form
        setNewProduct({
          name: "",
          wsCode: "",
          salesPrice: "",
          mrp: "",
          packageSize: "",
          tags: "",
          category: "",
          images: [],
        });
        setPreviewUrls([]);
        await fetchProducts();
      }
    } catch (error) {
      console.error("Detailed error:", error);
      setError(error.response?.data?.message || "Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
};


const editProduct = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const token = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("id", editingProduct.id);
    formData.append("name", editingProduct.name);
    formData.append("wsCode", Number(editingProduct.wsCode));
    formData.append("salesPrice", Number(editingProduct.salesPrice));
    formData.append("mrp", Number(editingProduct.mrp));
    formData.append("packageSize", Number(editingProduct.packageSize));
    formData.append("category", editingProduct.category);

    // Handle tags
    const tags = Array.isArray(editingProduct.tags) 
      ? editingProduct.tags 
      : editingProduct.tags.split(",").map(tag => tag.trim());
    formData.append("tags", JSON.stringify(tags));

    // Handle existing images
    const existingImages = Array.isArray(editingProduct.images)
      ? editingProduct.images
      : editingProduct.images.split(",").map(img => img.trim());
    formData.append("existingImages", JSON.stringify(existingImages));

    // Append new image files if any
    if (editingProduct.newImages) {
      editingProduct.newImages.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await axios.put("/api/admin/products", formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });

    if (response.status === 200) {
      setEditingProduct(null);
      await fetchProducts();
    } else {
      setError("Failed to update product. Please try again.");
    }
  } catch (error) {
    console.error("Update error:", error);
    setError("Failed to update product. Please try again.");
  } finally {
    setLoading(false);
  }
};

// Handle image change in edit mode
const handleEditImageChange = (e) => {
  const files = Array.from(e.target.files);
  
  // Create preview URLs for new images
  const newPreviews = files.map(file => URL.createObjectURL(file));
  
  setEditingProduct(prev => ({
    ...prev,
    newImages: files,
    previewUrls: [...(prev.previewUrls || []), ...newPreviews]
  }));
};

// Remove existing image
const handleRemoveExistingImage = (indexToRemove) => {
  setEditingProduct(prev => ({
    ...prev,
    images: prev.images.filter((_, index) => index !== indexToRemove)
  }));
};

// Remove new image
const handleRemoveNewImage = (indexToRemove) => {
  setEditingProduct(prev => ({
    ...prev,
    newImages: prev.newImages.filter((_, index) => index !== indexToRemove),
    previewUrls: prev.previewUrls.filter((_, index) => index !== indexToRemove)
  }));
};
  
  

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(`/api/admin/products?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchProducts();
    } catch (error) {
      setError("Failed to delete product.");
    }
  };

  const handleChange = (field, value) => {
    if (field === "images") {
      const files = Array.from(value);
      setPreviewUrls(files.map((file) => URL.createObjectURL(file))); // For previewing images

      // Upload images to Cloudinary
      const uploadPromises = files.map((file) => uploadImageToCloudinary(file));
      Promise.all(uploadPromises)
        .then((uploadedUrls) => {
          setNewProduct({ ...newProduct, images: uploadedUrls });
        })
        .catch((error) => {
          setError("Failed to upload images. Please try again.");
        });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }

    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
    
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Admin Product Management</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? "Edit Product" : "Create New Product"}
        </h2>
        <form>
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={editingProduct ? editingProduct.name : newProduct.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">WS Code</label>
            <input
              type="number"
              value={editingProduct ? editingProduct.wsCode : newProduct.wsCode}
              onChange={(e) => handleChange("wsCode", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Sales Price</label>
            <input
              type="number"
              value={
                editingProduct ? editingProduct.salesPrice : newProduct.salesPrice
              }
              onChange={(e) => handleChange("salesPrice", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">MRP</label>
            <input
              type="number"
              value={editingProduct ? editingProduct.mrp : newProduct.mrp}
              onChange={(e) => handleChange("mrp", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Package Size</label>
            <input
              type="number"
              value={
                editingProduct
                  ? editingProduct.packageSize
                  : newProduct.packageSize
              }
              onChange={(e) => handleChange("packageSize", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={editingProduct ? editingProduct.tags : newProduct.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Category</label>
            <input
              type="text"
              value={
                editingProduct ? editingProduct.category : newProduct.category
              }
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
          <label className="block mb-2">Images</label>
<div className="flex flex-wrap gap-4 mb-4">
  {/* Add a check to ensure `editingProduct` and `editingProduct.images` are valid */}
  {editingProduct?.images?.length > 0 && editingProduct.images.map((image, index) => (
    <div key={index} className="relative">
      <img
        src={image}
        alt={`Product ${index + 1}`}
        className="w-20 h-20 object-cover rounded"
      />
      <button
        type="button"
        onClick={() => handleRemoveExistingImage(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
      >
        ×
      </button>
    </div>
  ))}
  
  {/* Handle `previewUrls` with a similar check */}
  {editingProduct?.previewUrls?.map((url, index) => (
    <div key={`new-${index}`} className="relative">
      <img
        src={url}
        alt={`New upload ${index + 1}`}
        className="w-20 h-20 object-cover rounded"
      />
      <button
        type="button"
        onClick={() => handleRemoveNewImage(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
      >
        ×
      </button>
    </div>
  ))}
        
            </div>
            <input
              type="file"
              onChange={handleEditImageChange}
              className="w-full p-2 border rounded"
              accept="image/*"
              multiple
            />
          </div>
          <div className="mb-4">
            {editingProduct ? (
              <button
                onClick={editProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update Product
              </button>
            ) : (
              <button
                onClick={createProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Create Product
              </button>
            )}
            {editingProduct && (
              <button
                onClick={() => setEditingProduct(null)}
                className="ml-4 px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="container mx-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(product) => setEditingProduct(product)}
                onDelete={deleteProduct}
              />
            ))}
          </div>
    
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )};
    </div>
  );
};

export default AdminProductsPage;
