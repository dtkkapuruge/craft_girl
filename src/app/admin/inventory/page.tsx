'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import { getCategoryLabel } from '@/lib/categories';
import { 
  Loader2, 
  Plus, 
  Minus, 
  Package, 
  Hammer, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  PlusCircle,
  Trash2
} from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lastUpdated?: string;
}

function InventoryContent() {
  const [activeTab, setActiveTab] = useState<'finished' | 'raw'>('finished');
  
  // Finished Products States
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Raw Materials States
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loadingRaw, setLoadingRaw] = useState(true);
  
  // Raw material modal / add form state
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState<number>(0);
  const [newMaterialUnit, setNewMaterialUnit] = useState('units');
  const [savingRaw, setSavingRaw] = useState(false);

  // Load finished products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    const fetched = await fetchAllProducts();
    setProducts(fetched);
    setLoadingProducts(false);
  }, []);

  // Load raw materials
  const loadRawMaterials = useCallback(async () => {
    setLoadingRaw(true);
    try {
      const snapshot = await getDocs(collection(db, 'raw_materials'));
      const fetched: RawMaterial[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        fetched.push({
          id: d.id,
          name: data.name ?? '',
          quantity: Number(data.quantity) || 0,
          unit: data.unit ?? 'units',
          lastUpdated: data.lastUpdated,
        });
      });

      // Populate default raw materials if empty
      if (fetched.length === 0) {
        const defaults = [
          { name: 'Epoxy Resin', quantity: 25, unit: 'kg' },
          { name: 'Hardener', quantity: 12, unit: 'kg' },
          { name: 'Dried Flowers', quantity: 150, unit: 'g' },
          { name: 'Silicone Molds', quantity: 45, unit: 'pcs' },
          { name: 'Glitter Powder', quantity: 80, unit: 'tubes' },
        ];
        
        for (const item of defaults) {
          const id = `raw_${Math.random().toString(36).substring(2, 9)}`;
          await setDoc(doc(db, 'raw_materials', id), {
            ...item,
            lastUpdated: new Date().toISOString(),
          });
          fetched.push({ id, ...item, lastUpdated: new Date().toISOString() });
        }
      }
      setRawMaterials(fetched.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRaw(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'finished') {
      loadProducts();
    } else {
      loadRawMaterials();
    }
  }, [activeTab, loadProducts, loadRawMaterials]);

  // Adjust finished product stock inline
  const adjustProductStock = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    // Optimistic Update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockCount: newStock } : p));
    try {
      await updateDoc(doc(db, 'products', productId), {
        stockCount: newStock,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update stock quantity on server.');
      // Revert stock
      loadProducts();
    }
  };

  // Adjust raw material quantity inline
  const adjustRawQuantity = async (rawId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    setRawMaterials(prev => prev.map(r => r.id === rawId ? { ...r, quantity: newQty } : r));
    try {
      await updateDoc(doc(db, 'raw_materials', rawId), {
        quantity: newQty,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update raw material on server.');
      loadRawMaterials();
    }
  };

  // Add new raw material
  const handleAddRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;
    setSavingRaw(true);
    try {
      const id = `raw_${Date.now()}`;
      const item = {
        name: newMaterialName.trim(),
        quantity: Number(newMaterialQty) || 0,
        unit: newMaterialUnit.trim() || 'units',
        lastUpdated: new Date().toISOString(),
      };
      await setDoc(doc(db, 'raw_materials', id), item);
      setNewMaterialName('');
      setNewMaterialQty(0);
      setNewMaterialUnit('units');
      await loadRawMaterials();
    } catch (err) {
      console.error(err);
      alert('Failed to add raw material.');
    } finally {
      setSavingRaw(false);
    }
  };

  // Delete raw material
  const handleDeleteRaw = async (id: string, name: string) => {
    if (!confirm(`Delete raw material "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'raw_materials', id));
      setRawMaterials(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete raw material.');
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock >= 5) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> In Stock
        </span>
      );
    }
    if (stock > 0) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-250 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-250 px-2.5 py-0.5 rounded-full text-xs font-semibold">
        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Out of Stock
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">Inventory Dashboard</h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">
            Track sellable products catalog quantities and workshop raw materials logs.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-150">
        <button
          onClick={() => setActiveTab('finished')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'finished'
              ? 'bg-white text-gray-850 shadow-sm'
              : 'text-gray-500 hover:text-gray-805'
          }`}
        >
          <Package className="w-4 h-4" /> Finished Products
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'raw'
              ? 'bg-white text-gray-850 shadow-sm'
              : 'text-gray-500 hover:text-gray-855'
          }`}
        >
          <Hammer className="w-4 h-4" /> Raw Materials
        </button>
      </div>

      {/* TAB CONTENT: FINISHED PRODUCTS */}
      {activeTab === 'finished' && (
        <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-purple-750" />
              <p className="mt-3 text-xs font-semibold">Loading finished products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FDFBF7] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4">Count</th>
                    <th className="px-6 py-4 text-center">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-650 font-medium">
                  {products.map((p) => {
                    const stock = p.stockCount ?? 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[250px]">{p.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                            {getCategoryLabel(p.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-950">LKR {p.price.toLocaleString()}</td>
                        <td className="px-6 py-4">{getStockBadge(stock)}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 text-md">{stock}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => adjustProductStock(p.id, stock, -1)}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors active:scale-95"
                              title="Decrement Stock"
                            >
                              <Minus className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => adjustProductStock(p.id, stock, 1)}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 text-gray-500 hover:text-emerald-600 flex items-center justify-center transition-colors active:scale-95"
                              title="Increment Stock"
                            >
                              <Plus className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RAW MATERIALS */}
      {activeTab === 'raw' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of supplies */}
          <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm h-fit">
            {loadingRaw ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-purple-750" />
                <p className="mt-3 text-xs font-semibold">Loading workshop materials...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FDFBF7] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Material Name</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Unit</th>
                      <th className="px-6 py-4 text-center">Adjust Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-650 font-medium">
                    {rawMaterials.map((rm) => (
                      <tr key={rm.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{rm.name}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 text-md">{rm.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-semibold text-xs lowercase">{rm.unit}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => adjustRawQuantity(rm.id, rm.quantity, -1)}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => adjustRawQuantity(rm.id, rm.quantity, 1)}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 text-gray-500 hover:text-emerald-600 flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteRaw(rm.id, rm.name)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add supply form */}
          <div className="lg:col-span-1 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm h-fit space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <PlusCircle className="w-5 h-5 text-purple-705 text-purple-700" />
              <h3 className="text-sm font-bold text-gray-850">Log New Material</h3>
            </div>

            <form onSubmit={handleAddRawMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Material Name</label>
                <input
                  required
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  placeholder="e.g. Glitter Powder"
                  className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Qty</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={newMaterialQty || ''}
                    onChange={(e) => setNewMaterialQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Unit</label>
                  <input
                    required
                    type="text"
                    value={newMaterialUnit}
                    onChange={(e) => setNewMaterialUnit(e.target.value)}
                    placeholder="e.g. kg, ml, pcs"
                    className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-850"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingRaw}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#442852] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#321c3d] transition-all disabled:opacity-50"
              >
                Log Supply Material
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <AdminGuard minRole={['staff', 'admin', 'super-admin']} requiredPermission="canViewDashboard">
      <InventoryContent />
    </AdminGuard>
  );
}
