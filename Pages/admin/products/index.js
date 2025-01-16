import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import "@/app/globals.css"

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
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
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

      const response = await axios.post("/api/admin/products", newProduct, {
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
        { id: editingProduct.id, ...editingProduct },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setEditingProduct(null); // Clear edit state
        await fetchProducts();
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

  const handleChange = (field, value) => {
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
              type="text"
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
            <label className="block mb-2">Images (comma-separated URLs)</label>
            <input
              type="text"
              value={editingProduct ? editingProduct.images : newProduct.images}
              onChange={(e) => handleChange("images", e.target.value)}
              className="w-full p-2 border rounded"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded p-4 flex flex-col items-center"
            >
              <Link href={`/products/${product.id}`}>
                <img
                  src={product.images || "/default-image.jpg"}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4"
                />
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">${product.salesPrice}</p>
              </Link>

              <button
                onClick={() => setEditingProduct(product)}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
