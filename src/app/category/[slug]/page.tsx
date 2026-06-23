'use client';

import { useParams } from 'next/navigation';
import { Product } from '@/lib/products';
import Link from 'next/link';
import { ArrowDownAZ, ArrowUpAZ, Clock, Loader2, Search, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { useState, useMemo, useEffect } from 'react';
import { fetchAllProducts } from '@/lib/productService';
import { resolveCategorySlug, getCategoryLabel } from '@/lib/categories';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllProducts().then((data) => {
      setAllProducts(data);
      setLoading(false);
    });
  }, []);

  const resolvedSlug = resolveCategorySlug(slug);
  const categoryName = getCategoryLabel(resolvedSlug);

  const baseProducts = useMemo(
    () => allProducts.filter((p) => p.category === resolvedSlug || p.category === slug),
    [allProducts, resolvedSlug, slug]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseProducts;
    return baseProducts.filter((p) =>
      `${p.name} ${p.description ?? ''}`.toLowerCase().includes(q)
    );
  }, [baseProducts, searchQuery]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    if (sortBy === 'price-asc') return products.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return products.sort((a, b) => b.price - a.price);
    return products.sort((a, b) => b.id.localeCompare(a.id));
  }, [filteredProducts, sortBy]);

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

  // Empty check removed so normal layout renders even if no products.

  return (
    <div className="bg-[#F9F6F0] min-h-screen">
      <section className="bg-[#CBB0DC] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-[#442852] mb-4">{categoryName}</h1>
          <p className="text-[#2D2D2D] max-w-2xl mx-auto">
            Discover our premium collection of {categoryName.toLowerCase()}, handcrafted with love and care just for you.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          {/* Search bar within category */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={`Search in ${categoryName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#D1C9C0] bg-white text-[#2D2D2D] focus:outline-none focus:border-[#442852] focus:ring-1 focus:ring-[#442852] transition-all text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <p className="text-gray-500 font-medium text-sm">
              {loading ? 'Loading…' : `${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-500 font-medium">Sort:</label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
                  className="appearance-none bg-white border border-[#CBB0DC] text-[#2D2D2D] py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#442852] font-medium text-sm"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#442852]">
                  {sortBy === 'newest' ? <Clock className="w-4 h-4" /> : sortBy === 'price-asc' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#442852]" />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {searchQuery 
                ? 'No products match your search.' 
                : `No products found in the "${categoryName}" category yet.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm text-[#442852] font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
