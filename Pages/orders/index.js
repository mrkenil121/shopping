import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState({
    pending: [],
    accepted: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('user');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      const categorizedOrders = response.data.reduce((acc, order) => {
        const status = order.status.toLowerCase();
        if (status === 'pending' || status === 'accepted') {
          acc[status].push(order);
        }
        return acc;
      }, { pending: [], accepted: [] });

      setOrders(categorizedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch orders';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    try {
      const token = localStorage.getItem('user');
      await axios.delete(`/api/orders`, {
        params: { id },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCancelSuccess(true);
      setTimeout(() => setCancelSuccess(false), 3000);
      fetchOrders(); // Refresh orders after cancellation
      setShowCancelDialog(false);
    } catch (err) {
      console.error('Error canceling order:', err);
      setError('Failed to cancel order. Please try again.');
      setShowCancelDialog(false);
    }
  };

  const filteredOrders = (orderList) => {
    return orderList.filter(order => 
      order.id.toString().includes(searchQuery) ||
      order.orderItems.some(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const OrderCard = ({ order }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Order No. {order.id}</CardTitle>
            <CardDescription>
              {new Date(order.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {order.status === 'pending' ? (
                <Clock className="text-yellow-500" size={20} />
              ) : (
                <CheckCircle className="text-green-500" size={20} />
              )}
              <span className={`capitalize font-medium ${
                order.status === 'pending' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {order.status}
              </span>
            </div>
            {order.status === 'pending' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setSelectedOrder(order);
                  setShowCancelDialog(true);
                }}
                className="flex items-center gap-2"
              >
                <XCircle size={16} />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package size={20} />
              <span>{order.orderItems.length} items</span>
            </div>
            <div className="font-semibold">
              Total: ₹{order.totalAmount.toFixed(2)}
            </div>
          </div>
          
          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-gray-500">
                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-medium">
                  ₹{(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search orders by ID or item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {cancelSuccess && (
        <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>
            Order cancelled successfully!
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-12 h-15">
          <TabsTrigger value="pending" className="flex items-center gap-2 text-lg font-medium py-3">
            <Clock size={20} />
            Pending ({filteredOrders(orders.pending).length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2 text-lg font-medium py-3">
            <CheckCircle size={20} />
            Accepted ({filteredOrders(orders.accepted).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {filteredOrders(orders.pending).length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-lg">
              No pending orders found
            </div>
          ) : (
            filteredOrders(orders.pending).map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {filteredOrders(orders.accepted).length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-lg">
              No accepted orders found
            </div>
          ) : (
            filteredOrders(orders.accepted).map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Are you sure you want to cancel order no. {selectedOrder?.id}.</p>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelOrder(selectedOrder?.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;