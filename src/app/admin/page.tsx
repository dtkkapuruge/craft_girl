'use client';

import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  Eye,
  Package,
  CreditCard,
  MapPin,
  Phone,
  X,
  Loader2,
  Truck,
} from 'lucide-react';

// ─── Types (matching Orders page exactly) ─────────────────────────────────────

interface OrderItem {
  productId: string;
  name: string;
  variantChosen: {
    color?: string;
    size?: string;
    material?: string;
    personalizationText?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    district: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Dispatched' | 'Completed' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: string;
  createdAt: { toDate?: () => Date };
}

// ─── Normalize (shared with Orders page) ──────────────────────────────────────

function normalizeOrder(id: string, data: any): Order {
  const customer = data.customer || {};
  const items = Array.isArray(data.items) ? data.items : [];

  let parsedCreatedAt: Order['createdAt'] = { toDate: () => new Date() };
  if (data.createdAt) {
    if (typeof data.createdAt.toDate === 'function') {
      parsedCreatedAt = data.createdAt;
    } else if (data.createdAt.seconds) {
      parsedCreatedAt = { toDate: () => new Date(data.createdAt.seconds * 1000) };
    } else {
      const dateVal = new Date(data.createdAt);
      if (!isNaN(dateVal.getTime())) {
        parsedCreatedAt = { toDate: () => dateVal };
      }
    }
  }

  return {
    id,
    orderNumber: data.orderNumber || `CGS-${Math.floor(100000 + Math.random() * 900000)}`,
    customer: {
      name: customer.name || 'Anonymous Customer',
      phone: customer.phone || 'N/A',
      address: customer.address || 'No address provided',
      district: customer.district || 'N/A',
    },
    items: items.map((item: any) => ({
      productId: item.productId || '',
      name: item.name || 'Unknown Item',
      variantChosen: item.variantChosen || {},
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    })),
    totalAmount: Number(data.totalAmount) || 0,
    status: data.status || 'Pending',
    paymentMethod: data.paymentMethod || 'COD',
    paymentStatus: data.paymentStatus || 'Pending COD',
    createdAt: parsedCreatedAt,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(createdAt: Order['createdAt']) {
  if (!createdAt?.toDate) return 'N/A';
  return createdAt.toDate().toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return `LKR ${amount.toLocaleString('en-LK')}`;
}

function getStatusStyles(status: string) {
  if (status === 'Completed' || status === 'Dispatched') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Processing') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function getPaymentStyles(pay: string) {
  return pay === 'Paid'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    : 'bg-amber-50 text-amber-700 border border-amber-100';
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all orders (same collection as Orders page)
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const ordersSnap = await getDocs(ordersQuery);
      const allOrders: Order[] = [];
      ordersSnap.forEach((docSnap) => {
        allOrders.push(normalizeOrder(docSnap.id, docSnap.data()));
      });
      setOrders(allOrders);

      // Fetch user count from users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      setUserCount(usersSnap.size);
    } catch (err) {
      console.error('Dashboard data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ─── Compute real metrics from orders ────────────────────────────────────

  const totalOrders = orders.length;

  // Total Sales = sum of totalAmount for Completed orders (matches Orders page "Completed Revenue")
  const totalSales = orders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Avg order value across ALL orders
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / Math.max(orders.filter(o => o.status === 'Completed').length, 1)) : 0;

  // Status counts (matching Orders page logic exactly)
  const statusCounts: Record<string, number> = {
    Completed: 0,
    Dispatched: 0,
    Processing: 0,
    Pending: 0,
    Cancelled: 0,
  };
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Status split with percentages
  const statusSplit = [
    { label: 'Completed', count: statusCounts.Completed, color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'Processing', count: statusCounts.Processing, color: 'bg-blue-500', text: 'text-blue-500' },
    { label: 'Pending', count: statusCounts.Pending, color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Cancelled', count: statusCounts.Cancelled, color: 'bg-rose-500', text: 'text-rose-500' },
    { label: 'Dispatched', count: statusCounts.Dispatched, color: 'bg-violet-500', text: 'text-violet-500' },
  ].map((s) => ({
    ...s,
    percentage: totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0,
  }));

  // Conic gradient for doughnut
  const conicSegments: string[] = [];
  let cumulative = 0;
  const doughnutColors: Record<string, string> = {
    Completed: '#10B981',
    Processing: '#3B82F6',
    Pending: '#F59E0B',
    Cancelled: '#EF4444',
    Dispatched: '#8B5CF6',
  };
  statusSplit.forEach((s) => {
    const start = cumulative;
    cumulative += s.percentage;
    conicSegments.push(`${doughnutColors[s.label]} ${start}% ${cumulative}%`);
  });
  const conicGradient = totalOrders > 0
    ? `conic-gradient(${conicSegments.join(', ')})`
    : 'conic-gradient(#E5E7EB 0% 100%)';

  // Top selling products — aggregate item quantities across all orders
  const productSalesMap: Record<string, { name: string; quantity: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const key = item.name || item.productId;
      if (!productSalesMap[key]) {
        productSalesMap[key] = { name: item.name, quantity: 0 };
      }
      productSalesMap[key].quantity += item.quantity;
    });
  });
  const topSelling = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  const maxSales = topSelling.length > 0 ? topSelling[0].quantity : 1;

  const barColors = [
    'bg-gradient-to-t from-purple-600 to-indigo-500',
    'bg-gradient-to-t from-purple-500 to-pink-500',
    'bg-gradient-to-t from-violet-500 to-purple-400',
    'bg-gradient-to-t from-indigo-400 to-purple-300',
    'bg-gradient-to-t from-purple-400 to-pink-300',
  ];

  // Recent orders — last 5
  const recentOrders = orders.slice(0, 5);

  // Metrics cards
  const metrics = [
    { label: 'Total Sales', value: formatCurrency(totalSales), icon: DollarSign },
    { label: 'Total Orders', value: String(totalOrders), icon: ShoppingBag },
    { label: 'Active Users', value: String(userCount), icon: Users },
    { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), icon: TrendingUp },
  ];

