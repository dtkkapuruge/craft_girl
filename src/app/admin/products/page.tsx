'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type ProductInput,
} from '@/lib/productService';
import type { Product } from '@/lib/products';
import { getCategoryLabel } from '@/lib/categories';
import { hasPermission } from '@/lib/rbac';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  PackageOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ProductModal = dynamic(() => import('./ProductModal'), {
  ssr: false,
});

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  price: 0,
  category: 'resin',
  stockCount: 0,
  image: '',
};

function AdminProductsContent() {
  const { role } = useAuth();
  const canCreate = hasPermission(role, 'canCreateProducts');
  const canEdit = hasPermission(role, 'canEditProducts');
  const canDelete = hasPermission(role, 'canDeleteProducts') && role !== 'staff';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<ProductInput>(EMPTY_FORM);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Real-time listener for products
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const data = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: (data.name as string) ?? '',
          description: (data.description as string) ?? '',
          price: Number(data.price) || 0,
          category: (data.category as string) ?? 'handmade',
          image: (data.image as string) ?? '',
          rating: Number(data.rating) || 4.8,
          reviews: Number(data.reviews) || 0,
          stockCount: Number(data.stockCount ?? data.stock) || 0,
        } as Product;
      });
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute pagination and total pages
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  // Auto-adjust page if products list changes and current page exceeds total pages
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [products.length, totalPages, currentPage]);

  // Memoize paginated slice of products to avoid unnecessary re-rendering
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const openCreate = () => {
    setEditingId(null);
    setFormInitial(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setFormInitial({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      category: product.category,
      stockCount: product.stockCount ?? 10,
      image: product.image,
    });
    setModalOpen(true);
  };

  const handleSave = async (data: ProductInput, file: File | null) => {
    setSaving(true);
    let finalImageUrl = data.image;

    try {
      if (file) {
        finalImageUrl = await uploadProductImage(file);
      }
      if (editingId) {
        await updateProduct(editingId, { ...data, image: finalImageUrl }, null);
      } else {
        await createProduct({ ...data, image: finalImageUrl }, null);
      }

      setProducts(prev => {
        let newProducts;
        if (editingId) {
          newProducts = prev.map(p =>
            p.id === editingId ? { ...p, ...data, image: finalImageUrl } : p
          );
        } else {
          const newProd = {
            ...data,
            id: `prod_${Date.now()}`,
            image: finalImageUrl,
            rating: 4.8,
            reviews: 0,
            stockCount: data.stockCount,
          };
          newProducts = [newProd, ...prev];
        }
        localStorage.setItem('craft_products', JSON.stringify(newProducts));
        return newProducts;
      });
      setModalOpen(false);
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (!confirm('Delete this product permanently?')) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Firebase delete failed, falling back to local storage', err);
    }
    setProducts((prev) => {
      const newProducts = prev.filter((p) => p.id !== id);
      localStorage.setItem('craft_products', JSON.stringify(newProducts));
      return newProducts;
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock >= 5) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {stock} in stock
        </span>
      );
    }
    if (stock > 0) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-250 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> Low Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-250 px-2.5 py-0.5 rounded-full text-xs font-semibold">
        <XCircle className="w-3 h-3 text-rose-500" /> Out of stock
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
            Product Management
          </h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">
            Create, edit, and publish craft products for consumer browse and purchase workflows.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E2C2A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0a1f1e]"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#0E2C2A]" />
            <p className="mt-3 text-xs font-semibold">Loading product catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <PackageOpen className="h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-500">No products yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FDFBF7] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock Status</th>
                  {(canEdit || canDelete) && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650 font-medium">
                {paginatedProducts.map((product) => {
                  const stock = product.stockCount ?? 0;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-gray-100 shadow-sm shrink-0">
                          <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{product.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                          {getCategoryLabel(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        LKR {product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStockBadge(stock)}
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEdit && (
                              <button
                                onClick={() => openEdit(product)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                title="Edit product"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 bg-[#FDFBF7] px-6 py-4">
                <div className="text-xs font-semibold text-gray-500">
                  Showing <span className="font-bold text-gray-800">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, products.length)}</span> to{' '}
                  <span className="font-bold text-gray-800">{Math.min(currentPage * ITEMS_PER_PAGE, products.length)}</span> of{' '}
                  <span className="font-bold text-gray-800">{products.length}</span> products
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                          isActive
                            ? 'bg-[#0E2C2A] text-white border-[#0E2C2A] shadow-sm'
                            : 'border-gray-250 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={formInitial}
        title={editingId ? 'Edit Product Catalog Details' : 'Publish New Product'}
        saving={saving}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminGuard minRole={['admin', 'super-admin', 'staff']} requiredPermission="canViewProducts">
      <AdminProductsContent />
    </AdminGuard>
  );
}
