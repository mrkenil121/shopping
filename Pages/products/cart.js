import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Loader2, Minus, Plus, ShoppingCart, TrashIcon, ArrowLeft } from "lucide-react";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [token, setToken] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("user");
    if (!storedToken) {
      router.push("/login?redirect=/cart");
      return;
    }
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchCartItems();
    }
  }, [token]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data || !response.data.cartItems) {
        throw new Error("Invalid response format");
      }

      setCartItems(response.data.cartItems);
      setTotalPrice(response.data.totalPrice);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);

    try {
      await axios.post(
        `/api/cart`,
        { 
          productId,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchCartItems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await axios.post(
        `/api/cart`,
        { 
          productId,
          quantity: 0
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchCartItems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await axios.post(
        "/api/checkout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartItems([]);
      setTotalPrice(0);
      router.push("/checkout/success");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const CartItem = ({ item }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {item.product.images && item.product.images.length > 0 && (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-md"
              />
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">{item.product.name}</h3>
            <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                disabled={isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveItem(item.productId)}
              className="mt-2"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/products")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-xl mb-4">Your cart is empty</p>
            <Button onClick={() => router.push("/products")}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 lg:pr-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ScrollArea>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24"> {/* Adjust top value based on your navbar height */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Processing...
                      </span>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Cart;