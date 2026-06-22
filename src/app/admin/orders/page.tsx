'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminGuard from '@/components/AdminGuard';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  Search,
  ShieldCheck,
  CheckCircle,
  Clock,
  Truck,
  Trash2,
  DollarSign,
  ListOrdered,
  Eye,
  Loader2,
  PackageOpen,
} from 'lucide-react';
import {
  hasPermission,
  getRoleDisplayName,
  isSuperAdmin,
} from '@/lib/rbac';

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
  paymentMethod: 'COD';
  paymentStatus: 'Pending COD' | 'Paid';
  createdAt: { toDate?: () => Date };
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'CGS-542318',
    customer: {
      name: 'Sanduni Perera',
      phone: '0772439120',
      address: '24/1, Baseline Road, Kirulapone',
      district: 'Colombo',
    },
    items: [
      {
        productId: 'resin-flower-pendant',
        name: 'Floral Resin Blossom Pendant',
        variantChosen: {
          color: 'Rose Gold',
          size: 'Standard Chain (45cm)',
          personalizationText: 'Sanduni',
        },
        quantity: 1,
        price: 1450,
      },
    ],
    totalAmount: 1800,
    status: 'Pending',
    paymentMethod: 'COD',
    paymentStatus: 'Pending COD',
    createdAt: { toDate: () => new Date(Date.now() - 3600000) },
  },
  {
    id: 'ord-102',
    orderNumber: 'CGS-983145',
    customer: {
      name: 'Nipuni Fernando',
      phone: '0715982341',
      address: '88, Negombo Road, Kurana',
      district: 'Gampaha',
    },
    items: [
      {
        productId: 'aesthetic-resin-coaster',
        name: 'Aesthetic Terrazzo Resin Coaster',
        variantChosen: { color: 'Sage Green', size: 'Round (10cm)' },
        quantity: 2,
        price: 850,
      },
    ],
    totalAmount: 2050,
    status: 'Dispatched',
    paymentMethod: 'COD',
    paymentStatus: 'Pending COD',
    createdAt: { toDate: () => new Date(Date.now() - 86400000) },
  },
  {
    id: 'ord-103',
    orderNumber: 'CGS-312984',
    customer: {
      name: 'Fathima Rushda',
      phone: '0763248901',
      address: '15, Hill Street',
      district: 'Kandy',
    },
    items: [
      {
        productId: 'resin-flower-pendant',
        name: 'Floral Resin Blossom Pendant',
        variantChosen: {
          color: 'Gold',
          size: 'Long Chain (60cm)',
          personalizationText: 'Mom',
        },
        quantity: 1,
        price: 1450,
      },
    ],
    totalAmount: 1800,
    status: 'Completed',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    createdAt: { toDate: () => new Date(Date.now() - 172800000) },
  },
];

const STATUS_STYLES: Record<Order['status'], string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  Processing: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/10',
  Dispatched: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/10',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  Cancelled: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-500/10',
};

const FILTER_STATUSES = [
  'All',
  'Pending',
  'Processing',
  'Dispatched',
  'Completed',
  'Cancelled',
] as const;

