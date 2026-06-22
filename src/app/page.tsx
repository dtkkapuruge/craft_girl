'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1610996841103-6f8dce4937bb?q=80&w=1920&auto=format&fit=crop';

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.price,
      currency: 'LKR',
    });
    // Toast is shown by ProductCard component
  };

  return (
    <div className="bg-[#F9F6F0] min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Handmade resin crafts"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#442852]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B3D]/60 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto text-center">
          <p className="text-[#CBB0DC] text-sm font-medium tracking-widest uppercase mb-4">
            Handmade Items 🥰❤️
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
            Handcrafted Beauty,<br /> Delivered to You.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-[#E5E0D8] mb-10 leading-relaxed">
            Premium custom resin jewellery, flower preservation, and aesthetic handmade crafts with safe Cash on Delivery across Sri Lanka.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
          >
            Discover Our Story
          </Link>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#2D2D2D]">Trending Now</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#442852]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white border-y border-[#E5E0D8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-[#F9F6F0] text-[#442852] rounded-full flex items-center justify-center mx-auto mb-4">✨</div>
              <h3 className="font-bold text-[#2D2D2D] mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-500">Handcrafted with attention to every single detail.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-[#F9F6F0] text-[#442852] rounded-full flex items-center justify-center mx-auto mb-4">🚚</div>
              <h3 className="font-bold text-[#2D2D2D] mb-2">Islandwide Delivery</h3>
              <p className="text-sm text-gray-500">Safe and fast delivery across all of Sri Lanka.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-[#F9F6F0] text-[#442852] rounded-full flex items-center justify-center mx-auto mb-4">💵</div>
              <h3 className="font-bold text-[#2D2D2D] mb-2">Cash on Delivery</h3>
              <p className="text-sm text-gray-500">Pay conveniently when your package arrives.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}