  // ─── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
        <p className="mt-3 text-xs font-semibold">Loading dashboard data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</p>
                <h3 className="text-2xl font-bold text-gray-800">{m.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Top Selling Products</h3>
              <p className="text-xs text-gray-500">By craft items sales volume</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-[#582da8] hover:underline flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topSelling.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="w-10 h-10 mb-3 text-purple-200" />
              <p className="text-xs font-semibold">No product sales data yet</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-gray-100">
              {topSelling.map((item, idx) => {
                const percentage = Math.max(10, Math.round((item.quantity / maxSales) * 90));
                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full group w-1/5 relative">
                    {/* Count tooltip on hover */}
                    <div className="absolute -top-8 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.quantity} sold
                    </div>
                    {/* Bar */}
                    <div
                      className={`w-10 rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${barColors[idx] || barColors[0]}`}
                      style={{ height: `${percentage}%` }}
                    />
                    <span className="text-[10px] text-gray-400 mt-2 font-semibold truncate max-w-full px-1 text-center" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders Status Split Doughnut Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Orders Status Split</h3>
            <p className="text-xs text-gray-500 mb-6">Distribution of overall orders status</p>
          </div>

          {/* Doughnut */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className="w-32 h-32 rounded-full border-[12px] border-gray-50 relative flex items-center justify-center"
              style={{ background: conicGradient }}
            >
              <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-xl font-extrabold text-gray-800">{totalOrders}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {statusSplit.map((status, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full shrink-0 ${status.color}`} />
                <span className="text-gray-600 font-medium">{status.label}</span>
                <span className={`ml-auto font-bold ${status.text}`}>{status.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Log Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Recent Orders Log</h3>
            <p className="text-xs text-gray-500">Latest activity from the customer site</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-[#582da8] hover:underline flex items-center gap-1">
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="w-10 h-10 mb-3 text-purple-200" />
            <p className="text-xs font-semibold">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-bold">{ord.orderNumber}</td>
                    <td className="px-6 py-4">{ord.customer.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(ord.createdAt)}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">Rs. {ord.totalAmount.toLocaleString('en-LK')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStyles(ord.paymentStatus)}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white shadow-2xl overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#FDFBF7] px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-md font-bold text-gray-900">Order Details</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</span>
                <span className="text-sm font-bold text-gray-900">{selectedOrder.orderNumber}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Customer</p>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customer.name}</p>
                  </div>
                </div>

                {selectedOrder.customer.phone && selectedOrder.customer.phone !== 'N/A' && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Phone</p>
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.customer.phone}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.customer.address && selectedOrder.customer.address !== 'No address provided' && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Address</p>
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.customer.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Payment</p>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStyles(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Order Status</p>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                        {item.name}
                      </div>
                      <span className="text-xs text-gray-400">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold text-gray-900">Rs. {selectedOrder.totalAmount.toLocaleString('en-LK')}</span>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/admin/orders"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#442852] py-3 text-sm font-bold text-white shadow transition-all hover:bg-[#321c3d]"
                >
                  <Eye className="w-4 h-4" /> View in Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard minRole={['staff', 'admin', 'super-admin']} requiredPermission="canViewDashboard">
      <DashboardContent />
    </AdminGuard>
  );
}
