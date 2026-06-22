'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from '@/lib/productService';
import type { Product } from '@/lib/products';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '@/lib/categories';
import { hasPermission } from '@/lib/rbac';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  PackageOpen,
  X,
  ImageIcon,
  Tags,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  price: 0,
  category: 'resin',
  stockCount: 0,
  image: '',
};

function ProductModal({
  open,
  onClose,
  onSave,
  initial,
  title,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductInput, file: File | null) => Promise<void>;
  initial: ProductInput;
  title: string;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProductInput>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initial.image);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setPreview(initial.image);
      setImageFile(null);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form, imageFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-150 bg-white shadow-2xl overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#FDFBF7] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-750 flex items-center justify-center border border-purple-100">
              <Tags className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-md font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Product Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Preserved Rose Dome"
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide a detailed, elegant description..."
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm resize-none focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Price (LKR)</label>
              <input
                required
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="LKR 1,500"
                className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Initial Stock Qty</label>
              <input
                required
                type="number"
                min={0}
                value={form.stockCount || ''}
                onChange={(e) => setForm({ ...form, stockCount: Number(e.target.value) })}
                placeholder="25"
                className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Product Image</label>
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-gray-300 px-4 py-4 text-center hover:border-purple-400 hover:bg-purple-50/10 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <p className="text-xs font-bold text-gray-700">Click to upload image</p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#442852] py-3 text-sm font-bold text-white hover:bg-[#321c3d] shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminProductsContent() {
  const { role } = useAuth();
  const canManage = hasPermission(role, 'canManageProducts');
  const canDelete = canManage && role !== 'staff';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<ProductInput>(EMPTY_FORM);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    try {
      if (editingId) {
        await updateProduct(editingId, data, file);
      } else {
        await createProduct(data, file);
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (!confirm('Delete this product permanently?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
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
        {canManage && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#442852] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#321c3d]"
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
            <Loader2 className="h-8 w-8 animate-spin text-purple-750" />
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
                  {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650 font-medium">
                {products.map((product) => {
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
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(product)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                              title="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
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
