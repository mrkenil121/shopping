import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users } from 'lucide-react';
import "@/app/globals.css";

const DashboardCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-gray-100">
          <Icon className="text-gray-500" size={24} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    recentProducts: [],
    recentUsers: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={ShoppingCart}
        />
        <DashboardCard
          title="Total Products"
          value={metrics.totalProducts}
          icon={Package}
        />
        <DashboardCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} />
                    <span>Order #{order.id}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentProducts?.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} />
                    <span>{product.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">
                      WS#{product.wsCode}
                    </span>
                    <span className="text-sm font-medium">
                      ₹{product.salesPrice}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;