'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import { PRODUCT_CATEGORIES } from '@/lib/categories';
import { Folder, Loader2 } from 'lucide-react';

function CategoriesContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const getProductCount = (categoryVal: string) => {
    return products.filter((p) => p.category === categoryVal).length;
  };

  const categoryDescriptions: Record<string, string> = {
    resin: 'Custom resin accessories, keychains, and letter sets handcrafted using epoxy resin.',
    jewellery: 'Aesthetic bracelets, custom name lockets, flower necklaces, and beaded sets.',
    'chocolate-boxes': 'Special occasion luxury packaging boxes and handmade chocolate pairings.',
    'flower-preservation': 'Wedding and special event flower preservation inside glass dome displays.',
    handmade: 'Assorted custom aesthetic greeting cards, frames, and hand-woven artifacts.',
    stationery: 'Cute notebooks, customized wax seals, pastel highlighters, and aesthetic journals.',
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">Categories Management</h1>
        <p className="mt-1.5 text-xs font-medium text-gray-500">
          View product distribution across primary store categorizations.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
          <p className="mt-3 text-xs font-semibold">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_CATEGORIES.map((cat) => {
            const count = getProductCount(cat.value);
            return (
              <div 
                key={cat.value} 
                className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-750 flex items-center justify-center border border-purple-100">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{cat.label}</h3>
                    <p className="text-[10px] text-purple-500 mt-0.5 uppercase tracking-wider font-bold">{cat.value}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {categoryDescriptions[cat.value] || 'Handcrafted specialty items tailored to customize your aesthetic preferences.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Products Catalog</span>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full font-bold">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AdminGuard minRole={['staff', 'admin', 'super-admin']} requiredPermission="canViewDashboard">
      <CategoriesContent />
    </AdminGuard>
  );
}
