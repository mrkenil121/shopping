import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "@/app/globals.css";
import {
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProductForm from "./ProductForm";
import ProductCard from "./ProductCard";
import ErrorDialog from "@/utils/ErrorDialog";
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/Sidebar"

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        `/api/admin/products?page=${page}&pageSize=12`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  useEffect(() => {
    if (!showErrorDialog) {
      setError(""); // Clear error when dialog is closed
    }
  }, [showErrorDialog]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 animate-pulse h-80 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // In the createProduct function, update the tags handling:
  const createProduct = async (formData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("wsCode", formData.wsCode.toString());
      submitData.append("salesPrice", formData.salesPrice.toString());
      submitData.append("mrp", formData.mrp.toString());
      submitData.append("packageSize", formData.packageSize.toString());
      submitData.append("category", formData.category);
      submitData.append("description", formData.description.toString());

      // Handle tags
      const tags =
        typeof formData.tags === "string"
          ? formData.tags.split(",").map((tag) => tag.trim())
          : formData.tags;
      submitData.append("tags", JSON.stringify(tags));

      // Append new images
      formData.newImages.forEach((file) => {
        submitData.append("images", file);
      });

      const response = await axios.post("/api/admin/products", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setShowForm(false);
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (formData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const submitData = new FormData();
      submitData.append("id", editingProduct.id);
      submitData.append("name", formData.name);
      submitData.append("wsCode", formData.wsCode.toString());
      submitData.append("salesPrice", formData.salesPrice.toString());
      submitData.append("mrp", formData.mrp.toString());
      submitData.append("packageSize", formData.packageSize.toString());
      submitData.append("category", formData.category);
      submitData.append("description", formData.description.toString());

      // Handle tags
      const tags =
        typeof formData.tags === "string"
          ? formData.tags.split(",").map((tag) => tag.trim())
          : formData.tags;
      submitData.append("tags", JSON.stringify(tags));

      // Handle existing and new images
      submitData.append("existingImages", JSON.stringify(formData.images));
      formData.newImages.forEach((file) => {
        submitData.append("images", file);
      });

      const response = await axios.put("/api/admin/products", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setShowForm(false);
        setEditingProduct(null);
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Failed to update product");
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
      setError(
        "Failed to delete product because it is Ordered by Someone. Please delete that Order to proceed."
      );
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>

      <div className="flex">
        <Sidebar/>

        <div className="flex-1">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-semibold">
                Admin Product Management
              </h1>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Create New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the product details below. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[80vh]">
                    <ProductForm
                      editingProduct={editingProduct}
                      onSubmit={editingProduct ? editProduct : createProduct}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                      }}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <ErrorDialog
                error={error}
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(product) => {
                    setEditingProduct(product);
                    setShowForm(true);
                  }}
                  onDelete={deleteProduct}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
