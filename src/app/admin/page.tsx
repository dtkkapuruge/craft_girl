'use client';

import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  AlertTriangle,
  X,
  Package,
  CreditCard,
  MapPin,
  Phone,
} from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  date: string;
  total: string;
  paymentStatus: string;
  orderStatus: string;
  phone?: string;
  address?: string;
  items?: string[];
}

function DashboardContent() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const metrics = [
    { label: 'Total Sales', value: 'LKR 148,250', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Total Orders', value: '184', change: '+8.2%', icon: ShoppingBag, trend: 'up' },
    { label: 'Active Users', value: '45', change: '+5.4%', icon: Users, trend: 'up' },
    { label: 'Avg Order Value', value: 'LKR 805', change: '-2.1%', icon: TrendingUp, trend: 'down' },
  ];

  const topSelling = [
    { name: 'Preserved Rose Dome', sales: 145, percentage: 90, color: 'bg-gradient-to-t from-purple-600 to-indigo-500' },
    { name: 'Resin Letter Keychain', sales: 120, percentage: 75, color: 'bg-gradient-to-t from-purple-500 to-pink-500' },
    { name: 'Dried Flower Bookmark', sales: 88, percentage: 55, color: 'bg-gradient-to-t from-violet-500 to-purple-400' },
    { name: 'Custom Name Bracelet', sales: 64, percentage: 40, color: 'bg-gradient-to-t from-indigo-400 to-purple-300' },
    { name: 'Glitter Stationery Set', sales: 48, percentage: 30, color: 'bg-gradient-to-t from-purple-400 to-pink-300' },
  ];

  const statusSplit = [
    { label: 'Shipped', count: 83, percentage: 45, color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'Processing', count: 46, percentage: 25, color: 'bg-blue-500', text: 'text-blue-500' },
    { label: 'Pending', count: 28, percentage: 15, color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Cancelled', count: 27, percentage: 15, color: 'bg-rose-500', text: 'text-rose-500' },
  ];

  const recentOrders: Order[] = [
    { id: '#CG-8901', customer: 'Dinushi Perera', date: 'June 17, 2026', total: 'LKR 2,450', paymentStatus: 'Paid', orderStatus: 'Shipped', phone: '077 123 4567', address: '12, Flower Road, Colombo', items: ['Custom Name Resin Necklace', 'Pastel Highlighter Set'] },
    { id: '#CG-8902', customer: 'Imesha Silva', date: 'June 17, 2026', total: 'LKR 4,800', paymentStatus: 'COD Pending', orderStatus: 'Processing', phone: '071 234 5678', address: '45, Galle Road, Dehiwala', items: ['Preserved Rose Dome', 'Luxury Chocolate Gift Box'] },
    { id: '#CG-8903', customer: 'Asha Fernando', date: 'June 16, 2026', total: 'LKR 1,250', paymentStatus: 'Paid', orderStatus: 'Pending', phone: '076 345 6789', address: '78, Kandy Road, Peradeniya', items: ['Handmade Beaded Bracelet'] },
    { id: '#CG-8904', customer: 'Ruwan Kumara', date: 'June 15, 2026', total: 'LKR 3,500', paymentStatus: 'Paid', orderStatus: 'Delivered', phone: '072 456 7890', address: '23, Negombo Road, Gampaha', items: ['Ocean Theme Resin Tray', 'Aesthetic Vintage Journal'] },
  ];

  const getStatusStyles = (status: string) => {
    if (status === 'Shipped' || status === 'Delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Processing') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getPaymentStyles = (pay: string) => {
    return pay === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100';
  };

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
                <span className={`text-xs font-bold ${m.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.change}
                </span>
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
        {/* Top Selling Products - Flex Bars */}
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

          <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-gray-100">
            {topSelling.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-end h-full group w-1/5 relative">
                {/* Count tooltip on hover */}
                <div className="absolute -top-8 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.sales} sold
                </div>
                {/* Bar */}
                <div
                  className={`w-10 rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${item.color}`}
                  style={{ height: `${item.percentage}%` }}
                />
                <span className="text-[10px] text-gray-400 mt-2 font-semibold truncate max-w-full px-1 text-center" title={item.name}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Status Split Doughnut Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Orders Status Split</h3>
            <p className="text-xs text-gray-500 mb-6">Distribution of overall orders status</p>
          </div>

          {/* Doughnut Graphic representation */}
          <div className="relative flex items-center justify-center mb-6">
            {/* Conic Gradient Wrapper */}
            <div className="w-32 h-32 rounded-full border-[12px] border-gray-50 relative flex items-center justify-center" style={{ background: 'conic-gradient(#10B981 0% 45%, #3B82F6 45% 70%, #F59E0B 70% 85%, #EF4444 85% 100%)' }}>
              <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-xl font-extrabold text-gray-800">184</span>
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
              {recentOrders.map((ord) => {
                return (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-bold">{ord.id}</td>
                    <td className="px-6 py-4">{ord.customer}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{ord.date}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{ord.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStyles(ord.paymentStatus)}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(ord.orderStatus)}`}>
                        {ord.orderStatus}
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
                );
              })}
            </tbody>
          </table>
        </div>
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
                <span className="text-sm font-bold text-gray-900">{selectedOrder.id}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Customer</p>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customer}</p>
                  </div>
                </div>

                {selectedOrder.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Phone</p>
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.phone}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Address</p>
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.address}</p>
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
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold text-gray-900">{selectedOrder.total}</span>
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
