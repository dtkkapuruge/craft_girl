'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAllCategories,
  createCategory,
  type Category,
} from '@/lib/categoryService';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import toast from 'react-hot-toast';
import {
  Folder,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  Sparkles,
  Tag,
  FileText,
} from 'lucide-react';

// ─── New Category Modal ───────────────────────────────────────────────────────

interface NewCategoryModalProps {
  onClose: () => void;
  onCreate: (cat: Category) => void;
}

function NewCategoryModal({ onClose, onCreate }: NewCategoryModalProps) {
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [keyManual, setKeyManual] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-derive slug from name unless user manually edited it
  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!keyManual) {
      setKey(value.trim().toLowerCase().replace(/\s+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;
    setSaving(true);
    try {
      const created = await createCategory({ key, label, description });
      toast.success(`Category "${created.label}" created!`);
      onCreate(created);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create category. The key may already exist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-md rounded-3xl border border-purple-100/60 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#FDFBF7] to-purple-50/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#442852]/10 text-[#442852]">
              <Folder className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">New Category</h2>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                Add a new product catalogue section
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Category Name */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Tag className="w-3 h-3" />
              Category Name
            </label>
            <input
              required
              autoFocus
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. Crystal Art"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:border-[#442852] focus:outline-none focus:ring-1 focus:ring-[#442852]/30 transition-all"
            />
          </div>

          {/* Category Key / Slug */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              Category Key{' '}
              <span className="normal-case font-normal text-gray-400">(auto-generated)</span>
            </label>
            <input
              required
              type="text"
              value={key}
              onChange={(e) => {
                setKeyManual(true);
                setKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
              }}
              placeholder="e.g. crystal-art"
              className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-2.5 text-sm font-mono font-semibold text-purple-800 placeholder:text-gray-300 focus:border-[#442852] focus:outline-none focus:ring-1 focus:ring-[#442852]/30 transition-all"
            />
            <p className="mt-1.5 text-[10px] text-gray-400 leading-snug">
              Lowercase letters, numbers and hyphens only. Used as the database key and product filter.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              <FileText className="w-3 h-3" />
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what products belong in this category..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-[#442852] focus:outline-none focus:ring-1 focus:ring-[#442852]/30 transition-all leading-relaxed"
            />
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 px-4 py-3 text-[10px] text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              The category key cannot be changed after creation. Existing products assigned to this key will automatically appear under this category.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !label.trim() || !key.trim()}
              className="flex-1 rounded-xl bg-[#442852] py-2.5 text-sm font-bold text-white hover:bg-[#321c3d] shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  count,
  isNew,
}: {
  cat: Category;
  count: number;
  isNew?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
        isNew
          ? 'border-purple-200 ring-2 ring-[#442852]/10 animate-in fade-in zoom-in-95 duration-300'
          : 'border-gray-150'
      }`}
    >
      <div className="space-y-4">
        {/* Icon + badge row */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:bg-purple-100 transition-colors">
            <Folder className="w-5 h-5" />
          </div>
          {isNew && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-wider">
              New
            </span>
          )}
          {cat.isCustom && !isNew && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              Custom
            </span>
          )}
        </div>

        {/* Name + key */}
        <div>
          <h3 className="text-base font-bold text-gray-900">{cat.label}</h3>
          <p className="text-[10px] text-purple-500 mt-0.5 uppercase tracking-wider font-bold">
            {cat.key}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed">
          {cat.description || 'Handcrafted specialty items tailored to your aesthetic preferences.'}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-400 font-semibold">Products Catalog</span>
        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full font-bold">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────────

function CategoriesContent() {
  const { role } = useAuth();
  const canCreate = role === 'super-admin' || role === 'admin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newlyCreatedIds, setNewlyCreatedIds] = useState<Set<string>>(new Set());

  const getProductCount = (catKey: string) =>
    products.filter((p) => p.category === catKey).length;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetchAllCategories(),
        fetchAllProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryCreated = (cat: Category) => {
    // Optimistically prepend to the list and mark as "new"
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      return exists ? prev : [...prev, cat];
    });
    setNewlyCreatedIds((prev) => new Set(prev).add(cat.id));
    setShowModal(false);

    // Remove the "new" highlight after 4 seconds
    setTimeout(() => {
      setNewlyCreatedIds((prev) => {
        const next = new Set(prev);
        next.delete(cat.id);
        return next;
      });
    }, 4000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Modal */}
      {showModal && (
        <NewCategoryModal
          onClose={() => setShowModal(false)}
          onCreate={handleCategoryCreated}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#442852] font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Catalogue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
            Categories Management
          </h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">
            View product distribution across primary store categorizations.{' '}
            <span className="text-gray-400">({categories.length} categories)</span>
          </p>
        </div>

        {/* + New Category button — only for admin & super-admin */}
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#442852] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#321c3d] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        )}
      </div>

      {/* ── Category Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
          <p className="mt-3 text-xs font-semibold">Loading categories…</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-center">
          <Folder className="h-12 w-12 mb-4 text-purple-200" />
          <p className="text-sm font-semibold text-gray-600">No categories yet</p>
          <p className="text-xs mt-1">Click "+ New Category" to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              count={getProductCount(cat.key)}
              isNew={newlyCreatedIds.has(cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  return (
    <AdminGuard minRole={['staff', 'admin', 'super-admin']} requiredPermission="canViewDashboard">
      <CategoriesContent />
    </AdminGuard>
  );
}
