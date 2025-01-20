import { useState } from "react";
import "@/app/globals.css";
import { useRouter } from "next/router";
import {
  Pencil, Trash2, ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleImageClick = () => {
    router.push(`/products/details/${product.id}`);
  };

  const isLowStock = product.packageSize < 10;

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div 
        className="relative w-full h-64 cursor-pointer"
        onClick={handleImageClick}
      >
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousImage}
                  className="ml-2 bg-gray-500/50 hover:bg-gray-600/50"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
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
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {isLowStock && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Low Stock
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0">Category: {product.category}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Price: ₹{product.salesPrice}</p>
            <p className="text-sm text-muted-foreground">MRP: ₹{product.mrp}</p>
          </div>
          <p className="text-sm">
            Available Quantity: <span className={`font-medium ${isLowStock ? 'text-red-500' : ''}`}>{product.packageSize}</span> units
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => onEdit(product)}
          className="flex-1 transition-colors"
          variant="outline"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => onDelete(product.id)}
          className="flex-1 transition-colors"
          variant="destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;