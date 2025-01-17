import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState({
    pending: [],
    confirmed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/orders');
        const data = await response.json();
        
        // Split orders into pending and confirmed
        const categorizedOrders = data.reduce((acc, order) => {
          if (order.status === 'pending') {
            acc.pending.push(order);
          } else if (order.status === 'confirmed') {
            acc.confirmed.push(order);
          }
          return acc;
        }, { pending: [], confirmed: [] });

        setOrders(categorizedOrders);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const OrderCard = ({ order }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <CardDescription>
              {new Date(order.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
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
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock size={16} />
            Pending ({orders.pending.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <CheckCircle size={16} />
            Confirmed ({orders.confirmed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {orders.pending.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending orders
            </div>
          ) : (
            orders.pending.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="confirmed">
          {orders.confirmed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No confirmed orders
            </div>
          ) : (
            orders.confirmed.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;