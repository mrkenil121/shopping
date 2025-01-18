import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import "@/app/globals.css";
import {
  Package,
  LogOut,
  Plus,
  UserCircle,
  Pencil, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";

import { validateProductForm } from "../../../utils/validators";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Card className="overflow-hidden">
      <div className="relative w-full h-64">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    previousImage();
                  }}
                  className="ml-2 bg-gray-500/50 hover:bg-gray-600/50"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage();
                  }}
                  className="mr-2 bg-gray-500/50 hover:bg-gray-600/50"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-gray-500/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground mt-0">Category: {product.category}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">Price: ₹{product.salesPrice}</p>
          <p className="text-sm text-muted-foreground">MRP: ₹{product.mrp}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => onEdit(product)}
          className="flex-1"
          variant="outline"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => onDelete(product.id)}
          className="flex-1"
          variant="destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

const ProductForm = ({ editingProduct, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    wsCode: editingProduct?.wsCode || "",
    salesPrice: editingProduct?.salesPrice || "",
    mrp: editingProduct?.mrp || "",
    packageSize: editingProduct?.packageSize || "",
    tags: editingProduct?.tags?.join(", ") || "",
    category: editingProduct?.category || "",
    images: editingProduct?.images || [],
    newImages: [],
    previewUrls: editingProduct?.images || [],
  });

  const [formError, setFormError] = useState(""); // Add this line

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...files],
      previewUrls: [...prev.previewUrls, ...previews],
    }));
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        previewUrls: prev.previewUrls.filter((_, i) => i !== index),
      }));
    } else {
      const newImageIndex = index - (formData.images?.length || 0);
      setFormData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== newImageIndex),
        previewUrls: prev.previewUrls.filter((_, i) => i !== index),
      }));
    }
  };

  // In your ProductForm component, add this:
  const handleSubmit = async () => {
    const token = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const validation = await validateProductForm(
        formData,
        token,
        editingProduct
      );

      if (!validation.isValid) {
        setFormError(validation.errors.join("\n")); // Use setFormError instead
        return;
      }

      // If validation passes, proceed with submission
      await onSubmit(formData);
    } catch (error) {
      setFormError("Failed to validate product data"); // Use setFormError instead
    }
  };

  const renderImagePreviews = () => (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* Existing images */}
      {formData.images.map((image, index) => (
        <div key={`existing-${index}`} className="relative">
          <img
            src={image}
            alt={`Product ${index + 1}`}
            className="w-20 h-20 object-cover rounded"
          />
          <Button
            type="button"
            onClick={() => handleRemoveImage(index, true)}
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          >
            ×
          </Button>
        </div>
      ))}

      {/* New image previews */}
      {formData.newImages.map((_, index) => (
        <div key={`new-${index}`} className="relative">
          <img
            src={formData.previewUrls[formData.images.length + index]}
            alt={`New upload ${index + 1}`}
            className="w-20 h-20 object-cover rounded"
          />
          <Button
            type="button"
            onClick={() => handleRemoveImage(formData.images.length + index)}
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {formError}
        </div>
      )}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wsCode">WS Code</Label>
          <Input
            id="wsCode"
            type="number"
            value={formData.wsCode}
            onChange={(e) => handleChange("wsCode", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="salesPrice">Sales Price</Label>
            <Input
              id="salesPrice"
              type="number"
              value={formData.salesPrice}
              onChange={(e) => handleChange("salesPrice", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mrp">MRP</Label>
            <Input
              id="mrp"
              type="number"
              value={formData.mrp}
              onChange={(e) => handleChange("mrp", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="packageSize">Package Size</Label>
          <Input
            id="packageSize"
            type="number"
            value={formData.packageSize}
            onChange={(e) => handleChange("packageSize", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(selectedValue) =>
              handleChange("category", selectedValue)
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="beauty_personal_care">Beauty</SelectItem>
              <SelectItem value="sports_fitness">Fitness</SelectItem>
              <SelectItem value="toys_games">Games</SelectItem>
              <SelectItem value="health_wellness">Health & Wellness</SelectItem>
              <SelectItem value="jewelry_accessories">Jewelry</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="pet_supplies">Pet Supplies</SelectItem>
              <SelectItem value="baby_kids">Baby & Kids</SelectItem>
              <SelectItem value="office_supplies">Office Supplies</SelectItem>
              <SelectItem value="travel_luggage">Travelling</SelectItem>
              <SelectItem value="music_instruments">
                Musical Instruments
              </SelectItem>
              <SelectItem value="gardening_outdoor">Gardening</SelectItem>
              <SelectItem value="tools_hardware">THardware Tools</SelectItem>
              <SelectItem value="watches">Watches</SelectItem>
              <SelectItem value="mobile_phones_accessories">
                Mobile Phones & Accessories
              </SelectItem>
              <SelectItem value="gaming_consoles">Gaming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="images">Images</Label>
          {renderImagePreviews()}
          <Input
            id="images"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingProduct ? "Update" : "Create"} Product
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    wsCode: "",
    salesPrice: "",
    mrp: "",
    packageSize: "",
    tags: "",
    category: "",
    images: [],
    previewUrls: [], // Add previewUrls to initial state
  });
  const [editingProduct, setEditingProduct] = useState(null);
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
      setError("Failed to delete product.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleLoginAsCustomer = () => {
    router.push("/products");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800 -ml-2">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={handleLoginAsCustomer}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <UserCircle size={18} />
                <span>Login as Customer</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Orders</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Products</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Users</span>
            </Link>
          </nav>
        </aside>
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
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
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
