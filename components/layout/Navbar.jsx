'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">MyApp</Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          
          <Link href="/orders" className="hover:text-gray-400 flex items-center gap-2">
            <Package size={20} />
            <span className="hidden sm:inline">Orders</span>
          </Link>
          
          <Link href="/products/cart" className="hover:text-gray-400 flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Cart</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-gray-400">
                  {user.name || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="hover:text-gray-400">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;