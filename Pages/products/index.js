import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Loader2,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/compat/router";
import "@/app/globals.css";

const ProductCard = ({
  product,
  onAddToCart,
  isLoading,
  quantity,
  onUpdateQuantity,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const discount = Math.round(
    ((product.mrp - product.salesPrice) / product.mrp) * 100
  );

  return (
    <Card className="relative group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-64">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-500/50 hover:bg-gray-600/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500/50 hover:bg-gray-600/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {product.images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white w-3"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-500">
                  {discount}% OFF
                </Badge>
              )}
            </>
          ) : (
            <div className="w-full h-64 bg-muted flex items-center justify-center rounded-t-lg">
              No Image
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg line-clamp-1 mb-1">
          {product.name}
        </CardTitle>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-xl font-bold text-primary">
            ₹{product.salesPrice.toFixed(2)}
          </p>
          {product.mrp > product.salesPrice && (
            <p className="text-sm text-muted-foreground line-through">
              ₹{product.mrp.toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {isLoading ? (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {quantity ? "Updating..." : "Adding..."}
          </Button>
        ) : quantity ? (
          <div className="flex items-center justify-between w-full border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onUpdateQuantity(product.id, Math.max(0, quantity - 1))
              }
              className="hover:bg-primary/10"
            >
              <span className="text-lg font-medium">−</span>
            </Button>
            <span className="text-sm font-medium">{quantity} in cart</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="hover:bg-primary/10"
            >
              <span className="text-lg font-medium">+</span>
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => onAddToCart(product)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const ProductsPage = () => {
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [error, setError] = useState(null);
  const router = useRouter();

  // Existing fetch functions remain the same
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url =
        category === "all"
          ? "/api/products/filter?category="
          : `/api/products/filter?category=${category}`;
      const response = await axios.get(url);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, [category]);

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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem("user");

    if (!token) {
      router.push(`/login`);
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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

          {loading || cartLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  isLoading={addingToCart[product.id]}
                  quantity={cartItems[product.id]}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground">
                No products found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