function formatDate(createdAt: Order['createdAt']) {
  if (!createdAt?.toDate) return 'N/A';
  return createdAt.toDate().toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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

function getAccessDescription(role: string) {
  if (role === 'staff') return 'View-only access. Contact an administrator to modify orders.';
  if (role === 'admin') return 'You can update order statuses. Deletion requires super-admin access.';
  return 'Full access — view, update statuses, and delete orders.';
}

function StatCard({
  label,
  value,
  icon: Icon,
  restricted,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  restricted?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-300 hover:border-zinc-300 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            {label}
          </p>
          {restricted ? (
            <p className="mt-2 text-sm font-medium text-zinc-400">Restricted</p>
          ) : (
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">
              {value}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 transition-colors duration-300 group-hover:bg-zinc-100">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function AdminOrdersPageContent() {
  const { role, user } = useAuth();

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const canViewOrders = hasPermission(role, 'canViewOrders');
  const canUpdateOrderStatus = hasPermission(role, 'canUpdateOrderStatus');
  const canDeleteOrders = isSuperAdmin(role);
  const canViewRevenue = hasPermission(role, 'canViewRevenue');
  const showActionsColumn = canUpdateOrderStatus || canDeleteOrders;

  useEffect(() => {
    if (!canViewOrders) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const list: Order[] = [];
          querySnapshot.forEach((docSnap) => {
            list.push(normalizeOrder(docSnap.id, docSnap.data()));
          });
          setOrders(list);
        } else {
          setOrders(MOCK_ORDERS);
        }
      } catch (err) {
        console.warn('Firestore fetch failed (using fallback mock data):', err);
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [canViewOrders]);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: Order['status']
  ) => {
    if (!canUpdateOrderStatus) return;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: newStatus,
              paymentStatus:
                newStatus === 'Completed' ? 'Paid' : ord.paymentStatus,
            }
          : ord
      )
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        paymentStatus: newStatus === 'Completed' ? 'Paid' : 'Pending COD',
        updatedAt: Timestamp.now(),
      });

      await addDoc(collection(db, 'audit_logs'), {
        timestamp: Timestamp.now(),
        userId: user?.uid,
        userEmail: user?.email,
        userRole: role,
        actionDescription: `Updated order status of ${orderId} to ${newStatus}`,
      });
    } catch (dbErr) {
      console.warn('Firestore update failed (demo updated state locally):', dbErr);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!canDeleteOrders) return;
    if (!confirm('Are you sure you want to permanently delete this order?')) return;

    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));

    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (dbErr) {
      console.warn('Firestore document delete failed (deleted local model):', dbErr);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const dispatchedCount = orders.filter((o) => o.status === 'Dispatched').length;

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.phone.includes(searchQuery) ||
      order.orderNumber.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 max-w-lg">
            Track fulfillment, monitor payments, and manage delivery states across all customer orders.
          </p>
        </div>

        <div className="inline-flex items-center gap-2.5 self-start rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-zinc-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-zinc-900">
              {getRoleDisplayName(role)}
            </p>
            <p className="text-[11px] text-zinc-400 leading-snug max-w-[220px]">
              {getAccessDescription(role)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Completed Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          restricted={!canViewRevenue}
        />
        <StatCard label="Pending" value={pendingCount} icon={Clock} />
        <StatCard label="Processing" value={processingCount} icon={ListOrdered} />
        <StatCard label="Dispatched" value={dispatchedCount} icon={Truck} />
      </div>

      {/* Search & filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search name, phone, or order #"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {FILTER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
            <p className="mt-3 text-sm font-medium">Loading orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <PackageOpen className="h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-500">No orders found</p>
            <p className="mt-1 text-xs text-zinc-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  {[
                    'Order',
                    'Customer',
                    'Items',
                    'Total',
                    'Status',
                    ...(showActionsColumn ? ['Actions'] : []),
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group transition-colors duration-150 hover:bg-zinc-50/60"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-zinc-900">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-900">
                        {order.customer.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {order.customer.phone}
                      </p>
                      <p
                        className="mt-0.5 text-xs text-zinc-400 max-w-[200px] truncate"
                        title={`${order.customer.address}, ${order.customer.district}`}
                      >
                        {order.customer.address}, {order.customer.district}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="mb-1 last:mb-0">
                          <span className="text-sm text-zinc-700">{item.name}</span>
                          <span className="ml-1.5 text-xs text-zinc-400">
                            × {item.quantity}
                          </span>
                          {item.variantChosen.personalizationText && (
                            <span className="ml-2 inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                              &ldquo;{item.variantChosen.personalizationText}&rdquo;
                            </span>
                          )}
                        </div>
                      ))}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-zinc-900">
                        Rs. {order.totalAmount.toLocaleString()}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400">
                        <CheckCircle className="h-3 w-3" />
                        {order.paymentMethod} · {order.paymentStatus}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {showActionsColumn && (
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {canUpdateOrderStatus ? (
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  order.id,
                                  e.target.value as Order['status']
                                )
                              }
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400">
                              <Eye className="h-3 w-3" />
                              View only
                            </span>
                          )}

                          {canDeleteOrders && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                              title="Delete order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="border-t border-zinc-100 px-5 py-3">
            <p className="text-xs text-zinc-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard
      minRole={['admin', 'super-admin', 'staff']}
      requiredPermission="canViewOrders"
    >
      <AdminOrdersPageContent />
    </AdminGuard>
  );
}
