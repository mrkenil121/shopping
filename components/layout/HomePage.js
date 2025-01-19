import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/compat/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";
import Image from 'next/image';

// Sample swiper products
const swiperProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    image: "/images/1.jpg",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    image: "/images/2.jpg",
  },
  {
    id: 3,
    name: "Bluetooth Speaker",
    image: "/images/3.jpg",
  },
  {
    id: 4,
    name: "Gaming Mouse",
    image: "/images/4.jpg",
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    image: "/images/5.jpg",
  },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();

        const productsArray = Array.isArray(result)
          ? result
          : result.products || [];

        if (productsArray.length === 0) {
          console.log("No products found");
          return;
        }

        const sortedProducts = [...productsArray].sort((a, b) => {
          const discountA = ((a.mrp - a.salesPrice) / a.mrp) * 100;
          const discountB = ((b.mrp - b.salesPrice) / b.mrp) * 100;
          return discountB - discountA;
        });

        setProducts(sortedProducts.slice(0, 8));
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const calculateDiscount = (mrp, salesPrice) => {
    return Math.round(((mrp - salesPrice) / mrp) * 100);
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  return (
    <div className="container min-w-full mx-auto px-4 py-8 bg-gradient-to-b from-gray-800 via-gray-500 to-gray-100 min-h-screen">
      {/* Products Grid - Highest Discounts */}

      {/* Featured Products Swiper */}
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3 flex flex-col items-start justify-center space-y-6 pl-8">
          <p className="text-xl italic text-gray-300 font-light">
            "Discover amazing deals and transform your shopping experience with
            us"
          </p>
          <Button
            className="w-full md:w-auto text-lg py-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/login")}
          >
            Sign in to Buy Products
          </Button>
        </div>

        <div className="md:w-2/3">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="w-full h-[400px] rounded-lg"
          >
            {swiperProducts.map((productt) => (
              <SwiperSlide key={productt.id}>
                <div
                  className="cursor-pointer w-full h-full relative"
                >
                  <Image
                    src={productt.image}
                    alt={productt.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {products.map((product) => (
            <Card
              key={product.id}
              className="relative cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleProductClick(product.id)}
            >
              <CardHeader className="p-0">
                <img
                  src={product.images?.[0] || "/api/placeholder/400/300"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-2 right-2 bg-red-500">
                  {calculateDiscount(product.mrp, product.salesPrice)}% OFF
                </Badge>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-1">
                  {product.name}
                </CardTitle>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">₹{product.salesPrice}</p>
                    {product.mrp > product.salesPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      ₹{product.mrp}
                    </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
