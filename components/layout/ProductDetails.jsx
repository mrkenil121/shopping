import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const ProductDetails = ({ product, similarProducts }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    const token = localStorage.getItem("user");
    if (!token) {
      setCartLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartMap = {};
      response.data.cartItems.forEach((item) => {
        cartMap[item.productId] = item.quantity;
      });
      setCartItems(cartMap);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cart items",
        variant: "destructive",
      });
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (product) => {
    const token = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
    setError(null);

    try {
      await axios.post(
        "/api/cart",
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCartItems();
      toast({
        title: "Success",
        description: "Product added to cart",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      await axios.post(
        "/api/cart",
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCartItems();
      toast({
        title: "Success",
        description: "Cart updated successfully",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/products/details/${productId}`);
  };

  const calculateDiscount = () => {
    if (product.mrp > product.salesPrice) {
      const discount = ((product.mrp - product.salesPrice) / product.mrp) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  return (
    <div className="container mx-auto px-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Image Carousel */}
        <div className="w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Right side - Product Details */}
        <div className="space-y-6 ml-8">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-2xl font-bold">₹{product.salesPrice}</span>
              {product.mrp > product.salesPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{product.mrp}</span>
                  <Badge variant="secondary">{calculateDiscount()}% OFF</Badge>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div>
            {product.packageSize < 5 ? (
              <Badge variant="destructive">{ product.packageSize == 0 ? "Out of Stock" : `Only ${product.packageSize} left in stock`}</Badge>
            ): ""}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Badge key={index} variant="outline">{tag}</Badge>
            ))}
          </div>

          {/* Description */}
          <ScrollArea className="h-48">
            <p className="text-gray-600">{product.description}</p>
          </ScrollArea>

          {/* Add to Cart */}
          {addingToCart[product.id] ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {cartItems[product.id] ? "Updating..." : "Adding..."}
            </Button>
          ) : cartItems[product.id] ? (
            <div className="flex items-center justify-between w-full border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateQuantity(product.id, Math.max(0, cartItems[product.id] - 1))
                }
                className="hover:bg-primary/10"
              >
                <span className="text-lg font-medium">−</span>
              </Button>
              <span className="text-sm font-medium">{cartItems[product.id]} in cart</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(product.id, cartItems[product.id] + 1)}
                className="hover:bg-primary/10"
              >
                <span className="text-lg font-medium">+</span>
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>

      {/* Similar Products Section */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {similarProducts.map((similarProduct) => (
            <Card 
              key={similarProduct.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(similarProduct.id)}
            >
              <CardHeader>
                <img
                  src={similarProduct.images[0]}
                  alt={similarProduct.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">{similarProduct.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <CardDescription>₹{similarProduct.salesPrice}</CardDescription>
                  {similarProduct.mrp > similarProduct.salesPrice && (
                    <Badge variant="secondary">
                      {Math.round(((similarProduct.mrp - similarProduct.salesPrice) / similarProduct.mrp) * 100)}% OFF
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;