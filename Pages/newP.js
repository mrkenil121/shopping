import { useState } from "react";
import axios from "axios";
import "../app/globals.css";

const AddNewProductForm = ({ onProductAdded }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    wsCode: "",
    salesPrice: "",
    mrp: "",
    packageSize: "",
    tags: "",
    category: "",
    images: "",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
    setError(""); // Clear any previous errors

    // Validate the product before sending to the server
    const validationError = validateProduct({
      ...newProduct,
      salesPrice: parseFloat(newProduct.salesPrice),
      mrp: parseFloat(newProduct.mrp),
      packageSize: parseFloat(newProduct.packageSize),
      tags: newProduct.tags.split(",").map((tag) => tag.trim()),
      images: newProduct.images.split(",").map((img) => img.trim()),
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem("user");
      if (!token) {
        alert("You are not logged in!");
        return;
      }

      const response = await axios.post(
        "/api/admin/products",
        {
          ...newProduct,
          salesPrice: parseFloat(newProduct.salesPrice),
          mrp: parseFloat(newProduct.mrp),
          packageSize: parseFloat(newProduct.packageSize),
          tags: newProduct.tags.split(",").map((tag) => tag.trim()),
          images: newProduct.images.split(",").map((img) => img.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        alert("Product added successfully!");
        setNewProduct({
          name: "",
          wsCode: "",
          salesPrice: "",
          mrp: "",
          packageSize: "",
          tags: "",
          category: "",
          images: "",
        });

        if (onProductAdded) onProductAdded(); // Refresh product list
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="border p-6 rounded shadow-md bg-white">
     <div className="mb-6">
  <h2 className="text-xl font-semibold mb-4">
    {editingProduct ? "Edit Product" : "Create New Product"}
  </h2>
  
  {/** Name Field */}
  <div className="mb-4">
    <label className="block mb-2">Name</label>
    <input
      type="text"
      value={editingProduct ? editingProduct.name : newProduct.name}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, name: e.target.value })
          : setNewProduct({ ...newProduct, name: e.target.value })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** WS Code Field */}
  <div className="mb-4">
    <label className="block mb-2">WS Code</label>
    <input
      type="text"
      value={editingProduct ? editingProduct.wsCode : newProduct.wsCode}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, wsCode: e.target.value })
          : setNewProduct({ ...newProduct, wsCode: e.target.value })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** Sales Price Field */}
  <div className="mb-4">
    <label className="block mb-2">Sales Price</label>
    <input
      type="number"
      value={editingProduct ? editingProduct.salesPrice : newProduct.salesPrice}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, salesPrice: e.target.value })
          : setNewProduct({ ...newProduct, salesPrice: e.target.value })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** MRP Field */}
  <div className="mb-4">
    <label className="block mb-2">MRP</label>
    <input
      type="number"
      value={editingProduct ? editingProduct.mrp : newProduct.mrp}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, mrp: e.target.value })
          : setNewProduct({ ...newProduct, mrp: e.target.value })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** Package Size Field */}
  <div className="mb-4">
    <label className="block mb-2">Package Size</label>
    <input
      type="number"
      value={editingProduct ? editingProduct.packageSize : newProduct.packageSize}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, packageSize: e.target.value })
          : setNewProduct({ ...newProduct, packageSize: e.target.value })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** Tags Field */}
  <div className="mb-4">
    <label className="block mb-2">Tags (Comma Separated)</label>
    <input
      type="text"
      value={editingProduct ? editingProduct.tags : newProduct.tags}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, tags: e.target.value.split(",").map(tag => tag.trim()) })
          : setNewProduct({ ...newProduct, tags: e.target.value.split(",").map(tag => tag.trim()) })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** Category Field */}
  <div className="mb-4">
    <label className="block mb-2">Category</label>
    <input
      type="text"
      value={editingProduct ? editingProduct.category : newProduct.category}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, category: e.target.value })
          : setNewProduct({ ...newProduct, category: e.target.value })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** Images Field */}
  <div className="mb-4">
    <label className="block mb-2">Image URLs (Comma Separated)</label>
    <input
      type="text"
      value={editingProduct ? editingProduct.images : newProduct.images}
      onChange={(e) =>
        editingProduct
          ? setEditingProduct({ ...editingProduct, images: e.target.value.split(",").map(img => img.trim()) })
          : setNewProduct({ ...newProduct, images: e.target.value.split(",").map(img => img.trim()) })
      }
      className="w-full p-2 border rounded"
    />
  </div>

  {/** Action Buttons */}
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
</div>

    </div>
  );
};

export default AddNewProductForm;
