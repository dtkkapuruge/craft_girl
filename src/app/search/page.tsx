'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchAllProducts, filterProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { Search, Loader2 } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const results = filterProducts(products, query);

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
    <div className="bg-[#F9F6F0] min-h-screen">
      <section className="bg-white border-b border-[#E5E0D8] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-5 w-5 text-[#442852]" />
            <h1 className="text-2xl font-bold text-[#2D2D2D]">
              {query ? `Results for "${query}"` : 'Search Products'}
            </h1>
          </div>
          {!loading && (
            <p className="text-sm text-gray-500">
              {results.length} product{results.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#442852]" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No products match your search.</p>
            <p className="text-sm text-gray-400 mt-1">Try different keywords or browse categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#442852]" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
