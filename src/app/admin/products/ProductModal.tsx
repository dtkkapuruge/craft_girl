'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type ProductInput } from '@/lib/productService';
import { PRODUCT_CATEGORIES } from '@/lib/categories';
import { Tags, X, ImageIcon } from 'lucide-react';

export default function ProductModal({
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
            <div className="w-8 h-8 rounded-lg bg-[#0E2C2A]/10 text-[#0E2C2A] flex items-center justify-center border border-[#0E2C2A]/20">
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
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-[#AB9266] focus:outline-none focus:ring-1 focus:ring-[#AB9266] transition-all font-medium text-gray-850"
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
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm resize-none focus:border-[#AB9266] focus:outline-none focus:ring-1 focus:ring-[#AB9266] transition-all font-medium text-gray-850"
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
                className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-[#AB9266] focus:outline-none focus:ring-1 focus:ring-[#AB9266] transition-all font-medium text-gray-850"
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
                className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-[#AB9266] focus:outline-none focus:ring-1 focus:ring-[#AB9266] transition-all font-medium text-gray-850"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm focus:border-[#AB9266] focus:outline-none focus:ring-1 focus:ring-[#AB9266] transition-all font-medium text-gray-850"
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
              <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-gray-300 px-4 py-4 text-center hover:border-[#AB9266] hover:bg-[#0E2C2A]/5 transition-colors">
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
              className="flex-1 rounded-xl bg-[#0E2C2A] py-3 text-sm font-bold text-white hover:bg-[#0a1f1e] shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
