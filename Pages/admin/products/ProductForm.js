import { useState } from "react";
import "@/app/globals.css";
import { validateProductForm } from "../../../utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        setFormError(validation.errors); // Use setFormError instead
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
    <div className="space-y-4 px-4">
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
          <ul>
            {formError.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
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
              <SelectItem value="Groceries">Groceries</SelectItem>
              <SelectItem value="Beauty">Beauty</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
              <SelectItem value="Games">Games</SelectItem>
              <SelectItem value="Health & Wellness">
                Health & Wellness
              </SelectItem>
              <SelectItem value="Jewelry">Jewelry</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Pet Supplies">Pet Supplies</SelectItem>
              <SelectItem value="Baby & Kids">Baby & Kids</SelectItem>
              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
              <SelectItem value="Travelling">Travelling</SelectItem>
              <SelectItem value="Musical Instruments">
                Musical Instruments
              </SelectItem>
              <SelectItem value="Gardening">Gardening</SelectItem>
              <SelectItem value="Hardware Tools">Hardware Tools</SelectItem>
              <SelectItem value="Watches">Watches</SelectItem>
              <SelectItem value="Mobile Phones & Accessories">
                Mobile Phones & Accessories
              </SelectItem>
              <SelectItem value="Gaming">Gaming</SelectItem>
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

export default ProductForm;
