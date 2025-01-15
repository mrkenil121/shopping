import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import '@/app/globals.css';

export function validateProduct(product) {
  const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = product;

  // Check if all required fields are present
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Product name is required and must be a non-empty string.';
  }

  if (!wsCode || typeof wsCode !== 'string' || wsCode.trim() === '') {
    return 'Product wsCode is required and must be a non-empty string.';
  }

  if (isNaN(salesPrice) || !isFinite(salesPrice) || salesPrice <= 0) {
    return 'Sales price must be a positive number.';
  }

  if (isNaN(mrp) || !isFinite(mrp) || mrp <= 0) {
    return 'MRP must be a positive number.';
  }

  if (isNaN(packageSize) || !isFinite(packageSize) || packageSize <= 0) {
    return 'Package size must be a positive number.';
  }

  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
    return 'At least one non-empty tag is required.';
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return 'Category is required and must be a non-empty string.';
  }

  if (!Array.isArray(images) || images.length === 0 || images.some(image => typeof image !== 'string' || image.trim() === '')) {
    return 'At least one non-empty image URL is required.';
  }

  // If all validations pass, return null (no errors)
  return null;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [editingProduct, setEditingProduct] = useState(null); // Tracks the product being edited
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("user");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setProducts(response.data.products);
      } else {
        setError("Failed to fetch products. Please try again.");
      }
    } catch (error) {
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    const productToValidate = editingProduct || newProduct;
    const validationError = validateProduct({
      ...productToValidate,
      tags: productToValidate.tags.split(","),
      images: productToValidate.images.split(","),
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    if (editingProduct) {
      await editProduct();
    } else {
      await createProduct();
    }
  };

  const createProduct = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.post("/api/admin/products", {
        ...newProduct,
        tags: newProduct.tags.split(","),
        images: newProduct.images.split(","),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
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
        await fetchProducts();
      } else {
        setError("Failed to create product. Please try again.");
      }
    } catch (error) {
      setError("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.put(
        "/api/admin/products",
        {
          id: editingProduct.id,
          ...editingProduct,
          tags: editingProduct.tags.split(","),
          images: editingProduct.images.split(","),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setEditingProduct(null); // Clear edit state
        await fetchProducts(); // Refresh product list
      } else {
        setError("Failed to update product. Please try again.");
      }
    } catch (error) {
      setError("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Admin Product Management</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? "Edit Product" : "Create New Product"}
        </h2>
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
        <div className="mb-4">
          <label className="block mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            value={editingProduct ? editingProduct.tags : newProduct.tags}
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({ ...editingProduct, tags: e.target.value })
                : setNewProduct({ ...newProduct, tags: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Images (comma-separated URLs)</label>
          <input
            type="text"
            value={editingProduct ? editingProduct.images : newProduct.images}
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({ ...editingProduct, images: e.target.value })
                : setNewProduct({ ...newProduct, images: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>
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
        <button
          onClick={handleFormSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {editingProduct ? "Update Product" : "Create Product"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Products</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Images</th>
              <th>WS Code</th>
              <th>Sales Price</th>
              <th>MRP</th>
              <th>Package Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.tags.join(", ")}</td>
                <td>{product.images.join(", ")}</td>
                <td>{product.wsCode}</td>
                <td>{product.salesPrice}</td>
                <td>{product.mrp}</td>
                <td>{product.packageSize}</td>
                <td>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProductsPage;
           
