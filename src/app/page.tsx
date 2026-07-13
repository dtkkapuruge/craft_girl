'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { Loader2, Sparkles, Compass, Gift, ArrowRight } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1610996841103-6f8dce4937bb?q=80&w=1920&auto=format&fit=crop';

const CATEGORIES_SHOWCASE = [
  {
    key: 'jewellery',
    label: 'Custom Jewellery',
    count: 'Aesthetic & Handcrafted',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    color: 'from-pink-500/20 to-purple-500/20'
  },
  {
    key: 'resin',
    label: 'Resin Crafts',
    count: 'Keychains & Letters',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop',
    color: 'from-purple-500/20 to-indigo-500/20'
  },
  {
    key: 'stationery',
    label: 'Stationery',
    count: 'Journals & Wax Seals',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
    color: 'from-amber-500/20 to-orange-500/20'
  },
  {
    key: 'flower-preservation',
    label: 'Flower Preservation',
    count: 'Wedding & Event Keepsakes',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop',
    color: 'from-emerald-500/20 to-teal-500/20'
  }
];

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
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#2D2D2D] selection:bg-[#442852]/10 selection:text-[#442852] overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full filter blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[60vh] left-0 w-[400px] h-[400px] bg-pink-100/30 rounded-full filter blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-lg">
        <Image
          src={HERO_IMAGE}
          alt="Handmade resin crafts"
          fill
          priority
          className="object-cover transition-transform duration-10000 scale-105 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D1B3D]/90 via-[#442852]/80 to-[#2D1B3D]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7]/30 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#CBB0DC] text-xs font-bold uppercase tracking-widest shadow-inner animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            100% Handcrafted with Love
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight md:leading-none drop-shadow-md">
            Handcrafted Beauty, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CBB0DC] via-pink-200 to-[#F9F6F0]">
              Cured to Perfection.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-[#E5E0D8] text-base sm:text-lg leading-relaxed font-medium">
            Premium custom resin jewellery, flower preservation, and aesthetic handmade crafts with secure Cash on Delivery across Sri Lanka.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/category/all-products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c492e8] to-[#9c6fc2] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-[0_8px_30px_rgb(196,146,232,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Explore Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Custom Requests
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Browse Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-[#2D2D2D] tracking-tight">Shop by Category</h2>
          <p className="text-sm text-gray-500">Pick from our premium categories handcrafted to suit your style.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES_SHOWCASE.map((cat) => (
            <Link
              key={cat.key}
              href={`/category/${cat.key}`}
              className="group relative h-72 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] duration-300"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-all" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#CBB0DC]">
                  {cat.count}
                </span>
                <h3 className="text-lg font-extrabold tracking-tight">{cat.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-[#2D2D2D] tracking-tight">Trending Now</h2>
            <p className="text-sm text-gray-500">Some of our customers&apos; absolute favorite creations.</p>
          </div>
          <Link
            href="/category/all-products"
            className="flex items-center gap-1 text-[#442852] font-bold text-sm hover:underline"
          >
            View All Products <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#442852]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Custom Banner Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-[#442852] to-[#2D1B3D] rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#CBB0DC] text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" /> Gift Preservation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Preserve Your Special Memories</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              We preserve wedding bouquets, anniversary flowers, and special event tokens inside custom resin displays, glass domes, and jewelry. Message us to plan your keepsake.
            </p>
          </div>
          <Link
            href="/contact"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#F9F6F0] text-[#442852] px-8 py-4 rounded-2xl font-extrabold hover:bg-white shadow hover:scale-105 active:scale-95 transition-all text-sm shrink-0"
          >
            Start Custom Order
          </Link>
        </div>
      </section>

      {/* Features Block */}
      <section className="bg-white border-y border-[#E5E0D8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-[#F9F6F0] text-[#442852] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#E5E0D8] group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D]">Premium Quality</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">Handcrafted with carefully curated materials and meticulous attention to details.</p>
            </div>
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-[#F9F6F0] text-[#442852] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#E5E0D8] group-hover:scale-110 transition-transform duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D]">Islandwide Delivery</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">Safe packaging and reliable shipping to your doorstep across all Sri Lankan districts.</p>
            </div>
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-[#F9F6F0] text-[#442852] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#E5E0D8] group-hover:scale-110 transition-transform duration-300">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D]">Cash on Delivery</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">Pay conveniently in Cash only when you receive your handmade craft parcel.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}