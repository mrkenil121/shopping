'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { ShoppingCart, Package, UserCircle, PackageSearch } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  // Handle initial mounting and hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  
  return (
    <nav style={{zIndex:"100"}} className="bg-gray-800 text-white sticky top-0 w-full">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">
          <Image src="/images/logo1.png" alt="logo" width={180} height={30} />
          </Link>
        </div>

        <div className="flex items-center space-x-6 text-color" style={{color:"#CBB26A"}}>
        <Link href="/products" className="hover:text-gray-400 flex items-center gap-2 px-4 py-2">
          <PackageSearch size={20} />
          <span className="hidden sm:inline">Products</span>
          </Link>
          
          <Link href="/orders" className="hover:text-gray-400 flex items-center gap-2 px-4 py-2">
            <Package size={20} />
            <span className="hidden sm:inline">Orders</span>
          </Link>
          
          <Link href="/products/cart" className="hover:text-gray-400 flex items-center gap-2 px-4 py-2">
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Cart</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:text-gray-400 hover:bg-gray-600 flex items-center gap-2 px-4 py-2" style={{color:"#CBB26A"}}>
                  <UserCircle size={20} />
                  <span>{user.name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center">
              <Link href="/login" className="hover:text-gray-400 px-4 py-2">
                Login
              </Link>
              <Link
                href="/signup"
                className="hover:text-gray-400 px-4 py-2"
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