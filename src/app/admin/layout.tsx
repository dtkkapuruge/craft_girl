'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName, hasPermission } from '@/lib/rbac';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Warehouse,
  Users,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut, permissions } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLastSeen(localStorage.getItem('admin_last_orders_seen'));

      const handleOrdersRead = () => {
        setLastSeen(localStorage.getItem('admin_last_orders_seen'));
      };
      window.addEventListener('orders_read', handleOrdersRead);
      return () => window.removeEventListener('orders_read', handleOrdersRead);
    }
  }, []);

  useEffect(() => {
    if (!user || !role) return;
    const canView = hasPermission(role, 'canViewOrders', permissions);
    if (!canView) return;

    const q = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setOrders(list);
      },
      (err) => {
        console.warn('Error fetching orders count:', err);
      }
    );

    return () => unsubscribe();
  }, [user, role, permissions]);

  useEffect(() => {
    let count = 0;
    const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;

    orders.forEach((order) => {
      let orderTime = 0;
      if (order.createdAt) {
        if (typeof order.createdAt.toDate === 'function') {
          orderTime = order.createdAt.toDate().getTime();
        } else if (order.createdAt.seconds) {
          orderTime = order.createdAt.seconds * 1000;
        } else {
          const d = new Date(order.createdAt);
          if (!isNaN(d.getTime())) {
            orderTime = d.getTime();
          }
        }
      }

      const isAfterTimestamp = orderTime > lastSeenTime;
      const isUnread = order.isRead !== true;

      if (isAfterTimestamp || isUnread) {
        count++;
      }
    });

    setUnreadCount(count);
  }, [orders, lastSeen]);

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const getPageTitle = (path: string) => {
    if (path === '/admin') return '| Dashboard';
    if (path.startsWith('/admin/orders')) return '| Orders';
    if (path.startsWith('/admin/products')) return '| Products';
    if (path.startsWith('/admin/categories')) return '| Categories';
    if (path.startsWith('/admin/inventory')) return '| Inventory';
    if (path.startsWith('/admin/users')) return '| User Management';
    if (path.startsWith('/admin/roles')) return '| Role Permissions';
    if (path.startsWith('/admin/settings')) return '| Settings & Logs';
    return '| Admin Portal';
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Role Permissions', href: '/admin/roles', icon: Shield },
    { label: 'Settings & Logs', href: '/admin/settings', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.href === '/admin/users') {
      return hasPermission(role, 'canManageUsers', permissions);
    }
    if (item.href === '/admin/roles') {
      // super-admin = full edit access; admin = read-only view; staff/others = hidden
      return role === 'super-admin' || role === 'admin';
    }
    if (item.href === '/admin/settings') {
      return role === 'super-admin' || role === 'admin';
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-68 bg-[#160b24] text-gray-300 flex-col justify-between shrink-0 border-r border-[#2d1b46]/40 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#2d1b46]/60">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#7f56d9] to-[#b292c7]">
              <span className="text-white font-extrabold text-base">CG</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-md leading-none">Craft Girly</h1>
              <p className="text-[10px] text-purple-400 mt-1 uppercase tracking-wider font-semibold">Admin Workspace</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#442852] to-[#582da8] text-white shadow-md'
                      : 'hover:bg-[#25153b] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-purple-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Orders' && unreadCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold bg-white text-purple-900 rounded-full shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="p-6 border-t border-[#2d1b46]/40 bg-[#11081c]/50">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0 text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Status Bar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-150 px-4 md:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-gray-800 tracking-tight">{getPageTitle(pathname)}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Server status indicator */}
            <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline text-[11px] font-bold text-emerald-800">Server status: Online</span>
              <span className="sm:hidden text-[11px] font-bold text-emerald-800">Online</span>
            </div>

            {/* User display details */}
            {user && (
              <div className="hidden sm:flex items-center gap-3 border-l pl-4 border-gray-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">{user.displayName || 'Admin'}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user.email}</p>
                </div>
                <div className="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-bold uppercase tracking-wider shrink-0">
                  {getRoleDisplayName(role)}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic page children */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#160b24] border-t border-[#2d1b46]/40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 flex items-center justify-around px-2 py-2 pb-safe">
        {filteredMenuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
                isActive ? 'text-white' : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-lg ${isActive ? 'bg-gradient-to-r from-[#442852] to-[#582da8] shadow-md' : ''}`}>
                <Icon className="w-5 h-5 shrink-0" />
                {item.label === 'Orders' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-rose-400 hover:text-rose-300"
        >
          <div className="p-1.5 rounded-lg">
             <LogOut className="w-5 h-5 shrink-0" />
          </div>
        </button>
      </nav>
    </div>
  );
}